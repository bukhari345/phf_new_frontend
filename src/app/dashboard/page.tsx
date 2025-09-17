// Dashboard.tsx - Updated and Fixed version
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/UserDashboard/Sidebar';
import DashboardContent from '../components/UserDashboard/DashboardContent';
import LoanTracker from '../components/UserDashboard/LoanTracker';
import LoanDetails from '../components/UserDashboard/loanDetails';
import ViewDocuments from '../components/UserDashboard/ViewDocuments';
import { Menu, X } from 'lucide-react';

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
      return 'Application data not found.';
    }
    if (error.message.includes('HTTP 500')) {
      return 'Server error. Please try again later.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// ---------- Types ----------
interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  cnic?: string;
}

// Standardized ApplicationData interface
interface ApplicationData {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'field_inspection' | 'on_hold';
  updatedAt: string;
  cnic?: string;
  fullName?: string;
  createdAt?: string;
  organizationName?: string;
  // Fields from API response
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
  // Additional fields that might be needed by LoanTracker
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

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'loanTracker' | 'installmentPlans' | 'viewDocuments'
  >('dashboard');

  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    profession: '',
    cnic: '',
  });

  // ---------- Helper Functions ----------
  const getStoredAuthData = useCallback(() => {
    const tokenKeys = ['authToken', 'token', 'accessToken'];
    const userKeys = ['user'];

    let token = null;
    let storedUser = null;

    // Try to get token from localStorage and sessionStorage
    for (const key of tokenKeys) {
      token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) break;
    }

    // Try to get user data from localStorage and sessionStorage
    for (const key of userKeys) {
      storedUser = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (storedUser) break;
    }

    return { token, storedUser };
  }, []);

  // ---------- Data Fetching ----------
  const fetchApplicationData = useCallback(async (cnic: string): Promise<void> => {
    if (!cnic) {
      setError('CNIC is required to fetch application data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/applications?search=${encodeURIComponent(cnic)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if token exists
            ...(getStoredAuthData().token && {
              'Authorization': `Bearer ${getStoredAuthData().token}`
            })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data?.success && Array.isArray(data?.data?.applications) && data.data.applications.length) {
        // Get the first application and map all the fields
        const application = data.data.applications[0];
        setApplicationData({
          id: application.id,
          status: application.status,
          updatedAt: application.updatedAt,
          createdAt: application.createdAt,
          cnic: application.cnic,
          fullName: application.fullName,
          organizationName: application.organizationName,
          // Map the new fields from API response
          specialization: application.specialization,
          loanAmount: application.loanAmount,
          purpose: application.purpose,
          purposeCategory: application.purposeCategory,
          enterpriseType: application.enterpriseType,
          organizationAddress: application.organizationAddress,
          district: application.district,
          tehsil: application.tehsil,
          counsellingRequired: application.counsellingRequired,
          documentsStatus: application.documentsStatus,
          documentSummary: application.documentSummary,
          // Additional fields for LoanTracker
          adminComments: application.adminComments,
          approvedLoanAmount: application.approvedLoanAmount,
          documents: application.documents
        });
      } else {
        setApplicationData(null);
        if (data?.success === false) {
          setError(data.message || 'No application found for the provided CNIC.');
        }
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getStoredAuthData]);

  // ---------- Effects ----------
  useEffect(() => {
    const { token, storedUser } = getStoredAuthData();

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          profession: user.profession || '',
          cnic: user.cnic || '',
        });
        if (user.cnic) {
          fetchApplicationData(user.cnic);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setError('Invalid user data found. Please login again.');
      }
    } else {
      setError('Authentication required. Please login to continue.');
    }
  }, [fetchApplicationData, getStoredAuthData]);

  // Lock body scroll + close with Esc when drawer is open
  useEffect(() => {
    if (!isSidebarOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSidebarOpen]);

  // ---------- Navigation ----------
  const handleNavigation = useCallback((
    view: 'dashboard' | 'loanTracker' | 'installmentPlans' | 'viewDocuments'
  ): void => {
    setCurrentView(view);
    setIsSidebarOpen(false); // close drawer on mobile
  }, []);

  // Retry function for failed requests
  const handleRetry = useCallback(() => {
    if (userInfo.cnic) {
      fetchApplicationData(userInfo.cnic);
    }
  }, [userInfo.cnic, fetchApplicationData]);

  // ---------- Render helpers ----------
  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-600">Loading application data...</p>
        </div>
      );
    }

    // Show error state with retry option
    if (error && !applicationData) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-center max-w-md">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardContent
            userInfo={userInfo}
            applicationData={applicationData}
            onNavigateToTracker={() => handleNavigation('loanTracker')}
          />
        );
      case 'loanTracker':
        return (
          <LoanTracker
            applicationId={userInfo.cnic || ''} // Pass CNIC as applicationId
            onBackToDashboard={() => handleNavigation('dashboard')}
            initialApplicationData={applicationData}
          />
        );
      case 'installmentPlans':
        return (
          <LoanDetails
            onBackToDashboard={() => handleNavigation('dashboard')}
            userCnic={userInfo.cnic || ''}
          />
        );
      case 'viewDocuments':
        return (
          <ViewDocuments
            userCnic={userInfo.cnic || ''}
            onBackToDashboard={() => handleNavigation('dashboard')}
          />
        );
      default:
        return (
          <DashboardContent
            userInfo={userInfo}
            applicationData={applicationData}
            onNavigateToTracker={() => handleNavigation('loanTracker')}
          />
        );
    }
  };

  // ---------- JSX ----------
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#f9fbff_40%,#f6f9ff_100%)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <Header />
      </div>

      {/* Mobile top bar with hamburger */}
      <div className="px-4 pt-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm active:scale-[0.99]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>

      {/* FIXED DESKTOP SIDEBAR (visible md+) */}
      <aside
        className="
          fixed left-0 top-[64px] z-30 hidden md:block
          h-[calc(100vh-64px)]
          w-[16rem] lg:w-[18rem] xl:w-[20rem] 2xl:w-[22rem]
          border-r border-gray-200 bg-white
        "
      >
        <div className="h-full overflow-y-auto p-4">
          <Sidebar currentView={currentView} onNavigate={handleNavigation} />
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {isSidebarOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/45 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* drawer */}
          <div
            className="
              fixed inset-y-0 left-0 z-50 md:hidden
              h-[100dvh] w-[86vw] max-w-[20rem] sm:w-[20rem]
              bg-white shadow-2xl flex flex-col
            "
            role="dialog"
            aria-modal="true"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Navigation</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-md p-2 hover:bg-gray-100 active:scale-[0.98]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* scroll area inside drawer */}
            <div className="flex-1 overflow-y-auto p-3 overscroll-contain">
              <Sidebar currentView={currentView} onNavigate={handleNavigation} />
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <main
        className="
          min-w-0 px-3 pb-8 pt-4
          sm:px-5 sm:pt-6
          md:px-8 md:pt-8
          md:pl-[16rem] lg:pl-[18rem] xl:pl-[20rem] 2xl:pl-[22rem]
        "
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mx-auto w-full max-w-[1200px] md:max-w-[1280px] lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px]">
          {/* Show error banner if there's an error but we still have data */}
          {error && applicationData && (
            <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 shadow-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="ml-3 text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          <section
            className="
              rounded-2xl bg-white p-4 sm:p-5 md:p-6 lg:p-7 shadow-sm
              ring-1 ring-black/[0.02]
            "
          >
            {renderCurrentView()}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;