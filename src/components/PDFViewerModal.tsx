import React, { useState } from 'react';
import { NoteItem } from '../types';
import { X, Download, ExternalLink, FileText, Share2, RefreshCw } from 'lucide-react';

interface PDFViewerModalProps {
  note: NoteItem | null;
  onClose: () => void;
  onDownload: (note: NoteItem) => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ note, onClose, onDownload }) => {
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  if (!note) return null;

  // Ensure path spaces in raw github URLs are properly encoded (e.g. CSE Dept -> CSE%20Dept)
  const cleanRawUrl = encodeURI(note.pdfURL);

  // If using Google Viewer mode, format using encodeURI so scheme (https://) is preserved unencoded
  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(cleanRawUrl)}`;

  const activeViewerUrl = useGoogleViewer ? googleViewerUrl : cleanRawUrl;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: `Download ${note.title} for ${note.department} Semester ${note.semester} on StudyStash`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#E3D1BA] dark:bg-stone-800 border-b border-amber-900/10 dark:border-stone-700 flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#8B4513] text-amber-50 rounded-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base leading-snug truncate">
                {note.title}
              </h3>
              <p className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2 truncate">
                <span className="bg-[#8B4513] text-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                  {note.department}
                </span>
                <span>Semester {note.semester}</span>
                <span>•</span>
                <span className="truncate">{note.subject}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUseGoogleViewer(!useGoogleViewer)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100/80 hover:bg-amber-200 text-[#8B4513] font-semibold text-xs rounded-lg transition"
              title="Switch PDF rendering mode"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{useGoogleViewer ? 'Direct View' : 'Google View'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 dark:hover:bg-stone-700 rounded-lg transition"
              title="Share Note"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <a
              href={cleanRawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 dark:hover:bg-stone-700 rounded-lg transition"
              title="Open PDF in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => onDownload(note)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B4513] hover:bg-[#6e3819] text-white font-semibold text-xs rounded-lg transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-stone-100 dark:bg-stone-950 relative">
          <iframe
            src={activeViewerUrl}
            className="w-full h-full border-0"
            title={note.title}
          />
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-4">
            <span>Size: <strong>{note.fileSize || '2.4 MB'}</strong></span>
            <span>Uploaded by: <strong>{note.uploadedBy || 'StudyStash Admin'}</strong></span>
            <span>Downloads: <strong>{note.downloads}</strong></span>
          </div>

          <a
            href={note.oneDriveURL || cleanRawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B4513] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Backup Folder</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
