import React, { useState } from 'react';
import { DepartmentCode, NoteItem } from '../types';
import { SubjectCard } from '../components/SubjectCard';
import { DEPARTMENTS } from '../data/initialData';
import { Filter, Search, ArrowUpDown, BookOpen, FileX } from 'lucide-react';

interface DepartmentPageProps {
  notes: NoteItem[];
  selectedDept: DepartmentCode | 'ALL';
  onSelectDepartment: (dept: DepartmentCode | 'ALL') => void;
  onPreviewNote: (note: NoteItem) => void;
  onDownloadNote: (note: NoteItem) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
}

export const DepartmentPage: React.FC<DepartmentPageProps> = ({
  notes,
  selectedDept,
  onSelectDepartment,
  onPreviewNote,
  onDownloadNote,
  searchQuery,
  onSearchChange,
  bookmarks,
  onToggleBookmark
}) => {
  const [selectedSem, setSelectedSem] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'downloads'>('newest');

  // Filter notes
  let filtered = notes.filter(n => {
    if (selectedDept !== 'ALL' && (n.department || '').toUpperCase() !== selectedDept.toUpperCase()) return false;
    if (selectedSem > 0 && Number(n.semester) !== selectedSem) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        (n.title || '').toLowerCase().includes(q) ||
        (n.subject || '').toLowerCase().includes(q) ||
        (n.department || '').toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
  } else if (sortBy === 'downloads') {
    filtered.sort((a, b) => b.downloads - a.downloads);
  } else {
    filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  const currentDeptInfo = DEPARTMENTS.find(d => d.code === selectedDept);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#E3D1BA]/40 dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-amber-900/10 dark:border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B4513] text-amber-50 text-xs font-bold rounded-lg mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{selectedDept === 'ALL' ? 'All Departments' : `${selectedDept} Department`}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
              {selectedDept === 'ALL'
                ? 'Anna University Study Notes Repository'
                : currentDeptInfo?.fullName || `${selectedDept} Department Materials`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              Showing {filtered.length} notes for Anna University 2021 Regulation curriculum
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-500">Department:</span>
            <select
              value={selectedDept}
              onChange={e => onSelectDepartment(e.target.value as DepartmentCode | 'ALL')}
              className="px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE Department</option>
              <option value="IT">IT Department</option>
              <option value="AIDS">AIDS Department</option>
              <option value="ECE">ECE Department</option>
              <option value="CSBS">CSBS Department</option>
              <option value="Mechanical">Mechanical Department</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search subjects, codes, notes..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
          />
        </div>

        {/* Semester Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSem(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
              selectedSem === 0
                ? 'bg-[#8B4513] text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            All Sems
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSem(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                selectedSem === s
                  ? 'bg-[#8B4513] text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Grid of Notes */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <FileX className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-1">
            No materials found
          </h3>
          <p className="text-xs text-stone-500 mb-4 max-w-md mx-auto">
            No notes match your current filters. Try changing semester or department selection.
          </p>
          <button
            onClick={() => {
              onSelectDepartment('ALL');
              setSelectedSem(0);
              onSearchChange('');
            }}
            className="px-4 py-2 bg-[#8B4513] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(note => (
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

    </div>
  );
};
