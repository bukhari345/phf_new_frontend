import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Eye, Download, Loader2, AlertCircle, FileText,
  Search, X, User, Building2, MapPin, Calendar, DollarSign, Phone, CalendarCheck, Clock
} from 'lucide-react';

/* ----------------------------- Types ----------------------------- */
interface SiteInspection {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  inspectionDate?: string;
  inspectionTime?: string;
  inspectionResult?: string | null;
  inspectorName?: string;
  inspectorContact?: string;
  notes?: string;
}

interface Document {
  id: string;
  documentType: string;
  originalName: string;
  fileSize: number;
  processingStatus: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

interface Application {
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
  createdAt: string;
  documents: Document[];
  loanAmount?: number;
  approvedLoanAmount?: number;
  approvedAt?: string;
  approvedBy?: string;
  adminComments?: string;
  siteInspections?: SiteInspection[];
}

interface ApplicationReviewData {
  finalDecision: 'approved' | 'rejected';
  approvedLoanAmount: string;
  applicationComments: string;
}

interface SiteInspectionData {
  inspectionDate: string;
  inspectionTime: string;
  inspectorName: string;
  inspectorContact: string;
  notes: string;
}

interface ApiResponse {
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

const ApprovedApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentVerificationStates, setDocumentVerificationStates] = useState<{ [key: string]: 'approved' | 'rejected' | 'pending' }>({});
  const [updatingDocument, setUpdatingDocument] = useState<string | null>(null);
  const [showFinalReviewModal, setShowFinalReviewModal] = useState(false);
  const [showSiteInspectionModal, setShowSiteInspectionModal] = useState(false);
  const [schedulingInspection, setSchedulingInspection] = useState(false);
  const [processingReview, setProcessingReview] = useState(false);
  
  const [applicationReviewData, setApplicationReviewData] = useState<ApplicationReviewData>({
    finalDecision: 'approved',
    approvedLoanAmount: '',
    applicationComments: ''
  });

  const [siteInspectionData, setSiteInspectionData] = useState<SiteInspectionData>({
    inspectionDate: '',
    inspectionTime: '',
    inspectorName: '',
    inspectorContact: '',
    notes: ''
  });

  const API_BASE_URL = 'http://16.171.43.146/api';

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${API_BASE_URL}/applications?page=1&limit=50`);
      const data: ApiResponse = await resp.json();
      if (data.success) {
        // Show all applications (not just approved) since this is inspector view
        setApplications(data.data.applications);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch {
      setError('Network error - please check if backend is running');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (applicationId: string, documentId: string, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else setError('Failed to download document');
    } catch {
      setError('Failed to download document');
    }
  };

  const previewDocument = async (applicationId: string, documentId: string) => {
    // Placeholder for document preview functionality
    console.log('Preview document:', documentId);
  };

  const handleDocumentVerification = (documentId: string, status: 'approved' | 'rejected' | 'pending') => {
    setDocumentVerificationStates(prev => ({
      ...prev,
      [documentId]: status
    }));
  };

  const verifyDocument = async (applicationId: string, documentId: string, verificationStatus: 'approved' | 'rejected') => {
    setUpdatingDocument(documentId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Document verified:', documentId, verificationStatus);
    } catch (error) {
      setError('Failed to update document verification');
    } finally {
      setUpdatingDocument(null);
    }
  };

  const handleFinalReview = () => {
    setApplicationReviewData({
      finalDecision: 'approved',
      approvedLoanAmount: selectedApp?.loanAmount?.toString() || '',
      applicationComments: ''
    });
    setShowFinalReviewModal(true);
  };

  const handleScheduleInspection = () => {
    setSiteInspectionData({
      inspectionDate: '',
      inspectionTime: '',
      inspectorName: '',
      inspectorContact: '',
      notes: ''
    });
    setShowSiteInspectionModal(true);
  };

  const submitApplicationReview = async () => {
    setProcessingReview(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Application review submitted:', applicationReviewData);
      setShowFinalReviewModal(false);
      setSelectedApp(null);
      fetchApplications(); // Refresh data
    } catch (error) {
      setError('Failed to submit application review');
    } finally {
      setProcessingReview(false);
    }
  };

  // const submitSiteInspection = async () => {
  //   setSchedulingInspection(true);
  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     console.log('Site inspection scheduled:', siteInspectionData);
  //     setShowSiteInspectionModal(false);
      
  //     // Update the selected app with the new inspection
  //     if (selectedApp) {
  //       const newInspection: SiteInspection = {
  //         id: `insp_${Date.now()}`,
  //         status: 'scheduled',
  //         inspectionDate: siteInspectionData.inspectionDate,
  //         inspectionTime: siteInspectionData.inspectionTime,
  //         inspectorName: siteInspectionData.inspectorName,
  //         inspectorContact: siteInspectionData.inspectorContact,
  //         notes: siteInspectionData.notes
  //       };
        
  //       setSelectedApp({
  //         ...selectedApp,
  //         siteInspections: [...(selectedApp.siteInspections || []), newInspection]
  //       });
  //     }
      
  //     fetchApplications(); // Refresh data
  //   } catch (error) {
  //     setError('Failed to schedule site inspection');
  //   } finally {
  //     setSchedulingInspection(false);
  //   }
  // };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.includes(searchTerm) ||
      app.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'approved' ? 'bg-green-500' : 
          status === 'rejected' ? 'bg-red-500' : 
          status === 'under_review' ? 'bg-blue-500' : 'bg-yellow-500'
        }`}></div>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'approved' ? 'bg-green-500' : 
          status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        {status.toUpperCase()}
      </span>
    );
  };

  // Helper function to check if document is finalized (approved or rejected)
  const isDocumentFinalized = (docId: string, originalStatus: string) => {
    const currentStatus = documentVerificationStates[docId] || originalStatus;
    return currentStatus === 'approved' || currentStatus === 'rejected';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-400 text-white">
        <div className="px-8 py-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3">Inspector Applications</h1>
              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Conduct on-site inspections to verify location, ownership, and operational readiness of<br />
                the proposed facility.
              </p>
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white text-gray-900 pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 shadow-sm w-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="mr-2 w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-3 w-6 h-6 text-blue-600" />
            <span className="text-gray-600">Loading applications...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">
                  <span className="w-4 h-4 rounded border border-gray-300 mr-3"></span>
                  #
                </div>
                <div className="col-span-2">APPLICANT NAME</div>
                <div className="col-span-2">LOAN SCHEME</div>
                <div className="col-span-2">LOAN AMOUNT</div>
                <div className="col-span-2">INSPECTION DATE</div>
                <div className="col-span-2">INSPECTION TIME</div>
                <div className="col-span-1">VIEW DOCS</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredApplications.map((app, index) => {
                // Get scheduled inspection if exists
                const scheduledInspection = app.siteInspections?.find(inspection => 
                  inspection.status === 'scheduled'
                );

                return (
                  <div key={app.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center">
                    {/* Checkbox and Number */}
                    <div className="col-span-1 flex items-center">
                      <span className="w-4 h-4 rounded border border-gray-300 mr-3"></span>
                      <span className="text-sm text-gray-600">{index + 1}</span>
                    </div>

                    {/* Applicant Name */}
                    <div className="col-span-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        {app.fullName}
                      </button>
                    </div>

                    {/* Loan Scheme */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">Scheme 1</span>
                    </div>

                    {/* Loan Amount */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 font-medium">
                        {formatCurrency(app.approvedLoanAmount || app.loanAmount || 0)}
                      </span>
                    </div>

                    {/* Inspection Date */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {scheduledInspection?.inspectionDate 
                          ? new Date(scheduledInspection.inspectionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </span>
                    </div>

                    {/* Inspection Time */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900">
                        {scheduledInspection?.inspectionTime 
                          ? scheduledInspection.inspectionTime.slice(0, 5) // Format HH:MM from HH:MM:SS
                          : '-'
                        }
                      </span>
                    </div>

                    {/* View Docs */}
                    <div className="col-span-1 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View Document"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No applications found matching your search.' : 'No applications found.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">Application Details</h2>
                  <p className="text-gray-600 mt-1">{selectedApp.fullName} - {selectedApp.organizationName}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-8">
                {/* Application Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Full Name *</label>
                        <div className="text-blue-600 font-medium">{selectedApp.fullName}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Father Name *</label>
                        <div className="text-blue-600">{selectedApp.fatherName}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">CNIC *</label>
                        <div className="text-blue-600 font-mono">{selectedApp.cnic}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Personal Address *</label>
                        <div className="text-blue-600">{selectedApp.personalAddress}</div>
                      </div>
                    </div>

                    {/* Middle Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Organization Name *</label>
                        <div className="text-blue-600 font-medium">{selectedApp.organizationName}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Organization Address *</label>
                        <div className="text-blue-600">{selectedApp.organizationAddress}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Organization Phone *</label>
                        <div className="text-blue-600">{selectedApp.organizationPhone}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Enterprise Type *</label>
                        <div className="text-blue-600">{selectedApp.enterpriseType}</div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">District *</label>
                        <div className="text-blue-600">{selectedApp.district}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Tehsil *</label>
                        <div className="text-blue-600">{selectedApp.tehsil}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Nature of Employment *</label>
                        <div className="text-blue-600">{selectedApp.natureOfEmployment}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Specialization *</label>
                        <div className="text-blue-600">{selectedApp.specialization}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Loan Amount *</label>
                        <div className="text-blue-600 font-semibold">{formatCurrency(selectedApp.loanAmount || 0)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Inspection Details Section */}
                {(() => {
                  const scheduledInspection = selectedApp.siteInspections?.find(inspection => 
                    inspection.status === 'scheduled'
                  );
                  const hasScheduledInspection = !!scheduledInspection;

                  return hasScheduledInspection && scheduledInspection && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Site Inspection Details</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <CalendarCheck className="w-5 h-5 text-purple-600 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Inspection Date</div>
                                <div className="text-purple-600 font-medium">
                                  {scheduledInspection.inspectionDate 
                                    ? new Date(scheduledInspection.inspectionDate).toLocaleDateString()
                                    : 'Not set'
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Clock className="w-5 h-5 text-purple-600 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-700">Inspection Time</div>
                                <div className="text-purple-600 font-medium">
                                  {scheduledInspection.inspectionTime 
                                    ? new Date(`2000-01-01T${scheduledInspection.inspectionTime}`).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Not set'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <div className="w-5 h-5 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-purple-600">ID</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Inspection ID</div>
                                <div className="text-purple-600 font-mono text-xs">
                                  {scheduledInspection.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Status</div>
                                <div className="text-green-600 font-medium capitalize">
                                  {scheduledInspection.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-purple-700">
                              Site inspection {scheduledInspection.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Documents Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Documents Review ({selectedApp.documents.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* Document Card Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center flex-1">
                            <div className="bg-blue-50 p-2 rounded-lg mr-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.documentType.replace(/[-_]/g, ' ').toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{doc.originalName}</div>
                            </div>
                          </div>
                        </div>

                        {/* Document Actions - First Line: Document name and Preview button */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-700 font-medium">Document</span>
                          <button
                            onClick={() => previewDocument(selectedApp.id, doc.id)}
                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </button>
                        </div>

                        {/* Second Line: Select dropdown and Download icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1 mr-3 relative">
                            <select
                              value={documentVerificationStates[doc.id] || doc.verificationStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value as 'approved' | 'rejected' | 'pending';
                                handleDocumentVerification(doc.id, newStatus);
                                if (newStatus !== 'pending' && newStatus !== doc.verificationStatus) {
                                  verifyDocument(selectedApp.id, doc.id, newStatus);
                                }
                              }}
                              disabled={updatingDocument === doc.id || isDocumentFinalized(doc.id, doc.verificationStatus)}
                              className={`w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                                isDocumentFinalized(doc.id, doc.verificationStatus) ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            >
                              <option value="pending">Pending Review</option>
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            {updatingDocument === doc.id && (
                              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => downloadDocument(selectedApp.id, doc.id, doc.originalName)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Verification Status */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 mb-2">Verification Status:</div>
                          {getDocumentStatusBadge(documentVerificationStates[doc.id] || doc.verificationStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Application Status: {getStatusBadge(selectedApp.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Documents: {selectedApp.documents.filter(doc =>
                        (documentVerificationStates[doc.id] || doc.verificationStatus) === 'approved'
                      ).length}/{selectedApp.documents.length} Approved
                    </div>
                    {(() => {
                      const hasScheduledInspection = selectedApp.siteInspections?.find(inspection => 
                        inspection.status === 'scheduled'
                      );
                      return hasScheduledInspection && (
                        <div className="text-sm text-purple-600 font-medium">
                          Site Inspection Scheduled
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex space-x-4">
                    {/* Final Review Button - Show when all documents are approved and status is pending */}
                    {(() => {
                      const allDocsApproved = selectedApp.documents.length > 0 &&
                        selectedApp.documents.every(doc =>
                          (documentVerificationStates[doc.id] || doc.verificationStatus) === 'approved'
                        );
                      const canProceedToReview = allDocsApproved && selectedApp.status === 'pending';

                      return canProceedToReview && (
                        <button
                          onClick={handleFinalReview}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Final Review
                        </button>
                      );
                    })()}

              
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Review Modal */}
      {showFinalReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Final Application Review</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Final Decision
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="finalDecision"
                    value="approved"
                    checked={applicationReviewData.finalDecision === 'approved'}
                    onChange={(e) => setApplicationReviewData({
                      ...applicationReviewData,
                      finalDecision: e.target.value as 'approved' | 'rejected'
                    })}
                    className="mr-3"
                  />
                  <span className="text-green-700 font-medium">Approve Application</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="finalDecision"
                    value="rejected"
                    checked={applicationReviewData.finalDecision === 'rejected'}
                    onChange={(e) => setApplicationReviewData({
                      ...applicationReviewData,
                      finalDecision: e.target.value as 'approved' | 'rejected'
                    })}
                    className="mr-3"
                  />
                  <span className="text-red-700 font-medium">Reject Application</span>
                </label>
              </div>
            </div>

            {applicationReviewData.finalDecision === 'approved' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Loan Amount (PKR)
                </label>
                <input
                  type="number"
                  value={applicationReviewData.approvedLoanAmount}
                  onChange={(e) => setApplicationReviewData({
                    ...applicationReviewData,
                    approvedLoanAmount: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter approved amount"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments *
              </label>
              <textarea
                value={applicationReviewData.applicationComments}
                onChange={(e) => setApplicationReviewData({
                  ...applicationReviewData,
                  applicationComments: e.target.value
                })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add your review comments..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFinalReviewModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={processingReview}
              >
                Cancel
              </button>
              <button
                onClick={submitApplicationReview}
                disabled={!applicationReviewData.applicationComments.trim() || processingReview}
                className={`px-6 py-3 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center ${applicationReviewData.finalDecision === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {processingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {applicationReviewData.finalDecision === 'approved' ? 'Approve Application' : 'Reject Application'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Inspection Modal */}
      {showSiteInspectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CalendarCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Schedule Site Inspection</h3>
            </div>

            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Date *
                </label>
                <input
                  type="date"
                  value={siteInspectionData.inspectionDate}
                  onChange={(e) => setSiteInspectionData({
                    ...siteInspectionData,
                    inspectionDate: e.target.value
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Time *
                </label>
                <input
                  type="time"
                  value={siteInspectionData.inspectionTime}
                  onChange={(e) => setSiteInspectionData({
                    ...siteInspectionData,
                    inspectionTime: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Inspector Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Name
                </label>
                <input
                  type="text"
                  value={siteInspectionData.inspectorName}
                  onChange={(e) => setSiteInspectionData({
                    ...siteInspectionData,
                    inspectorName: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter inspector name"
                />
              </div>

              {/* Inspector Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Contact
                </label>
                <input
                  type="text"
                  value={siteInspectionData.inspectorContact}
                  onChange={(e) => setSiteInspectionData({
                    ...siteInspectionData,
                    inspectorContact: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter phone number or email"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={siteInspectionData.notes}
                  onChange={(e) => setSiteInspectionData({
                    ...siteInspectionData,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSiteInspectionModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={schedulingInspection}
              >
                Cancel
              </button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedApplications;