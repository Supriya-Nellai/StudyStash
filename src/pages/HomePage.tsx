import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { SubjectCard } from '../components/SubjectCard';
import { DepartmentCode, DepartmentItem, NoteItem } from '../types';
import { DEPARTMENTS } from '../data/initialData';
import {
  Code,
  Globe,
  Cpu,
  Radio,
  Briefcase,
  Wrench,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Download,
  Upload,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';

interface HomePageProps {
  notes: NoteItem[];
  onSelectDepartment: (dept: DepartmentCode | 'ALL') => void;
  onSelectSemester: (sem: number) => void;
  onNavigate: (page: 'home' | 'department' | 'profile' | 'admin' | 'about') => void;
  onPreviewNote: (note: NoteItem) => void;
  onDownloadNote: (note: NoteItem) => void;
  onOpenPostNote: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  notes,
  onSelectDepartment,
  onSelectSemester,
  onNavigate,
  onPreviewNote,
  onDownloadNote,
  onOpenPostNote,
  searchQuery,
  onSearchChange,
  bookmarks,
  onToggleBookmark
}) => {
  const [selectedSemTab, setSelectedSemTab] = useState<number>(0); // 0 = All

  const getDeptIcon = (code: string) => {
    switch (code) {
      case 'CSE': return <Code className="w-6 h-6 text-[#8B4513]" />;
      case 'IT': return <Globe className="w-6 h-6 text-[#8B4513]" />;
      case 'AIDS': return <Cpu className="w-6 h-6 text-[#8B4513]" />;
      case 'ECE': return <Radio className="w-6 h-6 text-[#8B4513]" />;
      case 'CSBS': return <Briefcase className="w-6 h-6 text-[#8B4513]" />;
      case 'Mechanical': return <Wrench className="w-6 h-6 text-[#8B4513]" />;
      default: return <BookOpen className="w-6 h-6 text-[#8B4513]" />;
    }
  };

  // Filter notes by search and sem
  const filteredNotes = notes.filter(n => {
    if (selectedSemTab > 0 && n.semester !== selectedSemTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const popularNotes = [...filteredNotes].sort((a, b) => b.downloads - a.downloads).slice(0, 8);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Header */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenPostNote={onOpenPostNote}
        onSelectDepartment={onSelectDepartment}
      />

      {/* Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
              Academic Departments
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Select your department to access curated Anna University 2021 Regulation materials
            </p>
          </div>

          <button
            onClick={() => {
              onSelectDepartment('ALL');
              onNavigate('department');
            }}
            className="text-xs font-bold text-[#8B4513] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map(dept => {
            const count = notes.filter(n => n.department === dept.code).length;
            return (
              <div
                key={dept.code}
                onClick={() => {
                  onSelectDepartment(dept.code);
                  onNavigate('department');
                }}
                className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-[#8B4513] transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200/60">
                      {getDeptIcon(dept.code)}
                    </div>
                    <span className="px-2.5 py-1 bg-[#8B4513] text-amber-50 text-xs font-bold rounded-lg">
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#8B4513] transition mb-2">
                    {dept.fullName}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                    {dept.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-100 dark:border-stone-800 text-stone-500">
                  <span className="font-semibold text-[#8B4513] dark:text-amber-400">
                    {count || 35}+ Notes Available
                  </span>
                  <span className="group-hover:translate-x-1 transition font-bold flex items-center gap-1 text-stone-800 dark:text-stone-200">
                    Explore Notes →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Semester Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E3D1BA]/40 dark:bg-stone-900/60 rounded-2xl p-6 border border-amber-900/10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive] mb-1">
              Filter By Semester
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Explore Semester 1 through Semester 8 notes instantly
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedSemTab(0)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedSemTab === 0
                  ? 'bg-[#8B4513] text-white shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              All Semesters
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <button
                key={sem}
                onClick={() => setSelectedSemTab(sem)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedSemTab === sem
                    ? 'bg-[#8B4513] text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular / Latest Notes List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
              {selectedSemTab > 0 ? `Semester ${selectedSemTab} Notes` : 'Most Popular Notes & Materials'}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Verified handwritten notes, formula sheets, and question banks
            </p>
          </div>

          <button
            onClick={() => {
              onSelectDepartment('ALL');
              onNavigate('department');
            }}
            className="text-xs font-bold text-[#8B4513] hover:underline flex items-center gap-1"
          >
            <span>Browse All {notes.length} Materials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {popularNotes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <Search className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base mb-1">
              No matching notes found
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Try adjusting your search query or semester selection.
            </p>
            <button
              onClick={() => { onSearchChange(''); setSelectedSemTab(0); }}
              className="px-4 py-2 bg-[#8B4513] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularNotes.map(note => (
              <SubjectCard
                key={note.id}
                note={note}
                onPreview={onPreviewNote}
                onDownload={onDownloadNote}
                isBookmarked={bookmarks.includes(note.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#8B4513] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="px-3 py-1 bg-amber-100 text-[#8B4513] text-xs font-bold rounded-lg mb-4 inline-block">
              Why StudyStash?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Courgette',cursive] mb-4">
              Built by Anna University Students, for Students
            </h2>
            <p className="text-amber-100/90 text-sm leading-relaxed mb-8">
              StudyStash solves the hassle of finding quality, unit-wise notes before exams. Access clean handwritten PDFs, Anna University 2021 Regulation question banks, and books in seconds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Duplicate Verification</h4>
                  <p className="text-xs text-amber-100/80">
                    SHA-256 file fingerprinting blocks spam and duplicate uploads automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                  <Zap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Instant Preview</h4>
                  <p className="text-xs text-amber-100/80">
                    Read PDFs directly in your browser without waiting for long downloads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                  <Upload className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Cloud Synced</h4>
                  <p className="text-xs text-amber-100/80">
                    All uploads are backed up directly in OneDrive storage repositories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
