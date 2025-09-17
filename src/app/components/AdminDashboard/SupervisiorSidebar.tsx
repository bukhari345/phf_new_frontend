import React from 'react';
import {
  CheckCircle, Eye, Download, FileText, HelpCircle, Settings, LogOut
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const SupervisorSidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
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
            <div className={`w-2 h-2 rounded-full ${currentView === 'dashboard' ? 'bg-blue-700' : 'bg-gray-400'}`} />
            <span>Dashboard</span>
          </button>

          {/* Documents Verification */}
          <button
            onClick={() => setCurrentView('documents-verification')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
              currentView === 'documents-verification' 
                ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Aplications</span>
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

          {/* Applications */}
        
          {/* Footer Section */}
          <div className="pt-4 border-t border-gray-200">
          
            
         
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SupervisorSidebar;
