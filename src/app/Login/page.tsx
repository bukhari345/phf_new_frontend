"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, ChevronDown, Loader2 } from "lucide-react";
import SignupSuccessModal from "../components/SignupSuccessModal";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ added for logos

const MODAL_DURATION_MS = 3500; // 3.5s (4s chahiye to 4000 kar dena)

// TypeScript interfaces
interface Profession {
  id: number;
  name: string;
}

interface ValidationCheck {
  label: string;
  met: boolean;
}

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface MyLinkButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface LoaderProps {
  size?: number;
}

interface ApiResponse {
  message: string;
  user?: any;
  token?: string;
}

// Custom Input Field Component
const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  required = false,
  className = "",
  style = {},
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      required={required}
      className={`w-full h-11 px-3 rounded-md border border-[#4B73D6] bg-white text-black outline-none shadow-[0_4px_6px_rgba(70,95,241,0.15)] ${className}`}
      style={style}
    />
  );
};

// Custom Button Component
const MyLinkButton: React.FC<MyLinkButtonProps> = ({
  type = "button",
  onClick,
  className = "",
  startContent,
  endContent,
  disabled = false,
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      <div className="flex items-center justify-center gap-2">
        {startContent}
        {children}
        {endContent}
      </div>
    </button>
  );
};

// Custom Loader Component
const Loader: React.FC<LoaderProps> = ({ size = 20 }) => {
  return <Loader2 size={size} className="animate-spin" />;
};

// Mock professions data
const mockProfessions: Profession[] = [
  { id: 1, name: "MBBS" },
  { id: 2, name: "BDS" },
  { id: 3, name: "Pharmacist" },
  { id: 4, name: "Assistant Homeopathic" },
  { id: 5, name: "Hakeem" },
  { id: 6, name: "Nurse" },
  { id: 7, name: "Midwife" },
  { id: 8, name: "LHV" },
  { id: 9, name: "NGO" },
  { id: 10, name: "Blood Bank" },
  { id: 11, name: " Labs" },
];

const AuthenticationUI: React.FC = () => {
  // State for tab switching
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");

  // Form states
  const [firstName, setFirstName] = useState<string>("");
  
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [CNIC, setCnic] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("+92");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // NEW — specialization states (UI only; rest of functionality unchanged)
  const [hasSpecialization, setHasSpecialization] = useState<null | boolean>(null);
  const [manualSpecialization, setManualSpecialization] = useState<string>("");

  // Uniqueness validation states
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [cnicExists, setCnicExists] = useState<boolean>(false);
  const [phoneExists, setPhoneExists] = useState<boolean>(false);
  const [checkingUniqueness, setCheckingUniqueness] = useState<{
    email: boolean;
    cnic: boolean;
    phone: boolean;
  }>({ email: false, cnic: false, phone: false });

  // Derived: only show specialization UI for MBBS/BDS
  const shouldAskForSpecialization =
    profession.trim() === "MBBS" || profession.trim() === "BDS";

  // UI states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoadingProfessions, setIsLoadingProfessions] =
    useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  // Validation states
  const [showFirstNameChecks, setFirstNameChecks] = useState<boolean>(false);
  const [showLastNameChecks, setLastNameChecks] = useState<boolean>(false);
  const [showCnicChecks, setShowCnicChecks] = useState<boolean>(false);
  const [showPhoneChecks, setShowPhoneChecks] = useState<boolean>(false);
  const [showEmailChecks, setShowEmailChecks] = useState<boolean>(false);
  const [showPasswordChecks, setShowPasswordChecks] = useState<boolean>(false);

  const [professions, setProfessions] = useState<Profession[]>(mockProfessions);

  // Auto-formatting functions
  const formatCNIC = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply CNIC format: 12345-1234567-1
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
  };

  const formatPhone = (value: string): string => {
    // If the value doesn't start with +92, ensure it does
    if (!value.startsWith('+92')) {
      const numbers = value.replace(/\D/g, '');
      return `+92${numbers}`;
    }
    
    // Remove all non-numeric characters except the + at the beginning
    const cleanValue = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +92 and limit to 13 characters total
    if (cleanValue.startsWith('+92')) {
      return cleanValue.slice(0, 13);
    }
    
    return '+92';
  };

  // Debounced uniqueness check
  const checkUniqueness = async (field: 'email' | 'cnic' | 'phone', value: string) => {
    if (!value) return;
    
    setCheckingUniqueness(prev => ({ ...prev, [field]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/check-unique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, value }),
      });
      
      const data = await response.json();
      
      if (field === 'email') setEmailExists(data.exists);
      if (field === 'cnic') setCnicExists(data.exists);
      if (field === 'phone') setPhoneExists(data.exists);
    } catch (error) {
      console.error(`Error checking ${field} uniqueness:`, error);
    } finally {
      setCheckingUniqueness(prev => ({ ...prev, [field]: false }));
    }
  };

  // Debounced check with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        checkUniqueness('email', email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (CNIC && /^\d{5}-\d{7}-\d{1}$/.test(CNIC)) {
        checkUniqueness('cnic', CNIC);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [CNIC]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mobileNumber && /^\+92\d{10}$/.test(mobileNumber)) {
        checkUniqueness('phone', mobileNumber);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [mobileNumber]);

  // Enhanced handlers with formatting
  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNIC(e.target.value);
    setCnic(formatted);
    setCnicExists(false); // Reset existence check when user types
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setMobileNumber(formatted);
    setPhoneExists(false); // Reset existence check when user types
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailExists(false); // Reset existence check when user types
  };

  // Validation functions
  const validateFirstName = (name: string): ValidationCheck[] => [
    { label: "At least 2 characters", met: name.length >= 2 },
    { label: "Only letters allowed", met: /^[a-zA-Z]+$/.test(name) },
  ];

  const validateLastName = (name: string): ValidationCheck[] => [
    { label: "At least 2 characters", met: name.length >= 2 },
    { label: "Only letters allowed", met: /^[a-zA-Z]+$/.test(name) },
  ];

  const validateCnic = (cnic: string): ValidationCheck[] => [
    { label: "Format: 12345-1234567-1", met: /^\d{5}-\d{7}-\d{1}$/.test(cnic) },
    {
      label: "Must be 13 digits total",
      met: cnic.replace(/-/g, "").length === 13,
    },
    {
      label: "CNIC must be unique",
      met: !cnicExists && !checkingUniqueness.cnic,
    },
  ];

  const validatePhone = (phone: string): ValidationCheck[] => [
    { label: "Start with +92", met: phone.startsWith("+92") },
    { label: "Must be 13 digits total", met: phone.length === 13 },
    { label: "Valid Pakistani number", met: /^\+92\d{10}$/.test(phone) },
    {
      label: "Phone number must be unique",
      met: !phoneExists && !checkingUniqueness.phone,
    },
  ];

  const validateEmail = (email: string): ValidationCheck[] => [
    {
      label: "Valid email format",
      met: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    },
    { label: "Contains @ symbol", met: email.includes("@") },
    {
      label: "Email must be unique",
      met: !emailExists && !checkingUniqueness.email,
    },
  ];

  const validatePassword = (password: string): ValidationCheck[] => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: "Passwords match",
      met: password === confirmPassword && confirmPassword.length > 0,
    },
  ];

  // Get validation results
  const firstNameChecks: ValidationCheck[] = validateFirstName(firstName);
  const lastNameChecks: ValidationCheck[] = validateLastName(lastName);
  const cnicChecks: ValidationCheck[] = validateCnic(CNIC);
  const phoneChecks: ValidationCheck[] = validatePhone(mobileNumber);
  const emailChecks: ValidationCheck[] = validateEmail(email);
  const passwordChecks: ValidationCheck[] = validatePassword(password);
  const router = useRouter();

  // API calls
const handleRegister = async (): Promise<void> => {
  // Check for uniqueness violations before submitting
  if (emailExists || cnicExists || phoneExists) {
    alert('Please resolve the uniqueness errors before submitting.');
    return;
  }

  setIsSigningUp(true);

  try {
    // Prepare the base request body
    const requestBody: {
        firstName: string;
        lastName: string;
        email: string;
        cnic: string;
        phone: string;
        profession: string;
        password: string;
        confirmPassword: string;
        specialization?: string;
      } = {
        firstName,
        lastName,
        email,
        cnic: CNIC,
        phone: mobileNumber,
        profession,
        password,
        confirmPassword,
      };

    // Add specialization if user has selected "Yes" and entered a specialization
    if (shouldAskForSpecialization && hasSpecialization === true && manualSpecialization.trim()) {
      requestBody.specialization = manualSpecialization.trim();
    }

    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: ApiResponse = await response.json();

    if (response.ok) {
      setShowModal(true); // Show modal
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Network error. Please try again.");
  } finally {
    setIsSigningUp(false);
  }
};

  const handleLogin = async (): Promise<void> => {
    setIsLoggingIn(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnic: CNIC,
          password,
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setShowModal(true);

        // Store token and user info
        if (data.token && data.user) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        router.push("/scheme");
        // Reset form
        setCnic("");
        setPassword("");
        setRememberMe(false);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle form submissions
  const handleSignInSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleLogin();
  };

  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="flex w-full h-screen bg-gray-50">
      <SignupSuccessModal
        show={showModal}
        name={firstName}
        onClose={() => setShowModal(false)}
      />

      {/* ✅ Top-left & Top-right logos (rest of UI untouched) */}
      <div className="fixed top-4 left-4 z-40">
        <Image
          src={"/pngegg 1.png"}  // public/logo 1.png
          alt="Logo 1"
          width={400}
          height={60}
          priority
          className="h-10 w-auto md:h-12"
        />
      </div>
      <div className="fixed top-4 right-4 z-40">
        <Image
          src={"/logo 1.png"}  // public/logo 2.png
          alt="Logo 2"
          width={400}
          height={60}
          priority
          className="h-10 w-auto md:h-12"
        />
      </div>

      {/* Left Section */}
      <div
        className="hidden md:flex w/full h-full md:w-[40%] text-white flex-col justify-center items-center p-10 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/back.png')" }}
      >
        <div className="relative z-10 max-w-md text-center flex flex-col justify-between h-full w-full">
          <div className="mt-10">
 

            <h1 className="text-3xl font-bold mb-2 mt-5">
              {activeTab === "signin" ? "SIGN IN" : "SIGN UP"}
            </h1>

            <p className="text-[22px] font-[500] mb-10 opacity-90 text-center text-white leading-tight">
              Empowering Healthcare Professionals
              <br />
              Through Access to Finance.
            </p>
          </div>

          <div className="mb-5">
            <h1 className="text-3xl font-bold">From Idea to Impact.</h1>
            <p className="text-sm mt-2">
              Start Your Medical Practice with
              <br /> PHF Loan Support.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12">
        <main className="w-full max-w-2xl px-4 sm:px-8 py-8 sm:py-10 lg:ml-8">
          {/* Toggle Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#ECF0FF] p-2.5 rounded-md flex w-full max-w-[300px] sm:w-[300px]">
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-[8px] px-[16px] text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-[#2C5EFF] text-white shadow-sm"
                    : "bg-[#ECF0FF] text-[#465FF1]"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 py-[8px] px-[16px] text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "signin"
                    ? "bg-[#2C5EFF] text-white shadow-sm"
                    : "bg-[#ECF0FF] text-[#465FF1]"
                }`}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="min-h-[500px]">
            {activeTab === "signin" ? (
              <form
                className="flex flex-col gap-6"
                onSubmit={handleSignInSubmit}
              >
                {/* CNIC Input Field */}
                <InputField
                  type="text"
                  placeholder="Enter your CNIC (12345-1234567-1)"
                  className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                  value={CNIC}
                  onChange={handleCNICChange}
                  style={{
                    background:
                      "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                  }}
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                    style={{
                      background:
                        "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  {/* Remember me on the left */}
                  <label className="flex items-center text-sm text-[#9C9AA5] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 w-4 h-4 text-[#4B73D6] border-[#4B73D6] rounded focus:ring-[#4B73D6]"
                    />
                    Remember me
                  </label>

                  {/* Forgot password on the right */}
                  <button
                    type="button"
                    className="text-sm text-[#9C9AA5] hover:underline"
                    onClick={() =>
                      alert(
                        "Forgot password functionality would be implemented here"
                      )
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <MyLinkButton
                  type="submit"
                  className={`w-full cursor-pointer h-12 bg-[#2C5EFF] text-white text-base font-medium rounded-md hover:bg-[#2C5EFF]/90 transition ${
                    isLoggingIn ? "opacity-50 pointer-events-none" : ""
                  }`}
                  startContent={<span>Sign In</span>}
                  endContent={isLoggingIn ? <Loader size={20} /> : null}
                />
              </form>
            ) : (
              <form
                className="w-full flex flex-col gap-3"
                onSubmit={handleSignUpSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-md">
                  <div>
                    <InputField
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFirstNameChecks(true)}
                      onBlur={() => setFirstNameChecks(false)}
                      required
                      className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                      style={{
                        background:
                          "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                      }}
                    />

                    {/* First name validation checks */}
                    {showFirstNameChecks && (
                      <div className="mt-2 space-y-1">
                        {firstNameChecks.map((requirement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {requirement.met ? (
                              <Check className="w-4 h-4 text-green-500 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 mt-0.5" />
                            )}
                            <span
                              className={`text-sm ${
                                requirement.met
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {requirement.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <InputField
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setLastNameChecks(true)}
                      onBlur={() => setLastNameChecks(false)}
                      required
                      className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                      style={{
                        background:
                          "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                      }}
                    />

                    {/* Last name validation checks */}
                    {showLastNameChecks && (
                      <div className="mt-2 space-y-1">
                        {lastNameChecks.map((requirement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {requirement.met ? (
                              <Check className="w-4 h-4 text-green-500 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 mt-0.5" />
                            )}
                            <span
                              className={`text-sm ${
                                requirement.met
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {requirement.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <InputField
                      type="text"
                      placeholder="Enter your CNIC number (12345-1234567-1)"
                      value={CNIC}
                      onChange={handleCNICChange}
                      onFocus={() => setShowCnicChecks(true)}
                      onBlur={() => setShowCnicChecks(false)}
                      required
                      className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
               shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                      style={{
                        background:
                          "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                      }}
                    />
                    {checkingUniqueness.cnic && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader size={16} />
                      </div>
                    )}
                  </div>
                  {/* CNIC validation checks */}
                  {showCnicChecks && (
                    <div className="mt-2 space-y-1">
                      {cnicChecks.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {requirement.met ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              requirement.met
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <InputField
                    type="text"
                    placeholder="Mobile number (+92xxxxxxxxxx)"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    onFocus={() => setShowPhoneChecks(true)}
                    onBlur={() => setShowPhoneChecks(false)}
                    required
                    className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                    style={{
                      background:
                        "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                    }}
                  />
                  {/* Phone validation checks */}
                  {showPhoneChecks && (
                    <div className="mt-2 space-y-1">
                      {phoneChecks.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {requirement.met ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              requirement.met
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <InputField
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
  shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent
  focus:shadow-[0_6px_10px_rgba(70,95,241,0.18)]"
                    style={{
                      background:
                        "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                    }}
                  />

                  {/* Email validation checks */}
                  {showEmailChecks && (
                    <div className="mt-2 space-y-1">
                      {emailChecks.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {requirement.met ? (
                            <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              requirement.met
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
  shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent
  focus:shadow-[0_6px_10px_rgba(70,95,241,0.18)]"
                      style={{
                        background:
                          "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                      }}
                      onFocus={() => setShowPasswordChecks(true)}
                      onBlur={() => setShowPasswordChecks(false)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <InputField
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent"
                      style={{
                        background:
                          "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password validation checks - only show when focused */}
                {showPasswordChecks && (
                  <div className="w-full space-y-1">
                    {passwordChecks.slice(0, 6).map((requirement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {requirement.met ? (
                          <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            requirement.met ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">👤</span>
                    </div>
                  </div>

                  <select
                    value={profession}
                    onChange={(e) => {
                      setProfession(e.target.value);
                      // reset specialization UI if profession changes
                      if (
                        e.target.value.trim() !== "MBBS" &&
                        e.target.value.trim() !== "BDS"
                      ) {
                        setHasSpecialization(null);
                        setManualSpecialization("");
                      }
                    }}
                    className={`
                       pl-12 pr-10  text-base  appearance-none cursor-pointer w-full h-11 px-3 rounded-md bg-white text-black outline-none
             shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent
                      ${
                        isLoadingProfessions
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                      ${!profession ? "text-gray-400" : "text-gray-700"}
                    `}
                    required
                    style={{
                      background:
                        "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                    }}
                  >
                    <option value="" disabled>
                      Select a profession
                    </option>
                    {Array.isArray(professions) &&
                      professions.map((prof) => (
                        <option key={prof.id} value={prof.name}>
                          {prof.name}
                        </option>
                      ))}
                  </select>

                  {/* Custom chevron icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isLoadingProfessions ? (
                      <Loader size={20} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#4B73D6]" />
                    )}
                  </div>
                </div>

                {/* Specialization UI (MBBS/BDS only) */}
                {shouldAskForSpecialization && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Do you have a specialization?
                    </label>

                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasSpecialization"
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={hasSpecialization === true}
                          onChange={() => setHasSpecialization(true)}
                        />
                        <span className="text-gray-800 text-sm">Yes</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasSpecialization"
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={hasSpecialization === false}
                          onChange={() => setHasSpecialization(false)}
                        />
                        <span className="text-gray-800 text-sm">No</span>
                      </label>
                    </div>

                    {hasSpecialization === true && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={manualSpecialization}
                          onChange={(e) => setManualSpecialization(e.target.value)}
                          placeholder={
                            profession.trim() === "MBBS"
                              ? "Enter specialization (e.g., Cardiology, Orthopedics)"
                              : "Enter specialization (e.g., Orthodontics, Endodontics)"
                          }
                          className="w-full h-11 px-3 rounded-md bg-white text-black outline-none shadow-[0_4px_6px_rgba(70,95,241,0.15)] border-2 border-transparent focus:shadow-[0_6px_10px_rgba(70,95,241,0.18)]"
                          style={{
                            background:
                              "linear-gradient(#ffffff,#ffffff) padding-box, linear-gradient(90deg,#97A3ED ,#7CEFE1) border-box",
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Type your specialization exactly as you want it on the application.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className={`
                    w-full cursor-pointer bg-[#465FF1] hover:bg-[#465FF1]/90 
                    ${isSigningUp ? "opacity-50 pointer-events-none" : ""}
                    text-white font-medium py-4 px-6 h-14 rounded-lg flex items-center justify-center gap-2 transition-all text-base mt-2
                  `}
                >
                  {isSigningUp ? <Loader size={20} /> : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthenticationUI;
