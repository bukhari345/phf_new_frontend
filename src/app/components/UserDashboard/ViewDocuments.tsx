'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';

interface Document {
    id: string;
    documentType: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    version: number;
    uploadedAt: string;
}

interface ViewDocumentsProps {
    applicationId?: string;
    userCnic?: string;
    onBackToDashboard: () => void;
}

const ViewDocuments: React.FC<ViewDocumentsProps> = ({ 
    applicationId, 
    userCnic, 
    onBackToDashboard 
}) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [rejectedDocuments, setRejectedDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reuploadLoading, setReuploadLoading] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

    // Document type labels for better UX
    const documentTypeLabels: { [key: string]: string } = {
        'cnic': 'CNIC',
        'domicile': 'Domicile Certificate',
        'passport': 'Passport',
        'medical': 'Medical Certificate',
        'registration': 'Registration Document',
        'project': 'Project Document',
        'clinic-agreement': 'Clinic Agreement',
        'phc-license': 'PHC License',
        'unemployment': 'Unemployment Certificate',
        'NTN': 'NTN Certificate',
        'Chartered-Accountants': 'Chartered Accountants Certificate',
        'Bank-Statement': 'Bank Statement',
        'Construction-Plan': 'Construction Plan',
        'Equipment-Experience': 'Equipment Experience Certificate'
    };

    // Fetch application documents
    useEffect(() => {
        if (applicationId || userCnic) {
            fetchDocuments();
        }
    }, [applicationId, userCnic]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (applicationId) {
                // Fetch by application ID
                response = await fetch(`${API_BASE_URL}/applications/${applicationId}`);
            } else if (userCnic) {
                // Fetch by CNIC
                response = await fetch(`${API_BASE_URL}/applications?search=${userCnic}`);
            }

            if (!response?.ok) {
                throw new Error('Failed to fetch application data');
            }

            const data = await response.json();
            
            if (data.success) {
                let appData;
                if (applicationId) {
                    appData = data.data;
                } else {
                    appData = data.data.applications[0];
                }

                if (appData && appData.documents) {
                    setDocuments(appData.documents);
                    
                    // Fetch rejected documents for re-upload
                    if (appData.id) {
                        fetchRejectedDocuments(appData.id);
                    }
                } else {
                    setError('No application found or no documents uploaded');
                }
            } else {
                setError(data.error || 'Failed to fetch documents');
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to load documents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRejectedDocuments = async (appId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/applications/${appId}/rejected-documents`);
            const data = await response.json();
            
            if (data.success) {
                setRejectedDocuments(data.data.rejectedDocuments || []);
            }
        } catch (err) {
            console.error('Error fetching rejected documents:', err);
        }
    };

    const handleFileSelect = (documentType: string, file: File) => {
        setSelectedFiles(prev => ({
            ...prev,
            [documentType]: file
        }));
    };

    const handleReupload = async () => {
        if (Object.keys(selectedFiles).length === 0) {
            alert('Please select at least one file to re-upload');
            return;
        }

        try {
            setReuploadLoading(true);
            
            // Find application ID if not provided
            let appId = applicationId;
            if (!appId && userCnic) {
                const response = await fetch(`${API_BASE_URL}/applications?search=${userCnic}`);
                const data = await response.json();
                if (data.success && data.data.applications.length > 0) {
                    appId = data.data.applications[0].id;
                }
            }

            if (!appId) {
                throw new Error('Application ID not found');
            }

            const formData = new FormData();
            
            // Add selected files to form data
            Object.entries(selectedFiles).forEach(([docType, file]) => {
                formData.append(docType, file);
            });

            const response = await fetch(`${API_BASE_URL}/applications/${appId}/documents/reupload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Documents re-uploaded successfully!');
                setSelectedFiles({});
                fetchDocuments(); // Refresh documents list
            } else {
                throw new Error(result.error || 'Failed to re-upload documents');
            }
        } catch (err) {
            console.error('Error re-uploading documents:', err);
            alert('Failed to re-upload documents. Please try again.');
        } finally {
            setReuploadLoading(false);
        }
    };

    const handleDownload = async (documentId: string, fileName: string) => {
        try {
            let appId = applicationId;
            if (!appId && userCnic) {
                const response = await fetch(`${API_BASE_URL}/applications?search=${userCnic}`);
                const data = await response.json();
                if (data.success && data.data.applications.length > 0) {
                    appId = data.data.applications[0].id;
                }
            }

            if (!appId) {
                throw new Error('Application ID not found');
            }

            const response = await fetch(`${API_BASE_URL}/applications/${appId}/documents/${documentId}/download`);
            
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
            } else {
                throw new Error('Failed to download file');
            }
        } catch (err) {
            console.error('Error downloading document:', err);
            alert('Failed to download document. Please try again.');
        }
    };

    const handlePreview = async (documentId: string) => {
        try {
            let appId = applicationId;
            if (!appId && userCnic) {
                const response = await fetch(`${API_BASE_URL}/applications?search=${userCnic}`);
                const data = await response.json();
                if (data.success && data.data.applications.length > 0) {
                    appId = data.data.applications[0].id;
                }
            }

            if (!appId) {
                throw new Error('Application ID not found');
            }

            const url = `${API_BASE_URL}/applications/${appId}/documents/${documentId}/preview`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Error previewing document:', err);
            alert('Failed to preview document. Please try again.');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'rejected':
                return 'text-red-700 bg-red-50 border-red-200';
            case 'pending':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <button
                        onClick={onBackToDashboard}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDocuments}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBackToDashboard}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
                            <p className="text-gray-600">View and manage your uploaded documents</p>
                        </div>
                    </div>
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
            </div>

            <div className="p-6">
                {/* Documents Summary */}
                {documents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">{documents.length}</div>
                            <div className="text-sm text-blue-600">Total Documents</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">
                                {documents.filter(d => d.verificationStatus === 'approved').length}
                            </div>
                            <div className="text-sm text-green-600">Approved</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-700">
                                {documents.filter(d => d.verificationStatus === 'rejected').length}
                            </div>
                            <div className="text-sm text-red-600">Rejected</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-700">
                                {documents.filter(d => d.verificationStatus === 'pending').length}
                            </div>
                            <div className="text-sm text-yellow-600">Pending Review</div>
                        </div>
                    </div>
                )}

                {/* Documents List */}
                {documents.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900">All Documents</h2>
                        {documents.map((doc) => (
                            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {documentTypeLabels[doc.documentType] || doc.documentType}
                                            </h3>
                                            <p className="text-sm text-gray-600">{doc.originalName}</p>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatFileSize(doc.fileSize)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Version {doc.version}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        {/* Status Badge */}
                                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.verificationStatus)}`}>
                                            {getStatusIcon(doc.verificationStatus)}
                                            <span className="capitalize">{doc.verificationStatus}</span>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePreview(doc.id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Preview"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(doc.id, doc.originalName)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Review Information */}
                                {doc.verificationStatus !== 'pending' && doc.reviewedBy && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="text-xs text-gray-500">
                                            Reviewed by {doc.reviewedBy} on {new Date(doc.reviewedAt!).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                        <p className="text-gray-600">No documents have been uploaded for this application yet.</p>
                    </div>
                )}

                {/* Re-upload Section for Rejected Documents */}
                {rejectedDocuments.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Upload className="w-5 h-5 mr-2" />
                            Re-upload Rejected Documents
                        </h2>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium text-red-700">Documents Requiring Re-upload</span>
                            </div>
                            <p className="text-sm text-red-600">
                                The following documents were rejected and need to be re-uploaded:
                            </p>
                        </div>

                        <div className="space-y-4">
                            {rejectedDocuments.map((doc) => (
                                <div key={doc.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {documentTypeLabels[doc.documentType] || doc.documentType}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Previous file: {doc.originalName}
                                            </p>
                                            {doc.reviewedBy && (
                                                <p className="text-xs text-red-600">
                                                    Rejected by {doc.reviewedBy} on {new Date(doc.reviewedAt!).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="file"
                                            id={`reupload-${doc.documentType}`}
                                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileSelect(doc.documentType, file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor={`reupload-${doc.documentType}`}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">
                                                {selectedFiles[doc.documentType] ? 'Change File' : 'Select New File'}
                                            </span>
                                        </label>
                                        
                                        {selectedFiles[doc.documentType] && (
                                            <div className="flex items-center space-x-2 text-sm text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>{selectedFiles[doc.documentType].name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Re-upload Button */}
                        {Object.keys(selectedFiles).length > 0 && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleReupload}
                                    disabled={reuploadLoading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {reuploadLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>Re-upload Selected Documents</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* No Documents Message */}
                {documents.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Documents Found</h3>
                        <p className="text-gray-600 mb-6">
                            It looks like you havent uploaded any documents yet, or no application was found.
                        </p>
                        <button
                            onClick={onBackToDashboard}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
            </div>
        );
};

export default ViewDocuments;