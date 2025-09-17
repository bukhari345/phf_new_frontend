import React from 'react';
import {
  CheckCircle, 
  Eye, 
  Download, 
  FileText, 
  HelpCircle, 
  Settings, 
  LogOut,
  User,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const SuperAdminSidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-64 bg-white shadow-sm min-h-screen border-r">
      <div className="p-4">
        <nav className="space-y-2">
          {/* Dashboard */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* All Applications */}
          <button
            onClick={() => setCurrentView('documents-verification')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
              currentView === 'documents-verification'
                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Applications</span>
          </button>

          {/* Site Inspector */}
          <button
            onClick={() => setCurrentView('site-inspector')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
              currentView === 'site-inspector'
                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Site Inspector</span>
          </button>

          {/* Supervisor Details - NEW */}
          <button
            onClick={() => setCurrentView('supervisor-details')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
              currentView === 'supervisor-details'
                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Supervisor Details</span>
          </button>

  

          {/* Reports */}
       

          {/* Divider */}
         </nav>
         </div>

    </div>
  );
};

export default SuperAdminSidebar;