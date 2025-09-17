"use client"
import React, { useState } from 'react';
import SuperAdminSidebar from '../components/AdminDashboard/SuperAdminSidebar';
import SupervisorDashboardContent from '../components/AdminDashboard/SuperadminContent';
import DocumentVerification from '../components/AdminDashboard/Documentsverification';
import Adminheader from '../components/Adminheader';
import ApprovedApplications from '../components/AdminDashboard/Siteinspector';
import InspectionDetails from '../components/AdminDashboard/Inspectiondetails';
import SupervisorDetailsTable from '../components/AdminDashboard/SupervisorDetails';

const SupervisorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'dashboard' |
    'applications' |
    'documents-verification' |
    'documents-verification-detail' |
    'site-inspector' |
    'inspection-details' |
    'supervisor-details' |
    'reports' |
    'help' |
    'settings' |
    string
  >('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <SupervisorDashboardContent />;

      case 'documents-verification':
        return <ApprovedApplications />;

      case 'documents-verification-detail':
        return <DocumentVerification />;

      case 'site-inspector':
        return <InspectionDetails />;

      case 'supervisor-details':
        return <SupervisorDetailsTable />;

      case 'reports':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
              <p className="text-gray-600 mb-6">
                Generate and download various reports for supervisor performance,
                application statistics, and system analytics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Performance Report</h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Detailed supervisor performance metrics
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Generate Report
                  </button>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Applications Report</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Monthly application processing statistics
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Generate Report
                  </button>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">System Analytics</h3>
                  <p className="text-purple-700 text-sm mb-4">
                    Overall system usage and performance
                  </p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Help & Support</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">How do I review applications?</h4>
                      <p className="text-gray-600 text-sm">
                        Navigate to All Applications to see pending applications that need review.
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">How to assign site inspectors?</h4>
                      <p className="text-gray-600 text-sm">
                        Use the site inspector section to assign inspectors to approved applications.
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        How to generate reports?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Use the Reports section to generate various performance and statistical reports.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                      <p className="text-gray-600 text-sm">support@supervisorsystem.com</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Phone Support</h4>
                      <p className="text-gray-600 text-sm">+92-42-1234-5678</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Office Hours</h4>
                      <p className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

              <div className="space-y-8">
                {/* Profile Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive email alerts for new applications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-600">Receive SMS alerts for urgent matters</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Change Password
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ml-4">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-6">The requested page is not available.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Adminheader />

      <div className="flex">
        <SuperAdminSidebar currentView={currentView} setCurrentView={setCurrentView} />

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;