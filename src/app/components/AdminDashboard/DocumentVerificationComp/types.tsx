/* eslint-disable @typescript-eslint/no-explicit-any */
// types.ts
export interface Document {
  rejectionReason: string;
  id: string;
  documentType: string;
  originalName: string;
  fileSize: number;
  processingStatus: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  version?: number;
}

export interface SiteInspection {
  id: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectorName?: string;
  inspectorContact?: string;
  notes?: string;
  status: string;
  scheduledAt: string;
}

export interface Application {
  siteInspection: any;
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string;
  gender: string;
  personalAddress: string;
  district: string;
  tehsil: string;
  organizationName: string;
  organizationAddress: string;
  organizationPhone: string;
  enterpriseType: string;
  counsellingRequired: string;
  natureOfEmployment: string;
  specialization: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documentsStatus?: string;
  createdAt: string;
  documents: Document[];
  siteInspections?: SiteInspection[];
  loanAmount?: number;
  approvedLoanAmount?: number;
  approvedAt?: string;
  approvedBy?: string;
  adminComments?: string;
  scheme?: string;
  documentSummary?: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    canProceedToReview: boolean;
  };
}

export interface ApiResponse {
  success: boolean;
  data: {
    applications: Application[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalApplications: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  error?: string;
}

export interface ApplicationReviewData {
  applicationId: string | null;
  applicationComments: string;
  finalDecision: 'approved' | 'rejected';
  approvedLoanAmount?: string;
}

export interface SiteInspectionData {
  inspectionDate: string;
  inspectionTime: string;
  inspectorName: string;
  inspectorContact: string;
  notes: string;
}

// Constants
export const PUNJAB_DISTRICTS = [
  'Attock', 'Bahawalnagar', 'Bahawalpur', 'Bhakkar', 'Chakwal', 'Chiniot',
  'Dera Ghazi Khan', 'Faisalabad', 'Gujranwala', 'Gujrat', 'Hafizabad',
  'Jhang', 'Jhelum', 'Kasur', 'Khanewal', 'Khushab', 'Lahore', 'Layyah',
  'Lodhran', 'Mandi Bahauddin', 'Mianwali', 'Multan', 'Muzaffargarh',
  'Narowal', 'Nankana Sahib', 'Okara', 'Pakpattan', 'Rahim Yar Khan',
  'Rajanpur', 'Rawalpindi', 'Sahiwal', 'Sargodha', 'Sheikhupura',
  'Sialkot', 'Toba Tek Singh', 'Vehari', 'Wazirabad'
].sort();

// Utility functions
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatCurrency = (amount: number) => {
  return `PKR ${amount.toLocaleString()}`;
};

export const getStatusBadge = (status: string) => {
  const statusStyles = {
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    under_review: 'bg-orange-100 text-orange-800 border-orange-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  const statusText = {
    approved: 'Approved',
    rejected: 'Rejected',
    under_review: 'Under Review',
    pending: 'Pending'
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
      {statusText[status as keyof typeof statusText] || 'Pending'}
    </span>
  );
};

export const getDocumentStatusBadge = (status: string) => {
  const statusStyles = {
    approved: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  const statusText = {
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
      {statusText[status as keyof typeof statusText] || 'Pending'}
    </span>
  );
};

export const getDocumentsSummaryBadge = (app: Application) => {
  const summary = app.documentSummary;
  if (!summary) return null;

  if (summary.pending > 0) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
        {summary.pending} Pending Review
      </span>
    );
  }

  if (summary.rejected > 0) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 border border-red-200">
        {summary.rejected} Rejected
      </span>
    );
  }

  if (summary.approved === summary.total && summary.total > 0) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 border border-green-200">
        All Verified
      </span>
    );
  }

  return (
    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 border border-gray-200">
      {summary.approved}/{summary.total} Verified
    </span>
  );
};

export const getInspectionStatusBadge = (status: string) => {
  const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    rescheduled: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};