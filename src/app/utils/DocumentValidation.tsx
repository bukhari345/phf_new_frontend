const getUserData = () => {
    if (typeof window !== 'undefined') {
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
  
  export const validateDocument = (file: File, documentType: string): { isValid: boolean; message: string } => {
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
      message: `CNIC should contain your name (${fullName}) in the filename for verification`
    };
  }
  
  return { isValid: true, message: 'Valid CNIC document' };
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
  
  const validatePassportPhoto = (file: File): { isValid: boolean; message: string } => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
    if (!validTypes.includes(file.type)) {
      return { isValid: false, message: 'Passport photo must be in JPG or PNG format only' };
    }
  
    const maxPhotoSize = 2 * 1024 * 1024; // 2MB max for photos
  
    if (file.size > maxPhotoSize) {
      return { isValid: false, message: 'Photo size must be less than 2MB' };
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
  export const getAcceptedFileTypes = (documentType: string): string => {
    switch (documentType) {
      case 'passport':
        return '.jpg,.jpeg,.png'; // Only images for passport photos
      case 'project':
        return '.pdf,.doc,.docx'; // Documents for project proposals
      default:
        return '.pdf,.jpg,.jpeg,.png'; // Default: images and PDFs
    }
  };
  
  // Helper functions for status colors
  export const getProgressBarColor = (status: string): string => {
    switch (status) {
      case 'uploaded':
        return 'bg-green-500';
      case 'uploading':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  export const getStatusColor = (status: string): string => {
    switch (status) {
      case 'uploaded':
        return 'text-green-600';
      case 'uploading':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };