/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';

// Define interfaces
interface LoanData {
    id: string;
    fullName: string;
    cnic: string;
    organizationName: string;
    loanAmount: number;
    approvedLoanAmount: number;
    approvedAt: string;
    approvedBy: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    profession: string;
    cnic: string;
}

interface LoanDetailsProps {
    userCnic?: string;
    onBackToDashboard: () => void;
}

interface InstallmentCalculation {
    loanAmount: number;
    installment: number;
    interest: number;
    tenure: number;
    frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
    totalAmount: number;
}

const LoanDetails: React.FC<LoanDetailsProps> = ({ 
    userCnic, 
    onBackToDashboard 
}) => {
    const [loanData, setLoanData] = useState<LoanData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        firstName: "",
        lastName: "",
        email: "",
        profession: "",
        cnic: "",
    });
    
    // Calculator state
    const [selectedFrequency, setSelectedFrequency] = useState<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'>('Monthly');
    const [selectedTenure, setSelectedTenure] = useState<number>(12);
    const [calculation, setCalculation] = useState<InstallmentCalculation | null>(null);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    // API base URL
    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

    // Get user info from storage and fetch application data
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
        
        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserInfo({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email || "",
                    profession: user.profession || "",
                    cnic: user.cnic || "",
                });
                // Fetch application data when user info is loaded
                if (user.cnic || userCnic) {
                    fetchLoanDetails(user.cnic || userCnic);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                setError("Error loading user information");
            }
        } else if (userCnic) {
            // If no stored user but have userCnic, proceed with fetch
            fetchLoanDetails(userCnic);
        }
    }, [userCnic]);

    useEffect(() => {
        if (loanData) {
            calculateInstallment();
        }
    }, [loanData, selectedFrequency, selectedTenure]);

    const fetchLoanDetails = async (cnic?: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const searchCnic = cnic || userInfo.cnic || userCnic;
            
            if (!searchCnic) {
                setError("No CNIC provided");
                setLoading(false);
                return;
            }

            // Fetch applications using search endpoint with CNIC
            const response = await fetch(`${API_BASE_URL}/applications?search=${searchCnic}`);

            if (response && response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // Handle search response - applications might be in data.applications or data.data
                    const applications = data.data?.applications || data.applications || data.data || [];

                    // Find approved loan application
                    const approvedLoan = applications.find((app: any) => 
                        app.status === 'approved' && 
                        app.cnic === searchCnic &&
                        app.approvedLoanAmount > 0
                    );

                    if (approvedLoan) {
                        // Map the application data to loan data format
                        const mappedLoanData: LoanData = {
                            id: approvedLoan.id || approvedLoan._id || '',
                            fullName: approvedLoan.fullName || `${approvedLoan.firstName || ''} ${approvedLoan.lastName || ''}`.trim(),
                            cnic: approvedLoan.cnic || '',
                            organizationName: approvedLoan.organizationName || approvedLoan.organization || 'N/A',
                            loanAmount: approvedLoan.loanAmount || approvedLoan.requestedAmount || 0,
                            approvedLoanAmount: approvedLoan.approvedLoanAmount || approvedLoan.approvedAmount || 0,
                            approvedAt: approvedLoan.approvedAt || approvedLoan.updatedAt || approvedLoan.approvalDate || '',
                            approvedBy: approvedLoan.approvedBy || approvedLoan.approver || 'Admin',
                            status: approvedLoan.status,
                            createdAt: approvedLoan.createdAt,
                            updatedAt: approvedLoan.updatedAt
                        };
                        
                        setLoanData(mappedLoanData);
                    } else {
                        // Check if there are any applications but none approved
                        if (applications.length > 0) {
                            const userApp = applications.find((app: any) => app.cnic === searchCnic);
                            if (userApp) {
                                if (userApp.status === 'pending') {
                                    setError("Your application is still under review. Please check back later.");
                                } else if (userApp.status === 'rejected') {
                                    setError("Your loan application was not approved. Please contact support for more information.");
                                } else {
                                    setError("No approved loan found for your application.");
                                }
                            } else {
                                setError("No application found matching your CNIC.");
                            }
                        } else {
                            setError("No approved loan found for your application.");
                        }
                    }
                } else {
                    setError(data.message || data.error || "Failed to fetch loan details");
                }
            } else {
                setError(`Failed to fetch loan details. Status: ${response?.status || 'Unknown'}`);
            }
        } catch (error) {
            console.error("Error fetching loan details:", error);
            setError("Failed to fetch loan details. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const calculateInstallment = (): void => {
        if (!loanData) return;

        const principal = loanData.approvedLoanAmount;
        
        // All plans have 0% interest as requested
        const interestRate = 0;
        const totalAmount = principal; // No interest added
        const installmentAmount = Math.ceil(totalAmount / selectedTenure);

        setCalculation({
            loanAmount: principal,
            installment: installmentAmount,
            interest: interestRate,
            tenure: selectedTenure,
            frequency: selectedFrequency,
            totalAmount: totalAmount
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTenureOptions = (frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'): number[] => {
        switch (frequency) {
            case 'Monthly':
                return [6, 12, 18, 24, 36, 48];
            case 'Quarterly':
                return [2, 4, 6, 8, 12, 16];
            case 'Half-Yearly':
                return [1, 2, 3, 4, 6, 8];
            case 'Yearly':
                return [1, 2, 3, 4, 5];
            default:
                return [12];
        }
    };

    const handleConfirmAndContinue = (): void => {
        if (!termsAccepted) {
            alert('Please accept the terms and conditions to continue.');
            return;
        }
        
        // Handle confirmation logic here
        console.log('Loan confirmed with calculation:', calculation);
        alert('Loan installment plan confirmed! Redirecting to next step...');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading loan details...</p>
                </div>
            </div>
        );
    }

    if (error || !loanData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                    <div className="text-red-500 text-lg mb-4">⚠️ {error || "No loan data found"}</div>
                    <button
                        onClick={onBackToDashboard}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => fetchLoanDetails()}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const tenureOptions = getTenureOptions(selectedFrequency);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBackToDashboard}
                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Installment Plan</h1>
                    <p className="text-gray-600">Configure your payment plan for the approved loan</p>
                </div>

                {/* Loan Status Card */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">Loan Approved!</h3>
                            <p className="text-green-600">Congratulations! Your loan has been approved by {loanData.approvedBy}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Applicant</p>
                            <p className="font-semibold text-gray-900">{loanData.fullName}</p>
                            <p className="text-xs text-gray-500">{loanData.cnic}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Requested Amount</p>
                            <p className="text-xl font-bold text-gray-800">{formatCurrency(loanData.loanAmount)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Approved Amount</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(loanData.approvedLoanAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Calculator */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Loan Amount Display */}
                        <div className="mb-8">
                            <p className="text-gray-600 mb-2">Approved Loan Amount</p>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                {formatCurrency(loanData.approvedLoanAmount)}
                            </div>
                            <p className="text-gray-500 text-sm">
                                (Configure your installment plan below)
                            </p>
                        </div>

                        {/* Installment Frequency Selection */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-blue-600 mb-4">
                                Select an Installment Frequency
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] as const).map((frequency) => (
                                    <button
                                        key={frequency}
                                        onClick={() => {
                                            setSelectedFrequency(frequency);
                                            setSelectedTenure(getTenureOptions(frequency)[0]);
                                        }}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            selectedFrequency === frequency
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {frequency}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calculation Results */}
                        {calculation && (
                            <div className="space-y-3 mb-8 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">Loan Amount:</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatCurrency(calculation.loanAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">Per Installment:</span>
                                    <span className="font-semibold text-blue-600 text-lg">
                                        {formatCurrency(calculation.installment)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">Interest Rate:</span>
                                    <span className="font-semibold text-gray-900">
                                        {calculation.interest}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">Tenure:</span>
                                    <span className="font-semibold text-gray-900">
                                        {calculation.tenure} {selectedFrequency.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Terms and Conditions */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-4">
                                Terms & Conditions Agreement
                            </h3>
                            <label className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 text-sm">
                                    I agree to repay the loan on time and understand that any defaults may lead to legal action from the Government of Punjab.
                                </span>
                            </label>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirmAndContinue}
                            disabled={!termsAccepted}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                                termsAccepted
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Confirm & Continue
                            <span className="ml-2">→</span>
                        </button>
                    </div>

                    {/* Right Column - Tenure Selection & Summary */}
                    <div className="space-y-6">
                        {/* Tenure Selection */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                    Select Tenure
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Choose your preferred payment period
                                </p>
                                
                                {/* Tenure Dropdown */}
                                <div className="relative">
                                    <select
                                        value={selectedTenure}
                                        onChange={(e) => setSelectedTenure(Number(e.target.value))}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                    >
                                        {tenureOptions.map((tenure) => (
                                            <option key={tenure} value={tenure} className="text-gray-900 bg-white">
                                                {tenure} {selectedFrequency.toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loan Summary Card */}
                        {calculation && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Installment Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Principal Amount:</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(calculation.loanAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Interest (0%):</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Payment Frequency:</span>
                                        <span className="font-semibold text-gray-900">{selectedFrequency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Total Installments:</span>
                                        <span className="font-semibold text-gray-900">{calculation.tenure}</span>
                                    </div>
                                    <hr className="border-gray-300 my-3" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span className="text-gray-800">Per Installment:</span>
                                        <span className="text-blue-600">
                                            {formatCurrency(calculation.installment)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-gray-800">Total Amount:</span>
                                        <span className="text-gray-900">{formatCurrency(calculation.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Application Details */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Application Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Application ID:</span>
                                    <span className="font-semibold text-gray-900">{loanData.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Organization:</span>
                                    <span className="font-semibold text-gray-900">{loanData.organizationName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Approved On:</span>
                                    <span className="font-semibold text-gray-900">{formatDate(loanData.approvedAt)}</span>
                                </div>
                                {userInfo.email && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700 font-medium">Email:</span>
                                        <span className="font-semibold text-gray-900">{userInfo.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Early payment is allowed without penalties</li>
                                <li>• Late payment may incur additional charges</li>
                                <li>• Auto-deduction will be set up from your account</li>
                                <li>• You can modify payment plan within first 30 days</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanDetails;