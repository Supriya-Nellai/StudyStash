import React, { useState, useEffect } from 'react';
import { UserProfile, NoteItem, DownloadRecord } from '../types';
import { SubjectCard } from '../components/SubjectCard';
import { fetchUserDownloads, deleteNoteFromFirestore } from '../firebase/firestore';
import { User, Download, Upload, Bookmark, CheckCircle2, Shield, Trash2, Mail, Building2, Calendar } from 'lucide-react';

interface ProfilePageProps {
  currentUser: UserProfile | null;
  notes: NoteItem[];
  onPreviewNote: (note: NoteItem) => void;
  onDownloadNote: (note: NoteItem) => void;
  onLogout: () => void;
  bookmarks: string[];
  onToggleBookmark: (noteId: string) => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
  onOpenPostNote: () => void;
  onDeleteNote?: (noteId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  notes,
  onPreviewNote,
  onDownloadNote,
  onLogout,
  bookmarks,
  onToggleBookmark,
  addToast,
  onOpenPostNote,
  onDeleteNote
}) => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'bookmarks' | 'downloads' | 'settings'>('uploads');
  const [downloadsHistory, setDownloadsHistory] = useState<DownloadRecord[]>([]);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoadingDownloads(true);
      fetchUserDownloads(currentUser.uid)
        .then(res => setDownloadsHistory(res))
        .finally(() => setIsLoadingDownloads(false));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-stone-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-2">
          Please Log In
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Log in to view your profile, manage uploaded notes, and track your download history.
        </p>
      </div>
    );
  }

  // Filter notes uploaded by current user matching UID, email fallback, or uploader name
  const myUploads = notes.filter(n => 
    n.uploadedByUID === currentUser.uid ||
    (currentUser.email && n.uploadedByUID === 'usr_' + btoa(currentUser.email.trim()).replace(/=/g, '').toLowerCase()) ||
    (n.uploadedBy && currentUser.name && n.uploadedBy.toLowerCase() === currentUser.name.toLowerCase())
  );

  // Filter saved bookmarks
  const myBookmarks = notes.filter(n => bookmarks.includes(n.id));

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this uploaded note from the website?')) {
      try {
        await deleteNoteFromFirestore(noteId);
        if (onDeleteNote) {
          onDeleteNote(noteId);
        }
        addToast('success', 'Note deleted successfully from the website.');
      } catch (err: any) {
        addToast('error', 'Failed to delete note: ' + (err.message || 'Error occurred'));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#8B4513] text-amber-50 font-bold text-3xl flex items-center justify-center shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
                {currentUser.name}
              </h1>
              {currentUser.emailVerified && (
                <span className="p-1 bg-amber-100 text-[#8B4513] rounded-full" title="Verified Account">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                {currentUser.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-[#8B4513] dark:text-amber-400">
                <Building2 className="w-3.5 h-3.5" />
                {currentUser.department} Department
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPostNote}
            className="px-4 py-2 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'uploads'
              ? 'bg-[#8B4513] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>My Uploads ({myUploads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'bookmarks'
              ? 'bg-[#8B4513] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Bookmarks ({myBookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'downloads'
              ? 'bg-[#8B4513] text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download History ({downloadsHistory.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'uploads' && (
        myUploads.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <Upload className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base mb-1">
              You haven't uploaded any notes yet
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Share handwritten notes with Anna University students.
            </p>
            <button
              onClick={onOpenPostNote}
              className="px-4 py-2 bg-[#8B4513] text-white text-xs font-bold rounded-xl"
            >
              Post First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myUploads.map(note => (
              <SubjectCard
                key={note.id}
                note={note}
                onPreview={onPreviewNote}
                onDownload={onDownloadNote}
                isBookmarked={bookmarks.includes(note.id)}
                onToggleBookmark={onToggleBookmark}
                onDelete={() => setNoteToDelete(note)}
              />
            ))}
          </div>
        )
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">Delete Material Confirmation</h3>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-400">
              Are you sure you want to permanently delete <strong className="text-stone-900 dark:text-stone-100">"{noteToDelete.title}"</strong> from the website? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = noteToDelete.id;
                  setNoteToDelete(null);
                  try {
                    await deleteNoteFromFirestore(targetId);
                    if (onDeleteNote) {
                      onDeleteNote(targetId);
                    }
                    addToast('success', 'Note deleted successfully from the website.');
                  } catch (err: any) {
                    addToast('error', 'Failed to delete note: ' + (err.message || 'Error occurred'));
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Yes, Delete Material
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        myBookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <Bookmark className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800 dark:text-stone-200 text-base mb-1">
              No saved bookmarks
            </h3>
            <p className="text-xs text-stone-500">
              Click the bookmark icon on any note card to save it here for quick exam revision.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myBookmarks.map(note => (
              <SubjectCard
                key={note.id}
                note={note}
                onPreview={onPreviewNote}
                onDownload={onDownloadNote}
                isBookmarked={true}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        )
      )}

      {activeTab === 'downloads' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base mb-4 font-['Courgette',cursive]">
            Download Log
          </h3>

          {downloadsHistory.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No recent downloads recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {downloadsHistory.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100">
                      {item.noteTitle}
                    </p>
                    <p className="text-stone-500 text-[11px]">{item.department} Department</p>
                  </div>
                  <span className="text-stone-400 text-[11px]">
                    {new Date(item.downloadedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
