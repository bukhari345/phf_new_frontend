"use client"
import React, { useState } from 'react';
import AdminSidebar from '../components/AdminDashboard/AdmiSidebar';
import DashboardContent from '../components/AdminDashboard/Admincontent';;
import DocumentVerification from '../components/AdminDashboard/Documentsverification';
import Adminheader from '../components/Adminheader'
import ApprovedApplications from '../components/AdminDashboard/Siteinspector';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'applications' | 'documents-verification' | string>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'documents-verification': // Add this case
        return <DocumentVerification />;
      case 'site-inspector': // Add this case
        return <ApprovedApplications />;
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
        <AdminSidebar currentView={currentView} setCurrentView={setCurrentView} />

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;