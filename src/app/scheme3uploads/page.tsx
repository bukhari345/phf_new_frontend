'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Trash2, AlertCircle, Eye, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';

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

interface ExtractedData {
  [documentId: string]: {
    documentType: string;
    extractedInfo: any;
    extractedAt: string;
    status: number;
    message: string;
  };
}

interface FormFieldProps {
  label: string;
  value: string;
  isDropdown?: boolean;
  options?: string[];
  onChange?: (value: string) => void;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cnic: string;
  phone: string;
  profession: string;
  specialization: string;
}

// Helper function to get purpose label from ID and category
const getPurposeLabel = (purposeId: string, category: string): string => {
  const PURPOSES: Record<string, { id: string; label: string }[]> = {
    "MBBS/BDS": [
      { id: "mbbs_eqp", label: "Purchase medical equipment" },
      { id: "mbbs_reno", label: "Renovation of clinic/building" },
      { id: "mbbs_furn", label: "Purchase of furniture and fixture" },
      { id: "mbbs_elec", label: "Purchase of electronic items" },
    ],
    "Pharmacist": [
      { id: "pharm_reno", label: "Renovation of pharmacy" },
      { id: "pharm_furn", label: "Purchase of furniture and fixture" },
      { id: "pharm_elec", label: "Purchase of electronic items" },
      { id: "pharm_meds", label: "Purchase of medicine" },
    ],
    "Others": [
      { id: "clinic_improvement", label: "Clinic improvement and expansion" },
      { id: "equipment_purchase", label: "Equipment purchase" },
      { id: "business_expansion", label: "Business expansion" },
      { id: "working_capital", label: "Working capital" },
      { id: "facility_upgrade", label: "Facility upgrade" },
      { id: "technology_enhancement", label: "Technology enhancement" },
    ],
  };

  const categoryPurposes = PURPOSES[category];
  if (!categoryPurposes) {
    console.warn(`Unknown category: ${category}`);
    return `${category} - ${purposeId}`;
  }
  
  const purpose = categoryPurposes.find((p: { id: string; }) => p.id === purposeId);
  return purpose ? purpose.label : `${category} - ${purposeId}`;
};

const FormField: React.FC<FormFieldProps> = ({ label, value, isDropdown = false, options = [], onChange }) => (
  <div className="w-full relative">
    <label className="block text-neutral-700 text-sm font-medium mb-2">
      {label} *
    </label>
    <div className="relative">
      {isDropdown ? (
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full h-12 rounded-lg shadow-sm border border-indigo-600 px-4 text-zinc-700 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 ${value && value !== 'Not extracted' && value !== 'no specialization' && value !== 'Not selected' ? 'bg-green-50' : 'bg-red-50'
            }`}
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value || ''}
          readOnly={!onChange}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full h-12 rounded-lg shadow-sm border border-indigo-600 px-4 text-zinc-700 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 ${value && value !== 'Not extracted' && value !== 'no specialization' && value !== 'Not selected' ? 'bg-green-50' : 'bg-red-50'
            }`}
        />
      )}
      {isDropdown && !onChange && (
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-4 pointer-events-none" />
      )}
    </div>
    {/* Status indicator */}
    <div className="mt-1 text-xs">
      {value && value !== 'Not extracted' && value !== 'no specialization' && value !== 'Not selected' ? (
        <span className="text-green-600">✓ Data extracted</span>
      ) : (
        <span className="text-red-600">⚠ Not extracted</span>
      )}
    </div>
  </div>
);

// Preview Documents Component
interface PreviewDocumentsProps {
  extractedData: ExtractedData;
  documents: DocumentItem[];
  onBack: () => void;
}

const PreviewDocuments: React.FC<PreviewDocumentsProps> = ({ extractedData, documents, onBack }) => {
  // State for form data and submission
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    cnic: '',
    phone: '',
    profession: '',
    specialization: '',
  });
  const [authToken, setAuthToken] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<{ category: string; purposeId?: string }>({ category: '' });
  const router = useRouter();
  
  // Dropdown options
  const enterpriseTypeOptions = ['Pharmacy', 'Clinic', 'Hospital', 'Diagnostic Center', 'Other'];
  const counsellingRequiredOptions = ['Yes', 'No'];
  const disciplineOptions = ['General Medicine', 'General Physician', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry', 'Surgery', 'Other'];
  const employmentTypeOptions = ['Self-Employed', 'Government Employed'];

  // Helper to safely get English/Urdu or direct value
  const getVal = (obj: any, ...keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj?.[key] !== undefined) return obj[key];
      if (obj?.[key.toLowerCase()] !== undefined) return obj[key.toLowerCase()];
      if (obj?.[key.toUpperCase()] !== undefined) return obj[key.toUpperCase()];
    }
    return undefined;
  };

  // Function to get value from extracted data
  const getExtractedValue = (fieldName: string, fallback: string = 'Not extracted') => {
    /** ------------------ CNIC DATA ------------------ **/
    const cnicData = extractedData.cnic?.extractedInfo;
    if (cnicData) {
      switch (fieldName) {
        case 'fullName':
          return getVal(cnicData.fullName, 'English', 'Urdu')
            || getVal(cnicData.name, 'English', 'Urdu')
            || fallback;

        case 'fatherName':
          return getVal(cnicData.fatherOrHusbandName, 'English', 'Urdu')
            || getVal(cnicData.fatherName, 'English', 'Urdu')
            || fallback;

        case 'cnic':
          return getVal(cnicData.nicNumber, 'English', 'Urdu')
            || getVal(cnicData.cnicNumber, 'English', 'Urdu')
            || fallback;

        case 'gender':
          return getVal(cnicData.gender, 'English', 'Urdu')
            || fallback;
      }
    }

    /** ------------------ DOMICILE DATA ------------------ **/
    const domicileData = extractedData.domicile?.extractedInfo;
    if (domicileData) {
      switch (fieldName) {
        case 'district':
          return domicileData.District || fallback;
        case 'tehsil':
          return domicileData.Tehsil || fallback;
        case 'personalAddress':
          return domicileData.address
            || domicileData.personalAddress
            || domicileData.residentialAddress
            || fallback;
      }
    }

    /** ------------------ MEDICAL QUALIFICATION DATA ------------------ **/
    const medicalData = extractedData.medical?.extractedInfo;
    if (medicalData) {
      switch (fieldName) {
        case 'specialization':
          return getVal(medicalData.specialization, 'English', 'Urdu')
            || getVal(medicalData.discipline, 'English', 'Urdu')
            || fallback;
      }
    }

    /** ------------------ PHC LICENSE DATA ------------------ **/
    const phcData = extractedData['phc-license']?.extractedInfo;
    if (phcData) {
      switch (fieldName) {
        case 'organizationName':
          return phcData.organizationName || phcData.clinic_name || phcData.organization_name || phcData.clinicName || fallback;
        case 'organizationAddress':
          return phcData.organizationAddress || phcData.address || phcData.clinic_address || phcData.clinicAddress || fallback;
        case 'organizationPhone':
          return phcData.organizationContactNumber || phcData.phone || phcData.contact_number || phcData.contactNumber || fallback;
      }
    }

    return fallback;
  };

  // Extract user info and token from localStorage
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const purpose = localStorage.getItem("selectedPurpose");

    console.log("Token:", token);
    console.log("Stored User:", storedUser);
    console.log("Selected Purpose:", purpose);

    if (token) {
      setAuthToken(token);
    }

    if (purpose) {
      try {
        const purposeData = JSON.parse(purpose);
        setSelectedPurpose({ 
          category: purposeData.category || '', 
          purposeId: purposeData.purposeId 
        });
      } catch (e) {
        setSelectedPurpose({ category: purpose });
      }
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("Parsed User:", user);
        
        const userData: UserInfo = {
          id: user.id || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          cnic: user.cnic || "",
          phone: user.phone || "",
          profession: user.profession || "",
          specialization: user.specialization || "no specialization",
        };
        
        setUserInfo(userData);
        console.log("User specialization from localStorage:", userData.specialization);
      } catch (error) {
        console.error("Error parsing user from storage:", error);
      }
    }
  }, []);

  // Initialize form data with extracted values
  useEffect(() => {
    const savedLoanAmount = localStorage.getItem('loanAmount');
    
    // Determine specialization priority: user info > extracted data > default
    let specialization = 'General Physician'; // default
    
    // Check if we have user specialization from localStorage
    if (userInfo.specialization && userInfo.specialization !== 'no specialization') {
      specialization = userInfo.specialization;
      console.log("Using specialization from user info:", specialization);
    } else {
      // Fall back to extracted data
      const extractedSpecialization = getExtractedValue('specialization');
      if (extractedSpecialization !== 'Not extracted') {
        specialization = extractedSpecialization;
        console.log("Using specialization from extracted data:", specialization);
      } else {
        specialization = 'no specialization';
        console.log("No specialization found, using default:", specialization);
      }
    }
    
    // Purpose handling
    let purposeDisplay = 'Not selected';
    try {
      const savedPurpose = localStorage.getItem("selectedPurpose");
      console.log("Raw saved purpose from localStorage:", savedPurpose);
      
      if (savedPurpose) {
        const purposeData = JSON.parse(savedPurpose);
        console.log("Parsed purpose data:", purposeData);
        
        if (purposeData.purposeId && purposeData.category) {
          purposeDisplay = getPurposeLabel(purposeData.purposeId, purposeData.category);
          console.log("Purpose display resolved to:", purposeDisplay);
        } else if (purposeData.category) {
          purposeDisplay = purposeData.category;
          console.log("Using category as purpose:", purposeDisplay);
        }
      }
    } catch (e) {
      console.error("Error parsing purpose from localStorage:", e);
      const rawPurpose = localStorage.getItem("selectedPurpose");
      if (rawPurpose && !rawPurpose.startsWith('{')) {
        purposeDisplay = rawPurpose;
      }
    }
    
    const initialFormData = {
      fullName: getExtractedValue('fullName'),
      fatherName: getExtractedValue('fatherName'),
      cnic: getExtractedValue('cnic'),
      gender: getExtractedValue('gender'),
      organizationName: getExtractedValue('organizationName'),
      organizationAddress: getExtractedValue('organizationAddress'),
      personalAddress: getExtractedValue('personalAddress'),
      organizationPhone: getExtractedValue('organizationPhone'),
      enterpriseType: getExtractedValue('facilityType') !== 'Not extracted' ? getExtractedValue('facilityType') : 'Pharmacy',
      counsellingRequired: 'Yes',
      natureOfEmployment: 'Self-Employed',
      specialization: specialization,
      district: getExtractedValue('district'),
      tehsil: getExtractedValue('tehsil'),
      loanAmount: savedLoanAmount || '',
      purpose: purposeDisplay,
    };
    
    console.log("Final purpose in form data:", initialFormData.purpose);
    console.log("Final specialization in form data:", initialFormData.specialization);
    setFormData(initialFormData);
  }, [extractedData, userInfo]);

  const updateFormData = (field: string, value: string) => {
    // Check if user selected Government Employed
    if (field === 'natureOfEmployment' && value === 'Government Employed') {
      alert('Government employed individuals are not eligible for this loan. Redirecting to home page.');
      router.push('/');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form validation function
  const validateFormData = () => {
    const requiredFields = [
      'fullName', 'fatherName', 'cnic', 'gender', 'personalAddress',
      'district', 'tehsil', 'organizationName', 'organizationAddress',
      'organizationPhone', 'enterpriseType', 'counsellingRequired',
      'natureOfEmployment', 'specialization', 'loanAmount', 'purpose'
    ];

    const missingFields = requiredFields.filter(field =>
      !formData[field] || formData[field].trim() === '' || 
      formData[field] === 'Not extracted' || formData[field] === 'Not selected'
    );

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Additional check for government employment
    if (formData.natureOfEmployment === 'Government Employed') {
      alert('Government employed individuals are not eligible for this loan.');
      return false;
    }

    return true;
  };

  // Main submission function
  const submitApplication = async () => {
    if (!validateFormData()) {
      return;
    }

    if (!authToken) {
      alert('Authentication token not found. Please login again.');
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData object
      const submissionFormData = new FormData();

      // Add form fields
      submissionFormData.append('fullName', formData.fullName);
      submissionFormData.append('fatherName', formData.fatherName);
      submissionFormData.append('cnic', formData.cnic);
      submissionFormData.append('gender', formData.gender);
      submissionFormData.append('personalAddress', formData.personalAddress);
      submissionFormData.append('district', formData.district);
      submissionFormData.append('tehsil', formData.tehsil);
      submissionFormData.append('organizationName', formData.organizationName);
      submissionFormData.append('organizationAddress', formData.organizationAddress);
      submissionFormData.append('organizationPhone', formData.organizationPhone);
      submissionFormData.append('enterpriseType', formData.enterpriseType);
      submissionFormData.append('counsellingRequired', formData.counsellingRequired);
      submissionFormData.append('natureOfEmployment', formData.natureOfEmployment);
      submissionFormData.append('specialization', formData.specialization);
      submissionFormData.append('loanAmount', formData.loanAmount);
      submissionFormData.append('scheme', 'scheme3');
      // Handle purpose data properly
      try {
        const savedPurpose = localStorage.getItem("selectedPurpose");
        if (savedPurpose) {
          const purposeData = JSON.parse(savedPurpose);
          submissionFormData.append('purpose', formData.purpose);
          submissionFormData.append('purposeId', purposeData.purposeId || '');
          submissionFormData.append('purposeCategory', purposeData.category || '');
        } else {
          submissionFormData.append('purpose', formData.purpose);
          submissionFormData.append('purposeId', '');
          submissionFormData.append('purposeCategory', '');
        }
      } catch (e) {
        console.error("Error parsing purpose data for submission:", e);
        submissionFormData.append('purpose', formData.purpose);
        submissionFormData.append('purposeId', '');
        submissionFormData.append('purposeCategory', '');
      }

      // Add extracted data as JSON string
      submissionFormData.append('extractedData', JSON.stringify(extractedData));

      // Add files
      const documentTypes = [
        'cnic', 'domicile', 'passport', 'medical', 'registration',
        'project', 'clinic-agreement', 'phc-license', 'unemployment',
        'NTN', 'Chartered-Accountants', 'Bank-Statement', 'Construction-Plan', 'Equipment-Experience'
      ];

      documentTypes.forEach(docType => {
        const document = documents.find(doc => doc.id === docType);
        if (document && document.file) {
          submissionFormData.append(docType, document.file);
        }
      });

      // Submit to backend with authorization header
      const response = await fetch('http://localhost:5000/api/applications/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: submissionFormData
      });

      const result = await response.json();

      if (result.success) {
        alert(`Application submitted successfully! Application ID: ${result.data.applicationId}`);
        setFormData({
          fullName: '',
          fatherName: '',
          cnic: '',
          gender: '',
          personalAddress: '',
          district: '',
          tehsil: '',
          organizationName: '',
          organizationAddress: '',
          organizationPhone: '',
          enterpriseType: '',
          counsellingRequired: '',
          natureOfEmployment: '',
          specialization: '',
          loanAmount: '',
          purpose: ''
        });
        router.push('/dashboard');
      } else {
        alert(`Error: ${result.error}`);
        if (result.missingFields) {
          console.log('Missing fields:', result.missingFields);
        }
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 min-h-screen relative bg-slate-50 overflow-hidden">
      <Header />
      <div className="max-w-7xl mx-auto mt-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-indigo-600 text-4xl font-bold font-sans">
              Preview Documents
            </h1>
            <p className="text-gray-600 mt-2">
              Review the automatically extracted information from your documents
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Upload
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg border-2 border-dashed border-indigo-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Application Form</h2>

          <div className="space-y-6">
            {/* Row 1: Full Name, Father Name */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Full Name"
                value={formData.fullName}
                onChange={(value) => updateFormData('fullName', value)}
              />
              <FormField
                label="Father Name"
                value={formData.fatherName}
                onChange={(value) => updateFormData('fatherName', value)}
              />
            </div>

            {/* Row 2: CNIC, Gender */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="CNIC"
                value={formData.cnic}
                onChange={(value) => updateFormData('cnic', value)}
              />
              <FormField
                label="Gender"
                value={formData.gender}
                onChange={(value) => updateFormData('gender', value)}
              />
            </div>

            {/* Row 3: Organization Name, Organization Address */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Organisation / Clinic Name"
                value={formData.organizationName}
                onChange={(value) => updateFormData('organizationName', value)}
              />
              <FormField
                label="Organisation Address"
                value={formData.organizationAddress}
                onChange={(value) => updateFormData('organizationAddress', value)}
              />
            </div>

            {/* Row 4: Personal Address, Organization Phone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Personal Address"
                value={formData.personalAddress}
                onChange={(value) => updateFormData('personalAddress', value)}
              />
              <FormField
                label="Organisation Phone Number"
                value={formData.organizationPhone}
                onChange={(value) => updateFormData('organizationPhone', value)}
              />
            </div>

            {/* Row 5: Enterprise Type, Counselling Required */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Enterprise Type"
                value={formData.enterpriseType}
                isDropdown={true}
                options={enterpriseTypeOptions}
                onChange={(value) => updateFormData('enterpriseType', value)}
              />
              <FormField
                label="Counselling required for enterprise"
                value={formData.counsellingRequired}
                isDropdown={true}
                options={counsellingRequiredOptions}
                onChange={(value) => updateFormData('counsellingRequired', value)}
              />
            </div>

            {/* Row 6: Nature of Employment, Discipline/Specialization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Nature of Employment"
                value={formData.natureOfEmployment}
                isDropdown={true}
                options={employmentTypeOptions}
                onChange={(value) => updateFormData('natureOfEmployment', value)}
              />
              <FormField
                label="Discipline / Specialization"
                value={formData.specialization}
              />
            </div>

            {/* Row 7: District, Tehsil, Purpose */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FormField
                label="District"
                value={formData.district}
                onChange={(value) => updateFormData('district', value)}
              />
              <FormField
                label="Tehsil"
                value={formData.tehsil}
                onChange={(value) => updateFormData('tehsil', value)}
              />
              <FormField
                label="Purpose"
                value={formData.purpose || 'Not selected'}
              />
            </div>

            {/* Row 8: Loan Amount */}
            <div className="grid grid-cols-1 lg:grid-1 gap-6">
              <FormField
                label="Requested Loan Amount"
                value={formData.loanAmount}
                onChange={(value) => updateFormData('loanAmount', value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={submitApplication}
              disabled={isSubmitting}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// API base URL
const API_BASE_URL = 'http://16.170.252.236:8000/';
const BACKEND_URL = 'http://localhost:5000'; // Your backend URL


const getUserData = () => {
  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
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
    case 'NTN':
      return validateNTN(file);
    case 'Chartered-Accountants':
      return validateCharteredAccountant(file);
    case 'Bank-Statement':
      return validateBankStatement(file);
    case 'Construction-Plan':
      return validateConstructionPlan(file);
    case 'Equipment-Experience':
      return validateEquipmentExperience(file);
    default:
      return { isValid: true, message: 'Valid document' };
  }
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
      message: `CNIC document should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid CNIC document' };
};


const validateEquipmentExperience = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Equipment experience certificate must be in PDF, JPG, or PNG format' };
  }

  const fileName = file.name.toLowerCase();
  const equipmentKeywords = [
    'equipment',
    'experience',
    'certificate',
    'medical equipment',
    'experience certificate',
    'equipment certificate',
    'medical experience',
    'technical experience'
  ];
  const hasValidKeyword = equipmentKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain equipment, experience, or certificate related keywords' };
  }

  return { isValid: true, message: 'Valid equipment experience certificate' };
};
const validateConstructionPlan = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Construction plan must be in PDF, JPG, or PNG format' };
  }

  const fileName = file.name.toLowerCase();
  const constructionKeywords = [
    'construction',
    'plan',
    'cost estimate',
    'approved plan',
    'building plan',
    'estimate',
    'construction cost',
    'project plan',
    'blueprint'
  ];
  const hasValidKeyword = constructionKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain construction, plan, or estimate related keywords' };
  }

  return { isValid: true, message: 'Valid construction plan document' };
};
const validateBankStatement = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'Bank statement must be in PDF, JPG, or PNG format' };
  }

  const fileName = file.name.toLowerCase();
  const bankKeywords = [
    'bank statement',
    'statement',
    'bank',
    'account statement',
    'financial statement',
    'balance',
    'transaction'
  ];
  const hasValidKeyword = bankKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain bank, statement, or account related keywords' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `Bank statement should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid bank statement' };
};

const validateCharteredAccountant = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'CA statement must be in PDF, JPG, or PNG format' };
  }

  const fileName = file.name.toLowerCase();
  const caKeywords = [
    'ca',
    'chartered accountant',
    'accountant statement',
    'ca statement',
    'financial statement',
    'audit',
    'certified statement',
    'professional statement'
  ];
  const hasValidKeyword = caKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain CA, chartered accountant, or statement related keywords' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `CA statement should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid Chartered Accountant statement' };
};

const validateNTN = (file: File): { isValid: boolean; message: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return { isValid: false, message: 'NTN certificate must be in JPG, PNG, or PDF format' };
  }

  const fileName = file.name.toLowerCase();
  const ntnKeywords = [
    'ntn',
    'national tax number',
    'tax certificate',
    'revenue',
    'cbr', // Central Board of Revenue
    'certificate'
  ];
  const hasValidKeyword = ntnKeywords.some(keyword => fileName.includes(keyword));

  if (!hasValidKeyword) {
    return { isValid: false, message: 'File name should contain NTN, certificate, or revenue-related keywords' };
  }

  // File size validation (NTN certificates are typically small documents)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, message: 'NTN certificate file size should be less than 5MB' };
  }

  // Check if filename contains user's name
  const { fullName } = getUserData();
  if (fullName && !containsUserName(fileName, fullName)) {
    return {
      isValid: false,
      message: `NTN certificate should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid NTN certificate' };
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
      message: `Domicile certificate should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid domicile certificate' };
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
      message: `Medical qualification should contain your name (${fullName}) in the filename for verification`
    };
  }

  return { isValid: true, message: 'Valid medical qualification document' };
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
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
  // State for current view
  const [currentView, setCurrentView] = useState<'upload' | 'preview'>('upload');

  const [sections] = useState<Section[]>([
    {
      title: 'Required Documents (Scheme 3)',
      documents: [
        {
          id: 'cnic',
          name: 'CNIC',
          description: 'Upload clear copy of valid CNIC (both sides)',
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
          requiresApiProcessing: false
        },
        {
          id: 'medical',
          name: 'Medical Qualification',
          description: 'Attested copy of medical degree/diploma',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          apiEndpoint: '/extract/degree-or-diploma',
          requiresApiProcessing: true
        },
        {
          id: 'registration',
          name: 'Registration Certificate',
          description: 'Certificate from PMC, PHCI, NCH, PPC or relevant council',
          icon: <FileText className="w-5 h-5" />,
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
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'clinic-agreement',
          name: 'Clinic Agreement',
          description: 'Ownership or rent agreement for clinic setup',
          icon: <FileText className="w-5 h-5" />,
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
          progress: 0,
          apiEndpoint: '/extract/phc',
          requiresApiProcessing: true
        },
        {
          id: 'unemployment',
          name: 'Unemployment Affidavit',
          description: 'Notarized affidavit stating not employed in government',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'NTN',
          name: 'NTN and Tax Return',
          description: 'Upload your National Tax Number (NTN) certificate and latest tax return statements.',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'Chartered-Accountants',
          name: 'Chartered Accountant\'s Statement',
          description: 'Upload certified statement from a chartered accountant',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'Bank-Statement',
          name: 'Bank Statement',
          description: 'Upload latest bank statement showing 1/3 equity of total project cost.',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'Construction-Plan',
          name: 'Construction Plan (If Applicable)',
          description: 'Upload approved cost estimate and plan (if applying for construction-related funds).',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },
        {
          id: 'Equipment-Experience',
          name: 'Equipment Experience Certificate',
          description: 'Upload experience certificate relevant to the medical equipment to be purchased.',
          icon: <FileText className="w-5 h-5" />,
          status: 'pending',
          progress: 0,
          requiresApiProcessing: false
        },


      ],
      type: 'required'
    }
  ]);

  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    sections.flatMap(section => section.documents.map(doc => ({ ...doc, sectionType: section.type })))
  );

  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  const updateDocument = (id: string, updates: Partial<Pick<DocumentItem, 'status' | 'progress' | 'file' | 'errorMessage'>>) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
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
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: formData
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
        code: data.code
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const handleDirectUpload = (file: File): Promise<ApiResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Direct upload: ${file.name} uploaded successfully (no API processing)`);
        resolve({
          success: true,
          message: 'Document uploaded successfully'
        });
      }, 1000 + Math.random() * 2000);
    });
  };

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
        updateDocument(id, {
          status: 'uploaded',
          progress: 100,
          errorMessage: undefined
        });
      } else {
        updateDocument(id, {
          status: 'error',
          progress: 0,
          errorMessage: response.message || 'Upload failed'
        });
      }
    } catch (error) {
      updateDocument(id, {
        status: 'error',
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Upload failed'
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
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
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
      error: 'text-red-600 bg-red-500'
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
                <p className="text-yellow-700 text-sm">Please authenticate to upload documents and submit your application.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Document Upload Portal</h1>
              <p className="text-gray-600 mt-2">Complete your loan application by uploading required documents</p>
            </div>
            <button
              onClick={() => setCurrentView('preview')}
              disabled={!allDocumentsUploaded}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${allDocumentsUploaded
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
            <span className="text-sm font-medium text-gray-700">{uploadedCount} of {documents.length} completed</span>
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
                          <div className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${doc.status === 'error' ? 'bg-red-100 text-red-600' :
                            doc.status === 'uploaded' ? 'bg-green-100 text-green-600' :
                              'bg-green-50 text-green-600 group-hover:bg-green-100 group-hover:text-green-700'
                            }`}>
                            {doc.status === 'error' ? <AlertCircle className="w-5 h-5" /> : doc.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{doc.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            {doc.file && (
                              <p className="text-xs text-gray-500 mt-1">File: {doc.file.name}</p>
                            )}
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

                            <button
                              onClick={() => fileInputRefs.current[doc.id]?.click()}
                              disabled={uploading.has(doc.id) || !isAuthenticated}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!isAuthenticated ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                doc.status === 'uploaded' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                  doc.status === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                    uploading.has(doc.id) ? 'bg-green-100 text-green-700 cursor-not-allowed' :
                                      'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
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

                          <input
                            ref={el => { fileInputRefs.current[doc.id] = el; }}
                            type="file"
                            className="hidden"
                            accept={getAcceptedFileTypes(doc.id)}
                            onChange={(e) => {
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
            className={`px-12 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg transform ${allDocumentsUploaded && isAuthenticated
              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {allDocumentsUploaded ? 'Preview & Submit Application' : `Upload All Documents (${uploadedCount}/${totalDocuments})`}
          </button>
          <p className="text-sm text-gray-600 mt-3">
            {allDocumentsUploaded
              ? 'All documents uploaded successfully. Click to preview and submit your application.'
              : `Please upload all ${totalDocuments} required documents before proceeding.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadSystem;