import React, { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  Users,
  Calendar,
  Bell,
  Search,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/me", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-amber-500 font-bold text-2xl">
              Skill<span className="text-blue-600">Hive</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Search for courses, skills, or instructors..."
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-amber-500">
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {user?.profileUrl ? (
                  <img
                    src={user.profileUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-amber-300"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium">
                    {user?.name ? getInitials(user.name) : "U"}
                  </div>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${
                    isProfileOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <UserIcon className="mr-2 h-4 w-4" /> My Profile
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </a>
                  <a
                    href="/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-amber-50 border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavItem icon={<Home />} label="Home" active />
            <NavItem icon={<BookOpen />} label="My Courses" />
            <NavItem icon={<Users />} label="Community" />
            <NavItem icon={<Calendar />} label="Events" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center px-1 pt-1 pb-2 border-b-2 text-sm font-medium ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:border-amber-300 hover:text-amber-600"
    }`}
  >
    <span className="mr-1.5">{icon}</span>
    {label}
  </a>
);

export default Navbar;
