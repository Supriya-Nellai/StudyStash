import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck, Upload, Download, CheckCircle2, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-[#8B4513] text-xs font-bold mb-4">
          <GraduationCap className="w-4 h-4" />
          <span>Anna University 2021 Regulation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#8B4513] dark:text-amber-400 font-['Courgette',cursive] mb-4">
          About StudyStash
        </h1>

        <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed">
          StudyStash is a free notes sharing platform designed for Anna University college students. Our mission is to make unit-wise handwritten notes, question banks, and books freely accessible to every engineering student.
        </p>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            1
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg mb-2">
            100% Free Access
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            No paywalls or hidden charges. Download handwritten unit notes and books directly without subscription fees.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            2
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg mb-2">
            Automated SHA-256 Check
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Every PDF uploaded is verified via cryptographic hashes to ensure zero duplicate materials in the repository.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            3
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg mb-2">
            6 Core Departments
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Covers CSE, IT, AIDS, ECE, CSBS, and Mechanical departments across Semesters 1 to 8.
          </p>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
          Sharing & Uploading Guidelines
        </h3>
        <ul className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Upload unit-wise handwritten notes or question banks in PDF format (max 25MB).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Select the exact Department (CSE, IT, AIDS, ECE, CSBS, Mechanical) and Semester (1-8).</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Verify your email address before logging in to maintain community trust and prevent spam.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
