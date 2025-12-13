// js/data.js
const STORAGE_KEY = 'inventory_pro_data_v2';

const defaultData = {
  items: [
    { id: 1, sku: "SKU-001", name: "Laptop Dell XPS 15", quantity: 48, price: 999.99, location: "Warehouse A", category: "Electronics" },
    { id: 2, sku: "SKU-002", name: "Wireless Mouse", quantity: 5, price: 24.99, location: "Warehouse B", category: "Accessories" },
    { id: 3, sku: "SKU-003", name: "USB-C Hub 7-in-1", quantity: 120, price: 45.00, location: "Warehouse A", category: "Accessories" },
    { id: 4, sku: "SKU-004", name: "Mechanical Keyboard", quantity: 33, price: 129.99, location: "Warehouse A", category: "Electronics" }
  ],
  orders: [
    { id: 1, orderId: "#ORD-1001", customer: "John Doe", items: 2, total: 1049.98, status: "Pending", date: "2025-12-08" },
    { id: 2, orderId: "#ORD-1002", customer: "Jane Smith", items: 1, total: 129.99, status: "Shipped", date: "2025-12-07" },
    { id: 3, orderId: "#ORD-1003", customer: "Mike Johnson", items: 3, total: 169.97, status: "Delivered", date: "2025-12-06" }
  ],
  locations: ["Warehouse A", "Warehouse B", "Store Front"],
  suppliers: ["TechSupplier Inc", "Global Electronics", "Accessories Direct"]
};

function getData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveData(defaultData);
    return defaultData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    // if parsing fails, reset to default and return default
    saveData(defaultData);
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Export functions
window.InventoryData = {
  getItems: () => getData().items,
  getOrders: () => getData().orders,
  getLocations: () => getData().locations,
  getSuppliers: () => getData().suppliers,

  saveItems: (items) => { const d = getData(); d.items = items; saveData(d); },
  saveOrders: (orders) => { const d = getData(); d.orders = orders; saveData(d); },
  saveLocations: (locs) => { const d = getData(); d.locations = locs; saveData(d); },
  saveSuppliers: (sups) => { const d = getData(); d.suppliers = sups; saveData(d); }
};


/* ---------- Vendor data (safe append) ---------- */
/* If you fetch vendor data from the server, replace this with that call. */
window.VENDORS = window.VENDORS || [
  {
    id: 1,
    name: "Alpha Supplies",
    contact: "alpha@example.com",
    products: [
      { id: 101, name: "Notebook A4 (100pcs)", sku: "NB-A4-100", price: 2500, stock: 120 },
      { id: 102, name: "Blue Ink Pen (Box of 50)", sku: "PEN-BX50", price: 450, stock: 400 }
    ]
  },
  {
    id: 2,
    name: "Best Industrial",
    contact: "sales@bestind.com",
    products: [
      { id: 201, name: "Industrial Tape 2in", sku: "TAPE-2IN", price: 150, stock: 600 },
      { id: 202, name: "Safety Gloves (Pair)", sku: "GLOVE-SFT", price: 120, stock: 300 }
    ]
  },
  {
    id: 3,
    name: "OfficeMart",
    contact: "office@mart.com",
    products: [
      { id: 301, name: "A4 Copier Paper (500 sheets)", sku: "PPR-A4-500", price: 420, stock: 220 },
      { id: 302, name: "Stapler Heavy Duty", sku: "STPL-HD", price: 650, stock: 50 }
    ]
  }
];
