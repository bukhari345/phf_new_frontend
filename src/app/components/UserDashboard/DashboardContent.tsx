/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { CheckCircle, Clock, Building, Target, Stethoscope, AlertCircle } from 'lucide-react';

// ---------- Utility Functions ----------
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  
  // Client-side
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  
  return 'http://localhost:5000/api';
};

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('HTTP 401')) {
      return 'Authentication failed. Please login again.';
    }
    if (error.message.includes('HTTP 403')) {
      return 'Access denied. You do not have permission to view this data.';
    }
    if (error.message.includes('HTTP 404')) {
      return 'Inspector information not found.';
    }
    return error.message;
  }
  return 'An unexpected error occurred.';
};

// ---------- Types ----------
interface ApplicationData {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'field_inspection' | 'on_hold';
  updatedAt: string;
  cnic?: string;
  fullName?: string;
  createdAt?: string;
  organizationName?: string;
  // New fields from API response
  specialization?: string;
  loanAmount?: string;
  purpose?: string;
  purposeCategory?: string;
  enterpriseType?: string;
  organizationAddress?: string;
  district?: string;
  tehsil?: string;
  counsellingRequired?: string;
  documentsStatus?: 'pending' | 'approved' | 'rejected' | 'on_hold';
  documentSummary?: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    canProceedToReview: boolean;
  };
  adminComments?: string;
  approvedLoanAmount?: string;
  documents?: Array<{
    id: string;
    documentType: string;
    status: 'pending' | 'approved' | 'rejected' | 'on_hold';
    verifiedAt?: string;
    comments?: string;
  }>;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  cnic?: string;
}

interface StatusInfo {
  text: string;
  description: string;
  currentStep: number;
}

interface DashboardContentProps {
  userInfo: UserInfo;
  applicationData: ApplicationData | null;
  onNavigateToTracker: () => void;
}

// ---------- Component ----------
const DashboardContent: React.FC<DashboardContentProps> = ({
  userInfo,
  applicationData,
  onNavigateToTracker
}) => {
  const [inspectorName, setInspectorName] = useState<string>('Inspector');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Input Validation ----------
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Missing User Information</h3>
          <p className="text-sm text-gray-600">User information is required to display the dashboard.</p>
        </div>
      </div>
    );
  }

  if (!onNavigateToTracker) {
    console.warn('DashboardContent: onNavigateToTracker prop is missing');
  }

  // ---------- Memoized Values ----------
  const displayName = useMemo((): string => {
    if (userInfo.firstName && userInfo.lastName) return `${userInfo.firstName} ${userInfo.lastName}`;
    if (userInfo.firstName) return userInfo.firstName;
    if (userInfo.email) return userInfo.email.split('@')[0];
    return 'User';
  }, [userInfo.firstName, userInfo.lastName, userInfo.email]);

  const formatLoanAmount = useCallback((amount: string | undefined): string => {
    if (!amount) return '0.00';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0.00';
    return numAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const formattedLoanAmount = useMemo(() => {
    return formatLoanAmount(applicationData?.loanAmount);
  }, [applicationData?.loanAmount, formatLoanAmount]);

  const getStatusInfo = useCallback((status: string): StatusInfo => {
    switch (status) {
      case 'pending':
        return { text: 'Application Submitted', description: 'Your application has been submitted and is pending review.', currentStep: 1 };
      case 'under_review':
        return { text: 'Document Verification', description: 'We are verifying your documents. This usually takes 2–3 business days.', currentStep: 2 };
      case 'field_inspection':
        return { text: 'Field Inspector Visit', description: 'An inspector will visit your business location for verification.', currentStep: 3 };
      case 'approved':
        return { text: 'Application Approved', description: 'Your application has been approved and is ready for disbursement.', currentStep: 4 };
      case 'rejected':
        return { text: 'Application Rejected', description: 'Your application has been rejected. Please contact support for more information.', currentStep: 1 };
      case 'on_hold':
        return { text: 'Application On Hold', description: 'Your application is temporarily on hold. We will contact you soon.', currentStep: 2 };
      default:
        return { text: 'Application Submitted', description: 'Your application has been submitted and is pending review.', currentStep: 1 };
    }
  }, []);

  const statusInfo = useMemo(() => {
    return getStatusInfo(applicationData?.status || 'pending');
  }, [applicationData?.status, getStatusInfo]);

  const isApproved = useMemo(() => applicationData?.status === 'approved', [applicationData?.status]);
  const isRejected = useMemo(() => applicationData?.status === 'rejected', [applicationData?.status]);
  const isOnHold = useMemo(() => applicationData?.status === 'on_hold', [applicationData?.status]);

  // ---------- API Calls ----------
  const fetchInspectorName = useCallback(async () => {
    if (!applicationData?.id) return;

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/applications/${applicationData.id}/performed-by`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.data?.performedByUsers?.length > 0) {
        const mostRecentInspector = data.data.performedByUsers[0];
        setInspectorName(mostRecentInspector.user || 'Inspector');
      } else if (data.success && data.data?.detailedLogs?.length > 0) {
        const mostRecentLog = data.data.detailedLogs[0];
        setInspectorName(mostRecentLog.performedBy || 'Inspector');
      } else {
        setInspectorName('Inspector');
      }
    } catch (error) {
      console.error('Failed to fetch inspector name:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Better fallback logic
      const storedAdminName = 
        localStorage.getItem('adminName') || 
        sessionStorage.getItem('adminName') || 
        'Inspector';
      setInspectorName(storedAdminName);
    } finally {
      setLoading(false);
    }
  }, [applicationData?.id]);

  // ---------- Effects ----------
  useEffect(() => {
    fetchInspectorName();
  }, [fetchInspectorName]);

  // ---------- Event Handlers ----------
  const handleNavigateToTracker = useCallback(() => {
    if (onNavigateToTracker) {
      onNavigateToTracker();
    }
  }, [onNavigateToTracker]);

  const handleRetryInspectorFetch = useCallback(() => {
    fetchInspectorName();
  }, [fetchInspectorName]);

  // ---------- Render ----------
  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
          Hello, {displayName}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here are the details of your loan progress and account.
        </p>
      </div>

      {/* Show application not found message */}
      {!applicationData && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">No Application Found</h3>
              <p className="text-sm text-yellow-700">
                No loan application was found for your account. Please submit an application to view your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Grid: Right column first on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
        {/* Right Column (summary) on mobile first */}
        <div className="order-1 lg:order-2 lg:col-span-4 space-y-4 sm:space-y-5">
          {/* Loan Amount Card - Updated with real data */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-5 shadow-md text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-medium tracking-wide">Loan Amount</h3>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold">PKR</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
              PKR {formattedLoanAmount}
            </div>
            <button
              onClick={handleNavigateToTracker}
              disabled={!onNavigateToTracker}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Loan Schedule
            </button>
          </div>

          {/* Application Details Card - New */}
          {applicationData && (
            <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Application Details</h3>
              <div className="space-y-3">
                {applicationData.specialization && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Specialization</div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{applicationData.specialization}</div>
                    </div>
                  </div>
                )}
                
                {applicationData.enterpriseType && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Enterprise Type</div>
                      <div className="text-sm font-medium text-gray-900">{applicationData.enterpriseType}</div>
                    </div>
                  </div>
                )}
                
                {applicationData.purpose && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Purpose</div>
                      <div className="text-sm font-medium text-gray-900 leading-tight">{applicationData.purpose}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2.5 sm:mb-3">What Happens Next</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isApproved
                ? 'Congratulations! Your loan has been approved. The disbursement process will begin shortly.'
                : isRejected
                ? 'Your application has been rejected. Please contact our support team for more details.'
                : isOnHold
                ? 'Your application is currently on hold. We will review it shortly and contact you with updates.'
                : 'Our inspector will visit your address. Make sure your documents are ready; you will be notified before visiting.'}
            </p>
          </div>

          {/* Application Status Card */}
          {applicationData && (
            <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Real-time Status</h4>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isApproved
                      ? 'bg-green-100 text-green-600'
                      : isRejected
                      ? 'bg-red-100 text-red-600'
                      : isOnHold
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {applicationData.status?.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              {applicationData.fullName && (
                <p className="text-sm text-gray-600 mb-1.5">Applicant: {applicationData.fullName}</p>
              )}
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm text-gray-600">
                  Inspector: {loading ? 'Loading...' : inspectorName}
                </p>
                {error && (
                  <button
                    onClick={handleRetryInspectorFetch}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                )}
              </div>
              {applicationData.district && applicationData.tehsil && (
                <p className="text-sm text-gray-600 mb-1.5">
                  Location: {applicationData.district}, {applicationData.tehsil}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Updated: {new Date(applicationData.updatedAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Standard Upgrade Notice - Updated with real loan amount */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-5 border border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-blue-800 font-medium">Standard — Up to 5 Million</div>
              <button className="text-blue-600 text-xs hover:text-blue-800" aria-label="Close notice">✕</button>
            </div>
            <div className="text-xs text-blue-700 mb-3 space-y-1.5">
              <div>Requested Amount: PKR {formattedLoanAmount}</div>
              <div>Monthly Payment: {applicationData?.status === 'approved' ? 'To be calculated' : '-'}</div>
            </div>
            <button
              onClick={handleNavigateToTracker}
              disabled={!onNavigateToTracker}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Loan Schedule
            </button>
          </div>
        </div>

        {/* Left Column (main) */}
        <div className="order-2 lg:order-1 lg:col-span-8 space-y-4 sm:space-y-5">
          {/* Loan Stats Cards - Updated with real data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">PKR</span>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-500">Requested Amount</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {formattedLoanAmount}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[11px] sm:text-xs text-gray-500">Tenure</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {isApproved ? 'To be decided' : 'TBD'}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">%</span>
                </div>
                <span className="text-[11px] sm:text-xs text-gray-500">Interest Rate</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {isApproved ? 'To be decided' : 'TBD'}
              </div>
            </div>
          </div>

          {/* Business Information Card - New */}
          {applicationData && (applicationData.organizationName || applicationData.organizationAddress) && (
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Business Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {applicationData.organizationName && (
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Organization Name</div>
                    <div className="font-medium text-gray-900">{applicationData.organizationName}</div>
                  </div>
                )}
                {applicationData.organizationAddress && (
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Business Address</div>
                    <div className="font-medium text-gray-900">{applicationData.organizationAddress}</div>
                  </div>
                )}
                {applicationData.counsellingRequired && (
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Counselling Required</div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      applicationData.counsellingRequired === 'Yes' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {applicationData.counsellingRequired}
                    </div>
                  </div>
                )}
                {applicationData.documentsStatus && (
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Documents Status</div>
                    <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      applicationData.documentsStatus === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : applicationData.documentsStatus === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : applicationData.documentsStatus === 'on_hold'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {applicationData.documentsStatus.charAt(0).toUpperCase() + applicationData.documentsStatus.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Stage */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Current Stage
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Reference Number</div>
                <div className="font-medium text-gray-900 break-all">
                  Ref: {applicationData?.id || '442016'}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600 mb-0.5">Inspector Name</div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      {inspectorName}
                      {error && (
                        <button
                          onClick={handleRetryInspectorFetch}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Retry loading inspector name"
                        >
                          🔄
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Document Summary */}
            {applicationData?.documentSummary && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Document Summary</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{applicationData.documentSummary.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{applicationData.documentSummary.approved}</div>
                    <div className="text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{applicationData.documentSummary.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{applicationData.documentSummary.rejected}</div>
                    <div className="text-gray-600">Rejected</div>
                  </div>
                </div>
                {applicationData.documentSummary.canProceedToReview && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Ready for review
                  </div>
                )}
              </div>
            )}
            
            <button 
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-medium mt-3 sm:mt-4 hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!applicationData}
            >
              Download Application Summary
            </button>
          </div>

          {/* Loan Tracker */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Loan Tracker</h3>
              <button
                onClick={handleNavigateToTracker}
                disabled={!onNavigateToTracker}
                className="text-sm text-blue-600 hover:text-blue-700 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                See Loan Schedule
              </button>
            </div>

            {/* Mobile: vertical steps */}
            <div className="space-y-3 lg:hidden">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Applied</div>
                  <div className="text-xs text-gray-500">Your application has been submitted.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Eligibility</div>
                  <div className="text-xs text-gray-500">Initial checks completed.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                  isApproved ? 'bg-green-500' : statusInfo.currentStep >= 2 ? 'bg-blue-500' : 'border-2 border-gray-300'
                }`}>
                  {isApproved || statusInfo.currentStep >= 2 ? (
                    <span className="w-2 h-2 bg-white rounded-full" />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">KYC</div>
                  <div className="text-xs text-gray-500">{statusInfo.description}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-90">
                <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 ${
                  isApproved ? 'bg-green-500' : statusInfo.currentStep >= 4 ? 'bg-green-500' : 'border-2 border-gray-300'
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">Eligibility & Approval</div>
                  <div className="text-xs text-gray-500">Final checks & approval stage.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-90">
                <div className={`w-5 h-5 rounded-full mt-0.5 shrink-0 ${
                  isApproved ? 'bg-green-500' : 'border-2 border-gray-300'
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">Money Transfer</div>
                  <div className="text-xs text-gray-500">Disbursement step.</div>
                </div>
              </div>
            </div>

            {/* Desktop: horizontal steps */}
            <div className="hidden lg:flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Applied</span>
              </div>
              <div className="flex-1 h-px bg-green-500" />
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Eligibility</span>
              </div>
              <div className="flex-1 h-px bg-green-500" />
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${
                  isApproved ? 'bg-green-500' : statusInfo.currentStep >= 2 ? 'bg-blue-500' : 'border-2 border-gray-300'
                } rounded-full flex items-center justify-center`}>
                  {(isApproved || statusInfo.currentStep >= 2) && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${
                  isApproved ? 'text-green-600' : statusInfo.currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                } font-medium`}>KYC</span>
              </div>
              <div className={`flex-1 h-px ${
                isApproved ? 'bg-green-500' : statusInfo.currentStep >= 4 ? 'bg-green-500' : 'bg-gray-200'
              }`} />
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${
                  isApproved ? 'bg-green-500 rounded-full' : statusInfo.currentStep >= 4 ? 'bg-green-500 rounded-full' : 'border-2 border-gray-300 rounded-full'
                }`} />
                <span className={`text-sm ${
                  isApproved ? 'text-green-600' : statusInfo.currentStep >= 4 ? 'text-green-600' : 'text-gray-400'
                }`}>Eligibility & Approval</span>
              </div>
              <div className={`flex-1 h-px ${isApproved ? 'bg-green-500' : 'bg-gray-200'}`} />
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${
                  isApproved ? 'bg-green-500 rounded-full' : 'border-2 border-gray-300 rounded-full'
                }`} />
                <span className={`text-sm ${isApproved ? 'text-green-600' : 'text-gray-400'}`}>Money Transfer</span>
              </div>
            </div>

            {/* Disbursement Mode */}
            <div className="border-t mt-4 pt-4">
              <h4 className="font-medium text-gray-900 mb-2.5 sm:mb-3">Disbursement Mode</h4>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Status</div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isApproved
                        ? 'bg-green-100 text-green-600'
                        : isRejected
                        ? 'bg-red-100 text-red-600'
                        : isOnHold
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {isApproved ? 'Approved' : isRejected ? 'Rejected' : isOnHold ? 'On Hold' : 'Pending'}
                  </div>
                </div>
                <button 
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 self-start sm:self-auto disabled:opacity-50"
                  disabled={!isApproved}
                >
                  Update Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>{/* grid */}
    </div>
  );
};

export default DashboardContent;