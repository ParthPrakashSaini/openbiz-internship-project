"use client";

import React, { useState } from 'react';

// Helper component for form input fields
const FormInput = ({ id, label, subLabel, type = 'text', value, onChange, error, placeholder }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-gray-800 text-sm font-semibold mb-2">
      {label} <span className="font-normal text-gray-600">{subLabel}</span>
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
  </div>
);

// Helper component for a dismissible message box
const MessageBox = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const baseClasses = "p-4 rounded-lg mb-4 flex items-center justify-between";
    const typeClasses = {
        success: "bg-green-100 border border-green-400 text-green-700",
        error: "bg-red-100 border border-red-400 text-red-700",
        info: "bg-blue-100 border border-blue-400 text-blue-700",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
            <span>{message}</span>
            <button onClick={onDismiss} className="font-bold text-xl ml-4">&times;</button>
        </div>
    );
};


// Main App Component
export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    name: '',
    panNumber: '',
    otp: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits.';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name as per Aadhaar is required.';
    }
    if (!formData.consent) {
        newErrors.consent = 'You must agree to the terms to proceed.';
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN format. It should be in the format ABCDE1234F.';
    }
    return newErrors;
  };
  
  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear previous messages
    const step1Errors = validateStep1();
    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/validate-aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber: formData.aadhaarNumber,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage({ text: data.message, type: 'info' });
      setIsOtpSent(true);

    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(formData.otp)) {
        setErrors({ otp: 'OTP must be 6 digits.'});
        return;
    }
    
    // This is a simulation. In a real app, the OTP would be verified on the backend.
    console.log('OTP validated:', formData.otp);
    setMessage({ text: 'Aadhaar validated successfully!', type: 'success' });
    
    setTimeout(() => {
        setStep(2);
        setErrors({});
        setMessage({ text: '', type: '' });
    }, 1500);
  };

  const handlePanSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch('/api/submit-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aadhaarNumber: formData.aadhaarNumber,
                name: formData.name,
                panNumber: formData.panNumber,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        setMessage({ text: data.message, type: 'success' });

    } catch (error) {
        setMessage({ text: error.message, type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-2">
          UDYAM REGISTRATION FORM
        </h1>
        <p className="text-center text-gray-600 mb-8">For New Enterprise who are not Registered yet as MSME</p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {step === 1 && (
            <div id="step1">
                <div className="bg-blue-700 text-white p-4 rounded-t-lg -m-8 mb-8">
                    <h2 className="text-lg font-semibold text-center">Aadhaar Verification with OTP</h2>
                </div>
                
                <MessageBox message={message.text} type={message.type} onDismiss={() => setMessage({text: '', type: ''})} />

                <form onSubmit={handleAadhaarSubmit} noValidate>
                    <div className="md:flex md:space-x-6 mb-4">
                        <div className="md:w-1/2">
                            <FormInput id="aadhaarNumber" label="1. Aadhaar Number" subLabel="/ आधार संख्या" value={formData.aadhaarNumber} onChange={handleInputChange} error={errors.aadhaarNumber} placeholder="Your Aadhaar No" />
                        </div>
                        <div className="md:w-1/2 mt-4 md:mt-0">
                            <FormInput id="name" label="2. Name of Entrepreneur" subLabel="/ उद्यमी का नाम" value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="Name as per Aadhaar" />
                        </div>
                    </div>

                    <div className="mb-6 mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <label className="flex items-start text-sm text-gray-700">
                            <input type="checkbox" name="consent" checked={formData.consent} onChange={handleInputChange} className="h-5 w-5 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="ml-3">
                                I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME, Government of India, for using my Aadhaar number as allowed by UIDAI for Udyam Registration. NIC / Ministry of MSME, Government of India, have informed me that my aadhaar data will not be stored/shared. / मैं, आधार धारक, इस प्रकार उद्यम पंजीकरण के लिए यूआईडीएआई द्वारा अनुमत मेरे आधार नंबर का उपयोग करने के लिए सूक्ष्म,लघु एवं मध्यम उद्यम मंत्रालय, भारत सरकार को अपनी सहमति देता हूं। एनआईसी / सूक्ष्म,लघु एवं मध्यम उद्यम मंत्रालय, भारत सरकार ने मुझे सूचित किया है कि मेरा आधार डेटा संग्रहीत / साझा नहीं किया जाएगा।
                            </span>
                        </label>
                        {errors.consent && <p className="text-red-500 text-xs italic mt-2 ml-8">{errors.consent}</p>}
                    </div>

                    <div className="text-center">
                        <button type="submit" disabled={!formData.consent || isOtpSent || isLoading} className="w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-md focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Validating...' : 'Validate & Generate OTP'}
                        </button>
                    </div>
                </form>

                {isOtpSent && (
                    <form onSubmit={handleOtpSubmit} className="mt-8 pt-6 border-t" noValidate>
                        <div className="max-w-sm mx-auto">
                            <FormInput id="otp" label="Enter OTP" type="text" value={formData.otp} onChange={handleInputChange} error={errors.otp} placeholder="Enter 6-digit OTP" />
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300">
                                Validate OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
            )}

            {step === 2 && (
            <div id="step2">
                <div className="bg-blue-700 text-white p-4 rounded-t-lg -m-8 mb-8">
                    <h2 className="text-lg font-semibold text-center">PAN Verification</h2>
                </div>
                <MessageBox message={message.text} type={message.type} onDismiss={() => setMessage({text: '', type: ''})} />
                <form onSubmit={handlePanSubmit} noValidate className="max-w-sm mx-auto">
                    <FormInput id="panNumber" label="PAN Number" value={formData.panNumber} onChange={handleInputChange} error={errors.panNumber} placeholder="Enter your 10-character PAN" />
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-gray-400">
                        {isLoading ? 'Submitting...' : 'Validate PAN & Submit'}
                    </button>
                </form>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
