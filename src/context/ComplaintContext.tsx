import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Complaint, IssueType } from '../types';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'summary' | 'status'>) => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  isLoading: boolean;
  error: string | null;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

interface ComplaintProviderProps {
  children: ReactNode;
}

export const ComplaintProvider: React.FC<ComplaintProviderProps> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints');
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addComplaint = async (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'summary' | 'status'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });

      if (!response.ok) throw new Error('Failed to add complaint');
      
      const savedComplaint = await response.json();
      setComplaints(prev => [savedComplaint, ...prev]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add complaint');
    }
  };

  const getComplaintById = (id: string) => {
    return complaints.find(complaint => complaint.id === id);
  };

  return (
    <ComplaintContext.Provider value={{ complaints, addComplaint, getComplaintById, isLoading, error }}>
      {children}
    </ComplaintContext.Provider>
  );
};