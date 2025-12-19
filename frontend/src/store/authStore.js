import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,

      // Initialize auth state listener
      initAuth: () => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            set({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
              },
              loading: false,
              error: null,
            });
          } else {
            set({ user: null, loading: false, error: null });
          }
        });
      },

      // Email/Password Sign Up
      signUp: async (email, password, displayName) => {
        try {
          set({ loading: true, error: null });
          const result = await createUserWithEmailAndPassword(auth, email, password);
          
          if (displayName) {
            await updateProfile(result.user, { displayName });
          }

          set({
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: displayName || result.user.email?.split('@')[0],
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            },
            loading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // Email/Password Sign In
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const result = await signInWithEmailAndPassword(auth, email, password);
          
          set({
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || result.user.email?.split('@')[0],
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            },
            loading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // Google Sign In
      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          const result = await signInWithPopup(auth, googleProvider);
          
          set({
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
            },
            loading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },

      // Sign Out
      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, error: null });
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
