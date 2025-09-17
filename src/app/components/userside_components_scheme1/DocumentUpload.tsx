'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Upload, FileText, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import Header from '../Header';
import PreviewDocuments from './PreviewDocuments';
import { CiBank } from "react-icons/ci";
import { PiWallet } from "react-icons/pi";
import { IoMdHome } from "react-icons/io";
import { LuSquareUserRound } from "react-icons/lu";
import { PiMedalDuotone } from "react-icons/pi";
import { PiNewspaperClippingLight } from "react-icons/pi";
import { FaCarSide } from "react-icons/fa";
import { LuNotebookPen } from "react-icons/lu";
import { FcDiploma1 } from "react-icons/fc";
import { PiIdentificationCard } from "react-icons/pi";
// Lazy-load the instructions modal (no SSR)
const UploadInstructionsModal = dynamic(
  () => import('../../scheme1uploads/uploadhandlemodal'),
  { ssr: false }
);

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  file?: File;
  sectionType?: string;
  apiEndpoint?: string;
  errorMessage?: string;
  requiresApiProcessing?: boolean;
}

interface Section {
  title: string;
  documents: DocumentItem[];
  type: 'required';
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  status?: number;
  code?: string;
}

export interface ExtractedData {
  [documentId: string]: {
    documentType: string;
    extractedInfo: any;
    extractedAt: string;
    status: number;
    message: string;
  };
}

// API base URL
const API_BASE_URL = 'http://16.170.252.236:8000';

// Document validation functions
const validateDocument = (file: File, documentType: string): { isValid: boolean; message: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const minSize = 1024; // 1KB

  // Basic file validations
  if (file.size > maxSize) {
    return { isValid: false, message: 'File size must be less than 10MB' };
  }

  if (file.size < minSize) {
    return { isValid: false, message: 'File size is too small, please upload a valid document' };
  }

  switch (documentType) {
    case 'cnic':
      return validateCNIC(file);
    case 'domicile':
      return validateDomicile(file);
    case 'passport':
      return validatePassportPhoto(file);
    case 'medical':
      return validateMedicalQualification(file);
    case 'registration':
      return validateRegistrationCertificate(file);
    case 'project':
      return validateProjectProposal(file);
    case 'clinic-agreement':
      return validateClinicAgreement(file);
    case 'phc-license':
      return validatePHCLicense(file);
    case 'unemployment':
      return validateUnemploymentAffidavit(file);
    default:
      return { isValid: true, message: 'Valid document' };
  }
};

const getUserData = () => {
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
    } catch {
      return { firstName: '', lastName: '', fullName: '' };
    }
  }
  return { firstName: '', lastName: '', fullName: '' };
};

// Helper function to check if document name contains user's name
const containsUserName = (fileName: string, userFullName: string): boolean => {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedUserName = userFullName.toLowerCase();

  // Split user name into parts
  const nameParts = normalizedUserName.split(' ').filter(part => part.length > 0);

  // Check if at least one part of user's name is in filename
  return nameParts.some(part => normalizedFileName.includes(part));
};

const validateCNIC = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'CNIC must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const cnicKeywords = ['cnic', 'identity', 'card', 'national'];
  const hasValidKeyword = cnicKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword && !fileName.includes('id')) {
    return { isValid: false, message: 'File name should contain CNIC or identity-related keywords' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `CNIC document should contain your name (${fullName}) in the filename for verification`,
    };
  }

  return { isValid: true, message: 'Valid CNIC document' };
};

const validateDomicile = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Domicile must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const domicileKeywords = ['domicile', 'residence', 'certificate'];
  const hasValidKeyword = domicileKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain domicile or residence-related keywords' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `Domicile certificate should contain your name (${fullName}) in the filename for verification`,
    };
  }

  return { isValid: true, message: 'Valid domicile certificate' };
};

const validateMedicalQualification = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Medical qualification must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const medicalKeywords = ['degree', 'diploma', 'mbbs', 'bds', 'pharm', 'medical', 'qualification', 'certificate'];
  const hasValidKeyword = medicalKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a medical degree, diploma, or qualification certificate' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `Medical qualification should contain your name (${fullName}) in the filename for verification`,
    };
  }

  return { isValid: true, message: 'Valid medical qualification document' };
};

const validatePassportPhoto = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Passport photo must be in JPG or PNG format only' };
  }

  const maxPhotoSize = 2 * 1024 * 1024; // 2MB max for photos
  const minPhotoSize = 50 * 1024; // 50KB min

  if (file.size > maxPhotoSize) {
    return { isValid: false, message: 'Photo size must be less than 2MB' };
  }

  if (file.size < minPhotoSize) {
    return { isValid: false, message: 'Photo quality is too low, minimum 50KB required' };
  }

  const fileName = file.name.toLowerCase();
  const photoKeywords = ['photo', 'picture', 'passport', 'image'];
  const hasValidKeyword = photoKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should indicate it is a passport photograph' };
  }

  return { isValid: true, message: 'Valid passport photograph' };
};

const validateRegistrationCertificate = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Registration certificate must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const registrationKeywords = ['registration', 'certificate', 'pmc', 'phci', 'nch', 'ppc', 'council', 'license'];
  const hasValidKeyword = registrationKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a registration certificate from PMC, PHCI, NCH, PPC, or relevant council' };
  }

  return { isValid: true, message: 'Valid registration certificate' };
};

const validateProjectProposal = (file: File): { isValid: boolean; message: string } => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Project proposal must be in PDF or Word document format' };
  }

  const fileName = file.name.toLowerCase();
  const proposalKeywords = ['proposal', 'project', 'plan', 'quotation', 'equipment', 'specification'];
  const hasValidKeyword = proposalKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a detailed project proposal with equipment quotations' };
  }

  return { isValid: true, message: 'Valid project proposal document' };
};

const validateClinicAgreement = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Clinic agreement must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const agreementKeywords = ['agreement', 'contract', 'lease', 'rent', 'ownership', 'clinic', 'property'];
  const hasValidKeyword = agreementKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a clinic ownership or rental agreement' };
  }

  return { isValid: true, message: 'Valid clinic agreement document' };
};

const validatePHCLicense = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'PHC License must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const licenseKeywords = ['phc', 'license', 'licence', 'health', 'commission', 'drug', 'regulatory', 'authority'];
  const hasValidKeyword = licenseKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a PHC license or Drug Regulatory Authority license' };
  }

  return { isValid: true, message: 'Valid PHC license document' };
};

const validateUnemploymentAffidavit = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Unemployment affidavit must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const affidavitKeywords = ['affidavit', 'unemployment', 'notarized', 'sworn', 'statement', 'declaration'];
  const hasValidKeyword = affidavitKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File should be a notarized unemployment affidavit' };
  }

  return { isValid: true, message: 'Valid unemployment affidavit' };
};

// Function to get accepted file types for each document
const getAcceptedFileTypes = (documentType: string): string => {
  switch (documentType) {
    case 'passport':
      return '.jpg,.jpeg,.png'; // Only images for passport photos
    case 'project':
      return '.pdf,.doc,.docx'; // Documents for project proposals
    default:
      return '.pdf,.jpg,.jpeg,.png'; // Default: images and PDFs
  }
};

const DocumentUploadSystem: React.FC = () => {
  // Switch between Upload and Preview screens
  const [currentView, setCurrentView] = useState<'upload' | 'preview'>('upload');

  const [sections] = useState<Section[]>([
    {
      title: 'Required Documents (Scheme 1)',
     documents: [
            {
              id: "cnic",
              name: "CNIC",
              description: "Upload a clear, attested copy of your valid CNIC (both sides).",
              icon: <PiIdentificationCard className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              apiEndpoint: "/extract",
              requiresApiProcessing: true,
            },
            {
              id: "domicile",
              name: "Domicile Certificate",
              description: "Upload an attested copy of your domicile.",
              icon: <FileText className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              apiEndpoint: "/extract/domicile",
              requiresApiProcessing: true,
            },
            {
              id: "passport",
              name: "Passport Photographs",
              description: "Upload two recent passport-size photographs.",
              icon:<LuSquareUserRound className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
            {
              id: "medical",
              name: "Medical Qualification",
              description: "Upload an attested copy of your relevant medical academic qualification.",
              icon: <PiIdentificationCard className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              apiEndpoint: "/extract/degree-or-diploma",
              requiresApiProcessing: true,
            },
            {
              id: "registration",
              name: "Registration Certificate",
              description:
                "Upload attested certificate from PNC, NCH, NCT, PPC, or other relevant federal council.",
              icon: <FileText className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
            {
              id: "project",
              name: "Project Proposal / Equipment Quotation",
              description:
                "Upload detailed project proposal or quotation, including item specs, pricing, model numbers, and estimates.",
              icon: <LuNotebookPen className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
             {
              id: "clinic-agreement",
              name: "Clinic Ownership or Rent Agreement",
              description: "Upload rent agreement or property ownership document for clinic setup.",
              icon: <PiNewspaperClippingLight className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
              {
              id: "phc-license",
              name: "PHC or Drug Regulatory License",
              description:
                "Upload provisional or full license from Punjab Health Commission (PHC) or Drug Regulatory Authority..",
              icon: <PiMedalDuotone className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
            {
              id: "equipment-experience",
              name: "Equipment Experience Certificate",
              description: "Upload experience certificate relevant to the medical equipment to be purchased.",
              icon: <FileText className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
            {
              id: "construction-plan",
              name: "Construction Plan (If Applicable)",
              description:
                "Upload approved cost estimate and plan (if applying for construction-related funds).",
              icon: <FaCarSide className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              apiEndpoint: "/extract/phc",
              requiresApiProcessing: true,
            },
            {
              id: "unemployment",
              name: "Unemployment Affidavit",
              description:
                "Upload notarized affidavit (as per PHF format) stating you're not employed in any government department.",
              icon: <PiWallet className="w-5 h-5" />,
              status: "pending",
              progress: 0,
              requiresApiProcessing: false,
            },
          
          ],
      type: 'required',
    },
  ]);

  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    sections.flatMap(section => section.documents.map(doc => ({ ...doc, sectionType: section.type })))
  );

  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  // NEW: Guide modal state
  const [showGuide, setShowGuide] = useState(false);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

  const proceedFromGuide = () => {
    if (pendingDocId) {
      const input = fileInputRefs.current[pendingDocId];
      setShowGuide(false);
      if (input) input.click();
    } else {
      setShowGuide(false);
    }
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
      message: apiResponse.message || 'Data extracted successfully',
    };

    setExtractedData(prev => ({
      ...prev,
      [documentId]: extractedInfo,
    }));

    console.log(`Extracted data saved for ${documentId}:`, extractedInfo);
  };

  const uploadToAPI = async (file: File, endpoint: string, documentId: string): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    console.log(`Attempting upload to: ${API_BASE_URL}${endpoint}`);
    console.log('Using field name: "file"');
    console.log(`Document ID: ${documentId}`);
    console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: formData,
      });

      console.log(`Upload response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorText = await response.text();
        }
        console.log(`Error response body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      if (data.data) {
        const document = documents.find(doc => doc.id === documentId);
        saveExtractedData(documentId, document?.name || documentId, data);
      }

      return {
        success: data.success !== false,
        message: data.message || 'Document processed successfully',
        data: data.data || data,
        status: data.status,
        code: data.code,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  };

  const handleDirectUpload = (file: File): Promise<ApiResponse> =>
    new Promise(resolve => {
      setTimeout(() => {
        console.log(`Direct upload: ${file.name} uploaded successfully (no API processing)`);
        resolve({
          success: true,
          message: 'Document uploaded successfully',
        });
      }, 1000 + Math.random() * 2000);
    });

  const handleFileSelect = async (id: string, file: File) => {
    if (!file) return;

    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    // Validate document before upload
    const validation = validateDocument(file, id);
    if (!validation.isValid) {
      updateDocument(id, {
        status: 'error',
        progress: 0,
        file: undefined,
        errorMessage: validation.message,
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
        updateDocument(id, {
          status: 'uploaded',
          progress: 100,
          errorMessage: undefined,
        });
      } else {
        updateDocument(id, {
          status: 'error',
          progress: 0,
          errorMessage: response.message || 'Upload failed',
        });
      }
    } catch (error) {
      updateDocument(id, {
        status: 'error',
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    try {
      if (document.requiresApiProcessing && document.apiEndpoint) {
        const response = await fetch(`${API_BASE_URL}${document.apiEndpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
        });

        if (!response.ok) {
          console.log('API delete failed, but continuing with local reset');
        }
      }

      updateDocument(id, { status: 'pending', progress: 0, file: undefined, errorMessage: undefined });

      setExtractedData(prev => {
        const newData = { ...prev };
        delete newData[id];
        return newData;
      });

      const inputRef = fileInputRefs.current[id];
      if (inputRef) {
        inputRef.value = '';
      }
    } catch (error) {
      console.error('Delete error:', error);
      updateDocument(id, { status: 'pending', progress: 0, file: undefined, errorMessage: undefined });
    }
  };

  const getStatusStyles = (status: DocumentItem['status']): string => {
    const styles: Record<DocumentItem['status'], string> = {
      uploaded: 'text-green-600 bg-green-500',
      uploading: 'text-green-600 bg-green-500',
      pending: 'text-gray-500 bg-gray-400',
      error: 'text-red-600 bg-red-500',
    };
    return styles[status];
  };

  const uploadedCount = documents.filter(doc => doc.status === 'uploaded').length;
  const totalDocuments = documents.length;
  const allDocumentsUploaded = uploadedCount === totalDocuments;

  // Show preview if currentView is 'preview'
  if (currentView === 'preview') {
    return (
      <PreviewDocuments
        extractedData={extractedData}
        documents={documents}
        onBack={() => setCurrentView('upload')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Authentication Status */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Authentication Required</p>
                <p className="text-yellow-700 text-sm">
                  Please authenticate to upload documents and submit your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Document Upload Portal
              </h1>
              <p className="text-gray-600 mt-2">
                Complete your loan application by uploading required documents
              </p>
            </div>
            <button
              onClick={() => setCurrentView('preview')}
              disabled={!allDocumentsUploaded}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                allDocumentsUploaded
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Preview Documents
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <div className="flex-1 max-w-md bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(uploadedCount / documents.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {uploadedCount} of {documents.length} completed
            </span>
          </div>

          {/* Validation Message */}
          {!allDocumentsUploaded && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Please upload all {totalDocuments} required documents before proceeding to preview and submission.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const sectionDocs = documents.filter(doc => doc.sectionType === section.type);
            const sectionUploaded = sectionDocs.filter(doc => doc.status === 'uploaded').length;

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-green-900">{section.title}</h2>
                    <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      {sectionUploaded}/{sectionDocs.length} uploaded
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {sectionDocs.map(doc => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                              doc.status === 'error'
                                ? 'bg-red-100 text-red-600'
                                : doc.status === 'uploaded'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-green-50 text-green-600 group-hover:bg-green-100 group-hover:text-green-700'
                            }`}
                          >
                            {doc.status === 'error' ? <AlertCircle className="w-5 h-5" /> : doc.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{doc.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            {doc.file && <p className="text-xs text-gray-500 mt-1">File: {doc.file.name}</p>}
                            {doc.errorMessage && (
                              <p className="text-xs text-red-600 mt-1 font-medium">Error: {doc.errorMessage}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className={`text-xs font-medium mb-2 ${getStatusStyles(doc.status).split(' ')[0]}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getStatusStyles(doc.status).split(' ')[1]}`}
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{doc.progress}%</div>
                          </div>

                          <div className="flex space-x-2">
                            {(doc.status === 'uploaded' || doc.status === 'error') && (
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Open instructions modal first; file picker opens after proceed */}
                            <button
                              onClick={() => {
                                if (isAuthenticated && !uploading.has(doc.id)) {
                                  setPendingDocId(doc.id);
                                  setShowGuide(true);
                                }
                              }}
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
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Re-upload</span>
                                </div>
                              ) : doc.status === 'error' ? (
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Retry</span>
                                </div>
                              ) : uploading.has(doc.id) ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                  <span>Uploading</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload</span>
                                </div>
                              )}
                            </button>
                          </div>

                          {/* Hidden file input (triggered after modal "Proceed") */}
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
        <div className="mt-12 text-center">
          <button
            onClick={() => setCurrentView('preview')}
            disabled={!allDocumentsUploaded || !isAuthenticated}
            className={`px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg transform ${
              allDocumentsUploaded && isAuthenticated
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allDocumentsUploaded ? 'Preview & Submit Application' : `Upload All Documents (${uploadedCount}/${totalDocuments})`}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            {allDocumentsUploaded
              ? 'All documents uploaded successfully. Click to preview and submit your application.'
              : `Please upload all ${totalDocuments} required documents before proceeding.`}
          </p>
        </div>
      </div>

      {/* Instructions Modal */}
      <UploadInstructionsModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        onProceed={proceedFromGuide}
        docId={pendingDocId ?? 'cnic'}
        docName={documents.find(d => d.id === pendingDocId)?.name ?? 'Document'}
      />
    </div>
  );
};

export default DocumentUploadSystem;
