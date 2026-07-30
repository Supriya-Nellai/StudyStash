import React from 'react';
import { Search, BookOpen, Upload, Sparkles, GraduationCap, FileCheck } from 'lucide-react';
import { DepartmentCode } from '../types';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPostNote: () => void;
  onSelectDepartment: (dept: DepartmentCode | 'ALL') => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onOpenPostNote,
  onSelectDepartment
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 text-center bg-gradient-to-b from-[#E3D1BA]/40 via-[#FAF7F2] to-[#FAF7F2] dark:from-stone-900/60 dark:to-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Regulation Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[#8B4513] dark:text-amber-300 text-xs font-bold mb-6 shadow-sm">
          <GraduationCap className="w-4 h-4 text-[#8B4513]" />
          <span>Anna University 2021 Regulation</span>
        </div>

        {/* Main Title - Courgette font with Logo */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#8B4513] text-[#FAF7F2] shadow-lg shrink-0 overflow-hidden">
            <img
              src="/Logo.png"
              alt="StudyStash Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <BookOpen className="w-7 h-7 sm:w-9 sm:h-9 stroke-[2.5] absolute" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-[#8B4513] dark:text-amber-400 font-['Courgette',cursive] tracking-tight drop-shadow-sm">
            StudyStash
          </h1>
        </div>

        <p className="text-lg sm:text-xl font-medium text-stone-700 dark:text-stone-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Free handwritten notes, books, and question banks for college students.
          Organized by department, semester, and unit.
        </p>

        {/* Hero Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border-2 border-[#8B4513]/20 focus-within:border-[#8B4513] transition bg-white dark:bg-stone-900">
            <Search className="w-5 h-5 text-stone-400 absolute left-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search subject name, code, or department (e.g. CS3351, Python, Data Structures)..."
              className="w-full pl-11 pr-24 py-4 text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 px-3 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs font-bold text-stone-600 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Action CTA Buttons matching StudyStash */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onSelectDepartment('ALL')}
            className="px-6 py-3.5 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-base rounded-xl transition shadow-md flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Browse Books & Notes</span>
          </button>

          <button
            onClick={onOpenPostNote}
            className="px-6 py-3.5 bg-white dark:bg-stone-800 border-2 border-[#8B4513] text-[#8B4513] dark:text-amber-400 hover:bg-[#8B4513] hover:text-white font-bold text-base rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            <span>Post Books / Upload</span>
          </button>
        </div>

        {/* Quick Features Pill Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center text-xs font-bold text-stone-700 dark:text-stone-300">
          <div className="p-3 bg-white/80 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
            <p className="text-[#8B4513] dark:text-amber-400 text-lg font-black">220+</p>
            <p className="text-[11px] text-stone-500">Subjects Covered</p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
            <p className="text-[#8B4513] dark:text-amber-400 text-lg font-black">6</p>
            <p className="text-[11px] text-stone-500">Departments</p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
            <p className="text-[#8B4513] dark:text-amber-400 text-lg font-black">1-8</p>
            <p className="text-[11px] text-stone-500">Semesters</p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm">
            <p className="text-[#8B4513] dark:text-amber-400 text-lg font-black">100% Free</p>
            <p className="text-[11px] text-stone-500">Instant PDF Download</p>
          </div>
        </div>

      </div>
    </section>
  );
};
