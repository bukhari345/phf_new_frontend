'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Trash2, AlertCircle, Info } from 'lucide-react';
import Header from '../Header';

// Modal (portal version)
import UploadInstructionsModal from '../../scheme1uploads/uploadhandlemodal';

import { DocumentItem, Section, ApiResponse, ExtractedData } from '@/app/types/DocumentTypes';
import {
  validateDocument,
  getAcceptedFileTypes,
  getProgressBarColor,
  getStatusColor
} from "../../utils/DocumentValidation";

interface DocumentUploadProps {
  onPreview: (extractedData: ExtractedData, documents: DocumentItem[]) => void;
}
  const getStatusStyles = (status: DocumentItem['status']): string => {
    const styles: Record<DocumentItem['status'], string> = {
      uploaded: 'text-green-600 bg-green-500',
      uploading: 'text-green-600 bg-green-500',
      pending: 'text-gray-500 bg-gray-400',
      error: 'text-red-600 bg-red-500',
    };
    return styles[status];
  };
// API base URL
const API_BASE_URL = 'http://16.170.252.236:8000';

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onPreview }) => {
  const [sections] = useState<Section[]>([
    {
      title: 'Required Documents (Scheme 2)',
      documents: [
        {
          id: 'cnic',
          name: 'CNIC',
          description: 'Upload clear copy of valid CNIC (both sides)',
          instructions: [
            'Upload both front and back sides of your CNIC',
            'Ensure all text is clearly visible and readable',
            'Image should be well-lit without shadows',
            'File formats: JPG, PNG, PDF (max 5MB)',
      
          ],
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          apiEndpoint: '/extract',
          requiresApiProcessing: true
        },
        {
          id: 'domicile',
          name: 'Domicile Certificate',
          description: 'Upload attested copy of domicile',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          instructions: [
            'Upload attested copy of domicile certificate',
            'Document must be issued by relevant government authority',
            'Attestation stamps and signatures must be clearly visible',
            'Certificate should not be older than 1 year',
            'All text must be legible and complete'
          ],
          apiEndpoint: '/extract/domicile',
          requiresApiProcessing: true
        },
        {
          id: 'passport',
          name: 'Passport Photographs',
          description: 'Two recent passport-size photographs',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          instructions: [
            'Upload two recent passport-size photographs',
            'Photos should be taken within last 6 months',
            'White or light green background preferred',
            'Face should be clearly visible with neutral expression',
            'High resolution images required (minimum 300 DPI)'
          ],
          requiresApiProcessing: false
        },
        {
          id: 'medical',
          name: 'Medical Qualification',
          description: 'Attested copy of medical degree/diploma',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          instructions: [
            'Upload attested copy of medical degree or diploma',
            'Document must be from recognized medical institution',
            'Attestation by relevant authority is mandatory',
            'All seals and signatures must be clearly visible',
            'Include transcript if degree is from foreign institution'
          ],
          progress: 0,
          apiEndpoint: '/extract/degree-or-diploma',
          requiresApiProcessing: true
        },
        {
          id: 'registration',
          name: 'Registration Certificate',
          description: 'Certificate from PMC, PHCI, NCH, PPC or relevant council',
          icon: <FileText className="w-5 h-5" />,
          instructions: [
            'Upload valid registration certificate',
            'Must be from PMC, PHCI, NCH, PPC or relevant medical council',
            'Certificate should be current and not expired',
            'Registration number must be clearly visible',
            'Include renewal certificate if applicable'
          ],
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'project',
          name: 'Project Proposal',
          description: 'Detailed proposal with equipment quotation and specifications',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          instructions: [
            'Prepare comprehensive project proposal document',
            'Include detailed equipment quotations from vendors',
            'Specify technical specifications for all equipment',
            'Provide implementation timeline and budget breakdown',
            'Attach vendor quotations and equipment brochures'
          ],
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'clinic-agreement',
          name: 'Clinic Agreement',
          description: 'Ownership or rent agreement for clinic setup',
          icon: <FileText className="w-5 h-5" />,
          instructions: [
            'Upload ownership deed or rental agreement',
            'Document must be for clinic/medical facility premises',
            'Agreement should be legally valid and registered',
            'Include property tax documents if ownership',
            'Rental agreement must be minimum 2 years duration'
          ],
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'phc-license',
          name: 'PHC License',
          description: 'License from Punjab Health Commission or Drug Regulatory Authority',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          instructions: [
            'Upload valid PHC license from Punjab Health Commission',
            'License must be current and not expired',
            'Include Drug Regulatory Authority license if applicable',
            'All official seals and signatures must be visible',
            'Ensure license number is clearly readable'
          ],
          progress: 0,
          apiEndpoint: '/extract/phc',
          requiresApiProcessing: true
        },
        {
          id: 'unemployment',
          name: 'Unemployment Affidavit',
          description: 'Notarized affidavit stating not employed in government',
          icon: <FileText className="w-5 h-5" />,
          instructions: [
            'Submit notarized unemployment affidavit',
            'Must state you are not employed in government sector',
            'Affidavit should be on stamp paper (minimum Rs. 100)',
            'Notary public seal and signature required',
            'Document should be recent (not older than 3 months)'
          ],
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'NTN',
          name: 'NTN and Tax Return',
          description: 'Upload your National Tax Number (NTN) certificate and latest tax return statements.',
          icon: <FileText className="w-5 h-5" />,
          instructions: [
            'Upload valid NTN certificate from FBR',
            'Include latest tax return statements (last 2 years)',
            'Tax returns must be filed and acknowledged by FBR',
            'Include wealth statement if applicable',
            'All documents should be clear and complete'
          ],
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        }
      ],
      type: 'required'
    }
  ]);

  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    sections.flatMap(section => section.documents.map(doc => ({ ...doc, sectionType: section.type })))
  );

  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [authToken] = useState<string | null>(null);
  const [isAuthenticated] = useState<boolean>(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDocId, setModalDocId] = useState<string | null>(null);
  const [modalDocName, setModalDocName] = useState<string>('');

  const openModal = (docId: string, docName: string) => {
    setModalDocId(docId);
    setModalDocName(docName);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDocId(null);
    setModalDocName('');
  };

  const proceedFromModal = () => {
    if (modalDocId) {
      fileInputRefs.current[modalDocId]?.click();
    }
    closeModal();
  };

  const updateDocument = (id: string, updates: Partial<Pick<DocumentItem, 'status' | 'progress' | 'file' | 'errorMessage'>>) => {
    setDocuments(prev => prev.map(doc => (doc.id === id ? { ...doc, ...updates } : doc)));
  };

  const saveExtractedData = (documentId: string, documentType: string, apiResponse: any) => {
    const extractedInfo = {
      documentType,
      extractedInfo: apiResponse.data || apiResponse,
      extractedAt: new Date().toISOString(),
      status: apiResponse.status || 200,
      message: apiResponse.message || 'Data extracted successfully'
    };

    setExtractedData(prev => ({
      ...prev,
      [documentId]: extractedInfo
    }));
  };

  const uploadToAPI = async (file: File, endpoint: string, documentId: string): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: formData
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorText = await response.text();
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.data) {
        const document = documents.find(doc => doc.id === documentId);
        saveExtractedData(documentId, document?.name || documentId, data);
      }

      return {
        success: data.success !== false,
        message: data.message || 'Document processed successfully',
        data: data.data || data,
        status: data.status,
        code: data.code
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const handleDirectUpload = (file: File): Promise<ApiResponse> =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, message: 'Document uploaded successfully' });
      }, 1000 + Math.random() * 2000);
    });

  const handleFileSelect = async (id: string, file: File) => {
    if (!file) return;

    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    // Validate
    const validation = validateDocument(file, id);
    if (!validation.isValid) {
      updateDocument(id, {
        status: 'error',
        progress: 0,
        file: undefined,
        errorMessage: validation.message
      });
      return;
    }

    setUploading(prev => new Set([...prev, id]));
    updateDocument(id, { status: 'uploading', progress: 0, file, errorMessage: undefined });

    try {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress < 90) {
          updateDocument(id, { progress: Math.round(progress) });
        }
      }, 200);

      let response: ApiResponse;
      if (document.requiresApiProcessing && document.apiEndpoint) {
        response = await uploadToAPI(file, document.apiEndpoint, id);
      } else {
        response = await handleDirectUpload(file);
      }

      clearInterval(progressInterval);

      if (response.success) {
        updateDocument(id, { status: 'uploaded', progress: 100, errorMessage: undefined });
      } else {
        updateDocument(id, { status: 'error', progress: 0, errorMessage: response.message || 'Upload failed' });
      }
    } catch (error) {
      updateDocument(id, {
        status: 'error',
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    try {
      if (document.requiresApiProcessing && document.apiEndpoint) {
        await fetch(`${API_BASE_URL}${document.apiEndpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` })
          }
        });
      }

      updateDocument(id, { status: 'pending', progress: 0, file: undefined, errorMessage: undefined });

      setExtractedData(prev => {
        const next: any = { ...prev };
        delete next[id];
        return next;
      });

      const inputRef = fileInputRefs.current[id];
      if (inputRef) inputRef.value = '';
    } catch {
      updateDocument(id, { status: 'pending', progress: 0, file: undefined, errorMessage: undefined });
    }
  };

  const uploadedCount = documents.filter(doc => doc.status === 'uploaded').length;
  const totalDocuments = documents.length;
  const allDocumentsUploaded = uploadedCount === totalDocuments;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                Document Upload Portal
              </h1>
              <p className="text-gray-600 mt-2">Complete your loan application by uploading required documents</p>
            </div>

            <button
              onClick={() => onPreview(extractedData, documents)}
              disabled={!allDocumentsUploaded}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                allDocumentsUploaded
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Preview Documents
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <div className="w-full sm:flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(uploadedCount / documents.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {uploadedCount} of {documents.length} completed
            </span>
          </div>

          {!allDocumentsUploaded && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start sm:items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Please upload all {documents.length} required documents before proceeding to preview and submission.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document list */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, idx) => {
            const sectionDocs = documents.filter(doc => doc.sectionType === section.type);
            const sectionUploaded = sectionDocs.filter(doc => doc.status === 'uploaded').length;

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-50 to-green-50 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-green-900">{section.title}</h2>
                    <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      {sectionUploaded}/{sectionDocs.length} uploaded
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  {sectionDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                              doc.status === 'error'
                                ? 'bg-red-100 text-red-600'
                                : doc.status === 'uploaded'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-green-50 text-green-600 group-hover:bg-green-100 group-hover:text-green-700'
                            }`}
                          >
                            {doc.status === 'error' ? (
                              <AlertCircle className="w-5 h-5" />
                            ) : doc.status === 'uploaded' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              doc.icon
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                              {/* Info icon can ALSO open modal */}
                              <button
                                onClick={() => openModal(doc.id, doc.name)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                title="View upload instructions"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            {doc.file && (
                              <p className="text-xs text-gray-500 mt-1 break-all">File: {doc.file.name}</p>
                            )}
                            {doc.errorMessage && (
                              <p className="text-xs text-red-600 mt-1 font-medium break-words">
                                Error: {doc.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                           <div className="text-left sm:text-center">
                            <div className={`text-[11px] sm:text-xs font-medium mb-1 sm:mb-2 ${getStatusStyles(doc.status).split(' ')[0]}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </div>
                            <div className="w-full sm:w-28 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getStatusStyles(doc.status).split(' ')[1]}`}
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">{doc.progress}%</div>
                          </div>

                          <div className="flex gap-2">
                            {(doc.status === 'uploaded' || doc.status === 'error') && (
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Upload button opens modal */}
                            <button
                              onClick={() => openModal(doc.id, doc.name)}
                              disabled={uploading.has(doc.id) || !isAuthenticated}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                !isAuthenticated
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : doc.status === 'uploaded'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : doc.status === 'error'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : uploading.has(doc.id)
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {doc.status === 'uploaded' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Re-upload</span>
                                </div>
                              ) : doc.status === 'error' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Retry</span>
                                </div>
                              ) : uploading.has(doc.id) ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                                  <span>Uploading</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload</span>
                                </div>
                              )}
                            </button>
                          </div>

                          {/* Hidden input remains the same */}
                          <input
                            ref={el => {
                              fileInputRefs.current[doc.id] = el;
                            }}
                            type="file"
                            className="hidden"
                            accept={getAcceptedFileTypes(doc.id)}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file && isAuthenticated) {
                                handleFileSelect(doc.id, file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-10 sm:mt-12 text-center px-2">
          <button
            onClick={() => onPreview(extractedData, documents)}
            disabled={!allDocumentsUploaded || !isAuthenticated}
            className={`w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg transform ${
              allDocumentsUploaded && isAuthenticated
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allDocumentsUploaded
              ? 'Preview & Submit Application'
              : `Upload All Documents (${uploadedCount}/${documents.length})`}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            {allDocumentsUploaded
              ? 'All documents uploaded successfully. Click to preview and submit your application.'
              : `Please upload all ${documents.length} required documents before proceeding.`}
          </p>
        </div>
      </div>

      {/* Modal (Scheme 2 theme) */}
      <UploadInstructionsModal
        open={modalOpen && !!modalDocId}
        onClose={closeModal}
        onProceed={proceedFromModal}
        docId={modalDocId ?? ''}
        docName={modalDocName}
        variant="scheme2"
        instructions={
          modalDocId ? (documents.find(d => d.id === modalDocId)?.instructions as string[] | undefined) : undefined
        }
        accept={modalDocId ? getAcceptedFileTypes(modalDocId) : undefined}
      />
    </div>
  );
};

export default DocumentUpload;
