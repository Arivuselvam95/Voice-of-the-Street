import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-xl text-gray-900">Voice of the Streets</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/report"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Report Issue
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;