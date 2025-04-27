import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { IssueType, Severity, Coordinates } from '../types';
import { MapPin, AlertTriangle, Info, Loader2 } from 'lucide-react';

const ReportComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('road');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 40.7128, lng: -74.0060 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Simulated location search/geocoding
  const searchLocation = (locationText: string) => {
    setLocation(locationText);
    
    if (locationText.trim()) {
      const baseCoords = { lat: 40.7128, lng: -74.0060 };
      const randomOffset = (Math.random() - 0.5) * 0.1;
      setCoordinates({
        lat: baseCoords.lat + randomOffset,
        lng: baseCoords.lng + randomOffset
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!title.trim()) {
      setFormError('Please provide a title for your complaint');
      return;
    }
    
    if (!description.trim()) {
      setFormError('Please describe the issue');
      return;
    }
    
    if (!location.trim()) {
      setFormError('Please provide the location of the issue');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComplaint({
        title,
        description,
        type,
        severity,
        location,
        coordinates,
        department: getDepartment(type)
      });
      
      navigate('/');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getDepartment = (type: IssueType): string => {
    const departments: Record<IssueType, string> = {
      road: 'Road Maintenance',
      water: 'Water Authority',
      electricity: 'Electricity Board',
      sanitation: 'Sanitation Department',
      other: 'General Administration'
    };
    return departments[type];
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Report a Civic Issue</h1>
        <p className="text-gray-600 mt-1">Help improve your community by reporting issues in your area</p>
      </header>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
          <p>{formError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title for the issue"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the issue"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as IssueType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="road">Road Issue</option>
            <option value="water">Water Supply</option>
            <option value="electricity">Electricity</option>
            <option value="sanitation">Sanitation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => searchLocation(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location"
            />
            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <p className="mt-1 text-sm text-gray-500 flex items-center">
            <Info size={14} className="mr-1" />
            Location will be verified by our team
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className={`w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium 
              transition-colors duration-200 flex items-center justify-center ${
                isSubmitting 
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportComplaint;