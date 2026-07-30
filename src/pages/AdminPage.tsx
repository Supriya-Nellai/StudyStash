import React, { useState, useEffect } from 'react';
import { UserProfile, NoteItem } from '../types';
import { fetchAdminStats, deleteNoteFromFirestore } from '../firebase/firestore';
import { Shield, Users, BookOpen, Download, AlertTriangle, Trash2, CheckCircle2, Search, ExternalLink } from 'lucide-react';

interface AdminPageProps {
  currentUser: UserProfile | null;
  notes: NoteItem[];
  onPreviewNote: (note: NoteItem) => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  notes,
  onPreviewNote,
  addToast
}) => {
  const [stats, setStats] = useState({ totalUsers: 1, totalNotes: notes.length, totalDownloads: 0, totalReports: 0 });
  const [adminSearch, setAdminSearch] = useState('');

  useEffect(() => {
    fetchAdminStats().then(s => setStats(s));
  }, [notes]);

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
    n.department.toLowerCase().includes(adminSearch.toLowerCase()) ||
    n.uploadedBy.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const handleDelete = async (noteId: string) => {
    if (confirm('Admin Action: Are you sure you want to delete this material?')) {
      await deleteNoteFromFirestore(noteId);
      addToast('success', 'Note removed by Admin.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Banner */}
      <div className="bg-[#8B4513] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-200 text-xs font-bold rounded-lg mb-2">
            <Shield className="w-4 h-4 text-amber-300" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-bold font-['Courgette',cursive]">
            StudyStash Administration
          </h1>
          <p className="text-amber-100/80 text-xs sm:text-sm mt-1">
            Manage study materials, monitor total downloads, and maintain content quality.
          </p>
        </div>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl w-fit mb-3 text-[#8B4513]">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{notes.length}</p>
          <p className="text-xs text-stone-500 font-semibold">Total Published Notes</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl w-fit mb-3 text-[#8B4513]">
            <Download className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{stats.totalDownloads}</p>
          <p className="text-xs text-stone-500 font-semibold">Total Downloads</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl w-fit mb-3 text-[#8B4513]">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{stats.totalUsers}</p>
          <p className="text-xs text-stone-500 font-semibold">Registered Users</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl w-fit mb-3 text-[#8B4513]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">{stats.totalReports}</p>
          <p className="text-xs text-stone-500 font-semibold">Flagged Reports</p>
        </div>
      </div>

      {/* Materials Table Management */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
            Manage All Study Notes ({filteredNotes.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={adminSearch}
              onChange={e => setAdminSearch(e.target.value)}
              placeholder="Search notes or uploader..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="p-3">Title & Subject</th>
                <th className="p-3">Department</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Uploader</th>
                <th className="p-3">Downloads</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredNotes.slice(0, 30).map(note => (
                <tr key={note.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                  <td className="p-3 font-semibold text-stone-900 dark:text-stone-100 max-w-xs truncate">
                    {note.title}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#8B4513] text-white font-bold rounded text-[10px]">
                      {note.department}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">Sem {note.semester}</td>
                  <td className="p-3 text-stone-500">{note.uploadedBy}</td>
                  <td className="p-3 font-bold">{note.downloads}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onPreviewNote(note)}
                        className="p-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-200"
                        title="Preview PDF"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
