import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { NoteItem, SubjectItem, DepartmentItem, DownloadRecord, ReportItem, UserProfile } from '../types';
import { DEPARTMENTS, INITIAL_SUBJECTS, INITIAL_NOTES } from '../data/initialData';

// Helper: Calculate SHA-256 hash of a file
export async function calculateFileSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Auto-seed Firestore if collections are empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const deptsSnap = await getDocs(collection(db, 'departments'));
    if (deptsSnap.empty) {
      console.log('Seeding departments into Firestore...');
      const batch = writeBatch(db);
      for (const dept of DEPARTMENTS) {
        batch.set(doc(db, 'departments', dept.code), dept);
      }
      await batch.commit();
    }

    const notesSnap = await getDocs(collection(db, 'notes'));
    if (notesSnap.empty || notesSnap.size < INITIAL_NOTES.length) {
      console.log(`Seeding initial notes into Firestore...`);
      const existingIds = new Set(notesSnap.docs.map(d => d.id));
      const missingNotes = INITIAL_NOTES.filter(n => !existingIds.has(n.id));

      const batchSize = 50;
      for (let i = 0; i < missingNotes.length; i += batchSize) {
        const chunk = missingNotes.slice(i, i + batchSize);
        const batch = writeBatch(db);
        for (const note of chunk) {
          batch.set(doc(db, 'notes', note.id), note);
        }
        await batch.commit();
      }
      console.log('Finished seeding initial notes into Firestore!');
    }

    const subSnap = await getDocs(query(collection(db, 'subjects'), limit(1)));
    if (subSnap.empty) {
      console.log('Seeding subjects into Firestore...');
      const batchSize = 100;
      for (let i = 0; i < INITIAL_SUBJECTS.length; i += batchSize) {
        const chunk = INITIAL_SUBJECTS.slice(i, i + batchSize);
        const batch = writeBatch(db);
        for (const sub of chunk) {
          batch.set(doc(db, 'subjects', sub.id), sub);
        }
        await batch.commit();
      }
    }
  } catch (err) {
    console.warn('Firestore seed warning (offline or permissions):', err);
  }
}

// Fetch notes with optional filters
export async function fetchNotesFromFirestore(options?: {
  department?: string;
  semester?: number;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'downloads';
}): Promise<NoteItem[]> {
  try {
    const notesRef = collection(db, 'notes');
    const snapshot = await getDocs(notesRef);
    let results: NoteItem[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as NoteItem));

    // Ensure all INITIAL_NOTES are included if Firestore snapshot is incomplete
    if (results.length < INITIAL_NOTES.length) {
      const existingMap = new Map(results.map(r => [r.id, r]));
      for (const initNote of INITIAL_NOTES) {
        if (!existingMap.has(initNote.id)) {
          results.push(initNote);
        }
      }
    }

    // Apply Department filter
    if (options?.department && options.department !== 'ALL') {
      const targetDept = options.department.toUpperCase();
      results = results.filter(n => (n.department || '').toUpperCase() === targetDept);
    }

    // Apply Semester filter
    if (options?.semester && options.semester > 0) {
      results = results.filter(n => Number(n.semester) === Number(options.semester));
    }

    // Apply Search Query filter (Subject, Title, Code, Department, Description)
    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      results = results.filter(n => 
        (n.title || '').toLowerCase().includes(q) ||
        (n.subject || '').toLowerCase().includes(q) ||
        (n.department || '').toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q)
      );
    }

    // Apply Sort By
    if (options?.sortBy === 'oldest') {
      results.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    } else if (options?.sortBy === 'downloads') {
      results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else {
      // Default: newest
      results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }

    return results;
  } catch (error) {
    console.warn('Error fetching notes from Firestore, falling back to local memory:', error);
    let results = [...INITIAL_NOTES];
    if (options?.department && options.department !== 'ALL') {
      const targetDept = options.department.toUpperCase();
      results = results.filter(n => (n.department || '').toUpperCase() === targetDept);
    }
    if (options?.semester && options.semester > 0) {
      results = results.filter(n => Number(n.semester) === Number(options.semester));
    }
    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      results = results.filter(n => 
        (n.title || '').toLowerCase().includes(q) ||
        (n.subject || '').toLowerCase().includes(q) ||
        (n.department || '').toLowerCase().includes(q)
      );
    }
    return results;
  }
}

// Check if note is duplicate using SHA-256 hash AND Metadata across all notes
export async function checkDuplicateNoteInFirestore(
  fileHash: string,
  title: string,
  subject: string,
  semester: number,
  department: string
): Promise<{ isDuplicate: boolean; reason?: string }> {
  try {
    const cleanTitle = title.toLowerCase().trim();
    const cleanSubject = subject.toLowerCase().trim();
    const targetDept = (department || '').toUpperCase().trim();

    const notesRef = collection(db, 'notes');
    let allNotes: NoteItem[] = [];

    try {
      const snap = await getDocs(notesRef);
      snap.docs.forEach(d => {
        allNotes.push({ id: d.id, ...d.data() } as NoteItem);
      });
    } catch (_) {}

    // Merge with INITIAL_NOTES
    for (const initNote of INITIAL_NOTES) {
      if (!allNotes.some(n => n.id === initNote.id)) {
        allNotes.push(initNote);
      }
    }

    // Check 1: SHA-256 Hash match
    if (fileHash) {
      const hashDup = allNotes.find(n => n.fileHash === fileHash);
      if (hashDup) {
        return { isDuplicate: true, reason: 'Upload failed: This exact PDF file content already exists on the website.' };
      }
    }

    // Check 2: Title match
    for (const note of allNotes) {
      const existingTitle = (note.title || '').toLowerCase().trim();
      if (existingTitle === cleanTitle) {
        return {
          isDuplicate: true,
          reason: `Upload failed: Material with title "${note.title}" already exists on the website.`
        };
      }
    }

    // Check 3: Subject & Semester match in same Department
    for (const note of allNotes) {
      const existingSub = (note.subject || '').toLowerCase().trim();
      const noteDept = (note.department || '').toUpperCase().trim();
      if (noteDept === targetDept && existingSub === cleanSubject && note.semester === semester) {
        return {
          isDuplicate: true,
          reason: `Upload failed: Notes for subject "${note.subject}" already exist in Semester ${semester} of ${department} Department.`
        };
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.warn('Duplicate check error:', err);
    return { isDuplicate: false };
  }
}

// Upload/Post new note
export async function createNoteInFirestore(noteData: Omit<NoteItem, 'id' | 'downloads' | 'uploadedAt'>): Promise<NoteItem> {
  const newNote: NoteItem = {
    ...noteData,
    id: 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    downloads: 0,
    uploadedAt: new Date().toISOString(),
    approved: true
  };

  try {
    await setDoc(doc(db, 'notes', newNote.id), newNote);
    
    // Log to uploads collection
    await addDoc(collection(db, 'uploads'), {
      noteId: newNote.id,
      title: newNote.title,
      department: newNote.department,
      semester: newNote.semester,
      subject: newNote.subject,
      uploadedByUID: newNote.uploadedByUID,
      uploadedAt: newNote.uploadedAt
    });
  } catch (err) {
    console.warn('Error creating note in Firestore, added to local session:', err);
    INITIAL_NOTES.unshift(newNote);
  }

  return newNote;
}

// Track download counter increment & record in downloads collection
export async function recordDownloadInFirestore(
  noteId: string,
  noteTitle: string,
  department: string,
  userUid: string
): Promise<void> {
  try {
    // 1. Increment note counter
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      downloads: increment(1)
    });

    // 2. Record download history
    await addDoc(collection(db, 'downloads'), {
      noteId,
      noteTitle,
      department,
      downloadedByUID: userUid || 'guest',
      downloadedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error recording download in Firestore:', err);
    const target = INITIAL_NOTES.find(n => n.id === noteId);
    if (target) {
      target.downloads = (target.downloads || 0) + 1;
    }
  }
}

// Fetch user downloads history
export async function fetchUserDownloads(userUid: string): Promise<DownloadRecord[]> {
  if (!userUid) return [];
  try {
    const q = query(collection(db, 'downloads'), where('downloadedByUID', '==', userUid));
    const snap = await getDocs(q);
    const records = snap.docs.map(d => ({ id: d.id, ...d.data() } as DownloadRecord));
    records.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    return records;
  } catch (err) {
    console.warn('Error fetching user downloads:', err);
    return [];
  }
}

// Delete Note (Owner or Admin)
export async function deleteNoteFromFirestore(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (err) {
    console.warn('Error deleting note:', err);
    const idx = INITIAL_NOTES.findIndex(n => n.id === noteId);
    if (idx !== -1) INITIAL_NOTES.splice(idx, 1);
  }
}

// Submit report for inappropriate note
export async function submitReportToFirestore(
  noteId: string,
  noteTitle: string,
  reason: string,
  reportedByUID: string,
  reportedByEmail?: string
): Promise<void> {
  const report: ReportItem = {
    noteId,
    noteTitle,
    reason,
    reportedByUID: reportedByUID || 'guest',
    reportedByEmail: reportedByEmail || 'anonymous',
    reportedAt: new Date().toISOString(),
    status: 'pending'
  };
  try {
    await addDoc(collection(db, 'reports'), report);
  } catch (err) {
    console.warn('Error submitting report:', err);
  }
}

// Admin stats
export async function fetchAdminStats() {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const notesSnap = await getDocs(collection(db, 'notes'));
    const downloadsSnap = await getDocs(collection(db, 'downloads'));
    const reportsSnap = await getDocs(collection(db, 'reports'));

    const totalUsers = usersSnap.size || 1;
    const totalNotes = notesSnap.size || INITIAL_NOTES.length;
    let totalDownloads = 0;
    
    notesSnap.docs.forEach(docSnap => {
      totalDownloads += (docSnap.data().downloads || 0);
    });

    if (totalDownloads === 0) {
      INITIAL_NOTES.forEach(n => { totalDownloads += n.downloads; });
    }

    return {
      totalUsers,
      totalNotes,
      totalDownloads,
      totalReports: reportsSnap.size
    };
  } catch (err) {
    let totalDownloads = 0;
    INITIAL_NOTES.forEach(n => { totalDownloads += n.downloads; });
    return {
      totalUsers: 1,
      totalNotes: INITIAL_NOTES.length,
      totalDownloads,
      totalReports: 0
    };
  }
}
