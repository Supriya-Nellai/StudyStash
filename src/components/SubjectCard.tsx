import React from 'react';
import { NoteItem } from '../types';
import { FileText, Download, Eye, Bookmark, Share2, Sparkles, Trash2 } from 'lucide-react';

interface SubjectCardProps {
  note: NoteItem;
  onPreview: (note: NoteItem) => void;
  onDownload: (note: NoteItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (noteId: string) => void;
  onDelete?: (noteId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  note,
  onPreview,
  onDownload,
  isBookmarked = false,
  onToggleBookmark,
  onDelete
}) => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1 duration-200">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#8B4513] text-amber-50 text-[11px] font-bold rounded-md">
              {note.department}
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-[#8B4513] dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold rounded-md">
              Sem {note.semester}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(note.id);
                }}
                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/80 dark:hover:bg-red-900 dark:text-red-300 transition flex items-center justify-center cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}

            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(note.id);
                }}
                className={`p-1.5 rounded-lg transition ${
                  isBookmarked
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#8B4513] transition">
          {note.title}
        </h3>

        {/* Subject Code & Name */}
        <p className="text-xs text-[#8B4513] dark:text-amber-400 font-semibold mb-2 line-clamp-1">
          {note.subject}
        </p>

        {/* Short Description */}
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
          {note.description || 'Handwritten notes for 5 units'}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div>
        <hr className="border-stone-100 dark:border-stone-800 mb-3" />
        
        <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <strong className="text-stone-700 dark:text-stone-300">{note.downloads}</strong> downloads
          </span>
          <span>{note.fileSize || '2.5 MB'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPreview(note)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onDownload(note)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8B4513] hover:bg-[#6e3819] text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
