'use client';
import React, { useEffect, useState } from 'react';
import { Settings, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import PackageDocumentModal from './Modal1';
import PackageDocumentModal1 from './Modal2';
import PackageDocumentModal2 from './Modal3';
import { useRouter } from "next/navigation";
import Header from '../components/Header';
import router from 'next/dist/client/router';
import { GoArrowRight } from "react-icons/go";
interface LoanScheme {
  id: number;
  title: string;
  subtitle: string;
  amount: string;
  description: string;
  maxCeiling: string;
}



const LoanSchemeCard: React.FC<{
  scheme: LoanScheme;
  bgColor: string;
  onReadMore: (scheme: LoanScheme) => void;
}> = ({ scheme, bgColor, onReadMore }) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-white relative overflow-hidden h-85`}>
      <div className="absolute top-0 right-0 w-20 h-40 opacity-10">
        <div className="w-full h-full bg-white rounded-full transform translate-x-6 -translate-y-6"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-1">{scheme.title}</h3>
        <h4 className="text-3xl font-bold mb-3 ">{scheme.subtitle}</h4>
        <div className="text-xl font-bold mb-2">{scheme.amount}</div>
        <p className="text-md  mb-3 leading-relaxed flex-grow">{scheme.description}</p>
        <div className="text-sm  mb-3">{scheme.maxCeiling}</div>

        <button
          onClick={() => onReadMore(scheme)}
          className="w-full px-3 py-3 bg-white rounded-lg inline-flex justify-center items-center gap-3 hover:shadow-md transition-all duration-200"
        >
          <span className="text-indigo-600 text-base font-semibold capitalize">
            Read More
          </span>
          <div className="w-6 h-6 relative overflow-hidden">
            <GoArrowRight className="absolute top-0 left-0 w-6 h-6 text-indigo-600 transform transition-transform duration-300 hover:translate-y-1" />
          </div>
        </button>

      </div>
    </div>
  );
};



const LoanPackage: React.FC = () => {
  const router = useRouter();

  // ✅ State management
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [isModal3Open, setIsModal3Open] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<LoanScheme | null>(null);

  const [userInfo, setUserInfo] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    cnic: "",
    phone: "",
    profession: "",
    specialization: "",
    createdAt: "",
    updatedAt: "",
  });

  const [loading, setLoading] = useState(true); // ✅ Prevents flash

  // ✅ Load user & check token
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
          // ✅ Extract ALL user data from storage
          setUserInfo({
            id: user.id || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            cnic: user.cnic || "",
            phone: user.phone || "",
            profession: user.profession || "",
            specialization: user.specialization || "", // ✅ Include specialization
            createdAt: user.createdAt || "",
            updatedAt: user.updatedAt || "",
            // Add any other fields your User model has
          });
        } catch (error) {
          console.error("Error parsing user from storage:", error);
        }
      }
    }

    setLoading(false); // ✅ allow render
  }, [router]);

  // console.log('this is the info of the user',userInfo);

  // ✅ Loan schemes
  const allLoanSchemes: LoanScheme[] = [
    {
      id: 1,
      title: "",
      subtitle: "Scheme 1",
      amount: "Rs. 100,000 — Rs. 500,000",
      description:
        "For: Hakeems, Homeopaths, LHVs, Midwives, Assistant Pharmacists",
      maxCeiling: "Max Ceiling: Rs. 500,000",
    },
    {
      id: 2,
      title: "",
      subtitle: "Scheme 2",
      amount: "Rs. 500,000 — Rs. 1,000,000",
      description:
        "For: MBBS,BDS,Pharmacist",
      maxCeiling: "Max Ceiling: Rs. 1,000,000",
    },
    {
      id: 3,
      title: "",
      subtitle: "Scheme 3",
      amount: "Rs. 1100000 — Rs. 5,000,000",
      description:
        "For: MBBS,BDS,Pharmacist,Laboratories,Blood Banks",
      maxCeiling: "Max Ceiling: Rs. 5,000,000",
    },
  ];

const loanSchemes = React.useMemo(() => {
  const profession = userInfo.profession?.toLowerCase();
  
  // MBBS, BDS, Pharmacist, Blood Bank, Labs - show all schemes
  if (profession === "mbbs" || 
      profession === "bds" || 
      profession === "pharmacist" || 
      profession === "blood bank" || 
      profession === "labs") {
    return allLoanSchemes;
  }
  
  // NGO - show only scheme 3
  if (profession === "ngo") {
    return allLoanSchemes.filter((scheme) => scheme.id === 3);
  }
  
  // Hakeems, Homeopaths, LHVs, Midwives, Assistant Pharmacists - show scheme 1 only
  if (profession === "hakeem" || 
      profession === "homeopath" || 
      profession === "lhv" || 
      profession === "midwife" || 
      profession === "assistant pharmacist") {
    return allLoanSchemes.filter((scheme) => scheme.id === 1);
  }
  
  // For all other professions - show scheme 1 only
  return allLoanSchemes.filter((scheme) => scheme.id === 1);
}, [userInfo.profession]);


  const cardColors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-blue-500 to-blue-600",
  ];

  // ✅ Handle Read More
  const handleReadMore = (scheme: LoanScheme) => {
    setSelectedScheme(scheme);
    switch (scheme.id) {
      case 1:
        setIsModal1Open(true);
        break;
      case 2:
        setIsModal2Open(true);
        break;
      case 3:
        setIsModal3Open(true);
        break;
      default:
        console.warn("Unknown scheme ID:", scheme.id);
    }
  };

  // ✅ Close modals
  const handleCloseModal1 = () => {
    setIsModal1Open(false);
    setSelectedScheme(null);
  };
  const handleCloseModal2 = () => {
    setIsModal2Open(false);
    setSelectedScheme(null);
  };
  const handleCloseModal3 = () => {
    setIsModal3Open(false);
    setSelectedScheme(null);
  };

  // ✅ Prevent flicker
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <br />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 ">
            Loan Package
          </h1>
          <p className="text-gray-600">
            Please choose the loan scheme that best fits your needs. Each scheme
            offers different benefits and terms.
            {userInfo.profession?.toLowerCase() === "hakeem" && (
              <span className="block  text-blue-600 font-medium">
                Based on your profession (Hakeem), you are eligible for Scheme 1.
              </span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loanSchemes.map((scheme, index) => (
            <LoanSchemeCard
              key={scheme.id}
              scheme={scheme}
              bgColor={cardColors[index]}
              onReadMore={handleReadMore}
            />
          ))}
        </div>

        {loanSchemes.length === 0 && (
          <div className="text-center ">
            <p className="text-gray-500">
              No loan schemes available for your profession at this time.
            </p>
          </div>
        )}
      </main>

      {/* ✅ Modals */}
      <PackageDocumentModal
        isOpen={isModal1Open}
        onClose={handleCloseModal1}
        scheme={selectedScheme}
      />
      <PackageDocumentModal1
        isOpen={isModal2Open}
        onClose={handleCloseModal2}
        scheme={selectedScheme}
      />
      <PackageDocumentModal2
        isOpen={isModal3Open}
        onClose={handleCloseModal3}
        scheme={selectedScheme}
      />
    </div>
  );
};

export default LoanPackage;


// src/app/adminlogin/page.tsx