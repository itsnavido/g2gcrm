import { create } from 'zustand';
import api from '../utils/api';

const useOrdersStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/orders');
      if (response.success) {
        set({ orders: response.data, loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchOrder: async (orderId, refresh = false) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/orders/${orderId}${refresh ? '?refresh=true' : ''}`);
      if (response.success) {
        set({ currentOrder: response.data, loading: false });
        
        // Update orders list if order exists in it
        const orders = get().orders;
        const index = orders.findIndex(o => o.order_id === orderId);
        if (index !== -1) {
          const updatedOrders = [...orders];
          updatedOrders[index] = response.data;
          set({ orders: updatedOrders });
        } else {
          set({ orders: [response.data, ...orders] });
        }
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deliverCodes: async (orderId, deliveryData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/orders/${orderId}/delivery`, deliveryData);
      if (response.success) {
        // Refresh the order
        await get().fetchOrder(orderId, true);
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  clearCurrentOrder: () => set({ currentOrder: null })
}));

export default useOrdersStore;

