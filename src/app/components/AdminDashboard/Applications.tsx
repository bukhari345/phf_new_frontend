import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Eye, Download, Loader2, AlertCircle, FileText,
  Search, Filter, X, User, Building2, MapPin, Calendar, DollarSign, Phone
} from 'lucide-react';

/* ----------------------------- Types ----------------------------- */
interface Document {
  id: string;
  documentType: string;
  originalName: string;
  fileSize: number;
  processingStatus: string;
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

interface ApprovalData {
  applicationId: string | null;
  originalAmount: number;
  approvedAmount: string;
  comments: string;
}

interface RejectionData {
  applicationId: string | null;
  comments: string;
}

interface UnderReviewData {
  applicationId: string | null;
  comments: string;
}

const ApplicationsManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showUnderReviewModal, setShowUnderReviewModal] = useState(false);
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    applicationId: null,
    originalAmount: 0,
    approvedAmount: '',
    comments: ''
  });
  const [rejectionData, setRejectionData] = useState<RejectionData>({
    applicationId: null,
    comments: ''
  });
  const [underReviewData, setUnderReviewData] = useState<UnderReviewData>({
    applicationId: null,
    comments: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleApproveClick = (application: Application) => {
    setApprovalData({
      applicationId: application.id,
      originalAmount: application.loanAmount || 0,
      approvedAmount: (application.loanAmount || 0).toString(),
      comments: ''
    });
    setShowApprovalModal(true);
  };

  const handleRejectClick = (application: Application) => {
    setRejectionData({
      applicationId: application.id,
      comments: ''
    });
    setShowRejectionModal(true);
  };

  const handleUnderReviewClick = (application: Application) => {
    setUnderReviewData({
      applicationId: application.id,
      comments: ''
    });
    setShowUnderReviewModal(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      const adminName = localStorage.getItem("adminName") || "Unknown Admin";

      const response = await fetch(
        `${API_BASE_URL}/applications/${approvalData.applicationId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            performedBy: adminName,
            approvedLoanAmount: parseFloat(approvalData.approvedAmount),
            adminComments: approvalData.comments,
            notes: 'Application approved via admin panel',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Application approved successfully!');
        fetchApplications();
        setShowApprovalModal(false);
        setSelectedApp(null);
        setApprovalData({
          applicationId: null,
          originalAmount: 0,
          approvedAmount: '',
          comments: '',
        });
      } else {
        alert('Failed to approve application: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application. Please try again.');
    }
  };

  const handleRejectionSubmit = async () => {
    try {
      const adminName = localStorage.getItem('adminName') || 'Unknown Admin';
      const response = await fetch(`${API_BASE_URL}/applications/${rejectionData.applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          performedBy: adminName,
          adminComments: rejectionData.comments,
          notes: 'Application rejected via admin panel'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Application rejected successfully!');
        fetchApplications();
        setShowRejectionModal(false);
        setSelectedApp(null);
        setRejectionData({
          applicationId: null,
          comments: ''
        });
      } else {
        alert('Failed to reject application: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application. Please try again.');
    }
  };

  const handleUnderReviewSubmit = async () => {
    try {
      const adminName = localStorage.getItem('adminName') || 'Unknown Admin';
      const response = await fetch(`${API_BASE_URL}/applications/${underReviewData.applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'under_review',
          performedBy: adminName,
          adminComments: underReviewData.comments,
          notes: 'Application marked as under review via admin panel'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Application marked as under review successfully!');
        fetchApplications();
        setShowUnderReviewModal(false);
        setSelectedApp(null);
        setUnderReviewData({
          applicationId: null,
          comments: ''
        });
      } else {
        alert('Failed to mark application as under review: ' + result.error);
      }
    } catch (error) {
      console.error('Error marking application as under review:', error);
      alert('Error marking application as under review. Please try again.');
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${API_BASE_URL}/applications?page=1&limit=50`);
      const data: ApiResponse = await resp.json();
      if (data.success) setApplications(data.data.applications);
      else setError(data.error || 'Failed to fetch applications');
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

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cnic.includes(searchTerm) ||
      app.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Applications Management</h2>
        <p className="text-blue-100">Manage and review all applications</p>
        
        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, CNIC, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-900 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-gray-900 pl-10 pr-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm appearance-none min-w-[180px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
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
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Applications ({filteredApplications.length})
                </h3>
                <div className="text-sm text-gray-600">
                  {statusFilter !== 'all' && `Filtered by: ${statusFilter.replace('_', ' ')}`}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNIC
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                            <div className="text-sm text-gray-500">{app.organizationName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {app.cnic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          {app.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          {formatCurrency(app.loanAmount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            View Details
                          </button>
                          
                          {(app.status === 'pending' || app.status === 'under_review') && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApproveClick(app)}
                                disabled={updatingStatus === app.id}
                                className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {updatingStatus === app.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleUnderReviewClick(app)}
                                disabled={updatingStatus === app.id}
                                className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 p-1 rounded transition-colors disabled:opacity-50"
                                title="Mark as Under Review"
                              >
                                <Eye size={16} />
                              </button>
                              
                              <button
                                onClick={() => handleRejectClick(app)}
                                disabled={updatingStatus === app.id}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Professional Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Application Details</h2>
                  <p className="text-blue-100 mt-1">
                    Application ID: {selectedApp.id.substring(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(selectedApp.status)}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-8">
                {/* Personal & Organization Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Full Name</span>
                        <span className="text-sm text-gray-900">{selectedApp.fullName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Fathers Name</span>
                        <span className="text-sm text-gray-900">{selectedApp.fatherName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">CNIC</span>
                        <span className="text-sm text-gray-900 font-mono">{selectedApp.cnic}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Gender</span>
                        <span className="text-sm text-gray-900">{selectedApp.gender}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">District</span>
                        <span className="text-sm text-gray-900">{selectedApp.district}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Tehsil</span>
                        <span className="text-sm text-gray-900">{selectedApp.tehsil}</span>
                      </div>
                    </div>
                  </div>

                  {/* Organization Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Organization Details</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Organization</span>
                        <span className="text-sm text-gray-900">{selectedApp.organizationName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Enterprise Type</span>
                        <span className="text-sm text-gray-900">{selectedApp.enterpriseType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Employment</span>
                        <span className="text-sm text-gray-900">{selectedApp.natureOfEmployment}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Specialization</span>
                        <span className="text-sm text-gray-900">{selectedApp.specialization}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Phone</span>
                        <span className="text-sm text-gray-900">{selectedApp.organizationPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Loan Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600">Requested Amount</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(selectedApp.loanAmount || 0)}
                      </p>
                    </div>
                    {selectedApp.approvedLoanAmount && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(selectedApp.approvedLoanAmount)}
                        </p>
                      </div>
                    )}
                    {selectedApp.approvedAt && (
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">Approved Date</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {new Date(selectedApp.approvedAt).toLocaleDateString()}
                        </p>
                        {selectedApp.approvedBy && (
                          <p className="text-sm text-gray-600 mt-1">By: {selectedApp.approvedBy}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedApp.adminComments && (
                    <div className="mt-4 bg-white rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Admin Comments</p>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-md p-3">
                        {selectedApp.adminComments}
                      </p>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Documents ({selectedApp.documents.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.documentType.replace(/[-_]/g, ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          Size: {formatFileSize(doc.fileSize)}
                        </div>
                        <button
                          onClick={() => downloadDocument(selectedApp.id, doc.id, doc.originalName)}
                          className="w-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Applied: {new Date(selectedApp.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-3">
                  {(selectedApp.status === 'pending' || selectedApp.status === 'under_review') && (
                    <>
                      <button
                        onClick={() => handleApproveClick(selectedApp)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUnderReviewClick(selectedApp)}
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center transition-colors"
                      >
                        <Eye size={16} className="mr-2" />
                        Under Review
                      </button>
                      <button
                        onClick={() => handleRejectClick(selectedApp)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Approve Application</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approved Loan Amount (PKR)
              </label>
              <input
                type="number"
                value={approvalData.approvedAmount}
                onChange={(e) => setApprovalData({ ...approvalData, approvedAmount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter approved amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Original requested: {formatCurrency(approvalData.originalAmount)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Comments
              </label>
              <textarea
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add comments about the approval decision..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalSubmit}
                disabled={!approvalData.approvedAmount}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionData.comments}
                onChange={(e) => setRejectionData({ ...rejectionData, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Please provide a detailed reason for rejection..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectionSubmit}
                disabled={!rejectionData.comments.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Under Review Modal */}
      {showUnderReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mark as Under Review</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments *
              </label>
              <textarea
                value={underReviewData.comments}
                onChange={(e) => setUnderReviewData({ ...underReviewData, comments: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add comments about why this application needs review..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnderReviewModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnderReviewSubmit}
                disabled={!underReviewData.comments.trim()}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Under Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;