import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Simple rate limiting implementation
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export const handleLogin = async (email: string, password: string) => {
  // Check rate limiting
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  
  if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < ATTEMPT_WINDOW) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Reset attempts on successful login
    loginAttempts.delete(email);
    return userCredential;
  } catch (error: any) {
    // Update login attempts
    loginAttempts.set(email, {
      count: attempts.count + 1,
      lastAttempt: now
    });

    // Provide user-friendly error messages
    switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled');
      case 'auth/user-not-found':
        throw new Error('No account found with this email');
      case 'auth/wrong-password':
        throw new Error('Incorrect password');
      default:
        throw new Error('An error occurred during login');
    }
  }
}; 