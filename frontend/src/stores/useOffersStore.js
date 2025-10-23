import { create } from 'zustand';
import api from '../utils/api';

const useOffersStore = create((set, get) => ({
  offers: [],
  currentOffer: null,
  loading: false,
  error: null,
  
  fetchOffers: async (refresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/offers${refresh ? '?refresh=true' : ''}`);
      if (response.success) {
        set({ offers: response.data, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchOffer: async (offerId, refresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/offers/${offerId}${refresh ? '?refresh=true' : ''}`);
      if (response.success) {
        set({ currentOffer: response.data, loading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  createOffer: async (offerData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/offers', offerData);
      if (response.success) {
        // Add to offers list
        set({ 
          offers: [response.data, ...get().offers],
          loading: false 
        });
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateOffer: async (offerId, offerData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/offers/${offerId}`, offerData);
      if (response.success) {
        // Update in offers list
        const offers = get().offers;
        const index = offers.findIndex(o => o.offer_id === offerId);
        if (index !== -1) {
          const updatedOffers = [...offers];
          updatedOffers[index] = response.data;
          set({ offers: updatedOffers });
        }
        set({ loading: false });
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteOffer: async (offerId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/offers/${offerId}`);
      if (response.success) {
        // Remove from offers list
        set({ 
          offers: get().offers.filter(o => o.offer_id !== offerId),
          loading: false 
        });
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  clearCurrentOffer: () => set({ currentOffer: null })
}));

export default useOffersStore;

