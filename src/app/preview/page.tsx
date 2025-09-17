"use client";
import React from "react";
import { ChevronDown } from "lucide-react";
import Header from "../components/Header";

const PreviewDocuments = () => {
  const formData = {
    fullName: "Noor Ali",
    fatherName: "Riaz Hussain Shah",
    cnic: "35202 5755 252 0",
    gender: "Male",
    organizationName: "Noor ali pharmacy",
    organizationAddress: "3 no shope street 5 dha phase 4",
    personalAddress: "Noor ali pharmacy",
    organizationPhone: "042 111 253 254",
    enterpriseType: "Pharmacy",
    counsellingRequired: "Yes",
    natureOfEmployment: "Doctor",
    specialization: "General Physician",
    district: "Punjab",
    tehsil: "Lahore",
  };

  interface FormFieldProps {
    label: string;
    value: string;
    isDropdown?: boolean;
  }

  const FormField: React.FC<FormFieldProps> = ({ label, value, isDropdown = false }) => (
    <div className="w-full relative">
      <label className="block text-neutral-700 text-sm font-medium mb-2">
        {label} *
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={value}
          className="w-full h-12 bg-white rounded-lg shadow-sm border border-indigo-600 px-4 text-zinc-700 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {isDropdown && (
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-4 pointer-events-none" />
        )}
      </div>
    </div>
  );

  return (
    <div className=" min-h-screen relative bg-slate-50 overflow-hidden">
      <Header />
      <div className="max-w-7xl mx-auto mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-indigo-600 text-4xl font-bold font-sans">
            Preview Documents
          </h1>
        </div>

        {/* Form Container */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
            {/* Row 1 */}
            <FormField label="Full Name" value={formData.fullName}  />
            <FormField label="Father Name" value={formData.fatherName} />

            {/* Row 2 */}
            <FormField label="CNIC" value={formData.cnic} />
            <FormField label="Gender" value={formData.gender} />

            {/* Row 3 */}
            <FormField label="Organization / Clinic Name" value={formData.organizationName} />
            <FormField label="Organization Address" value={formData.organizationAddress} />

            {/* Row 4 */}
            <FormField label="Personal Address" value={formData.personalAddress} />
            <FormField label="Organization Phone Number" value={formData.organizationPhone} />

            {/* Row 5 */}
            <FormField label="Enterprise Type" value={formData.enterpriseType} isDropdown={true} />
            <FormField label="Counselling required for enterprise" value={formData.counsellingRequired} isDropdown={true} />

            {/* Row 6 */}
            <FormField label="Nature of Employment" value={formData.natureOfEmployment} />
            <FormField label="Discipline / Specialization" value={formData.specialization} />

            {/* Row 7 */}
            <FormField label="District" value={formData.district} />
            <FormField label="Tehsil" value={formData.tehsil} />
          </div>

          {/* Get Started Button */}
          <div className="flex justify-end mt-8">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2">
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
   
   
  );
};

export default PreviewDocuments;
