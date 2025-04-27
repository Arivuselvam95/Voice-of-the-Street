import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Clock, CheckCircle, MapPin } from 'lucide-react';
import { Complaint } from '../../types';

interface RecentComplaintsProps {
  complaints: Complaint[];
}

const RecentComplaints: React.FC<RecentComplaintsProps> = ({ complaints }) => {
  // Helper to get icon and color for status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock size={16} />, 
          color: 'text-yellow-500 bg-yellow-50' 
        };
      case 'in-progress':
        return { 
          icon: <AlertTriangle size={16} />, 
          color: 'text-blue-500 bg-blue-50' 
        };
      case 'resolved':
        return { 
          icon: <CheckCircle size={16} />, 
          color: 'text-green-500 bg-green-50' 
        };
      default:
        return { 
          icon: <Clock size={16} />, 
          color: 'text-gray-500 bg-gray-50' 
        };
    }
  };
  
  // Helper to get icon and color for issue type
  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'road':
        return { color: 'text-orange-700 bg-orange-100' };
      case 'water':
        return { color: 'text-blue-700 bg-blue-100' };
      case 'electricity':
        return { color: 'text-yellow-700 bg-yellow-100' };
      case 'sanitation':
        return { color: 'text-green-700 bg-green-100' };
      default:
        return { color: 'text-gray-700 bg-gray-100' };
    }
  };
  
  // Helper to get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-700';
      case 'medium':
        return 'text-yellow-700';
      case 'high':
        return 'text-orange-700';
      case 'critical':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No complaints have been reported yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reported
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {complaints.map((complaint) => {
            // Use complaint._id or complaint.id as unique key
            const key = complaint._id || complaint.id;
            const statusDisplay = getStatusDisplay(complaint.status);
            const typeDisplay = getTypeDisplay(complaint.type);
            const severityColor = getSeverityColor(complaint.severity);
            
            return (
              <tr key={key} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span>{complaint.location}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${typeDisplay.color}`}>
                    {complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-medium ${severityColor}`}>
                    {complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                    <span className="mr-1">{statusDisplay.icon}</span>
                    {complaint.status === 'in-progress' ? 'In Progress' : 
                     complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentComplaints;