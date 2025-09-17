// ApplicationDetailsModal.tsx
import React from 'react';
import {
  CheckCircle, X, Eye, Download, Loader2, FileText, CalendarCheck, DollarSign, Clock, User, Phone
} from 'lucide-react';
import { 
  Application, 
  ApplicationReviewData, 
  SiteInspectionData, 
  formatCurrency, 
  getStatusBadge, 
  getDocumentStatusBadge 
} from './types';

interface ApplicationDetailsModalProps {
  selectedApp: Application;
  documentVerificationStates: { [key: string]: 'approved' | 'rejected' | 'pending' };
  updatingDocument: string | null;
  showFinalReviewModal: boolean;
  showSiteInspectionModal: boolean;
  applicationReviewData: ApplicationReviewData;
  siteInspectionData: SiteInspectionData;
  schedulingInspection: boolean;
  processingReview: boolean;
  onClose: () => void;
  onDocumentVerification: (documentId: string, status: 'approved' | 'rejected' | 'pending') => void;
  onVerifyDocument: (applicationId: string, documentId: string, verificationStatus: 'approved' | 'rejected') => void;
  onDownloadDocument: (applicationId: string, documentId: string, fileName: string) => void;
  onPreviewDocument: (applicationId: string, documentId: string) => void;
  onFinalReview: () => void;
  onScheduleInspection: () => void;
  onSubmitApplicationReview: () => void;
  onSubmitSiteInspection: () => void;
  setShowFinalReviewModal: (show: boolean) => void;
  setShowSiteInspectionModal: (show: boolean) => void;
  setApplicationReviewData: (data: ApplicationReviewData) => void;
  setSiteInspectionData: (data: SiteInspectionData) => void;
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  selectedApp,
  documentVerificationStates,
  updatingDocument,
  showFinalReviewModal,
  showSiteInspectionModal,
  applicationReviewData,
  siteInspectionData,
  schedulingInspection,
  processingReview,
  onClose,
  onDocumentVerification,
  onVerifyDocument,
  onDownloadDocument,
  onPreviewDocument,
  onFinalReview,
  onScheduleInspection,
  onSubmitApplicationReview,
  onSubmitSiteInspection,
  setShowFinalReviewModal,
  setShowSiteInspectionModal,
  setApplicationReviewData,
  setSiteInspectionData
}) => {
  // Check if site inspection has been scheduled - using siteInspections array
  const scheduledInspection = selectedApp.siteInspections?.find(inspection => 
    inspection.status === 'scheduled'
  );
  const hasScheduledInspection = !!scheduledInspection;

  // Helper function to check if document is finalized (approved or rejected)
  const isDocumentFinalized = (docId: string, originalStatus: string) => {
    const currentStatus = documentVerificationStates[docId] || originalStatus;
    return currentStatus === 'approved' || currentStatus === 'rejected';
  };

  // Define document order and display names
  const getDocumentDisplayName = (documentType: string) => {
    const documentNames: { [key: string]: string } = {
      'cnic': 'CNIC',
      'picture': 'Picture',
      'domicile': 'Domicile',
      'degree': 'Degree',
      'registration-council-certificate': 'Registration Council Certificate',
      'proposal': 'Proposal/Quotation',
      'quotation': 'Proposal/Quotation',
      'experience-certificate': 'Experience Certificate',
      'health-care-certificate-phc': 'Health Care Certificate PHC',
      'healthcare-certificate': 'Health Care Certificate PHC',
      'phc-certificate': 'Health Care Certificate PHC'
    };
    
    const normalizedType = documentType.toLowerCase().replace(/[-_\s]/g, '-');
    return documentNames[normalizedType] || documentType.replace(/[-_]/g, ' ').toUpperCase();
  };

  // Define the preferred document order
  const documentOrder = [
    'cnic',
    'picture', 
    'domicile',
    'degree',
    'registration-council-certificate',
    'proposal',
    'quotation',
    'experience-certificate',
    'health-care-certificate-phc',
    'healthcare-certificate',
    'phc-certificate'
  ];

  // Sort documents according to the defined order
  const sortedDocuments = [...selectedApp.documents].sort((a, b) => {
    const normalizeType = (type: string) => type.toLowerCase().replace(/[-_\s]/g, '-');
    
    const aIndex = documentOrder.findIndex(order => 
      normalizeType(a.documentType).includes(order) || order.includes(normalizeType(a.documentType))
    );
    const bIndex = documentOrder.findIndex(order => 
      normalizeType(b.documentType).includes(order) || order.includes(normalizeType(b.documentType))
    );
    
    // If both documents are in the order array, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order array, maintain original order
    return 0;
  });

  return (
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
              onClick={onClose}
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
            {hasScheduledInspection && scheduledInspection && (
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
            )}

            {/* Documents Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Documents Review</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Document Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1">
                        <div className="bg-blue-50 p-2 rounded-lg mr-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {/* {getDocumentDisplayName(doc.documentType)} */}
                            {doc.originalName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{doc.originalName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Document Actions - First Line: Document name and Preview button */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-700 font-medium">Document</span>
                      <button
                        onClick={() => onPreviewDocument(selectedApp.id, doc.id)}
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
                            onDocumentVerification(doc.id, newStatus);
                            if (newStatus !== 'pending' && newStatus !== doc.verificationStatus) {
                              onVerifyDocument(selectedApp.id, doc.id, newStatus);
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
                        onClick={() => onDownloadDocument(selectedApp.id, doc.id, doc.originalName)}
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
                {hasScheduledInspection && (
                  <div className="text-sm text-purple-600 font-medium">
                    Site Inspection Scheduled
                  </div>
                )}
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
                      onClick={onFinalReview}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Final Review
                    </button>
                  );
                })()}

                {/* Schedule Inspection Button - Show only when application is approved and inspection not scheduled */}
                <button
                  onClick={onScheduleInspection}
                  disabled={selectedApp.status !== 'approved' || hasScheduledInspection}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                    selectedApp.status === 'approved' && !hasScheduledInspection
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  title={
                    selectedApp.status !== 'approved' 
                      ? 'Application must be approved first' 
                      : hasScheduledInspection 
                        ? 'Site inspection already scheduled'
                        : ''
                  }
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  {hasScheduledInspection ? 'Inspection Scheduled' : 'Schedule Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Final Review Modal */}
        {showFinalReviewModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
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
                  onClick={onSubmitApplicationReview}
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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
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
                <button
                  onClick={onSubmitSiteInspection}
                  disabled={!siteInspectionData.inspectionDate || !siteInspectionData.inspectionTime || schedulingInspection}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {schedulingInspection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      Schedule Inspection
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

export default ApplicationDetailsModal;