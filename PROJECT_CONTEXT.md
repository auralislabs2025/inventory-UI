# Inventory Management System - Project Context

## Project Overview
This is a comprehensive inventory management system built with vanilla HTML, CSS, and JavaScript. The system provides features for managing inventory, orders, purchases, suppliers, reports, and settings.

## Project Structure

```
inventory-management/
├── index.html                    # Main dashboard page
├── inventory.html                # Inventory management page
├── orders.html                   # Orders management page
├── purchases.html                # Purchase orders page
├── suppliers.html                # Suppliers management page
├── reports.html                  # Reports and analytics page
├── settings.html                 # Settings page
├── adjustments.html              # Stock adjustments page
├── assets/
│   ├── css/
│   │   └── style.css            # Shared CSS styles
│   └── js/
│       ├── app.js               # Application JavaScript utilities
│       └── data.js              # Data management utilities
└── wholesaler-dashboard/
    ├── desktop/
    │   ├── index.html           # Desktop dashboard
    │   ├── inventory.html       # Desktop inventory view
    │   ├── orders.html          # Desktop orders view
    │   ├── reports.html         # Desktop reports view
    │   ├── retailers.html       # Retailers management
    │   ├── fleet.html           # Fleet management
    │   ├── settings.html        # Desktop settings
    │   ├── script.js            # Desktop JavaScript
    │   └── style.css            # Desktop styles
    └── mobile/
        ├── index.html           # Mobile dashboard (Route Planner)
        ├── mobile.css           # Mobile-specific styles
        └── mobile.js            # Mobile JavaScript

```

## Files Created

### Main Application Pages (Root Directory)

1. **index.html** - Dashboard
   - Main dashboard with marketplace, vendors, and activity feed
   - Features: Product marketplace, vendor management, purchase order creation
   - Data stored in localStorage
   - Responsive grid layout with sidebar navigation

2. **inventory.html** - Inventory Management
   - Complete inventory CRUD operations
   - Features: Search, filter, bulk actions, stock adjustments
   - Right-side drawer for item details
   - Table view with sorting and filtering
   - Low stock and out-of-stock highlighting

3. **orders.html** - Orders Management
   - Order creation and management
   - Features: Status updates, order filtering, customer management
   - Uses shared data.js for data persistence
   - Table-based order listing

4. **purchases.html** - Purchase Orders
   - Purchase order creation and tracking
   - Features: Status management (draft, pending, approved, received, cancelled)
   - Pagination support
   - Vendor integration

5. **suppliers.html** - Suppliers Management
   - Supplier CRUD operations
   - Features: Contact management, product catalogs, supplier cards
   - Modal-based forms for add/edit
   - Search and filter capabilities

6. **reports.html** - Reports & Analytics
   - Dashboard-style reports
   - Features: KPI cards, charts (placeholder), data visualization
   - Export functionality (placeholder)
   - Grid-based card layout

7. **settings.html** - Settings
   - Application settings management
   - Features: Theme selection, notification preferences, data management
   - Card-based settings groups
   - Modal confirmations for destructive actions

8. **adjustments.html** - Stock Adjustments
   - Stock adjustment tracking
   - Features: Adjustment reasons (restock, damage, lost, correction, received)
   - History tracking
   - Table-based adjustment log

### Assets Directory

1. **assets/css/style.css** - Shared CSS
   - Common styles (currently minimal/empty)
   - Intended for shared component styles

2. **assets/js/app.js** - Application Utilities
   - Utility functions (showToast, escapeHtml)
   - Marketplace product data
   - Vendor data management
   - Modal and drawer management

3. **assets/js/data.js** - Data Management
   - LocalStorage abstraction
   - Data persistence utilities
   - Shared data access functions

### Wholesaler Dashboard

#### Desktop Version (`wholesaler-dashboard/desktop/`)
- Full-featured desktop interface
- Multi-column layouts
- Advanced routing and fleet management
- Retailer management

#### Mobile Version (`wholesaler-dashboard/mobile/`)
- Mobile-optimized route planner
- Touch-friendly interface
- Bottom navigation bar
- Hamburger menu drawer
- Map integration (Leaflet)
- Fleet assignment modals
- Route execution overlay

## Key Features

### 1. Dashboard (index.html)
- **Marketplace**: Browse products with vendor offers, compare prices
- **Vendors**: Quick access to vendor catalogs, place orders
- **Activity Feed**: Recent purchase orders and vendor interactions
- **Smart Alerts**: Low stock warnings, price suggestions, demand trends
- **Inventory Health**: SKU counts, stock status overview
- **Sales Performance**: Top selling products, order value metrics

### 2. Inventory Management
- **CRUD Operations**: Add, edit, delete inventory items
- **Search & Filter**: By name, SKU, category, location, quantity
- **Bulk Actions**: Multi-select operations (export, adjust, delete)
- **Stock Tracking**: Current quantity, reorder points, location
- **Value Calculation**: Automatic cost and total value computation
- **Status Indicators**: Visual indicators for low stock and out-of-stock items

### 3. Orders Management
- **Order Creation**: Create new orders with customer details
- **Status Tracking**: Pending, Shipped, Delivered statuses
- **Order History**: Complete order log with timestamps
- **Customer Management**: Customer name and order association

### 4. Purchase Orders
- **PO Creation**: Create purchase orders from marketplace or vendors
- **Status Workflow**: Draft → Pending → Approved → Received
- **Vendor Integration**: Link POs to vendors
- **Pagination**: Handle large order lists

### 5. Suppliers
- **Supplier Directory**: Manage supplier contacts and information
- **Product Catalogs**: View supplier product offerings
- **Quick Actions**: Contact, order, view catalog
- **Search**: Find suppliers by name or contact

### 6. Reports
- **KPI Cards**: Revenue, orders, routes metrics
- **Charts**: Sales trends, inventory analytics (placeholder)
- **Data Export**: Export reports (placeholder functionality)

### 7. Settings
- **Theme Selection**: Light, Dark, High Contrast modes
- **Preferences**: Notification settings, default values
- **Data Management**: Export/import, reset options
- **User Profile**: Basic user information

### 8. Stock Adjustments
- **Adjustment Reasons**: Restock, damage, lost, correction, received
- **History Log**: Complete audit trail of stock changes
- **Quantity Tracking**: Positive and negative adjustments
- **Reason Categorization**: Color-coded reason badges

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage for data persistence
- **Maps**: Leaflet.js (for mobile route planner)
- **No Frameworks**: Pure vanilla implementation for performance and simplicity
- **Responsive Design**: CSS Grid, Flexbox, Media Queries

## Design System

### Color Scheme (CSS Variables)
```css
--primary: #4361ee      /* Primary brand color */
--success: #06d6a0      /* Success states */
--warning: #ff9f1c     /* Warning states */
--danger: #ef476f       /* Error/danger states */
--dark: #2c3e50         /* Dark text/backgrounds */
--muted: #6c757d        /* Muted text */
--bg: #f8f9fa           /* Background color */
--card: #ffffff         /* Card backgrounds */
--border: #e5e7eb       /* Border color */
--text: #1f2937         /* Primary text color */
```

### Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Base Font Size**: 15px (desktop), scales down on mobile
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Card Padding**: 18-30px
- **Section Margins**: 20-30px
- **Gap Spacing**: 12-20px (grid/flex gaps)
- **Border Radius**: 8-12px (cards), 12-20px (modals)

### Components
- **Cards**: White background, rounded corners, subtle shadows
- **Buttons**: Rounded, color-coded, hover states
- **Modals**: Centered, backdrop, max-width constraints
- **Tables**: Striped rows, hover effects, sortable headers
- **Forms**: Full-width inputs, proper spacing, labels

## Navigation Structure

### Desktop Navigation
- **Sidebar**: Fixed left sidebar (240-260px width)
- **Top Bar**: Header with search, theme selector, user avatar
- **Menu Items**: Dashboard, Inventory, Suppliers, Purchases, Adjustments, Reports, Settings

### Mobile Navigation
- **Hamburger Menu**: Slide-out drawer from left
- **Bottom Bar**: Fixed bottom navigation (mobile dashboard only)
- **Backdrop**: Dark overlay when drawer is open
- **Touch Targets**: Minimum 44x44px for accessibility

## Current State

### What's Working
✅ Core functionality for all pages
✅ LocalStorage data persistence
✅ Basic responsive design (some pages)
✅ Modal and drawer interactions
✅ Search and filter capabilities
✅ Theme switching (light/dark/contrast)
✅ Mobile dashboard with route planner

### What Needs Improvement

#### Mobile UI Issues
1. **Sidebar Navigation**: Doesn't collapse properly on mobile, needs hamburger menu
2. **Tables**: Overflow on small screens, need card view or horizontal scroll
3. **Forms**: Input fields too small, need better mobile keyboard types
4. **Touch Targets**: Buttons and links too small for touch interaction
5. **Modals**: Not optimized for mobile, need full-screen on small devices
6. **Spacing**: Inconsistent padding and margins on mobile
7. **Typography**: Font sizes don't scale well on mobile
8. **Grid Layouts**: Marketplace and vendor grids need mobile stacking
9. **Filters**: Filter bars need vertical stacking on mobile
10. **Action Buttons**: Need larger touch targets and better spacing

#### General Issues
- Inconsistent mobile breakpoints across pages
- Some pages lack mobile media queries entirely
- Modal interactions need swipe-to-close on mobile
- Form validation needs mobile-friendly error messages
- Loading states not optimized for mobile
- Image optimization needed for mobile

## Data Structure

### LocalStorage Keys
- `inventory`: Array of inventory items
- `vendor_orders`: Array of purchase orders
- `theme`: Current theme preference
- Additional keys used by data.js for orders, suppliers, etc.

### Data Models

**Inventory Item**:
```javascript
{
  sku: string,
  name: string,
  category: string,
  qty: number,
  reorder: number,
  location: string,
  cost: number
}
```

**Purchase Order**:
```javascript
{
  id: string,
  vendor: string,
  product: string,
  price: number,
  qty: number,
  ts: ISO timestamp
}
```

**Vendor**:
```javascript
{
  id: number,
  name: string,
  contact: string,
  products: Array
}
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- LocalStorage API
- No polyfills required for modern browsers

## Future Enhancements (Not in Current Scope)
- Backend API integration
- User authentication
- Multi-user support
- Real-time updates
- Advanced analytics
- Print functionality
- Email notifications
- Barcode scanning
- Mobile app (native)

## Notes for Development
- All pages use inline styles for self-contained functionality
- Some pages reference external CSS/JS files that may need creation
- Mobile dashboard uses Leaflet.js for maps (CDN)
- Theme switching persists via LocalStorage
- No build process required - pure static files
- Can be served from any web server or opened directly

---

**Last Updated**: 2025-01-27
**Version**: 1.0
**Status**: Active Development - Mobile UI Enhancement Phase

