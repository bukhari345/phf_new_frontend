'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from '../Header';
import { useRouter } from 'next/navigation';
import { DocumentItem, ExtractedData } from '@/app/types/DocumentTypes';

interface PreviewDocumentsProps {
  extractedData: ExtractedData;
  documents: DocumentItem[];
  onBack: () => void;
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
  };

  const categoryPurposes = PURPOSES[category];
  if (!categoryPurposes) return 'Unknown purpose';
  
  const purpose = categoryPurposes.find((p: { id: string; }) => p.id === purposeId);
  return purpose ? purpose.label : 'Unknown purpose';
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
          className={`w-full h-12 rounded-lg shadow-sm border border-indigo-600 px-4 text-zinc-700 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 ${value && value !== 'Not extracted' && value !== 'no specialization' ? 'bg-green-50' : 'bg-red-50'
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
    
    // Get the actual purpose label for display
    let purposeDisplay = 'Not selected';
    try {
      const savedPurpose = localStorage.getItem("selectedPurpose");
      if (savedPurpose) {
        const purposeData = JSON.parse(savedPurpose);
        if (purposeData.purposeId && purposeData.category) {
          purposeDisplay = getPurposeLabel(purposeData.purposeId, purposeData.category);
          console.log("Purpose display set to:", purposeDisplay);
        }
      }
    } catch (e) {
      console.error("Error parsing purpose from localStorage:", e);
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
      natureOfEmployment: 'Self-Employed', // Default to Self-Employed
      specialization: specialization,
      district: getExtractedValue('district'),
      tehsil: getExtractedValue('tehsil'),
      loanAmount: savedLoanAmount || '',
      purpose: purposeDisplay, // Use the actual purpose label instead of category
    };
    
    console.log("Final purpose in form data:", initialFormData.purpose);
    console.log("Final specialization in form data:", initialFormData.specialization);
    setFormData(initialFormData);
  }, [extractedData, userInfo, selectedPurpose]);

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

      // Add form fields (these match your backend expected fields)
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
      submissionFormData.append('scheme', 'scheme2');
      // Handle purpose data properly
      try {
        const savedPurpose = localStorage.getItem("selectedPurpose");
        if (savedPurpose) {
          const purposeData = JSON.parse(savedPurpose);
          submissionFormData.append('purpose', formData.purpose); // Display label
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

      // Add files - these field names must match your backend multer configuration
      const documentTypes = [
        'cnic', 'domicile', 'passport', 'medical', 'registration',
        'project', 'clinic-agreement', 'phc-license', 'unemployment',
        'NTN'
      ];

      documentTypes.forEach(docType => {
        const document = documents.find(doc => doc.id === docType);
        if (document && document.file) {
          submissionFormData.append(docType, document.file);
        }
      });

      // Submit to your backend with authorization header
      const response = await fetch('http://16.171.43.146/api/applications/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: submissionFormData
        // Don't set Content-Type header - let browser set it for FormData
      });

      const result = await response.json();

      if (result.success) {
        // Success handling
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
        router.push('/dashboard')
      } else {
        // Error handling
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
                value={(() => {
                  // If the formData.purpose looks like JSON, parse it and get the label
                  if (typeof formData.purpose === 'string' && formData.purpose.startsWith('{')) {
                    try {
                      const purposeData = JSON.parse(formData.purpose);
                      if (purposeData.purposeId && purposeData.category) {
                        return getPurposeLabel(purposeData.purposeId, purposeData.category);
                      }
                    } catch (e) {
                      console.error("Failed to parse purpose JSON:", e);
                    }
                  }
                  return formData.purpose || 'Not selected';
                })()}
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

export default PreviewDocuments;