import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { Loader2 } from 'lucide-react';

const ReportComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!description.trim()) {
      setFormError('Please describe the issue');
      return;
    }
    setIsSubmitting(true);
    try {
      await addComplaint({ description });
      navigate('/');
    } catch (error) {
      setFormError('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Report a Civic Issue</h1>
        <p className="text-gray-600 mt-1">Help improve your community by reporting issues in your area</p>
      </header>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <Loader2 className="mr-2 flex-shrink-0 mt-0.5" size={18} />
          <p>{formError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the issue, location, severity, etc. in detail..."
            required
          />
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