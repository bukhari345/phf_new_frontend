/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Define users with their roles and routes
  const users = [
    {
      username: 'Imtiaz Ali',
      password: 'Admin@123',
      role: 'inspector',
      route: '/applications',
      displayName: 'Imtiaz Ali'
    },
    {
      username: 'Furqan Hameed',
      password: 'Supervisor@123',
      role: 'supervisor',
      route: '/supervisor',
      displayName: 'Furqan Hameed'
    },
    {
      username: 'Iftikhar Ahmad',
      password: 'Manager@123',
      role: 'manager',
      route: '/superadmin',
      displayName: 'Iftikhar Ahmad'
    }
  ];

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Session-based storage functions
  const setSessionData = (sessionId: string, userData: any) => {
    // Store session data with unique session ID
    const sessionData = {
      sessionId,
      userData,
      timestamp: Date.now(),
      tabId: sessionId // Use sessionId as tabId for this implementation
    };

    // Store in sessionStorage (tab-specific) instead of localStorage
    sessionStorage.setItem('currentSession', JSON.stringify(sessionData));

    // Also store in a sessions registry (optional - for tracking active sessions)
    const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
    activeSessions.push(sessionData);
    localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Username and password are required.');
      return;
    }

    setIsLoggingIn(true);

    // Find matching user
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      // Check if this role is already logged in another tab
      const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
      const existingSession = activeSessions.find(
        (session: any) => session.userData.role === user.role
      );

      if (existingSession) {
        const shouldProceed = window.confirm(
          `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} is already logged in another tab/window. 
          
Click OK to continue (this will log out the other session)
Click Cancel to stop login`
        );

        if (!shouldProceed) {
          setIsLoggingIn(false);
          return;
        }

        // Remove existing session for this role
        const updatedSessions = activeSessions.filter(
          (session: any) => session.userData.role !== user.role
        );
        localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));
      }

      toast.success(`Welcome ${user.role}! Login successful.`);

      // Generate unique session ID for this tab
      const sessionId = generateSessionId();

      // Store session data (tab-specific)
      setSessionData(sessionId, {
        name: user.displayName,
        role: user.role,
        username: user.username,
        loginTime: new Date().toISOString()
      });

      setTimeout(() => {
        router.push(user.route);
      }, 500);
    } else {
      toast.error('Invalid credentials. Please check your username and password.');
    }

    setIsLoggingIn(false);
  };

  return (
    <div className="flex w-full h-screen bg-white">
      {/* Left Section */}
      <div className="hidden md:flex w-full h-full md:w-[40%] text-white flex-col justify-center items-center p-10 relative bg-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/back.png"
            alt="Background"
            fill
            className="object-cover brightness-110"
            priority
          />
        </div>

        <div className="relative z-10 max-w-md text-center flex flex-col justify-between h-full w-full">
          <div className="mt-10">
            <Image
              src="/newlogo2.png"
              alt="Logo"
              width={350}
              height={350}
              className="mx-auto mb-6"
            />
          
            <p className="text-[22px] font-[500] mb-10 opacity-90 text-center text-white leading-none">
              Empowering Healthcare Professionals<br />
              Through Access to Finance.
            </p>
          </div>

          <div className="mb-5">
            <h1 className="text-3xl font-bold">From Idea to Impact.</h1>
            <p className="text-sm mt-2">
              Start Your Medical Practice with<br /> PHF Loan Support.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 bg-white">
        <main className="w-full max-w-md px-4 sm:px-8 py-8 sm:py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Please enter your credentials</h2>
            
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Username Input */}
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full h-11 px-4 rounded-md border border-[#4B73D6] bg-white text-base outline-none shadow-[0_4px_6px_rgba(70,95,241,0.15)] text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  boxShadow: '0 4px 6px rgba(70, 95, 241, 0.15)'
                }}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full h-11 px-4 rounded-md border border-[#4B73D6] bg-white text-base outline-none shadow-[0_4px_6px_rgba(70,95,241,0.15)] text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  boxShadow: '0 4px 6px rgba(70, 95, 241, 0.15)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full h-12 bg-[#2C5EFF] text-white text-base font-medium rounded-md hover:bg-[#2C5EFF]/90 transition flex items-center justify-center ${isLoggingIn ? 'opacity-50 pointer-events-none' : ''
                }`}
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Login Credentials Info */}

        </main>
      </div>
    </div>
  );
};

export default Login;