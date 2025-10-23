const axios = require('axios');

class G2GAPI {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://prod.your-api-server.com';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      timeout: 30000
    });
  }

  // Services
  async getServices(language = 'en') {
    try {
      const response = await this.client.get('/v1/services', {
        params: { language }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Brands
  async getBrands(serviceId, query = '', after = null, language = 'en') {
    try {
      const response = await this.client.get(`/v1/services/${serviceId}/brands`, {
        params: { language, q: query, after }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Products
  async getProducts(serviceId, brandId) {
    try {
      const response = await this.client.get('/v1/products', {
        params: { service_id: serviceId, brand_id: brandId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Product attributes
  async getProductAttributes(productId) {
    try {
      const response = await this.client.get(`/v1/products/${productId}/attributes`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Offers
  async createOffer(offerData) {
    try {
      const response = await this.client.post('/v1/offers', offerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOffer(offerId) {
    try {
      const response = await this.client.get(`/v1/offers/${offerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOffer(offerId, offerData) {
    try {
      const response = await this.client.patch(`/v1/offers/${offerId}`, offerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteOffer(offerId) {
    try {
      const response = await this.client.delete(`/v1/offers/${offerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Orders
  async getOrder(orderId) {
    try {
      const response = await this.client.get(`/v1/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deliverCode(orderId, deliveryData) {
    try {
      const response = await this.client.post(`/v1/orders/${orderId}/delivery`, deliveryData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDeliveryStatus(orderId, deliveryId) {
    try {
      const response = await this.client.get(`/v1/orders/${orderId}/delivery/${deliveryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Inventory
  async uploadCode(offerId, codeData) {
    try {
      const response = await this.client.post(`/v1/offers/${offerId}/inventory_items`, codeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async viewCodeInfo(offerId, itemId) {
    try {
      const response = await this.client.get(`/v1/offers/${offerId}/inventory_items/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCode(offerId, itemId) {
    try {
      const response = await this.client.delete(`/v1/offers/${offerId}/inventory_items/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Store
  async getStore() {
    try {
      const response = await this.client.get('/v1/store');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Webhook logs
  async searchWebhookLogs(searchParams) {
    try {
      const response = await this.client.post('/v1/logs/webhooks/search', searchParams);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // API responded with error
      return {
        status: error.response.status,
        message: error.response.data.message || 'API Error',
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'No response from API server',
        data: null
      };
    } else {
      // Other errors
      return {
        status: 0,
        message: error.message || 'Unknown error',
        data: null
      };
    }
  }
}

module.exports = G2GAPI;

