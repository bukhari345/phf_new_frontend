/* eslint-disable @typescript-eslint/no-explicit-any */
// DocumentVerification.tsx
import React, { useState, useEffect } from 'react';
import ApplicationsList from './DocumentVerificationComp/ApplicationList';
import ApplicationDetailsModal from './DocumentVerificationComp/ApplicationModalDetails';
import ApplicationEditModal from './DocumentVerificationComp/EditApplicationModal';
import {
  Application,
  ApiResponse,
  ApplicationReviewData,
  SiteInspectionData
} from './DocumentVerificationComp/types';

interface ApplicationEditData {
  applicationStatus: string;
  documentChanges: { [documentId: string]: 'approved' | 'rejected' | 'pending' };
  finalReview?: {
    decision: 'approved' | 'rejected' | 'on_hold';
    comments: string;
    approvedLoanAmount?: string;
  };
}

const DocumentVerification: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingDocument, setUpdatingDocument] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFinalReviewModal, setShowFinalReviewModal] = useState(false);
  const [showSiteInspectionModal, setShowSiteInspectionModal] = useState(false);
  const [applicationReviewData, setApplicationReviewData] = useState<ApplicationReviewData>({
    applicationId: null,
    applicationComments: '',
    finalDecision: 'approved',
    approvedLoanAmount: ''
  });
  const [siteInspectionData, setSiteInspectionData] = useState<SiteInspectionData>({
    inspectionDate: '',
    inspectionTime: '',
    inspectorName: '',
    inspectorContact: '',
    notes: ''
  });
  const [schedulingInspection, setSchedulingInspection] = useState(false);
  const [processingReview, setProcessingReview] = useState(false);
  const [documentVerificationStates, setDocumentVerificationStates] = useState<{ [key: string]: 'approved' | 'rejected' | 'pending' }>({});
  const [savingEditChanges, setSavingEditChanges] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

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

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/applications/${applicationId}`);
      const data = await resp.json();
      if (data.success) {
        setSelectedApp(data.data);
        // Initialize document verification states
        const states: { [key: string]: 'approved' | 'rejected' | 'pending' } = {};
        data.data.documents.forEach((doc: any) => {
          states[doc.id] = doc.verificationStatus;
        });
        setDocumentVerificationStates(states);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  const verifyDocument = async (applicationId: string, documentId: string, verificationStatus: 'approved' | 'rejected') => {
    try {
      setUpdatingDocument(documentId);
      const adminName = localStorage?.getItem("adminName") || "Admin";

      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}/documents/${documentId}/verify`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verificationStatus,
            performedBy: adminName
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`Document ${verificationStatus} successfully!`);
        await fetchApplications();

        // Update the selected app details
        if (selectedApp && selectedApp.id === applicationId) {
          await fetchApplicationDetails(applicationId);
        }
      } else {
        alert('Failed to verify document: ' + result.error);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      alert('Error verifying document. Please try again.');
    } finally {
      setUpdatingDocument(null);
    }
  };

  const handleFinalReview = () => {
    if (!selectedApp) return;

    setApplicationReviewData({
      applicationId: selectedApp.id,
      applicationComments: '',
      finalDecision: 'approved',
      approvedLoanAmount: (selectedApp.loanAmount || 0).toString()
    });
    setShowFinalReviewModal(true);
  };

  const submitApplicationReview = async () => {
    try {
      setProcessingReview(true);
      const adminName = localStorage?.getItem("adminName") || "Admin";

      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationReviewData.applicationId}/review`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationComments: applicationReviewData.applicationComments,
            finalDecision: applicationReviewData.finalDecision,
            approvedLoanAmount: applicationReviewData.finalDecision === 'approved' ?
              parseFloat(applicationReviewData.approvedLoanAmount || '0') : undefined,
            performedBy: adminName
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const finalDecision = applicationReviewData.finalDecision as 'approved' | 'rejected' | 'on_hold';
        const decisionText = finalDecision === 'on_hold' 
          ? 'put on hold' 
          : finalDecision;
        alert(`Application ${decisionText} successfully!`);

        // Update applications list
        await fetchApplications();

        // Update selected app details
        if (selectedApp) {
          await fetchApplicationDetails(selectedApp.id);
        }

        setShowFinalReviewModal(false);

        // Reset review data
        setApplicationReviewData({
          applicationId: null,
          applicationComments: '',
          finalDecision: 'approved',
          approvedLoanAmount: ''
        });
      } else {
        alert('Failed to review application: ' + result.error);
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('Error reviewing application. Please try again.');
    } finally {
      setProcessingReview(false);
    }
  };

  const handleScheduleInspection = () => {
    if (!selectedApp) return;

    setSiteInspectionData({
      inspectionDate: '',
      inspectionTime: '',
      inspectorName: '',
      inspectorContact: '',
      notes: ''
    });
    setShowSiteInspectionModal(true);
  };

  const submitSiteInspection = async () => {
    try {
      setSchedulingInspection(true);
      const adminName = localStorage?.getItem("adminName") || "Admin";

      const response = await fetch(
        `${API_BASE_URL}/applications/${selectedApp?.id}/site-inspection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...siteInspectionData,
            scheduledBy: adminName
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Site inspection scheduled successfully!');
        await fetchApplications();

        // Update selected app details
        if (selectedApp) {
          await fetchApplicationDetails(selectedApp.id);
        }

        setShowSiteInspectionModal(false);
        setSiteInspectionData({
          inspectionDate: '',
          inspectionTime: '',
          inspectorName: '',
          inspectorContact: '',
          notes: ''
        });
      } else {
        alert('Failed to schedule site inspection: ' + result.error);
      }
    } catch (error) {
      console.error('Error scheduling site inspection:', error);
      alert('Error scheduling site inspection. Please try again.');
    } finally {
      setSchedulingInspection(false);
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
    try {
      const previewUrl = `${API_BASE_URL}/applications/${applicationId}/documents/${documentId}/preview`;
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Error opening document preview:', error);
      alert('Failed to open document preview');
    }
  };

  const handleDocumentVerification = (documentId: string, status: 'approved' | 'rejected' | 'pending') => {
    setDocumentVerificationStates(prev => ({
      ...prev,
      [documentId]: status
    }));
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApp(app);
    fetchApplicationDetails(app.id);
  };

  const handleEditApplication = (app: Application) => {
    setEditingApp(app);
    setShowEditModal(true);
  };

  const handleSaveEditChanges = async (applicationId: string, changes: ApplicationEditData) => {
    try {
      setSavingEditChanges(true);
      const adminName = localStorage?.getItem("adminName") || "Admin";

      // First, update document statuses if there are changes
      const documentPromises = Object.entries(changes.documentChanges).map(async ([documentId, status]) => {
        const originalDoc = editingApp?.documents.find(d => d.id === documentId);
        if (originalDoc && originalDoc.verificationStatus !== status) {
          return fetch(
            `${API_BASE_URL}/applications/${applicationId}/documents/${documentId}/verify`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                verificationStatus: status,
                performedBy: adminName,
                comments: `Document ${status} during application edit`
              }),
            }
          );
        }
        return Promise.resolve();
      });

      // Wait for all document updates to complete
      const documentResponses = await Promise.all(documentPromises);
      
      // Check if any document updates failed
      for (const response of documentResponses) {
        if (response && !response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update document status');
        }
      }

      // If there's a final review, submit it
      if (changes.finalReview) {
        const reviewResponse = await fetch(
          `${API_BASE_URL}/applications/${applicationId}/review`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              applicationComments: changes.finalReview.comments,
              finalDecision: changes.finalReview.decision,
              approvedLoanAmount: changes.finalReview.decision === 'approved' ?
                parseFloat(changes.finalReview.approvedLoanAmount || '0') : undefined,
              performedBy: adminName
            }),
          }
        );

        const reviewResult = await reviewResponse.json();
        if (!reviewResult.success) {
          throw new Error(reviewResult.error || 'Failed to submit final review');
        }

        // Show success message based on decision
        const decisionText = changes.finalReview.decision === 'on_hold' 
          ? 'put on hold' 
          : changes.finalReview.decision;
        alert(`Application ${decisionText} successfully!`);
        
      } else if (changes.applicationStatus !== editingApp?.status) {
        // Update application status if changed and no final review
        const statusResponse = await fetch(
          `${API_BASE_URL}/applications/${applicationId}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: changes.applicationStatus,
              performedBy: adminName,
              comments: `Status changed to ${changes.applicationStatus}`
            }),
          }
        );

        const statusResult = await statusResponse.json();
        if (!statusResult.success) {
          throw new Error(statusResult.error || 'Failed to update application status');
        }

        alert('Application status updated successfully!');
      } else {
        // Only document changes were made
        alert('Document verification status updated successfully!');
      }
      
      // Refresh data
      await fetchApplications();
      if (selectedApp) {
        await fetchApplicationDetails(selectedApp.id);
      }

      setShowEditModal(false);
      setEditingApp(null);

    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSavingEditChanges(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLocationFilter('all');
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setShowFinalReviewModal(false);
    setShowSiteInspectionModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingApp(null);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div>
      <ApplicationsList
        applications={applications}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        onSelectApplication={handleSelectApplication}
        onEditApplication={handleEditApplication}
        onClearFilters={clearFilters}
        onClearError={() => setError(null)}
      />

      {selectedApp && (
        <ApplicationDetailsModal
          selectedApp={selectedApp}
          documentVerificationStates={documentVerificationStates}
          updatingDocument={updatingDocument}
          showFinalReviewModal={showFinalReviewModal}
          showSiteInspectionModal={showSiteInspectionModal}
          applicationReviewData={applicationReviewData}
          siteInspectionData={siteInspectionData}
          schedulingInspection={schedulingInspection}
          processingReview={processingReview}
          onClose={handleCloseModal}
          onDocumentVerification={handleDocumentVerification}
          onVerifyDocument={verifyDocument}
          onDownloadDocument={downloadDocument}
          onPreviewDocument={previewDocument}
          onFinalReview={handleFinalReview}
          onScheduleInspection={handleScheduleInspection}
          onSubmitApplicationReview={submitApplicationReview}
          onSubmitSiteInspection={submitSiteInspection}
          setShowFinalReviewModal={setShowFinalReviewModal}
          setShowSiteInspectionModal={setShowSiteInspectionModal}
          setApplicationReviewData={setApplicationReviewData}
          setSiteInspectionData={setSiteInspectionData}
        />
      )}

      {showEditModal && editingApp && (
        <ApplicationEditModal
          selectedApp={editingApp}
          onClose={handleCloseEditModal}
          onSaveChanges={handleSaveEditChanges}
          onDownloadDocument={downloadDocument}
          onPreviewDocument={previewDocument}
          saving={savingEditChanges}
        />
      )}
    </div>
  );
};

export default DocumentVerification;