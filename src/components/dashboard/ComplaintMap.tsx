import React, { useEffect, useRef } from 'react';
import { Complaint } from '../../types';

interface ComplaintMapProps {
  complaints: Complaint[];
}

declare global {
  interface Window {
    google: any;
  }
}

const ComplaintMap: React.FC<ComplaintMapProps> = ({ complaints }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  useEffect(() => {
    // Simulate loading the Google Maps API
    const initMap = () => {
      if (!mapRef.current) return;
      
      // Center map on the average coordinates of all complaints
      // If no complaints, center on a default location
      let centerLat = 40.7128;
      let centerLng = -74.0060;
      
      if (complaints.length > 0) {
        const sumCoordinates = complaints.reduce(
          (acc, complaint) => {
            return {
              lat: acc.lat + complaint.coordinates.lat,
              lng: acc.lng + complaint.coordinates.lng,
            };
          },
          { lat: 0, lng: 0 }
        );
        
        centerLat = sumCoordinates.lat / complaints.length;
        centerLng = sumCoordinates.lng / complaints.length;
      }
      
      // Create a mock map for MVP purposes
      const mapContainer = mapRef.current;
      mapContainer.innerHTML = '';
      mapContainer.style.position = 'relative';
      mapContainer.style.overflow = 'hidden';
      
      // Add a placeholder map background
      const mapImage = document.createElement('div');
      mapImage.className = 'w-full h-full bg-blue-50';
      mapImage.style.background = 'linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 100%)';
      mapContainer.appendChild(mapImage);
      
      // Add pins for each complaint
      complaints.forEach((complaint) => {
        // Calculate relative positions within the container
        const x = ((complaint.coordinates.lng - (centerLng - 0.05)) / 0.1) * 100;
        const y = 100 - ((complaint.coordinates.lat - (centerLat - 0.05)) / 0.1) * 100;
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          const pin = document.createElement('div');
          pin.className = 'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer';
          pin.style.left = `${x}%`;
          pin.style.top = `${y}%`;
          
          // Determine color based on issue type
          let bgColor = 'bg-gray-500';
          if (complaint.type === 'road') bgColor = 'bg-orange-500';
          if (complaint.type === 'water') bgColor = 'bg-blue-500';
          if (complaint.type === 'electricity') bgColor = 'bg-yellow-500';
          if (complaint.type === 'sanitation') bgColor = 'bg-green-500';
          
          // Determine size based on severity
          let size = 'w-3 h-3';
          if (complaint.severity === 'medium') size = 'w-4 h-4';
          if (complaint.severity === 'high') size = 'w-5 h-5';
          if (complaint.severity === 'critical') size = 'w-6 h-6';
          
          pin.innerHTML = `
            <div class="flex flex-col items-center">
              <div class="${bgColor} ${size} rounded-full shadow-md pulse-animation"></div>
              <div class="mt-1 px-2 py-1 bg-white rounded shadow-md text-xs hidden group-hover:block">
                ${complaint.title}
              </div>
            </div>
          `;
          
          // Add tooltip functionality
          pin.addEventListener('mouseenter', () => {
            const tooltip = pin.querySelector('div > div:last-child');
            tooltip?.classList.remove('hidden');
            tooltip?.classList.add('block');
          });
          
          pin.addEventListener('mouseleave', () => {
            const tooltip = pin.querySelector('div > div:last-child');
            tooltip?.classList.add('hidden');
            tooltip?.classList.remove('block');
          });
          
          mapContainer.appendChild(pin);
        }
      });
      
      // Add a legend
      const legend = document.createElement('div');
      legend.className = 'absolute bottom-2 left-2 bg-white p-2 rounded shadow-md text-xs';
      legend.innerHTML = `
        <div class="font-semibold mb-1">Issue Types:</div>
        <div class="flex items-center mb-1">
          <div class="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
          <span>Road</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
          <span>Water</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
          <span>Electricity</span>
        </div>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
          <span>Sanitation</span>
        </div>
      `;
      mapContainer.appendChild(legend);
      
      // Add a disclaimer
      const disclaimer = document.createElement('div');
      disclaimer.className = 'absolute top-2 right-2 bg-white p-2 rounded shadow-md text-xs text-gray-500';
      disclaimer.textContent = 'Demo map (simplified visualization)';
      mapContainer.appendChild(disclaimer);
      
      // Add pulse animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .pulse-animation {
          position: relative;
        }
        .pulse-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: inherit;
          animation: pulse 2s infinite;
          z-index: -1;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Initialize the map
    initMap();
    
    // Update map when complaints change
    window.addEventListener('resize', initMap);
    
    return () => {
      window.removeEventListener('resize', initMap);
    };
  }, [complaints]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-80 rounded-lg overflow-hidden border border-gray-200 bg-blue-50"
    >
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Loading map...
      </div>
    </div>
  );
};

export default ComplaintMap;