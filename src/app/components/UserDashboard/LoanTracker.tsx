"use client"

import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, AlertCircle, RefreshCw, Clock, XCircle } from 'lucide-react';

// Updated interface to match the data structure from Dashboard
interface ApplicationData {
    id: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'on_hold' | 'field_inspection';
    updatedAt: string;
    cnic?: string;
    fullName?: string;
    createdAt?: string;
    organizationName?: string;
    documentsStatus?: 'pending' | 'approved' | 'rejected' | 'on_hold';
    adminComments?: string;
    approvedLoanAmount?: string;
    loanAmount?: string;
    documents?: Array<{
        id: string;
        documentType: string;
        status: 'pending' | 'approved' | 'rejected' | 'on_hold';
        verifiedAt?: string;
        comments?: string;
    }>;
}

interface StatusInfo {
    text: string;
    description: string;
    currentStep: number;
}

interface LoanTrackerProps {
    applicationId: string; // This will be the CNIC from Dashboard
    onBackToDashboard: () => void;
    initialApplicationData?: ApplicationData | null;
}

const LoanTracker: React.FC<LoanTrackerProps> = ({ 
    applicationId,
    onBackToDashboard, 
    initialApplicationData 
}) => {
    const [applicationData, setApplicationData] = useState<ApplicationData | null>(initialApplicationData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // API base URL
    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

    // Fetch application status
    const fetchApplicationStatus = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Use the applicationId (which is CNIC) directly
            let cnic = applicationId;
            
            // Fallback: try to get CNIC from localStorage if applicationId is not CNIC
            if (!cnic) {
                const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        cnic = user.cnic || '';
                    } catch (error) {
                        console.error("Error parsing user from storage:", error);
                    }
                }
            }

            if (!cnic) {
                throw new Error('No CNIC found for fetching application data');
            }
            
            const response = await fetch(`${API_BASE_URL}/applications?search=${encodeURIComponent(cnic)}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch application status: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.data.applications && data.data.applications.length > 0) {
                // Get the first application from the search results
                const application = data.data.applications[0];
                setApplicationData(application);
                setLastRefresh(new Date());
            } else {
                throw new Error('Application not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch application status');
            console.error('Error fetching application status:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds for active applications
    useEffect(() => {
        // Only fetch if we don't have initial data or if we need to refresh
        if (!initialApplicationData || !applicationData) {
            fetchApplicationStatus();
        }
        
        const shouldAutoRefresh = applicationData?.status && 
            ['pending', 'under_review', 'field_inspection'].includes(applicationData.status);
            
        if (shouldAutoRefresh) {
            const interval = setInterval(fetchApplicationStatus, 30000); // 30 seconds
            return () => clearInterval(interval);
        }
    }, [applicationId, applicationData?.status, initialApplicationData]);

    // Get progress percentage based on status
    const getProgressPercentage = (status: string): number => {
        switch (status) {
            case 'pending':
                return 25;
            case 'under_review':
                return 50;
            case 'on_hold':
                return 40; // Between under_review and field_inspection
            case 'field_inspection':
                return 75;
            case 'approved':
                return 100;
            case 'rejected':
                return 0;
            default:
                return 25;
        }
    };

    // Get status display info
    const getStatusInfo = (status: string): StatusInfo => {
        switch (status) {
            case 'pending':
                return {
                    text: 'Application Submitted',
                    description: 'Your application has been submitted and is pending review.',
                    currentStep: 1
                };
            case 'under_review':
                return {
                    text: 'Document Verification',
                    description: 'We are currently verifying your documents. This process usually takes 2-3 business days.',
                    currentStep: 2
                };
            case 'on_hold':
                return {
                    text: 'Application On Hold',
                    description: 'Your application is temporarily on hold. Please check the comments below for more details.',
                    currentStep: 2
                };
            case 'field_inspection':
                return {
                    text: 'Field Inspector Visit',
                    description: 'An inspector will visit your business location for verification.',
                    currentStep: 3
                };
            case 'approved':
                return {
                    text: 'Application Approved',
                    description: 'Your application has been approved and is ready for disbursement.',
                    currentStep: 4
                };
            case 'rejected':
                return {
                    text: 'Application Rejected',
                    description: 'Your application has been rejected. Please contact support for more information.',
                    currentStep: 1
                };
            default:
                return {
                    text: 'Application Submitted',
                    description: 'Your application has been submitted and is pending review.',
                    currentStep: 1
                };
        }
    };

    // Get document status icon
    const getDocumentStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'on_hold':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const statusInfo = applicationData ? getStatusInfo(applicationData.status) : getStatusInfo('pending');
    const progressPercentage = applicationData ? getProgressPercentage(applicationData.status) : 25;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button and Refresh */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBackToDashboard}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>
                
                <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={fetchApplicationStatus}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Status</h1>
                <p className="text-gray-600">
                    Application ID: {applicationData?.id ? `2024-${applicationData.id}` : '2024-07-26-12345'}
                </p>
                {applicationData?.organizationName && (
                    <p className="text-gray-600">
                        Organization: {applicationData.organizationName}
                    </p>
                )}
            </div>

            {/* Progress Timeline - Rest of the component remains the same */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-8">
                    {/* Step 1 - Submit Application */}
                    <div className="flex flex-col items-center text-center max-w-32">
                        <div className={`w-16 h-16 ${statusInfo.currentStep >= 1 ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-3`}>
                            {statusInfo.currentStep >= 1 ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>
                        <h3 className={`font-semibold ${statusInfo.currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'} mb-1`}>Submit Application</h3>
                        <p className={`text-xs ${statusInfo.currentStep >= 1 ? 'text-gray-600' : 'text-gray-400'}`}>
                            Submit your application form and personal and professional and work details.
                        </p>
                    </div>

                    {/* Connection Line 1 */}
                    <div className={`flex-1 h-0.5 ${statusInfo.currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'} mx-4`}></div>

                    {/* Step 2 - Document Verification */}
                    <div className="flex flex-col items-center text-center max-w-32">
                        <div className={`w-16 h-16 ${
                            statusInfo.currentStep >= 2 && applicationData?.status !== 'on_hold' ? 'bg-green-100' : 
                            statusInfo.currentStep === 2 || applicationData?.status === 'on_hold' ? 'bg-blue-100' : 
                            'bg-gray-100'
                        } rounded-full flex items-center justify-center mb-3`}>
                            {statusInfo.currentStep > 2 && applicationData?.status !== 'on_hold' ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : statusInfo.currentStep === 2 || applicationData?.status === 'on_hold' ? (
                                applicationData?.status === 'on_hold' ? (
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                ) : (
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <div className="w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                )
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>
                        <h3 className={`font-semibold ${statusInfo.currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'} mb-1`}>Document Verification</h3>
                        <p className={`text-xs ${statusInfo.currentStep >= 2 ? 'text-gray-600' : 'text-gray-400'}`}>
                            Your documents are being verified and reviewed by our team.
                        </p>
                    </div>

                    {/* Connection Line 2 */}
                    <div className={`flex-1 h-0.5 ${statusInfo.currentStep >= 3 ? 'bg-green-500' : statusInfo.currentStep === 2 ? 'bg-blue-500' : 'bg-gray-300'} mx-4`}></div>

                    {/* Step 3 - Field Inspector */}
                    <div className="flex flex-col items-center text-center max-w-32">
                        <div className={`w-16 h-16 ${statusInfo.currentStep >= 3 ? 'bg-green-100' : statusInfo.currentStep === 3 ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-3`}>
                            {statusInfo.currentStep > 3 ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : statusInfo.currentStep === 3 ? (
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>
                        <h3 className={`font-semibold ${statusInfo.currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'} mb-1`}>Field Inspector</h3>
                        <p className={`text-xs ${statusInfo.currentStep >= 3 ? 'text-gray-600' : 'text-gray-400'}`}>
                            Inspector will visit your office to confirm physical business.
                        </p>
                    </div>

                    {/* Connection Line 3 */}
                    <div className={`flex-1 h-0.5 ${statusInfo.currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'} mx-4`}></div>

                    {/* Step 4 - Eligibility & Approval */}
                    <div className="flex flex-col items-center text-center max-w-32">
                        <div className={`w-16 h-16 ${statusInfo.currentStep >= 4 ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-3`}>
                            {statusInfo.currentStep >= 4 ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>
                        <h3 className={`font-semibold ${statusInfo.currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'} mb-1`}>Eligibility & Approval</h3>
                        <p className={`text-xs ${statusInfo.currentStep >= 4 ? 'text-gray-600' : 'text-gray-400'}`}>
                            Check your loan eligibility and get your final loan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Status Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Verification Progress */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{statusInfo.text}</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${
                                applicationData?.status === 'on_hold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                applicationData?.status === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                'bg-gradient-to-r from-blue-500 to-green-500'
                            }`} style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {applicationData?.status === 'approved' ? (
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Approved</span>
                            </div>
                        ) : applicationData?.status === 'rejected' ? (
                            <div className="flex items-center space-x-3">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-600 font-medium">Rejected</span>
                            </div>
                        ) : applicationData?.status === 'on_hold' ? (
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm text-yellow-600 font-medium">On Hold</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span className="text-sm text-blue-600 font-medium">In Progress</span>
                            </div>
                        )}
                    </div>

                    <div className={`mt-4 p-3 ${
                        applicationData?.status === 'approved' ? 'bg-green-50' : 
                        applicationData?.status === 'rejected' ? 'bg-red-50' : 
                        applicationData?.status === 'on_hold' ? 'bg-yellow-50' :
                        'bg-blue-50'
                    } rounded-lg`}>
                        <p className="text-sm text-gray-700">
                            {statusInfo.description}
                        </p>
                    </div>

                    {/* Admin Comments */}
                    {applicationData?.adminComments && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Review Comments</h4>
                            <p className="text-sm text-gray-700">{applicationData.adminComments}</p>
                        </div>
                    )}

                    {/* Loan Amount Info */}
                    {applicationData?.status === 'approved' && applicationData?.approvedLoanAmount && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <h4 className="text-sm font-medium text-green-800 mb-1">Approved Loan Amount</h4>
                            <p className="text-lg font-bold text-green-600">
                                Rs. {parseFloat(applicationData.approvedLoanAmount).toLocaleString()}
                            </p>
                            {parseFloat(applicationData.loanAmount || '0') !== parseFloat(applicationData.approvedLoanAmount) && (
                                <p className="text-xs text-gray-600">
                                    Original request: Rs. {parseFloat(applicationData.loanAmount || '0').toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Updated</span>
                            <span className="font-medium text-gray-900">
                                {applicationData?.updatedAt ? new Date(applicationData.updatedAt).toLocaleDateString() : 'August 2, 2024'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Application Status</span>
                            <span className={`font-medium capitalize ${
                                applicationData?.status === 'approved' ? 'text-green-600' :
                                applicationData?.status === 'rejected' ? 'text-red-600' :
                                applicationData?.status === 'on_hold' ? 'text-yellow-600' :
                                'text-blue-600'
                            }`}>
                                {applicationData?.status?.replace('_', ' ') || 'Pending'}
                            </span>
                        </div>
                        {applicationData?.fullName && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Applicant Name</span>
                                <span className="font-medium text-gray-900">
                                    {applicationData.fullName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Document Status */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h3>
                    
                    {/* Overall Documents Status */}
                    <div className={`p-3 mb-4 rounded-lg ${
                        applicationData?.documentsStatus === 'approved' ? 'bg-green-50 border-green-200' :
                        applicationData?.documentsStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                        applicationData?.documentsStatus === 'on_hold' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                    } border`}>
                        <div className="flex items-center space-x-3">
                            {getDocumentStatusIcon(applicationData?.documentsStatus || 'pending')}
                            <div>
                                <h4 className={`font-medium ${
                                    applicationData?.documentsStatus === 'approved' ? 'text-green-800' :
                                    applicationData?.documentsStatus === 'rejected' ? 'text-red-800' :
                                    applicationData?.documentsStatus === 'on_hold' ? 'text-yellow-800' :
                                    'text-blue-800'
                                }`}>
                                    Documents {applicationData?.documentsStatus === 'on_hold' ? 'On Hold' : 
                                            applicationData?.documentsStatus ? 
                                                applicationData.documentsStatus.charAt(0).toUpperCase() + applicationData.documentsStatus.slice(1) 
                                                : 'Pending Review'}
                                </h4>
                                <p className={`text-sm ${
                                    applicationData?.documentsStatus === 'approved' ? 'text-green-700' :
                                    applicationData?.documentsStatus === 'rejected' ? 'text-red-700' :
                                    applicationData?.documentsStatus === 'on_hold' ? 'text-yellow-700' :
                                    'text-blue-700'
                                }`}>
                                    {applicationData?.documentsStatus === 'approved' ? 'All documents have been verified and approved.' :
                                     applicationData?.documentsStatus === 'rejected' ? 'Some documents were rejected. Please resubmit required documents.' :
                                     applicationData?.documentsStatus === 'on_hold' ? 'Document review is on hold. Additional information may be required.' :
                                     'Documents are currently being reviewed by our verification team.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Individual Document Status */}
                    {applicationData?.documents && applicationData.documents.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Individual Documents</h4>
                            {applicationData.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {getDocumentStatusIcon(doc.status)}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{doc.documentType}</p>
                                            {doc.comments && (
                                                <p className="text-xs text-gray-600">{doc.comments}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        doc.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {doc.status === 'on_hold' ? 'On Hold' : 
                                         doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Whats Next?</h3>

                <div className="space-y-4">
                    {applicationData?.status === 'on_hold' ? (
                        <div className="flex items-start space-x-3">
                            <Clock className="w-6 h-6 text-yellow-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-gray-900">Application On Hold</h4>
                                <p className="text-sm text-gray-600">
                                    Your application is temporarily on hold. Please review the comments above and take any required actions.
                                    Our team will resume processing once all requirements are met.
                                </p>
                            </div>
                        </div>
                    ) : applicationData?.status === 'approved' ? (
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-gray-900">Loan Disbursement</h4>
                                <p className="text-sm text-gray-600">
                                    Your loan has been approved! Our disbursement team will contact you within 1-2 business days
                                    to arrange the loan disbursement process.
                                </p>
                            </div>
                        </div>
                    ) : applicationData?.status === 'rejected' ? (
                        <div className="flex items-start space-x-3">
                            <XCircle className="w-6 h-6 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-gray-900">Application Rejected</h4>
                                <p className="text-sm text-gray-600">
                                    Unfortunately, your application has been rejected. Please contact our support team
                                    for more information or to discuss reapplying in the future.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start space-x-3">
                                <div className={`w-6 h-6 ${statusInfo.currentStep >= 2 ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mt-0.5`}>
                                    <span className={`${statusInfo.currentStep >= 2 ? 'text-green-600' : 'text-blue-600'} text-sm font-bold`}>1</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Document Review Complete</h4>
                                    <p className="text-sm text-gray-600">Our team will finish reviewing your submitted documents.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className={`w-6 h-6 ${statusInfo.currentStep >= 3 ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mt-0.5`}>
                                    <span className={`${statusInfo.currentStep >= 3 ? 'text-green-600' : 'text-blue-600'} text-sm font-bold`}>2</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Field Inspector Visit</h4>
                                    <p className="text-sm text-gray-600">An inspector will schedule a visit to verify your business location.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className={`w-6 h-6 ${statusInfo.currentStep >= 4 ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mt-0.5`}>
                                    <span className={`${statusInfo.currentStep >= 4 ? 'text-green-600' : 'text-gray-400'} text-sm font-bold`}>3</span>
                                </div>
                                <div>
                                    <h4 className={`font-medium ${statusInfo.currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>Final Approval</h4>
                                    <p className={`text-sm ${statusInfo.currentStep >= 4 ? 'text-gray-600' : 'text-gray-400'}`}>Final eligibility check and loan approval decision.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>

                    <div className="space-y-4">
                        {/* Contact Information */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
                            <p className="text-sm text-blue-700 mb-2">
                                If you have any questions about your application status, please contact our support team:
                            </p>
                            <div className="text-sm text-blue-700">
                                <p>📞 Phone: +92-42-1234-5678</p>
                                <p>📧 Email: support@loanportal.com</p>
                                <p>🕒 Hours: Mon-Fri, 9 AM - 6 PM</p>
                            </div>
                        </div>

                        {/* Processing Time Info */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Expected Processing Time</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• Document Verification: 2-3 business days</p>
                                <p>• Field Inspection: 3-5 business days</p>
                                <p>• Final Approval: 1-2 business days</p>
                                <p>• Total Process: 7-10 business days</p>
                            </div>
                        </div>

                        {/* Tips for Faster Processing */}
                        {(applicationData?.status === 'pending' || applicationData?.status === 'under_review' || applicationData?.status === 'on_hold') && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-2">Tips for Faster Processing</h4>
                                <div className="text-sm text-green-700 space-y-1">
                                    <p>• Ensure all documents are clear and readable</p>
                                    <p>• Keep your phone accessible for inspector calls</p>
                                    <p>• Have original documents ready for verification</p>
                                    <p>• Respond promptly to any requests for additional information</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-gray-700">Updating status...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanTracker;