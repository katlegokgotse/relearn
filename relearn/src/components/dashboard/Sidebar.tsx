// components/Sidebar.tsx
import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="flex">
      <div className="bg-gray-900 h-screen w-20 flex flex-col items-center py-4">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-400 to-blue-500 h-10 w-10 rounded-full"></div>
        </div>
        <div className="flex flex-col space-y-8">
          <a href="#" className="text-gray-400 hover:text-white"></a>
          <a href="#" className="text-white"></a>
          <a href="#" className="text-gray-400 hover:text-white"></a>
          <a href="#" className="text-gray-400 hover:text-white"></a>
          <a href="#" className="text-gray-400 hover:text-white"></a>
          <a href="#" className="text-gray-400 hover:text-white"></a>
          <a href="#" className="text-purple-500 hover:text-white"></a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
