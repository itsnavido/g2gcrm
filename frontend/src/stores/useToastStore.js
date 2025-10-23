import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 5000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  
  success: (message) => {
    useToastStore.getState().addToast(message, 'success');
  },
  
  error: (message) => {
    useToastStore.getState().addToast(message, 'error');
  },
  
  warning: (message) => {
    useToastStore.getState().addToast(message, 'warning');
  },
  
  info: (message) => {
    useToastStore.getState().addToast(message, 'info');
  }
}));

export default useToastStore;

