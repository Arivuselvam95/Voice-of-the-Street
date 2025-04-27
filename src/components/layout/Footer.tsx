import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center text-sm text-gray-600">
          <span>Made with</span>
          <Heart className="h-4 w-4 mx-1 text-red-500" />
          <span>for a better community</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;