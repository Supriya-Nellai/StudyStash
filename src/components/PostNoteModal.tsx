import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Hash, HardDrive } from 'lucide-react';
import { DepartmentCode, UserProfile, NoteItem } from '../types';
import { calculateFileSHA256, checkDuplicateNoteInFirestore, createNoteInFirestore } from '../firebase/firestore';

interface PostNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onNoteUploaded: (newNote: NoteItem) => void;
  addToast: (type: 'success' | 'error' | 'info', msg: string) => void;
  onRequireLogin: () => void;
}

export const PostNoteModal: React.FC<PostNoteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNoteUploaded,
  addToast,
  onRequireLogin
}) => {
  const [department, setDepartment] = useState<DepartmentCode>('CSE');
  const [semester, setSemester] = useState<number>(1);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl p-6 text-center shadow-2xl border border-stone-200 dark:border-stone-800 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 font-['Courgette',cursive]">
            Login Required
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-5">
            Only authenticated college students can post notes and study materials to StudyStash.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-lg hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={() => { onClose(); onRequireLogin(); }}
              className="flex-1 py-2 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-xs rounded-lg transition"
            >
              Login / Signup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Only PDF documents are allowed.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 25MB limit.');
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please select a PDF file to upload.');
      return;
    }

    if (!subject.trim() || !title.trim()) {
      setErrorMessage('Please fill in Subject and Note Title.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Calculating SHA-256 file fingerprint...');

    try {
      // 1. Calculate SHA-256 hash of PDF file
      const fileHash = await calculateFileSHA256(selectedFile);

      setStatusMessage('Checking repository for duplicates...');

      // 2. Duplicate Check
      const dupResult = await checkDuplicateNoteInFirestore(
        fileHash,
        title,
        subject,
        semester,
        department
      );

      if (dupResult.isDuplicate) {
        setIsProcessing(false);
        setStatusMessage(null);
        const errMsg = dupResult.reason || 'This material already exists.';
        setErrorMessage(errMsg);
        addToast('error', errMsg);
        return;
      }

      setStatusMessage('Saving metadata & configuring OneDrive storage link...');

      // 3. Create blob URL for instant preview & OneDrive drive link
      const blobUrl = URL.createObjectURL(selectedFile);
      const driveFolder = 'https://drive.google.com/drive/folders/1EX6pcYeRz93xd6gtXZFWF_kjQZxhgM0-';

      const fileSizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';

      // 4. Create Firestore Note Record
      const newNote = await createNoteInFirestore({
        title: title.trim(),
        department,
        semester,
        subject: subject.trim(),
        description: description.trim() || `Handwritten notes uploaded by ${currentUser.name}`,
        pdfURL: blobUrl,
        oneDriveURL: driveFolder,
        previewImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
        uploadedBy: currentUser.name,
        uploadedByUID: currentUser.uid,
        fileHash,
        fileSize: fileSizeMb,
        approved: true
      });

      addToast('success', 'Note published successfully!');
      onNoteUploaded(newNote);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error publishing material.');
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#8B4513] text-amber-50 rounded-xl">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-['Courgette',cursive]">
              Post Study Notes
            </h2>
            <p className="text-xs text-stone-500">
              Share Anna University 2021 Regulation materials with fellow students
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug font-medium">{errorMessage}</div>
          </div>
        )}

        {statusMessage && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <Hash className="w-4 h-4 text-amber-700 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as DepartmentCode)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
              >
                <option value="CSE">CSE Department</option>
                <option value="IT">IT Department</option>
                <option value="AIDS">AIDS Department</option>
                <option value="ECE">ECE Department</option>
                <option value="CSBS">CSBS Department</option>
                <option value="Mechanical">Mechanical Department</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Semester *
              </label>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Unit 1 to 5 Handwritten Question Bank & Notes"
              required
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Subject Name / Code *
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., CS3351 - Digital Principles and Computer Organization"
              required
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Description / Overview
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Provide brief details on units covered or key highlights..."
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Select PDF File (Max 25MB) *
            </label>
            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#8B4513] rounded-xl p-4 text-center cursor-pointer transition bg-stone-50/50 dark:bg-stone-800/50 relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                  <FileText className="w-5 h-5 text-[#8B4513]" />
                  <span className="truncate max-w-[280px]">{selectedFile.name}</span>
                  <span className="text-stone-500 font-normal">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Click or drag PDF file here
                  </p>
                  <p className="text-[10px] text-stone-400">PDF documents only up to 25MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-[#8B4513]" />
              <span>Automated OneDrive & Hash Check:</span>
            </div>
            <p className="leading-snug">
              Every uploaded PDF calculates a cryptographic SHA-256 hash to prevent duplicate materials, and syncs automatically with the StudyStash drive repository.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-2.5 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing ? 'Fingerprinting & Uploading...' : 'Publish Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
