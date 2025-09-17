/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Settings, Bell, User, ChevronDown, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";

interface AdminHeaderProps {
  name?: string; // name can come as prop
}

const Adminheader: React.FC<AdminHeaderProps> = ({ name }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userName, setUserName] = useState(name || "");
  const [userRole, setUserRole] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);

  // Get current session data
  const getCurrentSession = () => {
    try {
      const currentSession = sessionStorage.getItem('currentSession');
      if (currentSession) {
        return JSON.parse(currentSession);
      }
    } catch (error) {
      console.error('Error getting session data:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!name) {
      // Get session data from sessionStorage (tab-specific)
      const session = getCurrentSession();
      
      if (session && session.userData) {
        setSessionData(session);
        setUserName(session.userData.name);
        setUserRole(session.userData.role);
      } else {
        // If no session data, redirect to login
        console.warn('No valid session found');
        // Optionally redirect to login
        // window.location.href = "/adminlogin";
      }
    }
  }, [name]);

  // Listen for session changes (when user logs out from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeSessions') {
        // Check if current session is still valid
        const session = getCurrentSession();
        if (session) {
          const activeSessions = JSON.parse(e.newValue || '[]');
          const isSessionActive = activeSessions.some(
            (activeSession: any) => activeSession.sessionId === session.sessionId
          );
          
          if (!isSessionActive) {
            // Session was terminated from another tab
            handleLogout(true);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = (forceLogout = false) => {
    setIsProfileDropdownOpen(false);
    
    const session = getCurrentSession();
    
    if (session) {
      // Remove current session from active sessions
      const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
      const updatedSessions = activeSessions.filter(
        (activeSession: any) => activeSession.sessionId !== session.sessionId
      );
      localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));
    }
    
    // Clear session storage for this tab
    sessionStorage.removeItem('currentSession');
    
    if (!forceLogout) {
      // Only show message if user initiated logout
      console.log('Logged out successfully');
    }
    
    // Redirect to login
    window.location.href = "/adminlogin";
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case "inspector":
        return "Inspector";
      case "supervisor":
        return "Supervisor";
      case "manager":
        return "Manager";
      default:
        return "Administrator";
    }
  };

  // Get role-based avatar color
  const getAvatarColor = () => {
    switch (userRole) {
      case "inspector":
        return "bg-blue-500";
      case "supervisor":
        return "bg-green-500";
      case "manager":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Show session info for debugging (remove in production)
  const getSessionInfo = () => {
    if (sessionData) {
      return `Session: ${sessionData.sessionId.slice(-8)}`;
    }
    return "";
  };

  return (
    <header className="shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/newlogo1.png"
              alt="Punjab Health Foundation Logo"
              className="h-13 w-auto object-contain"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 ${getAvatarColor()} rounded-full flex items-center justify-center`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userName || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                    {/* Session info for debugging - remove in production */}
                    {sessionData && (
                      <p className="text-xs text-gray-400 mt-1">
                        {getSessionInfo()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleLogout(false)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Adminheader;