import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { seedFirestoreIfEmpty, fetchNotesFromFirestore, recordDownloadInFirestore } from './firebase/firestore';
import { UserProfile, NoteItem, DepartmentCode } from './types';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PDFViewerModal } from './components/PDFViewerModal';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { PostNoteModal } from './components/PostNoteModal';
import { ToastContainer, ToastMessage } from './components/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { DepartmentPage } from './pages/DepartmentPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';


export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('studystash_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState<'home' | 'department' | 'profile' | 'admin' | 'about'>('home');
  
  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isPostNoteOpen, setIsPostNoteOpen] = useState(false);
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('studystash_logged_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('studystash_logged_user');
      }
    } catch (_) {}
  }, [currentUser]);
  const getUserBookmarkKey = (user: UserProfile | null) => {
    if (!user) return 'studystash_bookmarks_guest';
    return `studystash_bookmarks_${user.uid}`;
  };

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(getUserBookmarkKey(currentUser));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    // Keep only a single toast at any time
    setToasts([{ id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth listener & initial database seeding
  useEffect(() => {
    seedFirestoreIfEmpty();

    // Fetch initial notes
    fetchNotesFromFirestore().then(data => {
      setNotes(data);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setCurrentUser(data);
          } else {
            setCurrentUser({
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Student',
              email: user.email || '',
              department: 'CSE',
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified,
              provider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'password',
              role: 'user',
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.warn('Profile fetch error:', err);
        }
      } else {try {
          const saved = localStorage.getItem('studystash_logged_user');
          if (saved) {
            const savedUser = JSON.parse(saved);
            setCurrentUser(savedUser);
            return;
          }
        } catch (_) {}
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user-specific bookmarks when currentUser changes
  useEffect(() => {
    const key = getUserBookmarkKey(currentUser);
    try {
      const saved = localStorage.getItem(key);
      setBookmarks(saved ? JSON.parse(saved) : []);
    } catch {
      setBookmarks([]);
    }
  }, [currentUser?.uid]);

  // Sync bookmarks to user-specific key in localStorage
  useEffect(() => {
    const key = getUserBookmarkKey(currentUser);
    try {
      localStorage.setItem(key, JSON.stringify(bookmarks));
    } catch (_) {}
  }, [bookmarks, currentUser?.uid]);

  const toggleBookmark = (noteId: string) => {
    const exists = bookmarks.includes(noteId);
    if (exists) {
      setBookmarks(prev => prev.filter(id => id !== noteId));
      addToast('info', 'Removed note from bookmarks.');
    } else {
      setBookmarks(prev => [...prev, noteId]);
      addToast('success', 'Saved note to bookmarks!');
    }
  };

// Download Action
  const handleDownloadNote = async (note: NoteItem) => {
    if (!currentUser) {
      addToast('error', 'Please log in to download study materials.');
      setIsLoginOpen(true);
      return;
    }

    try {
      // Record download in Firestore
      await recordDownloadInFirestore(
        note.id,
        note.title,
        note.department,
        currentUser?.uid || 'guest'
      );

      // Increment local count
      setNotes(prev =>
        prev.map(n => (n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n))
      );

      addToast('success', `Downloading ${note.title}...`);

      // Trigger download or open direct PDF
      const link = document.createElement('a');
      link.href = note.pdfURL;
      link.target = '_blank';
      link.download = `${note.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Download error:', err);
    }
  };

  const handleNoteUploaded = (newNote: NoteItem) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 font-['Nunito',sans-serif]">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSignup={() => setIsSignupOpen(true)}
        onOpenPostNote={() => setIsPostNoteOpen(true)}
        onLogout={() => {
          auth.signOut();
          setCurrentUser(null);
          addToast('info', 'Logged out successfully.');
          setActivePage('home');
        }}
        onSelectDepartment={(dept) => {
          setSelectedDept(dept);
          setActivePage('department');
        }}
        onNavigate={setActivePage}
        activePage={activePage}
      />

      {/* Page Body View Routing */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            notes={notes}
            onSelectDepartment={(dept) => {
              setSelectedDept(dept);
              setActivePage('department');
            }}
            onSelectSemester={(sem) => {
              setActivePage('department');
            }}
            onNavigate={setActivePage}
            onPreviewNote={setPreviewNote}
            onDownloadNote={handleDownloadNote}
            onOpenPostNote={() => setIsPostNoteOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (q.trim()) setActivePage('department');
            }}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {activePage === 'department' && (
          <DepartmentPage
            notes={notes}
            selectedDept={selectedDept}
            onSelectDepartment={setSelectedDept}
            onPreviewNote={setPreviewNote}
            onDownloadNote={handleDownloadNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            notes={notes}
            onPreviewNote={setPreviewNote}
            onDownloadNote={handleDownloadNote}
            onDeleteNote={handleDeleteNote}
            onLogout={() => {
              auth.signOut();
              setCurrentUser(null);
              addToast('info', 'Logged out successfully.');
              setActivePage('home');
            }}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            addToast={addToast}
            onOpenPostNote={() => setIsPostNoteOpen(true)}
          />
        )}

        {activePage === 'admin' && (
          <AdminPage
            currentUser={currentUser}
            notes={notes}
            onPreviewNote={setPreviewNote}
            addToast={addToast}
          />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectDepartment={(dept) => {
          setSelectedDept(dept);
          setActivePage('department');
        }}
        onNavigate={setActivePage}
      />

      {/* Modals */}
      <PDFViewerModal
        note={previewNote}
        onClose={() => setPreviewNote(null)}
        onDownload={handleDownloadNote}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => setIsSignupOpen(true)}
        onLoginSuccess={(profile) => setCurrentUser(profile)}
        addToast={addToast}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
        addToast={addToast}
      />

      <PostNoteModal
        isOpen={isPostNoteOpen}
        onClose={() => setIsPostNoteOpen(false)}
        currentUser={currentUser}
        onNoteUploaded={handleNoteUploaded}
        addToast={addToast}
        onRequireLogin={() => setIsLoginOpen(true)}
      />

    </div>
  );
}
