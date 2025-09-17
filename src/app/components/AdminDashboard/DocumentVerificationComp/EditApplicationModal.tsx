// ApplicationEditModal.tsx - Fixed version with proper status handling
import React, { useState, useEffect } from 'react';
import {
  Edit3, X, Eye, Download, Loader2, FileText, CheckCircle, XCircle, Clock,
  AlertTriangle, Save, User, Building, MapPin, DollarSign, MessageSquare
} from 'lucide-react';
import { 
  Application, 
  formatCurrency, 
  getStatusBadge, 
  getDocumentStatusBadge 
} from './types';

interface ApplicationEditModalProps {
  selectedApp: Application;
  onClose: () => void;
  onSaveChanges: (applicationId: string, changes: ApplicationEditData) => void;
  onDownloadDocument: (applicationId: string, documentId: string, fileName: string) => void;
  onPreviewDocument: (applicationId: string, documentId: string) => void;
  saving: boolean;
}

interface ApplicationEditData {
  applicationStatus: string;
  documentChanges: { [documentId: string]: 'approved' | 'rejected' | 'pending' };
  finalReview?: {
    decision: 'approved' | 'rejected' | 'on_hold';
    comments: string;
    approvedLoanAmount?: string;
  };
}

interface DocumentVerificationState {
  [documentId: string]: 'approved' | 'rejected' | 'pending';
}

const ApplicationEditModal: React.FC<ApplicationEditModalProps> = ({
  selectedApp,
  onClose,
  onSaveChanges,
  onDownloadDocument,
  onPreviewDocument,
  saving
}) => {
  const [applicationStatus, setApplicationStatus] = useState<'approved' | 'rejected' | 'pending' | 'under_review' | 'on_hold'>(selectedApp.status as 'approved' | 'rejected' | 'pending' | 'under_review' | 'on_hold');
  const [documentStates, setDocumentStates] = useState<DocumentVerificationState>({});
  const [showFinalReview, setShowFinalReview] = useState(false);
  const [finalReviewData, setFinalReviewData] = useState({
    decision: 'approved' as 'approved' | 'rejected' | 'on_hold',
    comments: '',
    approvedLoanAmount: (selectedApp.loanAmount || 0).toString()
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize document states
  useEffect(() => {
    const initialStates: DocumentVerificationState = {};
    selectedApp.documents.forEach((doc) => {
      initialStates[doc.id] = doc.verificationStatus;
    });
    setDocumentStates(initialStates);
  }, [selectedApp]);

  // Check if changes have been made
  useEffect(() => {
    const statusChanged = applicationStatus !== selectedApp.status;
    const documentsChanged = selectedApp.documents.some(doc => 
      documentStates[doc.id] !== doc.verificationStatus
    );
    setHasChanges(statusChanged || documentsChanged);
  }, [applicationStatus, documentStates, selectedApp]);

  const handleDocumentStatusChange = (documentId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setDocumentStates(prev => ({
      ...prev,
      [documentId]: newStatus
    }));
  };

  const getDocumentStats = () => {
    const approved = Object.values(documentStates).filter(status => status === 'approved').length;
    const rejected = Object.values(documentStates).filter(status => status === 'rejected').length;
    const pending = Object.values(documentStates).filter(status => status === 'pending').length;
    const total = selectedApp.documents.length;

    return { approved, rejected, pending, total };
  };

  const needsFinalReview = () => {
    const stats = getDocumentStats();
    const allDocumentsReviewed = stats.pending === 0 && stats.total > 0;
    const statusRequiresFinalReview = ['approved', 'rejected', 'on_hold'].includes(applicationStatus);
    
    return allDocumentsReviewed && statusRequiresFinalReview;
  };

  const canDirectStatusUpdate = () => {
    // Allow direct updates for pending and under_review without final review
    return ['pending', 'under_review'].includes(applicationStatus);
  };

  const handleSave = () => {
    // If user selected approved/rejected/on_hold and all documents are reviewed, show final review
    if (needsFinalReview()) {
      setFinalReviewData({
        decision: applicationStatus as 'approved' | 'rejected' | 'on_hold',
        comments: '',
        approvedLoanAmount: (selectedApp.loanAmount || 0).toString()
      });
      setShowFinalReview(true);
    } else {
      // Direct save for status changes to pending/under_review or document-only changes
      const changes: ApplicationEditData = {
        applicationStatus,
        documentChanges: documentStates
      };
      onSaveChanges(selectedApp.id, changes);
    }
  };

  const handleFinalReviewSubmit = () => {
    const changes: ApplicationEditData = {
      applicationStatus: finalReviewData.decision,
      documentChanges: documentStates,
      finalReview: finalReviewData
    };
    onSaveChanges(selectedApp.id, changes);
    setShowFinalReview(false);
  };

  const getStatusUpdateMessage = () => {
    const stats = getDocumentStats();
    
    if (needsFinalReview()) {
      return "All documents reviewed. Final application review required.";
    }
    
    if (stats.pending > 0 && ['approved', 'rejected'].includes(applicationStatus)) {
      return "Some documents still pending review. Complete document review before final approval/rejection.";
    }
    
    return null;
  };

  const stats = getDocumentStats();
  const statusMessage = getStatusUpdateMessage();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                <Edit3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-600">Edit Application</h2>
                <p className="text-gray-600 mt-1">{selectedApp.fullName} - {selectedApp.organizationName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-8">
            {/* Application Status Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Status</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Status
                    </label>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(selectedApp.status)}
                      <span className="text-gray-400">→</span>
                      <select
                        value={applicationStatus}
                        onChange={(e) => setApplicationStatus(e.target.value as 'approved' | 'rejected' | 'pending' | 'under_review' | 'on_hold')}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="on_hold">On Hold</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  {applicationStatus !== selectedApp.status && (
                    <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      Status will be updated
                    </div>
                  )}
                </div>

                {/* Status Update Message */}
                {statusMessage && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700">{statusMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Applicant</div>
                    <div className="font-medium text-gray-900">{selectedApp.fullName}</div>
                    <div className="text-sm text-gray-500">CNIC: {selectedApp.cnic}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Organization</div>
                    <div className="font-medium text-gray-900">{selectedApp.organizationName}</div>
                    <div className="text-sm text-gray-500">{selectedApp.enterpriseType}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Loan Amount</div>
                    <div className="font-medium text-gray-900">{formatCurrency(selectedApp.loanAmount || 0)}</div>
                    <div className="text-sm text-gray-500">{selectedApp.district}, {selectedApp.tehsil}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Review Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Documents Review</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">{stats.approved} Approved</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600">{stats.rejected} Rejected</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-yellow-600">{stats.pending} Pending</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedApp.documents.map((doc) => {
                  const currentStatus = documentStates[doc.id];
                  const hasChanged = currentStatus !== doc.verificationStatus;

                  return (
                    <div key={doc.id} className={`border rounded-lg p-4 transition-all ${
                      hasChanged ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:shadow-md'
                    }`}>
                      {/* Document Header */}
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
                        {hasChanged && (
                          <div className="bg-amber-100 px-2 py-1 rounded text-xs text-amber-700 font-medium">
                            Modified
                          </div>
                        )}
                      </div>

                      {/* Original vs New Status */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-2">Status Change:</div>
                        <div className="flex items-center space-x-2">
                          {getDocumentStatusBadge(doc.verificationStatus)}
                          {hasChanged && (
                            <>
                              <span className="text-gray-400">→</span>
                              {getDocumentStatusBadge(currentStatus)}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        {/* Status Selection */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Verification Status
                          </label>
                          <select
                            value={currentStatus}
                            onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value as 'approved' | 'rejected' | 'pending')}
                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Preview and Download */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onPreviewDocument(selectedApp.id, doc.id)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </button>
                          <button
                            onClick={() => onDownloadDocument(selectedApp.id, doc.id, doc.originalName)}
                            className="text-blue-600 hover:text-blue-800 p-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Documents Summary */}
              {stats.total > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Documents Summary</div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">{stats.approved}/{stats.total} Approved</span>
                      <span className="text-red-600">{stats.rejected}/{stats.total} Rejected</span>
                      <span className="text-yellow-600">{stats.pending}/{stats.total} Pending</span>
                    </div>
                  </div>
                  
                  {/* Status-based Warnings/Info */}
                  {stats.pending > 0 && ['approved', 'rejected'].includes(applicationStatus) && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700">
                        {stats.pending} document(s) still need review before final {applicationStatus} decision
                      </span>
                    </div>
                  )}

                  {stats.rejected > 0 && stats.approved > 0 && stats.pending === 0 && applicationStatus !== 'on_hold' && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                      <span className="text-sm text-amber-700">
                        Mixed document status detected. Consider using On Hold option for partial approval.
                      </span>
                    </div>
                  )}

                  {stats.approved === stats.total && stats.total > 0 && applicationStatus === 'approved' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">
                        All documents approved. Ready for final application approval.
                      </span>
                    </div>
                  )}

                  {stats.rejected === stats.total && stats.total > 0 && applicationStatus === 'rejected' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">
                        All documents rejected. Application will be rejected.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {hasChanges ? (
                  <span className="text-amber-600 font-medium">Unsaved changes detected</span>
                ) : (
                  <span>No changes made</span>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {needsFinalReview() ? 'Proceed to Final Review' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Final Review Modal */}
        {showFinalReview && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Final Application Review</h3>
              </div>

              {/* Document Status Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Document Review Summary</div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{stats.approved} Approved</span>
                  <span className="text-red-600">{stats.rejected} Rejected</span>
                  <span className="text-gray-600">{stats.total} Total</span>
                </div>
              </div>

              {/* Final Decision */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Final Decision
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="finalDecision"
                      value="approved"
                      checked={finalReviewData.decision === 'approved'}
                      onChange={(e) => setFinalReviewData({
                        ...finalReviewData,
                        decision: e.target.value as 'approved' | 'rejected' | 'on_hold'
                      })}
                      className="mr-3"
                    />
                    <span className="text-green-700 font-medium">Approve Application</span>
                    {stats.approved === stats.total && (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        All docs approved
                      </span>
                    )}
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="finalDecision"
                      value="rejected"
                      checked={finalReviewData.decision === 'rejected'}
                      onChange={(e) => setFinalReviewData({
                        ...finalReviewData,
                        decision: e.target.value as 'approved' | 'rejected' | 'on_hold'
                      })}
                      className="mr-3"
                    />
                    <span className="text-red-700 font-medium">Reject Application</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="finalDecision"
                      value="on_hold"
                      checked={finalReviewData.decision === 'on_hold'}
                      onChange={(e) => setFinalReviewData({
                        ...finalReviewData,
                        decision: e.target.value as 'approved' | 'rejected' | 'on_hold'
                      })}
                      className="mr-3"
                    />
                    <span className="text-amber-700 font-medium">Put On Hold</span>
                    {stats.rejected > 0 && stats.approved > 0 && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                        Recommended for mixed docs
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Approved Amount (only for approved applications) */}
              {finalReviewData.decision === 'approved' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Loan Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={finalReviewData.approvedLoanAmount}
                    onChange={(e) => setFinalReviewData({
                      ...finalReviewData,
                      approvedLoanAmount: e.target.value
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter approved amount"
                    min="0"
                    max={selectedApp.loanAmount}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Original requested: {formatCurrency(selectedApp.loanAmount || 0)}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comments *
                </label>
                <textarea
                  value={finalReviewData.comments}
                  onChange={(e) => setFinalReviewData({
                    ...finalReviewData,
                    comments: e.target.value
                  })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder={
                    finalReviewData.decision === 'on_hold' 
                      ? "Explain why the application is being put on hold and what actions are needed..."
                      : finalReviewData.decision === 'rejected'
                      ? "Explain the reasons for rejection..."
                      : "Add your approval comments and any conditions..."
                  }
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFinalReview(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Back
                </button>
                <button
                  onClick={handleFinalReviewSubmit}
                  disabled={!finalReviewData.comments.trim() || saving}
                  className={`px-6 py-3 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center ${
                    finalReviewData.decision === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : finalReviewData.decision === 'rejected'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {finalReviewData.decision === 'approved' 
                        ? 'Approve Application'
                        : finalReviewData.decision === 'rejected'
                        ? 'Reject Application'
                        : 'Put On Hold'
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationEditModal;