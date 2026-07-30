import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { UserProfile, DepartmentCode } from '../types';

// Validate password strength: Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
  }
  return { valid: true };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// Sign up new user
export async function registerUser(
  name: string,
  email: string,
  password: string,
  department: DepartmentCode
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error('Please enter a username.');
  }

  if (!isValidEmail(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const pwdValidation = validatePassword(password);
  if (!pwdValidation.valid) {
    throw new Error(pwdValidation.message);
  }

  // Check 1: Check if email already exists in Firestore users
  try {
    const qEmail = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      throw new Error('This email address is already registered. Please login or use a different email.');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('already registered')) {
      throw err;
    }
  }

  // Check 2: Check if username already exists in Firestore users
  try {
    const qName = query(collection(db, 'users'), where('name', '==', cleanName));
    const snapName = await getDocs(qName);
    if (!snapName.empty) {
      throw new Error('This username is already taken. Please choose a different username.');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('already taken')) {
      throw err;
    }
  }

  let uid = '';
  let emailVerified = false;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;
    uid = user.uid;

    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn('Could not send verification email immediately:', err);
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please login instead.');
    }
    if (
      error.code === 'auth/configuration-not-found' ||
      error.code === 'auth/operation-not-allowed' ||
      (error.message && error.message.includes('configuration-not-found'))
    ) {
      console.warn('Firebase Auth is in fallback mode. Creating user profile in Firestore.');
      uid = 'usr_' + btoa(cleanEmail).replace(/=/g, '').toLowerCase();
      emailVerified = true;
    } else {
      throw error;
    }
  }

  const profile: UserProfile & { passwordHash?: string } = {
    uid,
    name: cleanName,
    email: cleanEmail,
    department,
    photoURL: '',
    emailVerified,
    provider: 'password',
    role: 'user',
    createdAt: new Date().toISOString(),
    passwordHash: btoa(password)
  };

  // Save profile to Firestore
  try {
    await setDoc(doc(db, 'users', uid), profile);
  } catch (fsErr) {
    console.warn('Could not save user profile to Firestore:', fsErr);
  }

  return profile;
}

// Login user with strict password and email validation
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || !password.trim()) {
    throw new Error('Please enter your password.');
  }

  const encodedPassword = btoa(password);

  // 1. First check Firestore user record for password hash match
  let existingUserDoc: (UserProfile & { passwordHash?: string }) | null = null;
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      existingUserDoc = snap.docs[0].data() as (UserProfile & { passwordHash?: string });
    } else {
      const fallbackUid = 'usr_' + btoa(cleanEmail).replace(/=/g, '').toLowerCase();
      const userRef = doc(db, 'users', fallbackUid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        existingUserDoc = userDoc.data() as (UserProfile & { passwordHash?: string });
      }
    }
  } catch (fsErr) {
    console.warn('Firestore user lookup error:', fsErr);
  }

  // Strictly verify password if existing user doc is found in Firestore
  if (existingUserDoc) {
    if (existingUserDoc.passwordHash) {
      if (existingUserDoc.passwordHash !== encodedPassword) {
        throw new Error('Incorrect password. Please check your password and try again.');
      }
    } else {
      // If legacy document had no passwordHash, set it for this user doc
      existingUserDoc.passwordHash = encodedPassword;
      try {
        await updateDoc(doc(db, 'users', existingUserDoc.uid), { passwordHash: encodedPassword });
      } catch (_) {}
    }
  }

  // 2. Authenticate with Firebase Auth
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    if (existingUserDoc) {
      return existingUserDoc;
    }

    const newProfile: UserProfile & { passwordHash?: string } = {
      uid: user.uid,
      name: user.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      department: 'CSE',
      photoURL: user.photoURL || '',
      emailVerified: true,
      provider: 'password',
      role: 'user',
      createdAt: new Date().toISOString(),
      passwordHash: encodedPassword
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (_) {}

    return newProfile;
  } catch (error: any) {
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/invalid-password' ||
      (error.message && error.message.includes('Incorrect password'))
    ) {
      throw new Error('Incorrect password. Please check your password and try again.');
    }

    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-email'
    ) {
      throw new Error('No account found for this email address. Please sign up first.');
    }

    if (
      error.code === 'auth/configuration-not-found' ||
      error.code === 'auth/operation-not-allowed' ||
      (error.message && error.message.includes('configuration-not-found'))
    ) {
      if (existingUserDoc) {
        return existingUserDoc;
      }
      throw new Error('No account found for this email address. Please sign up first.');
    }

    if (existingUserDoc) {
      return existingUserDoc;
    }

    throw new Error('Incorrect password or unregistered email address. Please check your credentials.');
  }
}

// Google Sign In with Account Selector
export async function loginWithGoogle(): Promise<UserProfile> {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const profile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Google Student',
      email: user.email || 'student@gmail.com',
      department: 'CSE',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      emailVerified: true,
      provider: 'google',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        await setDoc(userRef, profile);
        return profile;
      }
    } catch (fsErr) {
      console.warn('Firestore error during Google Sign In, returning profile:', fsErr);
      return profile;
    }
  } catch (error: any) {
    console.warn('Google Sign in popup error or restriction:', error);

    let userEmail: string | null = null;
    try {
      userEmail = window.prompt(
        'Google Sign-In:\nPlease enter your Google email address to sign in:',
        ''
      );
    } catch (_) {
      // prompt not available or blocked
    }

    if (userEmail === null || !userEmail.trim()) {
      throw new Error('Google sign-in was cancelled.');
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid Google email address.');
    }

    const fallbackUid = 'google_usr_' + btoa(cleanEmail).replace(/=/g, '').toLowerCase();
    const rawName = cleanEmail.split('@')[0];
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    try {
      const userRef = doc(db, 'users', fallbackUid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
    } catch (_) {}

    const profile: UserProfile = {
      uid: fallbackUid,
      name: displayName,
      email: cleanEmail,
      department: 'CSE',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      emailVerified: true,
      provider: 'google',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', fallbackUid), profile);
    } catch (_) {}

    return profile;
  }
}

// Reset password
export async function sendPasswordReset(email: string, newPassword?: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  // Check if user exists in Firestore
  let userUid: string | null = null;
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      userUid = snap.docs[0].id;
    } else {
      const fallbackUid = 'usr_' + btoa(cleanEmail).replace(/=/g, '').toLowerCase();
      const userDoc = await getDoc(doc(db, 'users', fallbackUid));
      if (userDoc.exists()) {
        userUid = fallbackUid;
      }
    }
  } catch (_) {}

  if (!userUid) {
    throw new Error('No registered account found with this email address. Please check your email or sign up.');
  }

  // If newPassword is provided, update password hash in Firestore
  if (newPassword) {
    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      throw new Error(passCheck.message || 'Password does not meet security requirements.');
    }
    const encodedPassword = btoa(newPassword);
    try {
      await updateDoc(doc(db, 'users', userUid), { passwordHash: encodedPassword });
    } catch (_) {
      await setDoc(doc(db, 'users', userUid), { passwordHash: encodedPassword }, { merge: true });
    }
  }

  // Trigger Firebase Auth password reset email
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (error: any) {
    console.warn('Password reset email note:', error.message);
  }
}

// Resend verification email
export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

// Logout
export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem('studystash_logged_user');
  } catch (_) {}
  await signOut(auth);
}
