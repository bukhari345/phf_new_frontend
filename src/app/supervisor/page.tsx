"use client"
import React, { useState } from 'react';
import SupervisorSidebar from '../components/AdminDashboard/SupervisiorSidebar';
import SupervisorDashboardContent from '../components/AdminDashboard/SupervisorContent';
import DocumentVerification from '../components/AdminDashboard/Documentsverification';
import Adminheader from '../components/Adminheader'
import ApprovedApplications from '../components/AdminDashboard/Siteinspector';
import InspectionDetails from '../components/AdminDashboard/Inspectiondetails'; // Import the new component

const SupervisorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'applications' | 'documents-verification' | 'site-inspector' | 'inspection-details' | string>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <SupervisorDashboardContent />;
      case 'documents-verification':
        return <ApprovedApplications />;
      case 'site-inspector':
        return <InspectionDetails />;
   
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600">The requested page is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Adminheader />

      <div className="flex">
        <SupervisorSidebar currentView={currentView} setCurrentView={setCurrentView} />

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;