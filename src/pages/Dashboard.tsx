import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import StatCards from '../components/dashboard/StatCards';
import ComplaintMap from '../components/dashboard/ComplaintMap';
import ComplaintCharts from '../components/dashboard/ComplaintCharts';
import RecentComplaints from '../components/dashboard/RecentComplaints';
import { ComplaintStats } from '../types';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { complaints, isLoading, error } = useComplaints();
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints/stats');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || statsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || statsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Civic Issues Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of reported issues and their status</p>
      </header>
      
      {stats && <StatCards stats={stats} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Issues Map</h2>
          <ComplaintMap complaints={complaints} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Analytics</h2>
          {stats && <ComplaintCharts stats={stats} />}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Complaints</h2>
        <RecentComplaints complaints={complaints.slice(0, 5)} />
      </div>
    </div>
  );
};

export default Dashboard;