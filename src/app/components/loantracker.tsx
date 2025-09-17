/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { CheckCircle, Clock, FileText, User, ArrowLeft } from 'lucide-react';

const LoanTracker = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
    

        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Status</h1>
          <p className="text-gray-600">Application ID: 2024-07-26-12345</p>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-8">
            {/* Step 1 - Submit Application */}
            <div className="flex flex-col items-center text-center max-w-32">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Submit Application</h3>
              <p className="text-xs text-gray-600">
                Submit your application form and personal and professional and work details.
              </p>
            </div>

            {/* Connection Line 1 */}
            <div className="flex-1 h-0.5 bg-green-500 mx-4"></div>

            {/* Step 2 - Document Verification */}
            <div className="flex flex-col items-center text-center max-w-32">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Document Verification</h3>
              <p className="text-xs text-gray-600">
                Your documents have been verified and approved. You are  all submitted.
              </p>
            </div>

            {/* Connection Line 2 */}
            <div className="flex-1 h-0.5 bg-blue-500 mx-4"></div>

            {/* Step 3 - Field Inspector */}
            <div className="flex flex-col items-center text-center max-w-32">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Field Inspector</h3>
              <p className="text-xs text-gray-600">
                Inspector will visit your office to confirm physical business.
              </p>
            </div>

            {/* Connection Line 3 */}
            <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>

            {/* Step 4 - Eligibility & Approval */}
            <div className="flex flex-col items-center text-center max-w-32">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-gray-400 mb-1">Eligibility & Approval</h3>
              <p className="text-xs text-gray-400">
                Check your loan eligibility and get your final loan.
              </p>
            </div>
          </div>
        </div>

        {/* Current Status Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Progress */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification</h3>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>In Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Verification</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-blue-600 font-medium">In Progress</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                We are currently verifying your documents. This process usually takes 2-3 business days.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Completion</span>
                <span className="font-medium text-gray-900">August 2, 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assigned Officer</span>
                <span className="font-medium text-gray-900">Hasan Khan</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What is  Next?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Document Review Complete</h4>
                  <p className="text-sm text-gray-600">Our team will finish reviewing your submitted documents.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Field Inspector Visit</h4>
                  <p className="text-sm text-gray-600">An inspector will schedule a visit to verify your business location.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-gray-400 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-400">Final Approval</h4>
                  <p className="text-sm text-gray-400">Final eligibility check and loan approval decision.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Keep Your Documents Ready</h4>
                  <p className="text-sm text-green-700">
                    Make sure all your business documents and ID are easily accessible for the inspector visit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanTracker;