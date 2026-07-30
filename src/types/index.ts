export type DepartmentCode = 'CSE' | 'IT' | 'AIDS' | 'ECE' | 'CSBS' | 'Mechanical';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  department: DepartmentCode | string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'password' | 'google';
  role?: 'user' | 'admin';
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  department: DepartmentCode;
  semester: number;
  subject: string;
  description: string;
  pdfURL: string;
  oneDriveURL?: string;
  previewImage?: string;
  uploadedBy: string;
  uploadedByUID: string;
  uploadedAt: string;
  downloads: number;
  fileHash: string;
  fileSize: string;
  approved?: boolean;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  department: DepartmentCode;
  semester: number;
}

export interface DepartmentItem {
  code: DepartmentCode;
  name: string;
  fullName: string;
  description: string;
  subjectCount?: number;
  icon?: string;
}

export interface DownloadRecord {
  id?: string;
  noteId: string;
  noteTitle: string;
  department: string;
  downloadedByUID: string;
  downloadedAt: string;
}

export interface ReportItem {
  id?: string;
  noteId: string;
  noteTitle?: string;
  reason: string;
  reportedByUID: string;
  reportedByEmail?: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
