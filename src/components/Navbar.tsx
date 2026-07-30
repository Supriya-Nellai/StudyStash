import React, { useState } from 'react';
import { UserProfile, DepartmentCode } from '../types';
import {
  BookOpen,
  Upload,
  User,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  Shield,
  Bookmark,
  Home,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenPostNote: () => void;
  onLogout: () => void;
  onSelectDepartment: (dept: DepartmentCode | 'ALL') => void;
  onNavigate: (page: 'home' | 'department' | 'profile' | 'admin' | 'about') => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onOpenPostNote,
  onLogout,
  onSelectDepartment,
  onNavigate,
  activePage
}) => {
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const departments: { code: DepartmentCode; name: string }[] = [
    { code: 'CSE', name: 'CSE Department' },
    { code: 'IT', name: 'IT Department' },
    { code: 'AIDS', name: 'AIDS Department' },
    { code: 'ECE', name: 'ECE Department' },
    { code: 'CSBS', name: 'CSBS Department' },
    { code: 'Mechanical', name: 'Mechanical Department' },
  ];

  const handleDeptSelect = (dept: DepartmentCode) => {
    onSelectDepartment(dept);
    onNavigate('department');
    setIsDeptDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#E3D1BA] dark:bg-stone-900 border-b border-amber-900/10 dark:border-stone-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#8B4513] text-[#FAF7F2] shadow-md shrink-0 overflow-hidden">
            <img
              src="/Logo.png"
              alt="StudyStash Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <BookOpen className="w-5 h-5 stroke-[2.5] absolute" />
          </div>
          <div>
            <span className="font-['Courgette',cursive] text-2xl sm:text-3xl font-bold text-[#8B4513] dark:text-amber-400 leading-none">
              StudyStash
            </span>
            <p className="text-[10px] text-stone-700 dark:text-stone-400 font-semibold uppercase tracking-wider hidden sm:block">
              Anna University 2021 Regulation
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className={`text-base font-semibold transition ${
              activePage === 'home'
                ? 'text-[#8B4513] dark:text-amber-400 underline underline-offset-4 decoration-2 font-bold'
                : 'text-stone-800 dark:text-stone-200 hover:text-[#8B4513]'
            }`}
          >
            Home
          </button>

          {/* Departments Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsDeptDropdownOpen(true)}
            onMouseLeave={() => setIsDeptDropdownOpen(false)}
          >
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="flex items-center gap-1 text-base font-semibold text-stone-800 dark:text-stone-200 hover:text-[#8B4513] transition py-1"
            >
              <span>Departments</span>
              <ChevronDown className="w-4 h-4 text-stone-600" />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute top-full left-0 mt-0 pt-1 w-56 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.code}
                      onClick={() => handleDeptSelect(dept.code)}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-stone-800 dark:text-stone-200 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 hover:text-[#8B4513] transition"
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onSelectDepartment('ALL');
              onNavigate('department');
            }}
            className="text-base font-semibold text-stone-800 dark:text-stone-200 hover:text-[#8B4513] transition"
          >
            Browse All Notes
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`text-base font-semibold transition ${
              activePage === 'about'
                ? 'text-[#8B4513] dark:text-amber-400 underline underline-offset-4 decoration-2 font-bold'
                : 'text-stone-800 dark:text-stone-200 hover:text-[#8B4513]'
            }`}
          >
            About
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Post Books / Upload Notes button */}
          <button
            onClick={onOpenPostNote}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 border border-[#8B4513] hover:bg-[#8B4513] hover:text-white text-[#8B4513] dark:text-amber-400 font-bold text-sm rounded-xl transition shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Post Notes</span>
          </button>

          {/* User Profile or Login/Signup */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-[#8B4513] text-white rounded-xl hover:bg-[#6e3819] transition shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-amber-100 text-[#8B4513] font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-700">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-[#8B4513] text-[10px] font-bold rounded">
                      {currentUser.department}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile & Notes</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-700" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-sm rounded-xl transition shadow-sm"
              >
                Login
              </button>
              <button
                onClick={onOpenSignup}
                className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 font-bold text-sm rounded-xl transition shadow-sm"
              >
                Signup
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-stone-800 dark:text-stone-200 hover:bg-amber-900/10 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-amber-900/10 bg-[#E3D1BA] dark:bg-stone-900 px-4 py-4 space-y-3 animate-in fade-in">
          <button
            onClick={() => {
              onNavigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-bold text-stone-800 dark:text-stone-200"
          >
            Home
          </button>

          <div className="space-y-1 pl-3 border-l-2 border-[#8B4513]">
            <p className="text-xs font-bold text-[#8B4513] uppercase mb-1">Departments</p>
            {departments.map(d => (
              <button
                key={d.code}
                onClick={() => handleDeptSelect(d.code)}
                className="block w-full text-left py-1 text-sm font-semibold text-stone-700 dark:text-stone-300"
              >
                {d.name}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenPostNote}
            className="w-full mt-2 py-2.5 bg-[#8B4513] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Post Notes</span>
          </button>

          {!currentUser ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => { onOpenLogin(); setIsMobileMenuOpen(false); }}
                className="py-2 bg-[#8B4513] text-white font-bold text-xs rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => { onOpenSignup(); setIsMobileMenuOpen(false); }}
                className="py-2 bg-stone-900 text-white font-bold text-xs rounded-lg"
              >
                Signup
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-stone-300">
              <button
                onClick={() => { onNavigate('profile'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left py-2 font-bold text-stone-800"
              >
                My Profile ({currentUser.name})
              </button>
              <button
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="block w-full text-left py-2 font-bold text-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
