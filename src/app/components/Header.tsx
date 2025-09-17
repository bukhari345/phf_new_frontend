import { Settings, Bell, User, ChevronDown, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";

const Header: React.FC = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profession: "",
  });

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
        });
      } catch (error) {
        console.error("Error parsing user from storage:", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const keysToRemove = ["token", "authToken", "accessToken", "user"];
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      setIsProfileDropdownOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error during logout. Please try again.");
    }
  };

  const handleSettings = () => {
    // optionally route to a settings page
    window.location.href = "/settings";
  };

  return (
    <header className="shadow-sm relative z-30 bg-white">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <img
              src="/green.png"
              alt="Punjab Health Foundation Logo"
              className="h-8 sm:h-10 md:h-13 w-auto object-contain"
            />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Bell (always visible) */}
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* Settings (desktop/tablet only in top bar) */}
            <button className="hidden sm:inline-flex p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors max-w-[60vw] sm:max-w-none"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
                  {userInfo.firstName && userInfo.lastName
                    ? `${userInfo.firstName} ${userInfo.lastName}`
                    : "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 min-w-[12rem] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userInfo.firstName && userInfo.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo.email || "user@example.com"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo.profession || "Not specified"}
                    </p>
                  </div>

                  {/* Settings inside dropdown (mobile only) */}
                  <button
                    onClick={handleSettings}
                    className="sm:hidden w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  {/* Divider for mobile settings presence */}
                  <div className="sm:hidden h-px bg-gray-100 my-1" />

                  <button
                    onClick={handleLogout}
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

export default Header;
