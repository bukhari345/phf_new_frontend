import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface LoanScheme {
    id: number;
    title: string;
    subtitle: string;
    amount: string;
    description: string;
    maxCeiling: string;
}

interface PackageDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    scheme: LoanScheme | null;
}

const PackageDocumentModal: React.FC<PackageDocumentModalProps> = ({ 
    isOpen, 
    onClose, 
    scheme 
}) => {
    const [loanAmount, setLoanAmount] = useState('');
    const [activeTab, setActiveTab] = useState('amount');
    const [amountError, setAmountError] = useState('');

    const maxAmount = 500000;
    const minAmount = 50000;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, '');
        
        // Only allow numeric input
        if (/^\d*$/.test(value)) {
            const numericValue = parseInt(value) || 0;
            
            // Check if amount exceeds maximum limit
            if (numericValue > maxAmount) {
                setAmountError(`Maximum loan amount is Rs. ${maxAmount.toLocaleString()}`);
                setLoanAmount(maxAmount.toLocaleString());
            } else if (numericValue > 0 && numericValue < minAmount) {
                setAmountError(`Minimum loan amount is Rs. ${minAmount.toLocaleString()}`);
                setLoanAmount(numericValue.toLocaleString());
            } else {
                setAmountError('');
                setLoanAmount(numericValue > 0 ? numericValue.toLocaleString() : '');
            }
        }
    };

    if (!isOpen || !scheme) return null;

    // Updated scheme info for display
    const updatedScheme = {
        ...scheme,
        description: "For: Hakeems, Homeopaths, LHVs, Midwives, Assistant Pharmacists"
    };

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <style>{`
                /* Custom Scrollbar Styles */
                .scrollbar-thin {
                    scrollbar-width: thin;
                    scrollbar-color: #93C5FD #F3F4F6;
                }
                
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #F3F4F6;
                    border-radius: 3px;
                }
                
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #93C5FD;
                    border-radius: 3px;
                }
                
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #60A5FA;
                }
            `}</style>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] mx-auto relative border border-gray-200 flex flex-col">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="p-8 pb-0 flex-shrink-0">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-blue-600 mb-2">Package Documents</h2>
                        <p className="text-gray-600">Complete your loan application for {updatedScheme.title} - {updatedScheme.subtitle}</p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button 
                            onClick={() => setActiveTab('amount')}
                            className={`pb-4 px-2 mr-12 font-semibold text-base border-b-3 transition-colors ${
                                activeTab === 'amount' 
                                    ? 'text-blue-600 border-blue-600' 
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            💰 Loan Amount
                        </button>
                        <button 
                            onClick={() => setActiveTab('documents')}
                            className={`pb-4 px-2 font-semibold text-base border-b-3 transition-colors ${
                                activeTab === 'documents' 
                                    ? 'text-blue-600 border-blue-600' 
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            📄 Required Documents
                        </button>
                    </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-hidden">
                    <div className="px-8 pb-8 h-full overflow-y-auto scrollbar-thin">
                        {activeTab === 'amount' ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column - Form */}
                                <div>
                                    <div className="mb-6">
                                        <label className="block text-lg font-semibold text-blue-600 mb-4">
                                            How much loan would you like to apply for?
                                        </label>
                                        <input
                                            type="text"
                                            value={loanAmount}
                                            onChange={handleInputChange}
                                            className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black transition-all text-lg ${
                                                amountError ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter amount (e.g., 250,000)"
                                        />
                                        {amountError && (
                                            <p className="text-red-500 text-sm mt-2">{amountError}</p>
                                        )}
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>Minimum: Rs. {minAmount.toLocaleString()}</span>
                                            <span>Maximum: Rs. {maxAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                        <p className="text-sm text-blue-700 font-medium">
                                            💡 Note: Maximum loan ceiling is Rs. {maxAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-start">
                                        <button 
                                            className={`px-8 py-3 rounded-xl font-semibold transition-colors text-lg ${
                                                loanAmount && !amountError 
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            disabled={!loanAmount || !!amountError}
                                        >
                                            Next Step →
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column - Scheme Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-blue-700 mb-4">{updatedScheme.title}</h3>
                                    <h4 className="text-lg font-semibold text-blue-600 mb-3">{updatedScheme.subtitle}</h4>
                                    <div className="text-2xl font-bold text-blue-800 mb-4">{updatedScheme.amount}</div>
                                    <p className="text-gray-700 leading-relaxed mb-4 font-medium">{updatedScheme.description}</p>
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-sm font-medium text-blue-600">Maximum Ceiling: Rs. {maxAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column - Documents List */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                        Required documents for {updatedScheme.title}:
                                    </h3>
                                    <div className="space-y-3 pr-2">
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">🏦</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Bank Draft/Online Deposit</h4>
                                                <p className="text-sm text-gray-600">Rs. 500 at Bank of Punjab Account No CPA PA 6580048830600044, Branch Code 0048 Chouburji, Lahore</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">📄</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">CNIC & Domicile</h4>
                                                <p className="text-sm text-gray-600">Attested copies of valid CNIC and Domicile certificate</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">📸</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Passport Size Pictures</h4>
                                                <p className="text-sm text-gray-600">02 recent passport size photographs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">🎓</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Medical Qualification</h4>
                                                <p className="text-sm text-gray-600">Attested copy of Medical Academic Qualification (Degree/Diploma)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">🏥</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Professional Registration</h4>
                                                <p className="text-sm text-gray-600">Attested copy of valid registration with Federal Council (PNC, NCH, NCT, PPC, etc.)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">📋</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Project Proposal/Quotation</h4>
                                                <p className="text-sm text-gray-600">For loan purpose with specifications, model/make, price, Reference No. (construction plan if applicable)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">🏢</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Clinic Evidence</h4>
                                                <p className="text-sm text-gray-600">Proof of clinic ownership or rent agreement for premises</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">🔖</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Healthcare Commission License</h4>
                                                <p className="text-sm text-gray-600">Registration and Licensed/provisionally Licensed with Punjab Healthcare Commission</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                                            <span className="text-blue-600 mr-3 text-lg">⚖️</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Unemployment Affidavit</h4>
                                                <p className="text-sm text-gray-600">As per PHF specimen on Rs. 100/- stamp paper stating no government employment</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Additional Info */}
                                <div>
                                    <div className="bg-yellow-50 p-6 rounded-xl mb-6">
                                        <h4 className="font-semibold text-yellow-800 mb-3">📋 Important Notes:</h4>
                                        <ul className="space-y-2 text-sm text-yellow-700">
                                            <li>• All documents must be attested copies (original attestation required)</li>
                                            <li>• Bank draft should be in favour of MD, Punjab Health Foundation</li>
                                            <li>• Unemployment affidavit must be on Rs. 100/- stamp paper as per PHF specimen</li>
                                            <li>• Project proposal should include full specifications and cost estimates</li>
                                            <li>• Punjab Healthcare Commission registration is mandatory</li>
                                            <li>• Processing time: 7-10 business days after document verification</li>
                                        </ul>
                                    </div>

                                    <div className="bg-green-50 p-6 rounded-xl">
                                        <h4 className="font-semibold text-green-800 mb-3">✅ Application Process:</h4>
                                        <div className="space-y-3 text-sm text-green-700">
                                            <div className="flex items-center">
                                                <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                                                Pay Rs. 500 processing fee at Bank of Punjab
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                                                Submit complete application with all required documents
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                                                Document verification and eligibility assessment
                                            </div>
                                            <div className="flex items-center">
                                                <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                                                Final approval and loan disbursement
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDocumentModal;