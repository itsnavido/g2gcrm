# G2G CRM Dashboard

A full-stack CRM dashboard for managing G2G marketplace operations including orders, offers, products, inventory, and webhook logs.

## Features

- 📊 **Dashboard** - Overview with statistics and recent orders
- 🛒 **Orders Management** - Search, view, and track orders with database caching
- 📦 **Offers CRUD** - Complete create, read, update, delete operations for offers
- 🎁 **Products Browser** - Browse services, brands, products, and attributes
- 📥 **Inventory Management** - Upload and manage codes for offers
- 🔔 **Webhook Logs** - Search and view webhook event logs
- 🏪 **Store Information** - View your G2G store settings
- ⚙️ **Settings** - Configure API credentials and manage cache

## Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand (State Management)
- Axios
- Lucide React (Icons)

**Backend:**
- Node.js
- Express
- SQLite (with better-sqlite3)
- Axios

## Project Structure

```
D:\G2G CRM\
├── backend/
│   ├── server.js           # Express server with API routes
│   ├── database.js         # SQLite database operations
│   ├── g2g-api.js          # G2G API client wrapper
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand state stores
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json            # Root package with workspace scripts
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- G2G API credentials

### Setup Steps

1. **Clone or navigate to the project directory:**

```bash
cd "D:\G2G CRM"
```

2. **Install all dependencies:**

```bash
npm install
```

This will install dependencies for both backend and frontend.

3. **Start the application:**

```bash
npm start
```

This runs both the backend (port 3000) and frontend (port 5173) concurrently.

Alternatively, you can run them separately:

```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

4. **Access the dashboard:**

Open your browser and navigate to:
```
http://localhost:5173
```

## Configuration

### First Time Setup

1. Navigate to **Settings** page in the dashboard
2. Enter your **G2G API Key**
3. Optionally update the **API Base URL** (default: `https://prod.your-api-server.com`)
4. Click **Test Connection** to verify your credentials
5. Click **Save Settings** to store your configuration

### API Configuration

The backend proxies all requests to the G2G API. Configure your API credentials in the Settings page, which stores them in the local SQLite database.

## Usage Guide

### Orders

1. Go to **Orders** page
2. Enter an Order ID in the search field
3. Click **Fetch Order** to retrieve order details from the API
4. Orders are automatically cached in the database
5. View all cached orders in the table below

### Offers

1. Go to **Offers** page
2. Click **Create Offer** to add a new offer
3. Fill in the required fields (product ID, price, quantity, etc.)
4. Use the Products page to find product IDs
5. Edit or delete offers using the action buttons

### Products

1. Go to **Products** page
2. Select a **Service** from the dropdown
3. Choose a **Brand** for that service
4. Pick a **Product** to view details
5. Copy product IDs and attribute IDs for creating offers

### Inventory

1. Go to **Inventory** page
2. Select an offer from the dropdown
3. Upload codes with content, type, and optional reference ID
4. View and manage all codes for the selected offer

### Webhook Logs

1. Go to **Webhooks** page
2. Set date range for the search
3. Configure limit and sort order
4. Click **Search Logs** to fetch webhook events
5. Expand log entries to view full details

### Store Information

1. Go to **Store** page
2. View your G2G store account details
3. Check account status, seller status, and supported currencies

## Database Caching

The dashboard implements smart caching to improve performance:

- **Orders** - Cached when fetched, can be refreshed with `?refresh=true`
- **Offers** - Cached on create/update, automatically updated on changes
- **Services/Brands/Products** - Cached for quick browsing
- **Webhook Logs** - Cached for quick access to recent events

### Clear Cache

Navigate to **Settings** and click **Clear All Cache** to remove all cached data.

## API Endpoints

### Backend API Routes

**Settings:**
- `GET /api/settings` - Get current configuration
- `POST /api/settings` - Save API credentials
- `POST /api/settings/test` - Test API connection
- `POST /api/settings/clear-cache` - Clear all cached data

**Orders:**
- `GET /api/orders` - Get all cached orders
- `GET /api/orders/:order_id` - Get specific order
- `POST /api/orders/:order_id/delivery` - Deliver codes to order

**Offers:**
- `GET /api/offers` - Get all offers
- `GET /api/offers/:offer_id` - Get specific offer
- `POST /api/offers` - Create new offer
- `PATCH /api/offers/:offer_id` - Update offer
- `DELETE /api/offers/:offer_id` - Delete offer

**Products:**
- `GET /api/services` - Get all services
- `GET /api/brands/:service_id` - Get brands for service
- `GET /api/products` - Get products (requires service_id and brand_id)
- `GET /api/products/:product_id/attributes` - Get product attributes

**Inventory:**
- `GET /api/inventory/:offer_id` - Get inventory items
- `POST /api/inventory/:offer_id` - Upload code
- `DELETE /api/inventory/:offer_id/:item_id` - Delete code

**Store:**
- `GET /api/store` - Get store information

**Webhook Logs:**
- `POST /api/webhook-logs/search` - Search webhook logs
- `GET /api/webhook-logs` - Get recent logs from cache

**Stats:**
- `GET /api/stats` - Get dashboard statistics

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

```bash
cd frontend
npm run build
```

## Troubleshooting

### Connection Issues

- Verify your API credentials in Settings
- Check if the API base URL is correct
- Use the "Test Connection" button to diagnose issues

### Database Issues

- The SQLite database is created automatically in `backend/g2g-crm.db`
- If you encounter database errors, delete the `.db` file and restart
- Use "Clear All Cache" to reset cached data

### Port Conflicts

- Backend runs on port 3000 (configurable in `backend/.env`)
- Frontend runs on port 5173 (configurable in `frontend/vite.config.js`)
- Change ports if they're already in use

## Features Highlights

### Smart Caching
- Reduces API calls by caching frequently accessed data
- Automatic cache updates on data modifications
- Manual refresh options available

### Real-time Updates
- Toast notifications for all actions
- Loading states for better UX
- Error handling with user-friendly messages

### Responsive Design
- Mobile-friendly interface
- Tailwind CSS for modern styling
- Accessible UI components

### Data Management
- Export capabilities (future enhancement)
- Filtering and sorting options
- Detailed view modals

## Contributing

This is a custom dashboard built for G2G marketplace operations. Feel free to customize it according to your needs.

## License

This project is private and proprietary.

## Support

For issues or questions, please refer to the G2G API documentation or contact support.

---

**Built with ❤️ using React, Node.js, and modern web technologies**

