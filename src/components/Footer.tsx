import React from 'react';
import { DepartmentCode } from '../types';
import { BookOpen, FileText } from 'lucide-react';

interface FooterProps {
  onSelectDepartment: (dept: DepartmentCode | 'ALL') => void;
  onNavigate: (page: 'home' | 'department' | 'profile' | 'admin' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectDepartment, onNavigate }) => {
  const departments: { code: DepartmentCode; name: string }[] = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'AIDS', name: 'AI & Data Science' },
    { code: 'ECE', name: 'Electronics & Communication' },
    { code: 'CSBS', name: 'CS & Business Systems' },
    { code: 'Mechanical', name: 'Mechanical Engineering' },
  ];

  return (
    <footer className="bg-[#E3D1BA]/60 dark:bg-stone-950 border-t border-amber-900/10 dark:border-stone-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B4513] text-[#FAF7F2] shadow-sm shrink-0 overflow-hidden">
                <img
                  src="/Logo.png"
                  alt="StudyStash Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <BookOpen className="w-4 h-4 stroke-[2.5] absolute" />
              </div>
              <span className="font-['Courgette',cursive] text-2xl font-bold text-[#8B4513] dark:text-amber-400">
                StudyStash
              </span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-400 leading-relaxed">
              StudyStash is a free notes sharing platform for college students, specifically designed for Anna University 2021 Regulation curriculum.
            </p>
          </div>

          {/* Department Links */}
          <div>
            <h4 className="text-xs font-bold text-[#8B4513] dark:text-amber-400 uppercase tracking-wider mb-3">
              Departments
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              {departments.map((dept) => (
                <li key={dept.code}>
                  <button
                    onClick={() => {
                      onSelectDepartment(dept.code);
                      onNavigate('department');
                    }}
                    className="hover:text-[#8B4513] dark:hover:text-amber-400 transition"
                  >
                    {dept.name} ({dept.code})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-[#8B4513] dark:text-amber-400 uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#8B4513] transition">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectDepartment('ALL'); onNavigate('department'); }} className="hover:text-[#8B4513] transition">
                  All Subjects & Notes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#8B4513] transition">
                  About StudyStash
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-[#8B4513] transition">
                  Student Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-xs font-bold text-[#8B4513] dark:text-amber-400 uppercase tracking-wider mb-3">
              Regulation Info
            </h4>
            <p className="text-xs text-stone-700 dark:text-stone-400 leading-relaxed mb-3">
              Covers Semester 1 through Semester 8 syllabus, unit notes, question banks, and handwritten PDF materials.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#8B4513] rounded-lg text-[11px] font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Anna University 2021 Reg</span>
            </div>
          </div>

        </div>

        <hr className="border-amber-900/10 dark:border-stone-800 my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 dark:text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} StudyStash. Built for Anna University Students.</p>
          <div className="flex items-center gap-1 text-stone-500">
            <span>Crafted for college notes sharing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};