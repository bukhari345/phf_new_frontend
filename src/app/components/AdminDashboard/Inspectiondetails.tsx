"use client"
import React, { useState, useEffect } from 'react';

interface SiteInspection {
  id: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionResult: string | null;
  status: string;
}

interface DetailedInspection {
  inspectorContact: React.JSX.Element;
  id: string;
  applicationId: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionResult: string | null;
  status: string;
  scheduledAt: string;
  inspectorId?: string;
  inspectorName?: string;
  notes?: string;
  findings?: string;
  recommendations?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Application {
  id: string;
  fullName: string;
  cnic: string;
  organizationName: string;
  organizationAddress: string;
  enterpriseType: string;
  siteInspections: SiteInspection[];
}

interface InspectionData {
  applicationId: string;
  applicantName: string;
  cnic: string;
  organizationName: string;
  organizationAddress: string;
  enterpriseType: string;
  inspection: SiteInspection;
}

interface APIResponse {
  success: boolean;
  data: {
    applications: Application[];
  };
}

interface DetailedAPIResponse {
  success: boolean;
  data: DetailedInspection[];
}

const InspectionDetails: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [selectedInspection, setSelectedInspection] = useState<DetailedInspection | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://16.171.43.146/api/applications/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data: APIResponse = await response.json();
      
      if (data.success && data.data.applications) {
        const inspectionDetails: InspectionData[] = [];
        
        data.data.applications.forEach((application: Application) => {
          if (application.siteInspections && application.siteInspections.length > 0) {
            application.siteInspections.forEach((inspection: SiteInspection) => {
              inspectionDetails.push({
                applicationId: application.id,
                applicantName: application.fullName,
                cnic: application.cnic,
                organizationName: application.organizationName,
                organizationAddress: application.organizationAddress,
                enterpriseType: application.enterpriseType,
                inspection: inspection
              });
            });
          }
        });
        
        setInspections(inspectionDetails);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionDetails = async (applicationId: string): Promise<void> => {
    try {
      setDetailsLoading(true);
      setError(null);
      
      // This is where I call the /:id/site-inspections endpoint
      const response = await fetch(`http://16.171.43.146/api/applications/${applicationId}/site-inspections`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inspection details');
      }

      const data: DetailedAPIResponse = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Get the most recent inspection (first one due to DESC order)
        setSelectedInspection(data.data[0]);
        setShowModal(true);
      } else {
        setError('No detailed inspection data found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inspection details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedInspection(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInspections = inspections.filter(item => {
    if (filter === 'all') return true;
    return item.inspection.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Inspections</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchApplications}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Inspection Details</h1>
        <p className="text-gray-600 mt-1">Manage and track site inspections for loan applications</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex space-x-2">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {status === 'all' ? inspections.length : inspections.filter(item => item.inspection.status.toLowerCase() === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inspections found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'No inspections have been scheduled yet.' : `No ${filter} inspections found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map((item) => (
            <div key={`${item.applicationId}-${item.inspection.id}`} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{item.applicantName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.inspection.status)}`}>
                      {item.inspection.status.charAt(0).toUpperCase() + item.inspection.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600"><span className="font-medium">CNIC:</span> {item.cnic}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Enterprise Type:</span> {item.enterpriseType}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Organization:</span> {item.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600"><span className="font-medium">Inspection Date:</span> {formatDate(item.inspection.inspectionDate)}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Inspection Time:</span> {formatTime(item.inspection.inspectionTime)}</p>
                      {item.inspection.inspectionResult && (
                        <p className="text-sm text-gray-600"><span className="font-medium">Result:</span> {item.inspection.inspectionResult}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {item.organizationAddress}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <button 
                    onClick={() => fetchInspectionDetails(item.applicationId)}
                    disabled={detailsLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {detailsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      'View Details'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{inspections.length}</div>
          <div className="text-sm text-gray-600">Total Inspections</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {inspections.filter(item => item.inspection.status.toLowerCase() === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {inspections.filter(item => item.inspection.status.toLowerCase() === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {inspections.filter(item => item.inspection.status.toLowerCase() === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Modal for detailed inspection view */}
      {showModal && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detailed Inspection Information</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inspection ID</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedInspection.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Application ID</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedInspection.applicationId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInspection.status)}`}>
                        {selectedInspection.status.charAt(0).toUpperCase() + selectedInspection.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Schedule Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inspection Date</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatDate(selectedInspection.inspectionDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inspection Time</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatTime(selectedInspection.inspectionTime)}</p>
                    </div>
                    {selectedInspection.scheduledAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Scheduled At</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {new Date(selectedInspection.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspector Information */}
                {(selectedInspection.inspectorId || selectedInspection.inspectorName) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Inspector Information
                    </h3>
                    <div className="space-y-3">
                      {selectedInspection.inspectorName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Inspector Name</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedInspection.inspectorName}</p>
                        </div>
                      )}
                          {selectedInspection.inspectorContact && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Inspector Contact</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedInspection.inspectorContact}</p>
                        </div>
                      )}
                      {selectedInspection.inspectorId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Inspector ID</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedInspection.inspectorId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Results Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Results & Findings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inspection Result</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[2.5rem]">
                        {selectedInspection.inspectionResult || 'Not completed yet'}
                      </p>
                    </div>
                    {selectedInspection.findings && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Findings</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[2.5rem]">{selectedInspection.findings}</p>
                      </div>
                    )}
                    {selectedInspection.recommendations && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[2.5rem]">{selectedInspection.recommendations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedInspection.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Additional Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedInspection.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {selectedInspection.createdAt && (
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedInspection.createdAt).toLocaleString()}
                    </div>
                  )}
                  {selectedInspection.updatedAt && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {new Date(selectedInspection.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetails;