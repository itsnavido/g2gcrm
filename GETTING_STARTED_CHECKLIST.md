# Getting Started Checklist

Use this checklist to set up and verify your G2G CRM Dashboard installation.

## Pre-Installation

- [ ] Node.js version 18 or higher installed
- [ ] npm package manager available
- [ ] G2G API credentials ready
- [ ] Terminal/PowerShell access

Check Node.js version:
```bash
node --version
```

## Installation Steps

- [ ] Navigate to project directory: `cd "D:\G2G CRM"`
- [ ] Run `npm install` to install all dependencies
- [ ] Wait for installation to complete (may take a few minutes)
- [ ] Verify no errors during installation

## First Run

- [ ] Start the application: `npm start`
- [ ] Verify backend starts on http://localhost:3000
- [ ] Verify frontend starts on http://localhost:5173
- [ ] Open browser to http://localhost:5173
- [ ] See the G2G CRM Dashboard login page

## Configuration

- [ ] Navigate to **Settings** page (bottom of sidebar)
- [ ] Enter your **G2G API Key**
- [ ] Verify/update the **API Base URL**
- [ ] Click **Test Connection** button
- [ ] Verify "Connection successful!" message
- [ ] Click **Save Settings** button
- [ ] Verify "Settings saved successfully!" message

## Feature Verification

### Dashboard
- [ ] Navigate to **Dashboard** (home icon)
- [ ] See statistics cards (may show 0 initially)
- [ ] Verify no error messages

### Orders
- [ ] Navigate to **Orders** page
- [ ] Enter a test Order ID in search field
- [ ] Click **Fetch Order** button
- [ ] Verify order appears in the table
- [ ] Click **View** button to see order details
- [ ] Close modal with X or ESC key

### Products
- [ ] Navigate to **Products** page
- [ ] Select a **Service** from dropdown
- [ ] Select a **Brand** from dropdown
- [ ] Select a **Product** from dropdown
- [ ] View product attributes below
- [ ] Copy a Product ID using the copy button
- [ ] Verify "Product ID copied!" toast notification

### Offers
- [ ] Navigate to **Offers** page
- [ ] Click **Create Offer** button
- [ ] Fill in the form:
  - [ ] Paste Product ID from Products page
  - [ ] Enter Unit Price (e.g., 10.99)
  - [ ] Select Currency (e.g., MYR)
  - [ ] Enter Min Quantity (e.g., 1)
  - [ ] Enter API Quantity (e.g., 100)
  - [ ] Enter Low Stock Alert (e.g., 10)
- [ ] Click **Create** button
- [ ] Verify "Offer created successfully!" message
- [ ] See new offer in the table
- [ ] Click **View** icon to see offer details
- [ ] Click **Edit** icon to modify offer
- [ ] Try **Delete** button (with confirmation)

### Inventory
- [ ] Navigate to **Inventory** page
- [ ] Select an offer from dropdown
- [ ] Upload a test code:
  - [ ] Content: `TEST-CODE-123,31 Dec 2025`
  - [ ] Content Type: `text/plain`
  - [ ] Reference ID: `test-ref-001`
- [ ] Click **Upload Code** button
- [ ] Verify "Code uploaded successfully!" message
- [ ] See code in the inventory table
- [ ] Try deleting the test code

### Webhooks
- [ ] Navigate to **Webhooks** page
- [ ] Set date range (last 7 days)
- [ ] Set limit to 20
- [ ] Click **Search Logs** button
- [ ] View webhook logs (if any)
- [ ] Click on a log to expand details

### Store Information
- [ ] Navigate to **Store** page
- [ ] View your store details
- [ ] Verify User ID is displayed
- [ ] Check Account Status
- [ ] Check Seller Status
- [ ] View Selling Currencies

## UI/UX Verification

- [ ] All pages load without errors
- [ ] Navigation sidebar highlights active page
- [ ] All buttons are clickable
- [ ] Forms have proper validation
- [ ] Toast notifications appear and auto-dismiss
- [ ] Modals open and close properly
- [ ] Loading spinners show during operations
- [ ] Status badges display with correct colors
- [ ] Tables are scrollable horizontally if needed
- [ ] Responsive design works (try resizing browser)

## Data Flow Verification

- [ ] Fetched orders are cached (refresh page, orders still there)
- [ ] Created offers appear immediately
- [ ] Updated offers reflect changes
- [ ] Deleted offers disappear from list
- [ ] Dashboard stats update after adding data
- [ ] Settings persist after page reload

## Error Handling

- [ ] Try invalid Order ID → See friendly error message
- [ ] Try creating offer without Product ID → See validation error
- [ ] Disconnect internet → See connection error
- [ ] All errors show toast notifications
- [ ] No console errors in browser DevTools (F12)

## Cache Management

- [ ] Navigate to **Settings** page
- [ ] Click **Clear All Cache** button
- [ ] Confirm the action
- [ ] Verify "Cache cleared successfully!" message
- [ ] Refresh page and verify cached data is gone
- [ ] Fetch data again to repopulate cache

## Performance Check

- [ ] Page navigation is instant
- [ ] Data loads within 2-3 seconds
- [ ] UI remains responsive during loading
- [ ] No lag when typing in forms
- [ ] Smooth animations and transitions

## Browser Compatibility

Test in your preferred browser:
- [ ] Google Chrome
- [ ] Microsoft Edge
- [ ] Mozilla Firefox
- [ ] Safari (Mac)

## Production Readiness

- [ ] All features working correctly
- [ ] No console errors
- [ ] API credentials secured
- [ ] Database created in backend folder
- [ ] Ready for daily use!

## Troubleshooting (If Issues Occur)

If you encounter any issues:

1. **Backend won't start:**
   - Check if port 3000 is available
   - Delete `backend/node_modules` and run `npm install` in backend folder
   - Check for syntax errors in backend files

2. **Frontend won't start:**
   - Check if port 5173 is available
   - Delete `frontend/node_modules` and run `npm install` in frontend folder
   - Clear browser cache

3. **API connection fails:**
   - Verify API credentials in Settings
   - Check internet connection
   - Try "Test Connection" button
   - Check backend logs in terminal

4. **Database errors:**
   - Stop the server
   - Delete `backend/g2g-crm.db`
   - Restart the server (database recreates automatically)

5. **UI issues:**
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear browser cache
   - Try incognito/private mode
   - Check browser console for errors (F12)

## Next Steps

Once everything is verified:

1. Start managing your real orders and offers
2. Set up your product catalog
3. Configure inventory for your offers
4. Monitor webhook logs for order events
5. Use the dashboard for daily operations

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [QUICKSTART.md](QUICKSTART.md) for quick setup
- See [COMMANDS.md](COMMANDS.md) for all available commands
- Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

---

**Congratulations! Your G2G CRM Dashboard is ready to use! 🎉**

