// components/layout/Navbar.jsx
import React from "react";
import { Menu, Bell, Search, User, LogOut } from "lucide-react";

const Navbar = ({ userData, userType, onLogout, onToggleSidebar }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30 transition-all duration-300">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="ml-4 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {userData?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userType}</p>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </a>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
