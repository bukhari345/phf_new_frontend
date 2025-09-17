"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaRegFileAlt } from "react-icons/fa";
import { CiMoneyBill } from "react-icons/ci";
import { SquareUser } from "lucide-react";

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

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cnic: string;
  phone: string;
  profession: string;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

const PackageDocumentModal2: React.FC<PackageDocumentModalProps> = ({
  isOpen,
  onClose,
  scheme,
}) => {
  const [loanAmount, setLoanAmount] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState<"Purpose" | "amount" | "documents">(
    "Purpose"
  );
  const [amountError, setAmountError] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ---- Range: 5 lakh to 10 lakh ----
  const minAmount = 500_000;
  const maxAmount = 1_000_000;

  // ===== Category + Purposes (with radios; no amounts) =====
  const CATEGORY_OPTIONS = ["MBBS/BDS", "Pharmacist"] as const;
  type Category = (typeof CATEGORY_OPTIONS)[number];

  const PURPOSES: Record<Category, { id: string; label: string }[]> = {
    "MBBS/BDS": [
      { id: "mbbs_eqp", label: "Purchase medical equipment" },
      { id: "mbbs_reno", label: "Renovation of clinic/building" },
      { id: "mbbs_furn", label: "Purchase of furniture and fixture" },
      { id: "mbbs_elec", label: "Purchase of electronic items" },
    ],
    Pharmacist: [
      { id: "pharm_reno", label: "Renovation of pharmacy" },
      { id: "pharm_furn", label: "Purchase of furniture and fixture" },
      { id: "pharm_elec", label: "Purchase of electronic items" },
      { id: "pharm_meds", label: "Purchase of medicine" },
    ],
  };

  // Function to determine default category based on profession
  const getDefaultCategory = (profession: string): Category => {
    const lowerProfession = profession.toLowerCase();
    if (lowerProfession.includes('mbbs') || lowerProfession.includes('bds') || 
        lowerProfession.includes('doctor') || lowerProfession.includes('physician')) {
      return "MBBS/BDS";
    }
    if (lowerProfession.includes('pharmacist') || lowerProfession.includes('pharmacy')) {
      return "Pharmacist";
    }
    // Default fallback
    return "MBBS/BDS";
  };

  // Function to get available categories based on profession
  const getAvailableCategories = (profession: string): Category[] => {
    const lowerProfession = profession.toLowerCase();
    if (lowerProfession.includes('mbbs') || lowerProfession.includes('bds') || 
        lowerProfession.includes('doctor') || lowerProfession.includes('physician')) {
      return ["MBBS/BDS"];
    }
    if (lowerProfession.includes('pharmacist') || lowerProfession.includes('pharmacy')) {
      return ["Pharmacist"];
    }
    // Default fallback - show both
    return ["MBBS/BDS", "Pharmacist"];
  };

  const [category, setCategory] = useState<Category>("MBBS/BDS");
  const [selectedPurposeId, setSelectedPurposeId] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(["MBBS/BDS", "Pharmacist"]);

  // ===== localStorage helpers for purpose =====
  const savePurposeToStorage = (purposeId: string | null, categoryType: Category) => {
    try {
      if (purposeId) {
        const purposeData = {
          purposeId,
          category: categoryType,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("selectedPurpose", JSON.stringify(purposeData));
        console.log("✅ Purpose saved to localStorage:", purposeData);
      } else {
        localStorage.removeItem("selectedPurpose");
        console.log("❌ Purpose removed from localStorage");
      }
    } catch (e) {
      console.error("Error saving purpose to localStorage:", e);
    }
  };

  const loadPurposeFromStorage = () => {
    try {
      const saved = localStorage.getItem("selectedPurpose");
      if (saved) {
        const purposeData = JSON.parse(saved);
        console.log("📂 Purpose loaded from localStorage:", purposeData);
        return {
          purposeId: purposeData.purposeId || null,
          category: purposeData.category || "MBBS/BDS"
        };
      }
    } catch (e) {
      console.error("Error loading purpose from localStorage:", e);
    }
    return { purposeId: null, category: "MBBS/BDS" as Category };
  };

  // Enhanced function to determine if a tab is disabled with better logic
  const isTabDisabled = (tab: "Purpose" | "amount" | "documents") => {
    switch (tab) {
      case "Purpose":
        return false; // Purpose is always enabled
      case "amount":
        return !selectedPurposeId; // Amount enabled only if purpose is selected
      case "documents":
        const validAmount = loanAmount && !amountError && toNum(loanAmount) >= minAmount && toNum(loanAmount) <= maxAmount;
        return !selectedPurposeId || !validAmount; // Documents enabled only if purpose and valid amount are set
      default:
        return false;
    }
  };

  // Function to get tab status text for better UX
  const getTabStatusText = (tab: "Purpose" | "amount" | "documents") => {
    if (!isTabDisabled(tab)) return "";
    
    switch (tab) {
      case "amount":
        return "Complete Purpose first";
      case "documents":
        if (!selectedPurposeId) return "Complete Purpose first";
        if (!loanAmount || amountError) return "Complete Loan Amount first";
        return "";
      default:
        return "";
    }
  };

  // ===== User authentication and data loading =====
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

    if (!token) {
      router.replace("/"); // redirect to login
    } else {
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Extract ALL user data from storage
          const userData: UserInfo = {
            id: user.id || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            cnic: user.cnic || "",
            phone: user.phone || "",
            profession: user.profession || "",
            specialization: user.specialization || "",
            createdAt: user.createdAt || "",
            updatedAt: user.updatedAt || "",
          };
          
          setUserInfo(userData);

          // Set available categories based on profession
          const availableCategs = getAvailableCategories(userData.profession);
          setAvailableCategories(availableCategs);
          
          // Load saved purpose from localStorage
          const savedPurpose = loadPurposeFromStorage();
          
          // Set default category based on profession or saved data
          const defaultCategory = availableCategs.includes(savedPurpose.category) 
            ? savedPurpose.category 
            : getDefaultCategory(userData.profession);
          
          setCategory(defaultCategory);
          
          // Set saved purpose if it matches the current category
          if (savedPurpose.purposeId && savedPurpose.category === defaultCategory) {
            setSelectedPurposeId(savedPurpose.purposeId);
          }
          
        } catch (error) {
          console.error("Error parsing user from storage:", error);
        }
      }
    }

    setLoading(false); // allow render
  }, [router]);

  // ---------- helpers: parse/format/clamp + localStorage ----------
  const NUM_ONLY = /[^\d]/g;
  const toNum = (s: string) => Number((s || "").replace(NUM_ONLY, "")) || 0;
  const fmt = (n: number) => n.toLocaleString();
  const clamp = (n: number) => Math.min(Math.max(n, minAmount), maxAmount);

  // load loan amount on mount and clamp if needed
  useEffect(() => {
    if (loading) return; // Wait for user data to load first
    
    try {
      const saved = localStorage.getItem("loanAmount");
      if (saved) {
        const n = toNum(saved);
        if (n) {
          const clamped = clamp(n);
          const formatted = fmt(clamped);
          setLoanAmount(formatted);
          if (clamped !== n) localStorage.setItem("loanAmount", formatted);
          console.log("📂 Loan amount loaded from localStorage:", formatted);
        }
      }
    } catch (e) {
      console.error("Error loading loan amount from localStorage:", e);
    }
  }, [loading]);

  const saveLoanAmountToStorage = (amount: string) => {
    try {
      const n = toNum(amount);
      if (n >= minAmount && n <= maxAmount) {
        const formattedAmount = fmt(n);
        localStorage.setItem("loanAmount", formattedAmount);
        console.log("✅ Loan amount saved to localStorage:", formattedAmount);
      } else {
        localStorage.removeItem("loanAmount");
        console.log("❌ Loan amount removed from localStorage (invalid amount)");
      }
    } catch (e) {
      console.error("Error saving loan amount to localStorage:", e);
    }
  };
  // ---------------------------------------------------------------

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (!/^\d*$/.test(raw)) return;

    const n = parseInt(raw) || 0;

    if (n === 0) {
      setLoanAmount("");
      setAmountError("");
      saveLoanAmountToStorage("");
      return;
    }

    if (n > maxAmount) {
      setAmountError(`Maximum loan amount is Rs. ${fmt(maxAmount)}`);
      setLoanAmount(fmt(maxAmount));
      saveLoanAmountToStorage(String(maxAmount));
      return;
    }

    if (n < minAmount) {
      setAmountError(`Minimum loan amount is Rs. ${fmt(minAmount)}`);
      setLoanAmount(fmt(n));
      saveLoanAmountToStorage("");
      return;
    }

    setAmountError("");
    setLoanAmount(fmt(n));
    saveLoanAmountToStorage(String(n));
  };

  const handleNextStep = () => {
    const n = toNum(loanAmount);
    if (n >= minAmount && n <= maxAmount && !amountError) {
      saveLoanAmountToStorage(loanAmount);
      // Switch to documents tab instead of navigating to fee chalan
      setActiveTab("documents");
      console.log("📋 Switched to documents tab - loan amount validated");
    }
  };

  const handleContinue = () => {
    // Save both purpose and loan amount before navigating
    savePurposeToStorage(selectedPurposeId, category);
    saveLoanAmountToStorage(loanAmount);
    
    console.log("🎯 Final data saved before navigation:");
    console.log("- Purpose:", selectedPurposeId);
    console.log("- Category:", category);
    console.log("- Loan Amount:", loanAmount);
    
    router.push("/feechalan1");
  };

  // Handle purpose selection change
  const handlePurposeChange = (purposeId: string) => {
    setSelectedPurposeId(purposeId);
    savePurposeToStorage(purposeId, category);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setSelectedPurposeId(null); // reset selection when switching
    savePurposeToStorage(null, newCategory); // clear saved purpose
  };

  // Handle tab switching with validation
  const handleTabSwitch = (tab: "Purpose" | "amount" | "documents") => {
    if (!isTabDisabled(tab)) {
      setActiveTab(tab);
      console.log(`📑 Switched to ${tab} tab`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen || !scheme) return null;

  const updatedScheme = {
    ...scheme,
    description:
      "For MBBS, BDS, Pharmacist.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20">
      <style>{`
        .scrollbar-thin{scrollbar-width:thin;scrollbar-color:#93C5FD #F3F4F6}
        .scrollbar-thin::-webkit-scrollbar{width:6px}
        .scrollbar-thin::-webkit-scrollbar-track{background:#F3F4F6;border-radius:3px}
        .scrollbar-thin::-webkit-scrollbar-thumb{background:#93C5FD;border-radius:3px}
        .scrollbar-thin::-webkit-scrollbar-thumb:hover{background:#60A5FA}
        .scrollbar-none::-webkit-scrollbar{display:none}
      `}</style>

      {/* Card */}
      <div className="relative w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] md:h-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 z-30"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sticky header (title + tabs) */}
        <div className="sticky top-0 bg-white z-20">
          <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
              Package Documents
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Complete your loan application for {updatedScheme.title} –{" "}
              {updatedScheme.subtitle}
            </p>
          </div>

          {/* Tabs — scrollable on mobile with enhanced styling */}
          <div className="flex gap-6 overflow-x-auto px-4 sm:px-6 md:px-8 border-b border-gray-200 scrollbar-none">
            {(["Purpose", "amount", "documents"] as const).map((tab) => {
              const disabled = isTabDisabled(tab);
              const statusText = getTabStatusText(tab);
              
              return (
                <div key={tab} className="relative group">
                  <button
                    onClick={() => handleTabSwitch(tab)}
                    disabled={disabled}
                    className={`pb-3 md:pb-4 px-1 md:px-2 font-semibold text-sm md:text-base border-b-2 whitespace-nowrap transition-colors relative
                      ${disabled 
                        ? "text-gray-400 border-transparent cursor-not-allowed" 
                        : activeTab === tab
                          ? "text-blue-600 border-[#08BDAC]"
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {tab === "Purpose" ? (
                        <>
                          <SquareUser className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                          <span>Purpose</span>
                          {selectedPurposeId && <span className="text-green-500 text-xs">✓</span>}
                        </>
                      ) : tab === "amount" ? (
                        <>
                          <CiMoneyBill className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                          <span>Loan Amount</span>
                          {loanAmount && !amountError && <span className="text-green-500 text-xs">✓</span>}
                        </>
                      ) : (
                        <>
                          <FaRegFileAlt className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                          <span>Required Documents</span>
                        </>
                      )}
                    </span>
                  </button>
                  
                  {/* Tooltip for disabled tabs */}
                  {disabled && statusText && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {statusText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 md:px-8 pb-6 md:pb-8 scrollbar-thin">
          {/* Navigation Loading Overlay */}
          {isNavigating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                <div className="text-center">
                  <p className="text-blue-600 font-semibold">Saving your application...</p>
                  <p className="text-gray-600 text-sm mt-1">Redirecting to payment page</p>
                </div>
              </div>
            </div>
          )}

          {/* Purpose */}
          {activeTab === "Purpose" && (
            <div className="h-full flex flex-col">
              {/* Category Switch - Only show if multiple categories available */}
              {availableCategories.length > 1 && (
                <div className="flex items-center gap-3 sm:gap-4 py-2">
                  {availableCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCategoryChange(c)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        category === c
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Show current category if only one is available */}
              {availableCategories.length === 1 && (
                <div className="py-2 mb-4">
                  <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {category}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Category selected based on your profession: {userInfo?.profession}
                  </p>
                </div>
              )}

              {/* Radio list of purposes (no amount column) */}
              <div role="radiogroup" className="mt-2">
                {PURPOSES[category].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-xl border transition
                      ${
                        selectedPurposeId === opt.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="purposeChoice"
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        checked={selectedPurposeId === opt.id}
                        onChange={() => handlePurposeChange(opt.id)}
                      />
                      <span className="text-gray-800 text-sm sm:text-base font-medium">
                        {opt.label}
                      </span>
                    </div>
                    {/* right-side subtle check indicator */}
                    {selectedPurposeId === opt.id ? (
                      <span className="text-xs text-blue-600 font-semibold">
                        Selected
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Choose</span>
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // Save current purpose selection
                    savePurposeToStorage(selectedPurposeId, category);
                    // Switch to amount tab
                    setActiveTab("amount");
                    console.log("➡️ Moving from Purpose to Amount tab");
                  }}
                  disabled={!selectedPurposeId}
                  className={`px-5 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPurposeId
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Amount */}
          {activeTab === "amount" && (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-base sm:text-lg font-semibold text-blue-600 mb-3 sm:mb-4">
                  How much loan would you like to apply for?
                </label>
                <input
                  type="text"
                  value={loanAmount}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black transition-all text-base sm:text-lg ${
                    amountError ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter amount (e.g., 800,000)"
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-2">{amountError}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Minimum: Rs. {minAmount.toLocaleString()}</span>
                  <span>Maximum: Rs. {maxAmount.toLocaleString()}</span>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mt-5 sm:mt-6">
                  <p className="text-sm text-blue-700 font-medium">
                    Note: Maximum loan ceiling is Rs.{" "}
                    {maxAmount.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  className={`mt-4 px-6 sm:px-8 py-3 rounded-xl font-semibold transition-colors text-base sm:text-lg ${
                    loanAmount && !amountError
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!loanAmount || !!amountError}
                >
                  Next Step →
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl">
                <h3 className="text-lg sm:text-xl font-bold text-blue-700 mb-3 sm:mb-4">
                  {updatedScheme.title}
                </h3>
                <h4 className="text-base sm:text-lg font-semibold text-blue-600 mb-2 sm:mb-3">
                  {updatedScheme.subtitle}
                </h4>
                <div className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">
                  {updatedScheme.amount}
                </div>
                <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                  {updatedScheme.description}
                </p>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">
                    Maximum Ceiling: Rs. {maxAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === "documents" && (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                  Required documents for {updatedScheme.title}:
                </h3>
                <div className="space-y-3 pr-0 sm:pr-2">
                  {[
                    {
                      h: "Bank Draft/Online Deposit",
                      p: `1. Rs. 2000 (Bank Draft/Online Bank Deposit Slip at Bank of Punjab Account No CPA 6580048830600033 branch code 0048 Chouburji, Lahore in favour of MD, Punjab Health Foundation)`,
                    },
                    {
                      h: "CNIC & Domicile",
                      p: "Attested copies of valid CNIC and Domicile certificate",
                    },
                    {
                      h: "Passport Size Pictures",
                      p: "02 recent passport size photographs",
                    },
                    {
                      h: "Medical Qualification",
                      p: "Attested copy of Medical Academic Qualification (Degree/Diploma)",
                    },
                    {
                      h: "Professional Registration",
                      p: "Attested copy of valid registration with Federal Council (PNC, NCH, NCT, PPC, etc.)",
                    },
                    {
                      h: "Project Proposal/Quotation",
                      p: "For loan purpose with specifications, model/make, price, Reference No. (construction plan if applicable)",
                    },
                    {
                      h: "Clinic Evidence",
                      p: "Proof of clinic ownership or rent agreement for premises",
                    },
                    {
                      h: "Healthcare Commission License",
                      p: "Registration and Licensed/provisionally Licensed with Punjab Healthcare Commission",
                    },
                    {
                      h: "Unemployment Affidavit",
                      p: "As per PHF specimen on Rs. 100/- stamp paper stating no government employment",
                    },
                    {
                      h: "Bank statement showing balance of 1/3 equity of total project.",
                      p: "",
                    },
                    {
                      h: "Annual Income and Expenditure statement",
                      p: "Approved by any Chartered Accountant Firm registered with ICAP.",
                    },
                    {
                      h: "Copy of NTN, Tax Return Statements.",
                      p: "NTN or Tax Return Statement",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.h}</h4>
                        {item.p && (
                          <p className="text-sm text-gray-600">{item.p}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl mb-5 sm:mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-3">
                    Important Notes:
                  </h4>
                  <ul className="space-y-2 text-sm text-yellow-700">
                    <li>• All documents must be attested copies (original attestation required)</li>
                    <li>• Bank draft should be in favour of MD, Punjab Health Foundation</li>
                    <li>• Unemployment affidavit must be on Rs. 100/- stamp paper as per PHF specimen</li>
                    <li>• Project proposal should include full specifications and cost estimates</li>
                    <li>• Punjab Healthcare Commission registration is mandatory</li>
                    <li>• Processing time: 7–10 business days after document verification</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 sm:p-6 rounded-xl mb-5 sm:mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">
                    ✅ Application Process:
                  </h4>
                  <div className="space-y-3 text-sm text-green-700">
                    {[
                      "Pay Rs. 2000 processing fee at Bank of Punjab",
                      "Submit complete application with all required documents",
                      "Document verification and eligibility assessment",
                      "Final approval and loan disbursement",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center">
                        <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary of selected options */}
                <div className="bg-blue-50 p-4 sm:p-6 rounded-xl mb-5 sm:mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    📋 Your Application Summary:
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Purpose:</span>
                      <span className="text-right flex-1 ml-2">
                        {PURPOSES[category].find(p => p.id === selectedPurposeId)?.label || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Loan Amount:</span>
                      <span>Rs. {loanAmount || '0'}</span>
                    </div>
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Status:</span>
                        <span className="text-green-600">Ready to Submit ✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleContinue}
                    className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDocumentModal2;
