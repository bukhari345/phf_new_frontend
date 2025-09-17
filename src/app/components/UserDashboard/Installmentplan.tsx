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
}

interface LoanDetailsProps {
    applicationId?: string;
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
    applicationId, 
    userCnic, 
    onBackToDashboard 
}) => {
    const [loanData, setLoanData] = useState<LoanData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Calculator state
    const [selectedFrequency, setSelectedFrequency] = useState<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'>('Monthly');
    const [selectedTenure, setSelectedTenure] = useState<number>(12);
    const [calculation, setCalculation] = useState<InstallmentCalculation | null>(null);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    // API base URL
    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

    useEffect(() => {
        if (applicationId || userCnic) {
            fetchLoanDetails();
        }
    }, [applicationId, userCnic]);

    useEffect(() => {
        if (loanData) {
            calculateInstallment();
        }
    }, [loanData, selectedFrequency, selectedTenure]);

    const fetchLoanDetails = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            let response;
            
            if (applicationId) {
                response = await fetch(`${API_BASE_URL}/applications/loans/${applicationId}`);
            } else if (userCnic) {
                response = await fetch(`${API_BASE_URL}/applications/loans?limit=100`);
                const data = await response.json();
                
                if (data.success && data.data.loans.length > 0) {
                    const userLoan = data.data.loans.find((loan: LoanData) => 
                        loan.cnic === userCnic
                    );
                    if (userLoan) {
                        setLoanData(userLoan);
                        setLoading(false);
                        return;
                    } else {
                        setError("No approved loan found for your application.");
                        setLoading(false);
                        return;
                    }
                }
            }

            if (response && applicationId) {
                const data = await response.json();
                
                if (data.success) {
                    setLoanData(data.data);
                } else {
                    setError(data.error || "Failed to fetch loan details");
                }
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
        
        // Interest rates based on frequency and tenure
        const getInterestRate = (frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly', tenure: number): number => {
            const baseRates: Record<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly', number> = {
                'Monthly': tenure <= 12 ? 0 : tenure <= 24 ? 5 : 10,
                'Quarterly': tenure <= 4 ? 2 : tenure <= 8 ? 7 : 12,
                'Half-Yearly': tenure <= 2 ? 3 : tenure <= 4 ? 8 : 15,
                'Yearly': tenure <= 1 ? 5 : tenure <= 2 ? 10 : 18
            };
            return baseRates[frequency];
        };

        const interestRate = getInterestRate(selectedFrequency, selectedTenure);
        const totalAmount = principal + (principal * interestRate / 100);
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
                        onClick={fetchLoanDetails}
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
            <div className="max-w-4xl mx-auto px-4 py-8">
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Calculator */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Loan Amount Display */}
                        <div className="mb-8">
                            <p className="text-gray-600 mb-2">Loan Amount you have selected</p>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                {formatCurrency(loanData.approvedLoanAmount)}
                            </div>
                            <p className="text-gray-500 text-sm">
                                (No interest considered for now — flat distribution)
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
                                    <span className="text-gray-600">Loan Amount:</span>
                                    <span className="font-medium">-</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Installment:</span>
                                    <span className="font-medium">
                                        {formatCurrency(calculation.installment)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Interest:</span>
                                    <span className="font-medium">
                                        {calculation.interest}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tenure:</span>
                                    <span className="font-medium">
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

                    {/* Right Column - Tenure Selection */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-blue-600 mb-2">
                                Select Tenure
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Loan Amount you have selected
                            </p>
                            
                            {/* Tenure Dropdown */}
                            <div className="relative">
                                <select
                                    value={selectedTenure}
                                    onChange={(e) => setSelectedTenure(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    {tenureOptions.map((tenure) => (
                                        <option key={tenure} value={tenure}>
                                            {tenure} {selectedFrequency.toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Loan Summary Card */}
                        {calculation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Installment Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Principal Amount:</span>
                                        <span className="font-medium">
                                            {formatCurrency(calculation.loanAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Interest ({calculation.interest}%):</span>
                                        <span className="font-medium">
                                            {formatCurrency(calculation.totalAmount - calculation.loanAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Frequency:</span>
                                        <span className="font-medium">{selectedFrequency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Installments:</span>
                                        <span className="font-medium">{calculation.tenure}</span>
                                    </div>
                                    <hr className="border-blue-200" />
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Per Installment:</span>
                                        <span className="text-blue-600">
                                            {formatCurrency(calculation.installment)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Amount:</span>
                                        <span>{formatCurrency(calculation.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Early payment is allowed without penalties</li>
                                <li>• Late payment may incur additional charges</li>
                                <li>• Auto-deduction will be set up from your account</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanDetails;