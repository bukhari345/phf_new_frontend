/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Landmark, Download, CreditCard, ChevronDown, Shuffle, X, FileText, Upload, AlertCircle } from 'lucide-react';
import { FaArrowRight } from 'react-icons/fa6';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';
// Lightweight toast (no extra package)
function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const show = (msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };
  const Toast = () =>
    toast ? (
      <div
        className={`fixed top-4 right-4 z-[9999] rounded-md px-4 py-2 shadow-lg text-sm ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
      >
        {toast.msg}
      </div>
    ) : null;
  return { Toast, show };
}

const PaymentApplicationFee: React.FC = () => {
  const { Toast, show } = useToast();

  const [selectedMethod, setSelectedMethod] = useState('Select Method');
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Hardcoded read-only payment details
  const paymentDetails = {
    challanNo: '#y124595uj',
    bankName: 'Bank of Punjab',
    branchCode: '0084',
    accountTitle: 'MP Punjab Health Foundation',
    accountNumber: '6580048830600044',
    amount: 'PKR 3000'
  };

  const methods = [
    { label: 'Challan Form', icon: <Download className="w-4 h-4" /> },
    { label: 'Debit/Credit', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Bank Transfer', icon: <Landmark className="w-4 h-4" /> },
  ];

  // STRICT: Only accept files with these exact naming patterns
  const acceptedFilenames = [
    'easypaisa receipt',
    'easypaisa_receipt',
    'easypaisa-receipt',
    'easypaisareceipt',
    'jazz cash receipt',
    'jazzcash receipt',
    'jazz_cash_receipt',
    'jazzcash_receipt',
    'jazz-cash-receipt',
    'jazzcash-receipt',
    'jazzcashreceipt',
    'deposit slip',
    'deposit_slip',
    'deposit-slip',
    'depositslip',
    'bank deposit slip',
    'bank_deposit_slip',
    'bank-deposit-slip',
    'bankdepositslip'
  ];

  // File validation function with strict filename checking
  const validatePaymentDocument = (file: File): { isValid: boolean; error: string } => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size should not exceed 10MB.' };
    }

    // Check file type - allow common document and image formats
    const allowedFileTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload images (JPG, PNG, GIF), PDF, Word documents, or text files.'
      };
    }

    // STRICT filename validation - remove file extension and check
    const fileNameWithoutExt = file.name.toLowerCase().replace(/\.[^/.]+$/, '');

    // Check if the filename (without extension) matches any accepted pattern
    const isValidFilename = acceptedFilenames.some(pattern => {
      // Exact match
      if (fileNameWithoutExt === pattern) return true;

      // Check if filename contains the pattern (for cases with numbers/dates)
      if (fileNameWithoutExt.includes(pattern)) return true;

      return false;
    });

    if (!isValidFilename) {
      return {
        isValid: false,
        error: `Invalid filename. Please rename your file to one of these exact formats: "easypaisa receipt", "jazzcash receipt", or "deposit slip" (with any file extension like .jpg, .pdf, etc.)`
      };
    }

    return { isValid: true, error: '' };
  };

  // Handle document upload with validation
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePaymentDocument(file);

    if (!validation.isValid) {
      setValidationError(validation.error);
      show(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Clear any previous validation errors
    setValidationError('');
    setUploadedFile(file);
    show('Payment document uploaded successfully!', 'success');
  };

  const handleDelete = () => {
    setUploadedFile(null);
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplace = () => {
    setValidationError('');
    fileInputRef.current?.click();
  };
const router = useRouter();
  const handleNextStep = () => {
    if (selectedMethod === 'Select Method') {
      show('Please select a payment method before proceeding.');
      return;
    }

    if (!uploadedFile) {
      show('Please upload a payment receipt/document before proceeding.');
      return;
    }

    // Navigate to next step - you can replace this with actual navigation logic
    show('All requirements met! Proceeding to next step...', 'success');
    router.push('/scheme3uploads'); // Example navigation to next step page
    console.log('Proceeding to next step with:', {
      method: selectedMethod,
      file: uploadedFile.name
    });
  };

  const renderPaymentInformation = () => (
    <div className="w-full max-w-[734px] pb-6 bg-[#f4f9fd] rounded-lg border border-[#70cfff] outline-offset-[-1px] outline-[#caebf0] flex flex-col justify-start items-center">
      <div className="self-stretch md:h-52 p-4 md:p-6 flex flex-col justify-start items-start">
        <div className="justify-start items-start">
          <div className="justify-start text-indigo-600 text-2xl md:text-4xl font-bold">Payment Information</div>
          <div className="justify-start text-stone-500 text-sm md:text-base font-normal">
            This is a non-refundable fee for eligibility processing. All information is read-only.
          </div>
        </div>
        <div className="md:w-48 flex flex-col justify-start items-start">
          <div className="mt-4 md:mt-10 justify-start text-zinc-700 text-xs md:text-sm">Total Amount</div>
          <div className="md:w-72 text-justify justify-start text-indigo-600 text-2xl md:text-4xl font-bold">{paymentDetails.amount}</div>
        </div>
      </div>
      <div className="self-stretch h-0 border-t border-zinc-400" />
      <div className="p-4 md:p-6 flex flex-col justify-start items-start gap-4 w-full">
        <div className="flex flex-col md:flex-row justify-start items-start gap-4 w-full">
          <div className="flex-1 h-12 relative bg-gray-100 rounded-[5px] border border-gray-300 px-4">
            <div className="relative w-full h-10">
              <label className="absolute -top-2 left-2 text-xs text-gray-600 bg-gray-100 px-1">Challan No.</label>
              <div className="w-full h-full flex items-center text-sm text-neutral-700 font-medium">
                {paymentDetails.challanNo}
              </div>
            </div>
          </div>
          <div className="flex-1 h-12 relative bg-gray-100 rounded-[5px] border border-gray-300 px-4">
            <div className="relative w-full h-10">
              <label className="absolute -top-2 left-2 text-xs text-gray-600 bg-gray-100 px-1">Branch Code</label>
              <div className="w-full h-full flex items-center text-sm text-neutral-700 font-medium">
                {paymentDetails.branchCode}
              </div>
            </div>
          </div>
        </div>

        <div className="self-stretch h-12 relative bg-gray-100 rounded-[5px] border border-gray-300 px-4">
          <div className="relative w-full h-10">
            <label className="absolute -top-2 left-2 text-xs text-gray-600 bg-gray-100 px-1">Bank Name</label>
            <div className="w-full h-full flex items-center text-sm text-neutral-700 font-medium">
              {paymentDetails.bankName}
            </div>
          </div>
        </div>

        <div className="self-stretch h-12 relative bg-gray-100 rounded-[5px] border border-gray-300 px-4">
          <div className="relative w-full h-10">
            <label className="absolute -top-2 left-2 text-xs text-gray-600 bg-gray-100 px-1">Account Title</label>
            <div className="w-full h-full flex items-center text-sm text-neutral-700 font-medium">
              {paymentDetails.accountTitle}
            </div>
          </div>
        </div>

        <div className="self-stretch h-12 relative bg-gray-100 rounded-[5px] border border-gray-300 px-4">
          <div className="relative w-full h-10">
            <label className="absolute -top-2 left-2 text-xs text-gray-600 bg-gray-100 px-1">Account Number</label>
            <div className="w-full h-full flex items-center text-sm text-neutral-700 font-medium">
              {paymentDetails.accountNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions for payment */}
      <div className="w-full px-6 pb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 font-medium text-sm mb-1">Payment Instructions</h4>
              <p className="text-blue-700 text-xs leading-relaxed">
                Please make the payment using the above details and upload your payment receipt with the correct filename (easypaisa receipt, jazzcash receipt, or deposit slip) to complete the process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-hidden">
      <Toast />

      {/* Header Component - Replace this with your actual Header component */}
      <Header />

      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse bg-blue-200" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000 bg-purple-200" />
        <div className="absolute top-40 left-40 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500 bg-indigo-200" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mt-10">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">Pay Application Fee</h1>
        <p className="text-neutral-950 mb-6">Select your payment method and upload payment receipt to proceed</p>

        <div className="w-full grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Show payment information for all selected methods */}
            {selectedMethod !== 'Select Method' ? (
              <>
                {renderPaymentInformation()}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`flex items-center gap-2 px-8 py-4 mt-10 rounded-lg font-medium transition-all duration-200 transform shadow-lg ${uploadedFile && selectedMethod !== 'Select Method'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={!uploadedFile || selectedMethod === 'Select Method'}
                >
                  Next Step <FaArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* When no method selected */
              <div className="w-full max-w-[734px] pb-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center items-center py-20">
                <div className="text-gray-400 text-lg font-medium mb-2">Please select a payment method</div>
                <div className="text-gray-500 text-sm">Choose from the dropdown on the right to proceed</div>
              </div>
            )}
          </div>

          {/* Payment Method and Document Upload */}
          <div>
            {/* Payment Method Dropdown */}
            <div className="bg-white shadow-[0px_8px_16px_0px_rgba(143,149,178,0.15)] rounded-lg border border-[#aad4e9] outline-offset-[-1px] outline-[#caebf0] relative mb-6">
              <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left px-4 py-3 flex items-center justify-between">
                <span className={`font-normal text-base ${selectedMethod === 'Select Method' ? 'text-black/50' : 'text-black'}`}>
                  {selectedMethod}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="border-t border-gray-100" />
              {isOpen && (
                <div className="absolute left-0 top-full w-full bg-white z-10 rounded-b-lg overflow-hidden shadow-lg border border-[#aad4e9] outline-offset-[-1px] outline-[#caebf0]">
                  {methods.map((method, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedMethod(method.label);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 flex justify-between items-center text-base text-black/70 hover:bg-gray-50 transition-colors"
                    >
                      <span>{method.label}</span>
                      {method.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Document Upload Component */}
            <div className="w-full p-4 bg-[#f4f8fe] rounded-lg border border-gray-200 flex justify-start items-center">
              {!uploadedFile ? (
                <div className="flex justify-start items-center gap-5 w-full">
                  <div className="w-20 h-20 p-3 bg-white rounded border border-zinc-200 flex justify-center items-center">
                    <FileText className="w-10 h-10 text-indigo-600" />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <p className="text-zinc-900 text-sm font-bold">Upload Payment Receipt</p>
                    <p className="text-neutral-950 text-xs font-normal">
                      <strong>IMPORTANT:</strong> File must be named exactly as "easypaisa receipt", "jazzcash receipt", or "deposit slip" (with any extension like .jpg, .pdf, etc.)
                    </p>
                    {validationError && (
                      <div className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded border border-red-200 w-full">
                        {validationError}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-6 py-3 bg-indigo-600 text-white rounded-[3px] flex justify-center items-center gap-3 hover:bg-indigo-700 cursor-pointer transition mt-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-bold">Upload Receipt</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-5 w-full">
                  <div className="w-20 h-20 p-3 bg-white rounded border border-zinc-200 flex justify-center items-center">
                    {uploadedFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        className="w-14 h-14 rounded-xl border-2 border-indigo-600 object-cover"
                        alt="Uploaded receipt"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-start items-start gap-1.5">
                    <p className="text-zinc-900 text-sm font-bold">Payment Receipt Uploaded</p>
                    <p className="text-green-600 text-xs font-medium">✓ Valid payment document with correct filename</p>

                    {/* File name display */}
                    <p className="text-xs text-gray-500 italic mt-1 break-all">{uploadedFile.name}</p>

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={handleDelete}
                        className="h-10 px-4 py-2 bg-white rounded-[3px] border border-red-300 flex items-center gap-x-2 text-red-500 text-sm font-bold capitalize hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={handleReplace}
                        className="h-10 px-4 py-2 bg-indigo-600 rounded-[3px] text-white text-sm font-bold flex items-center gap-x-2 hover:bg-indigo-700 transition"
                      >
                        <Shuffle className="w-4 h-4" />
                        Replace
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Strict Filename Requirements */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium text-xs mb-2">🚨 STRICT Filename Requirements:</h4>
              <ul className="text-red-700 text-xs space-y-1">
                <li><strong>• "easypaisa receipt"</strong> (e.g., easypaisa receipt.jpg)</li>
                <li><strong>• "jazzcash receipt"</strong> (e.g., jazzcash receipt.pdf)</li>
                <li><strong>• "deposit slip"</strong> (e.g., deposit slip.png)</li>
                <li>• You can use underscore (_) or hyphen (-) instead of spaces</li>
                <li>• Any file extension is acceptable (.jpg, .pdf, .png, etc.)</li>
                <li>• <span className="text-red-600 font-semibold">Files with other names will be rejected</span></li>
              </ul>
            </div>

            {/* Requirements Checklist */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-gray-800 font-medium text-xs mb-2">✅ Requirements Checklist:</h4>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-xs ${selectedMethod !== 'Select Method' ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethod !== 'Select Method' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                    {selectedMethod !== 'Select Method' && <span className="text-white text-xs">✓</span>}
                  </div>
                  Payment method selected
                </div>
                <div className={`flex items-center gap-2 text-xs ${uploadedFile ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${uploadedFile ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                    {uploadedFile && <span className="text-white text-xs">✓</span>}
                  </div>
                  Valid receipt with correct filename uploaded
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentApplicationFee;