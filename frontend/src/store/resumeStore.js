import { create } from 'zustand';
import api from '../config/api';

export const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  loading: false,
  error: null,

  // Resume workflow state
  uploadedFile: null,
  extractedText: '',
  enhancedText: '',
  preferences: {
    jobRole: '',
    yearsOfExperience: 0,
    skills: [],
    industry: '',
    customInstructions: '',
  },
  isEnhancing: false,

  // Fetch all resumes
  fetchResumes: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.getResumes();
      set({ resumes: response.data.resumes, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single resume
  fetchResume: async (resumeId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getResume(resumeId);
      set({ currentResume: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Upload resume and extract text
  uploadResume: async (file) => {
    try {
      set({ loading: true, error: null, uploadedFile: file });
      const response = await api.uploadResume(file);
      set({ 
        extractedText: response.data.extractedText,
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set preferences
  setPreferences: (preferences) => {
    set({ preferences: { ...get().preferences, ...preferences } });
  },

  // Enhance resume with AI
  enhanceResume: async () => {
    const { extractedText, preferences } = get();
    
    if (!extractedText) {
      set({ error: 'No resume text to enhance' });
      return null;
    }

    try {
      set({ isEnhancing: true, error: null });
      const response = await api.enhanceResume(extractedText, preferences);
      set({ 
        enhancedText: response.data.enhancedResume,
        isEnhancing: false 
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isEnhancing: false });
      throw error;
    }
  },

  // Save resume
  saveResume: async (title) => {
    const { extractedText, enhancedText, preferences } = get();
    
    try {
      set({ loading: true, error: null });
      const response = await api.createResume({
        originalText: extractedText,
        enhancedText,
        jobRole: preferences.jobRole,
        preferences,
        title,
      });
      
      // Add to local resumes list
      set((state) => ({
        resumes: [response.data, ...state.resumes],
        currentResume: response.data,
        loading: false,
      }));
      
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update resume
  updateResume: async (resumeId, updates) => {
    try {
      set({ loading: true, error: null });
      const response = await api.updateResume(resumeId, updates);
      
      // Update in local list
      set((state) => ({
        resumes: state.resumes.map((r) =>
          r.id === resumeId ? response.data : r
        ),
        currentResume: response.data,
        loading: false,
      }));
      
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    try {
      set({ loading: true, error: null });
      await api.deleteResume(resumeId);
      
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== resumeId),
        currentResume: state.currentResume?.id === resumeId ? null : state.currentResume,
        loading: false,
      }));
      
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update enhanced text (for editor changes)
  setEnhancedText: (text) => {
    set({ enhancedText: text });
  },

  // Reset workflow state
  resetWorkflow: () => {
    set({
      uploadedFile: null,
      extractedText: '',
      enhancedText: '',
      preferences: {
        jobRole: '',
        yearsOfExperience: 0,
        skills: [],
        industry: '',
        customInstructions: '',
      },
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
