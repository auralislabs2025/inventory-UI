/* =========================
   SEARCH UTILITIES
========================= */

// Debounced search function
function createSearchHandler(callback, delay = 300) {
  let timeout;
  return (e) => {
    const value = e.target ? e.target.value : e;
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(value), delay);
  };
}

// Create modern search input component
function createSearchInput(containerId, options = {}) {
  const {
    placeholder = "Search...",
    onSearch = () => {},
    onClear = () => {},
    showFilters = false,
    filterButtonText = "Filters"
  } = options;

  const container = document.getElementById(containerId);
  if (!container) return null;

  const searchHTML = `
    <div class="search-container">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="search" 
               class="search-input" 
               placeholder="${placeholder}"
               inputmode="search"
               autocomplete="off"
               aria-label="${placeholder}">
        <button class="search-clear" aria-label="Clear search" style="display: none;">×</button>
      </div>
      ${showFilters ? `<button class="filter-toggle" aria-label="Show filters">${filterButtonText}</button>` : ''}
    </div>
  `;

  container.innerHTML = searchHTML;

  const input = container.querySelector('.search-input');
  const clearBtn = container.querySelector('.search-clear');
  const searchHandler = createSearchHandler(onSearch);

  // Input event with debouncing
  input.addEventListener('input', (e) => {
    const value = e.target.value;
    searchHandler(e);
    
    // Show/hide clear button
    if (value.length > 0) {
      clearBtn.style.display = 'flex';
    } else {
      clearBtn.style.display = 'none';
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    onClear();
    onSearch('');
  });

  // Enter key to search immediately
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(input.value);
    }
  });

  return {
    input,
    clear: () => {
      input.value = '';
      clearBtn.style.display = 'none';
      onClear();
      onSearch('');
    },
    getValue: () => input.value
  };
}

/* =========================
   DATA MODELS
========================= */

// Warehouses (First-Class Entity)
const warehouses = [
  {
    id: 1,
    name: "Trivandrum Central Godown",
    lat: 8.5241,
    lng: 76.9366,
    vehicles: 4
  },
  {
    id: 2,
    name: "Attingal Depot",
    lat: 8.6960,
    lng: 76.8150,
    vehicles: 2
  },
  {
    id: 3,
    name: "Nedumangad Hub",
    lat: 8.6010,
    lng: 77.0014,
    vehicles: 3
  }
];

// Fleet Management (MANDATORY)
const fleet = [
  {
    id: 1,
    name: "Van-001",
    type: "Van",
    capacity: 500, // kg
    costPerKm: 8,
    status: "available",
    assignedRoute: null,
    warehouseId: 1
  },
  {
    id: 2,
    name: "Truck-002",
    type: "Mini Truck",
    capacity: 1500,
    costPerKm: 12,
    status: "available",
    assignedRoute: null,
    warehouseId: 1
  },
  {
    id: 3,
    name: "Van-003",
    type: "Van",
    capacity: 500,
    costPerKm: 8,
    status: "assigned",
    assignedRoute: "Attingal – Kallambalam Belt",
    warehouseId: 1
  },
  {
    id: 4,
    name: "Truck-004",
    type: "Truck",
    capacity: 3000,
    costPerKm: 15,
    status: "on_route",
    assignedRoute: "Varkala – Paravur Belt",
    warehouseId: 1
  }
];

// Area Clusters (Routes) - Realistic Kerala belts
const clusters = [
  {
    id: 1,
    name: "Attingal – Kallambalam Belt",
    retailers: [
      { name: "Retailer A1", lat: 8.6961, lng: 76.8154, value: 32000, orderId: "ORD-001" },
      { name: "Retailer A2", lat: 8.7148, lng: 76.8031, value: 28000, orderId: "ORD-002" },
      { name: "Retailer A3", lat: 8.7353, lng: 76.7945, value: 36000, orderId: "ORD-003" }
    ],
    status: "planned"
  },
  {
    id: 2,
    name: "Varkala – Paravur Belt",
    retailers: [
      { name: "Retailer B1", lat: 8.7379, lng: 76.7163, value: 45000, orderId: "ORD-004" },
      { name: "Retailer B2", lat: 8.7552, lng: 76.7012, value: 33000, orderId: "ORD-005" }
    ],
    status: "in_progress",
    assignedVehicle: 4
  },
  {
    id: 3,
    name: "Kilimanoor – Nagaroor Belt",
    retailers: [
      { name: "Retailer C1", lat: 8.7526, lng: 76.8731, value: 28000, orderId: "ORD-006" },
      { name: "Retailer C2", lat: 8.7639, lng: 76.8614, value: 35000, orderId: "ORD-007" },
      { name: "Retailer C3", lat: 8.7812, lng: 76.8523, value: 25000, orderId: "ORD-008" }
    ],
    status: "planned"
  },
  {
    id: 4,
    name: "Nedumangad – Vattapara Belt",
    retailers: [
      { name: "Retailer D1", lat: 8.6010, lng: 77.0014, value: 42000, orderId: "ORD-009" },
      { name: "Retailer D2", lat: 8.6168, lng: 76.9913, value: 38000, orderId: "ORD-010" },
      { name: "Retailer D3", lat: 8.6365, lng: 76.9782, value: 22000, orderId: "ORD-011" }
    ],
    status: "planned"
  }
];

let activeWarehouse = warehouses[0];
let activeCluster = null;
let map = null;
let routeLayer = null;
let currentRouteData = null;
let selectedVehicleId = null;

/* =========================
   DEMO DATA SEEDING
========================= */

function seedDemoData() {
  // Seed Orders Data
  if (!localStorage.getItem('wholesaler_orders')) {
    const demoOrders = [
      { id: 1, orderId: "ORD-001", retailer: "Krishna Stores", items: "15 items", value: 45000, status: "pending", date: "2025-01-27", address: "Attingal, Kerala" },
      { id: 2, orderId: "ORD-002", retailer: "Lakshmi Supermarket", items: "22 items", value: 32000, status: "pending", date: "2025-01-27", address: "Kallambalam, Kerala" },
      { id: 3, orderId: "ORD-003", retailer: "Devi Trading Co", items: "18 items", value: 36000, status: "shipped", date: "2025-01-26", address: "Attingal, Kerala" },
      { id: 4, orderId: "ORD-004", retailer: "Ganesh Provisions", items: "25 items", value: 45000, status: "shipped", date: "2025-01-26", address: "Varkala, Kerala" },
      { id: 5, orderId: "ORD-005", retailer: "Sai Enterprises", items: "12 items", value: 33000, status: "delivered", date: "2025-01-25", address: "Paravur, Kerala" },
      { id: 6, orderId: "ORD-006", retailer: "Balaji Stores", items: "20 items", value: 28000, status: "pending", date: "2025-01-27", address: "Kilimanoor, Kerala" },
      { id: 7, orderId: "ORD-007", retailer: "Murugan Traders", items: "16 items", value: 35000, status: "shipped", date: "2025-01-26", address: "Nagaroor, Kerala" },
      { id: 8, orderId: "ORD-008", retailer: "Venkateshwara Mart", items: "14 items", value: 25000, status: "delivered", date: "2025-01-25", address: "Kilimanoor, Kerala" },
      { id: 9, orderId: "ORD-009", retailer: "Mahalakshmi Stores", items: "28 items", value: 42000, status: "pending", date: "2025-01-27", address: "Nedumangad, Kerala" },
      { id: 10, orderId: "ORD-010", retailer: "Padmanabha Trading", items: "19 items", value: 38000, status: "shipped", date: "2025-01-26", address: "Vattapara, Kerala" },
      { id: 11, orderId: "ORD-011", retailer: "Anjaneya Provisions", items: "17 items", value: 22000, status: "delivered", date: "2025-01-25", address: "Nedumangad, Kerala" },
      { id: 12, orderId: "ORD-012", retailer: "Radha Supermarket", items: "24 items", value: 41000, status: "pending", date: "2025-01-27", address: "Trivandrum, Kerala" }
    ];
    localStorage.setItem('wholesaler_orders', JSON.stringify(demoOrders));
  }

  // Seed Inventory Data
  if (!localStorage.getItem('wholesaler_inventory')) {
    const demoInventory = [
      { id: 1, sku: "PROD-001", name: "Rice 1kg Premium", category: "Food Grains", quantity: 150, unit: "bags", price: 450, reorderLevel: 50 },
      { id: 2, sku: "PROD-002", name: "Wheat Flour 1kg", category: "Food Grains", quantity: 8, unit: "bags", price: 380, reorderLevel: 20 },
      { id: 3, sku: "PROD-003", name: "Sugar 1kg", category: "Food Grains", quantity: 0, unit: "bags", price: 420, reorderLevel: 30 },
      { id: 4, sku: "PROD-004", name: "Cooking Oil 1L", category: "Oils", quantity: 85, unit: "bottles", price: 180, reorderLevel: 40 },
      { id: 5, sku: "PROD-005", name: "Mustard Oil 500ml", category: "Oils", quantity: 120, unit: "bottles", price: 95, reorderLevel: 50 },
      { id: 6, sku: "PROD-006", name: "Turmeric Powder 500g", category: "Spices", quantity: 45, unit: "packets", price: 120, reorderLevel: 25 },
      { id: 7, sku: "PROD-007", name: "Chilli Powder 500g", category: "Spices", quantity: 6, unit: "packets", price: 110, reorderLevel: 20 },
      { id: 8, sku: "PROD-008", name: "Coriander Powder 500g", category: "Spices", quantity: 38, unit: "packets", price: 85, reorderLevel: 25 },
      { id: 9, sku: "PROD-009", name: "Tea Powder 500g", category: "Beverages", quantity: 95, unit: "packets", price: 250, reorderLevel: 40 },
      { id: 10, sku: "PROD-010", name: "Coffee Powder 200g", category: "Beverages", quantity: 72, unit: "packets", price: 180, reorderLevel: 30 },
      { id: 11, sku: "PROD-011", name: "Salt 1kg", category: "Food Grains", quantity: 200, unit: "packets", price: 25, reorderLevel: 50 },
      { id: 12, sku: "PROD-012", name: "Dal Toor 1kg", category: "Pulses", quantity: 55, unit: "packets", price: 140, reorderLevel: 30 },
      { id: 13, sku: "PROD-013", name: "Dal Moong 1kg", category: "Pulses", quantity: 42, unit: "packets", price: 150, reorderLevel: 25 },
      { id: 14, sku: "PROD-014", name: "Dal Urad 1kg", category: "Pulses", quantity: 5, unit: "packets", price: 160, reorderLevel: 20 },
      { id: 15, sku: "PROD-015", name: "Soap Bar", category: "Personal Care", quantity: 180, unit: "pieces", price: 35, reorderLevel: 50 },
      { id: 16, sku: "PROD-016", name: "Shampoo 200ml", category: "Personal Care", quantity: 65, unit: "bottles", price: 120, reorderLevel: 30 },
      { id: 17, sku: "PROD-017", name: "Toothpaste 100g", category: "Personal Care", quantity: 90, unit: "tubes", price: 75, reorderLevel: 40 },
      { id: 18, sku: "PROD-018", name: "Detergent Powder 1kg", category: "Cleaning", quantity: 110, unit: "packets", price: 95, reorderLevel: 50 },
      { id: 19, sku: "PROD-019", name: "Biscuits 200g", category: "Snacks", quantity: 75, unit: "packets", price: 45, reorderLevel: 30 },
      { id: 20, sku: "PROD-020", name: "Namkeen 250g", category: "Snacks", quantity: 48, unit: "packets", price: 55, reorderLevel: 25 }
    ];
    localStorage.setItem('wholesaler_inventory', JSON.stringify(demoInventory));
  }
}

/* =========================
   INITIALIZATION
========================= */

function init() {
  // Seed demo data first
  seedDemoData();
  
  // Initialize page views
  pageViews = {
    dashboard: document.getElementById('dashboardView'),
    routes: document.getElementById('routesView'),
    fleet: document.getElementById('fleetView'),
    orders: document.getElementById('ordersView'),
    inventory: document.getElementById('inventoryView'),
    analytics: document.getElementById('analyticsView'),
    settings: document.getElementById('settingsView')
  };
  
  // Show dashboard by default
  navigateToPage('dashboard');
  
  initWarehouseSelect();
  recalculateMetrics();
  renderUI();
  updateFleetQuickView();
}

function initWarehouseSelect() {
  const select = document.getElementById("warehouseSelect");
  warehouses.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.name;
    select.appendChild(opt);
  });
  select.value = activeWarehouse.id;
  select.onchange = () => {
    activeWarehouse = warehouses.find(w => w.id == select.value);
    document.getElementById("activeWarehouseLabel").textContent = activeWarehouse.name;
    updateWarehouseInfo();
    recalculateMetrics();
    renderUI();
    updateFleetQuickView();
  };
  updateWarehouseInfo();
}

function updateWarehouseInfo() {
  const info = document.getElementById("warehouseInfo");
  const availableFleet = fleet.filter(v => 
    v.warehouseId === activeWarehouse.id && v.status === "available"
  ).length;
  info.textContent = `📍 ${availableFleet} Vehicles Available`;
}

/* =========================
   METRICS CALCULATION (₹/KM)
========================= */

function recalculateMetrics() {
  clusters.forEach(c => {
    c.totalValue = c.retailers.reduce((s, r) => s + r.value, 0);
    c.estimatedKm = calculateRouteDistance(c);
    c.efficiency = c.estimatedKm > 0 ? Math.round(c.totalValue / c.estimatedKm) : 0;
  });

  // Sort by efficiency (best first)
  clusters.sort((a, b) => b.efficiency - a.efficiency);
  activeCluster = clusters[0];
}

function calculateRouteDistance(cluster) {
  // Use haversine for initial estimate, OSRM will refine
  let dist = 0;
  let prev = { lat: activeWarehouse.lat, lng: activeWarehouse.lng };
  
  cluster.retailers.forEach(r => {
    dist += haversineDistance(prev, r);
    prev = r;
  });
  
  // Return to warehouse
  dist += haversineDistance(prev, activeWarehouse);
  
  return Math.round(dist);
}

function haversineDistance(a, b) {
  const R = 6371; // Earth radius in km
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) *
    Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* =========================
   UI RENDERING
========================= */

function renderUI() {
  // Best Route Card
  if (activeCluster) {
    document.getElementById("bestRouteName").textContent = activeCluster.name;
    document.getElementById("bestRevenue").textContent = "₹" + activeCluster.totalValue.toLocaleString();
    document.getElementById("bestKm").textContent = activeCluster.estimatedKm + " km";
    document.getElementById("bestScore").textContent = "₹" + activeCluster.efficiency;
  }

  // Route List
  const list = document.getElementById("routeList");
  list.innerHTML = "";
  clusters.forEach(c => {
    const div = document.createElement("div");
    div.className = "route-card";
    if (c === activeCluster) div.classList.add("highlighted");
    
    const statusBadge = getStatusBadge(c.status);
    
    div.innerHTML = `
      <div class="route-header">
        <strong>${c.name}</strong>
        ${statusBadge}
      </div>
      <div class="route-metrics">
        <span>₹${c.totalValue.toLocaleString()}</span>
        <span>•</span>
        <span>${c.estimatedKm} km</span>
        <span>•</span>
        <span class="efficiency">₹${c.efficiency}/km</span>
      </div>
      ${c.assignedVehicle ? `<div class="vehicle-assigned">🚚 ${getVehicleName(c.assignedVehicle)}</div>` : ''}
    `;
    
    div.onclick = () => {
      activeCluster = c;
      renderUI();
      openMap();
    };
    
    list.appendChild(div);
  });
}

function getStatusBadge(status) {
  const badges = {
    planned: '<span class="badge badge-planned">Planned</span>',
    assigned: '<span class="badge badge-assigned">Assigned</span>',
    in_progress: '<span class="badge badge-progress">In Progress</span>',
    completed: '<span class="badge badge-completed">Completed</span>'
  };
  return badges[status] || '';
}

function getVehicleName(vehicleId) {
  const v = fleet.find(f => f.id === vehicleId);
  return v ? v.name : 'Unknown';
}

function updateFleetQuickView() {
  const warehouseFleet = fleet.filter(v => v.warehouseId === activeWarehouse.id);
  const available = warehouseFleet.filter(v => v.status === "available").length;
  const assigned = warehouseFleet.filter(v => v.status === "assigned").length;
  const onRoute = warehouseFleet.filter(v => v.status === "on_route").length;
  
  document.getElementById("fleetAvailable").textContent = available;
  document.getElementById("fleetAssigned").textContent = assigned;
  document.getElementById("fleetOnRoute").textContent = onRoute;
}

/* =========================
   OSRM ROUTING
========================= */

async function fetchOSRMRoute(points) {
  const coords = points.map(p => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      return {
        coordinates: data.routes[0].geometry.coordinates,
        distance: data.routes[0].distance / 1000, // Convert to km
        duration: data.routes[0].duration / 60 // Convert to minutes
      };
    }
    throw new Error("No route found");
  } catch (error) {
    console.warn("OSRM failed, using fallback:", error);
    // Fallback: straight-line polyline
    return {
      coordinates: points.map(p => [p.lng, p.lat]),
      distance: calculateRouteDistance({ retailers: points }),
      duration: 0
    };
  }
}

/* =========================
   MAP FUNCTIONS
========================= */

function openMap() {
  if (!activeCluster) return;
  
  document.getElementById("mapOverlay").style.display = "flex";
  document.getElementById("mapTitle").textContent = activeCluster.name;
  
  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([activeWarehouse.lat, activeWarehouse.lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    }
    
    map.invalidateSize();
    drawRoute();
  }, 200);
}

async function drawRoute() {
  if (routeLayer) map.removeLayer(routeLayer);
  map.eachLayer(l => {
    if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l);
  });

  const points = [
    { lat: activeWarehouse.lat, lng: activeWarehouse.lng },
    ...activeCluster.retailers,
    { lat: activeWarehouse.lat, lng: activeWarehouse.lng } // Return to warehouse
  ];

  const routeData = await fetchOSRMRoute(points);
  currentRouteData = routeData;

  // Draw route polyline (BLUE)
  const latLngs = routeData.coordinates.map(c => [c[1], c[0]]);
  routeLayer = L.polyline(latLngs, {
    color: "#2563eb",
    weight: 5,
    opacity: 0.8
  }).addTo(map);

  // Green marker: Warehouse (START) - using custom div icon
  const greenIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="background: #22c55e; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
  L.marker([activeWarehouse.lat, activeWarehouse.lng], { icon: greenIcon })
    .addTo(map).bindPopup("🟢 Warehouse (Start)");

  // Red marker: Final stop (END)
  const lastRetailer = activeCluster.retailers[activeCluster.retailers.length - 1];
  const redIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
  L.marker([lastRetailer.lat, lastRetailer.lng], { icon: redIcon })
    .addTo(map).bindPopup("🔴 Final Stop");

  // Blue markers: Intermediate stops
  const blueIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="background: #2563eb; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
  activeCluster.retailers.slice(0, -1).forEach((r, i) => {
    L.marker([r.lat, r.lng], { icon: blueIcon })
      .addTo(map).bindPopup(`Stop ${i + 1}: ${r.name}`);
  });

  map.fitBounds(routeLayer.getBounds());
}

/* =========================
   FLEET ASSIGNMENT
========================= */

function openFleetModal() {
  const container = document.getElementById("fleetSelectList");
  container.innerHTML = "";
  
  const availableFleet = fleet.filter(v => 
    v.warehouseId === activeWarehouse.id && 
    (v.status === "available" || v.status === "assigned")
  );
  
  if (availableFleet.length === 0) {
    container.innerHTML = "<p>No vehicles available</p>";
    return;
  }
  
  availableFleet.forEach(v => {
    const div = document.createElement("div");
    div.className = "fleet-option";
    div.innerHTML = `
      <input type="radio" name="vehicleSelect" value="${v.id}" id="v${v.id}">
      <label for="v${v.id}">
        <strong>${v.name}</strong>
        <span>${v.type} • ${v.capacity}kg • ₹${v.costPerKm}/km</span>
        ${v.status === "assigned" ? '<span class="warning">Currently assigned</span>' : ''}
      </label>
    `;
    div.onclick = () => {
      document.getElementById(`v${v.id}`).checked = true;
      selectedVehicleId = v.id;
    };
    container.appendChild(div);
  });
  
  document.getElementById("fleetModal").classList.add("open");
}

function confirmFleetAssignment() {
  if (!selectedVehicleId || !activeCluster) return;
  
  const vehicle = fleet.find(v => v.id === selectedVehicleId);
  if (!vehicle) return;
  
  // Assign vehicle to route
  activeCluster.assignedVehicle = selectedVehicleId;
  activeCluster.status = "assigned";
  vehicle.status = "assigned";
  vehicle.assignedRoute = activeCluster.name;
  
  closeFleetModal();
  renderUI();
  updateFleetQuickView();
  showToast(`Vehicle ${vehicle.name} assigned to ${activeCluster.name}`);
}

function closeFleetModal() {
  document.getElementById("fleetModal").classList.remove("open");
  selectedVehicleId = null;
}

/* =========================
   ROUTE EXECUTION
========================= */

function startRouteExecution() {
  if (!activeCluster || activeCluster.status !== "assigned") {
    showToast("Please assign a vehicle first");
    return;
  }
  
  // Update status
  activeCluster.status = "in_progress";
  const vehicle = fleet.find(v => v.id === activeCluster.assignedVehicle);
  if (vehicle) vehicle.status = "on_route";
  
  // Show execution overlay
  document.getElementById("execRouteName").textContent = activeCluster.name;
  const stopsList = document.getElementById("execStopsList");
  stopsList.innerHTML = "";
  
  activeCluster.retailers.forEach((r, i) => {
    const stopDiv = document.createElement("div");
    stopDiv.className = "exec-stop";
    stopDiv.innerHTML = `
      <div class="stop-number">${i + 1}</div>
      <div class="stop-info">
        <strong>${r.name}</strong>
        <span>Order: ${r.orderId}</span>
        <span>Value: ₹${r.value.toLocaleString()}</span>
      </div>
      <div class="stop-status">⏳</div>
    `;
    stopsList.appendChild(stopDiv);
  });
  
  document.getElementById("executionOverlay").style.display = "flex";
  document.getElementById("mapOverlay").style.display = "none";
  renderUI();
  updateFleetQuickView();
}

function markStopComplete() {
  const stops = document.querySelectorAll(".exec-stop");
  const firstPending = Array.from(stops).find(s => 
    s.querySelector(".stop-status").textContent === "⏳"
  );
  
  if (firstPending) {
    firstPending.querySelector(".stop-status").textContent = "✅";
    firstPending.classList.add("completed");
    showToast("Stop marked complete");
    
    // Check if all stops complete
    const allComplete = Array.from(stops).every(s => 
      s.querySelector(".stop-status").textContent === "✅"
    );
    
    if (allComplete) {
      completeRoute();
    }
  } else {
    showToast("All stops already completed");
  }
}

function completeRoute() {
  if (!activeCluster) return;
  
  activeCluster.status = "completed";
  const vehicle = fleet.find(v => v.id === activeCluster.assignedVehicle);
  if (vehicle) {
    vehicle.status = "available";
    vehicle.assignedRoute = null;
  }
  
  showToast("Route completed successfully!");
  document.getElementById("executionOverlay").style.display = "none";
  renderUI();
  updateFleetQuickView();
}

function callRetailer() {
  showToast("Calling retailer...");
}

/* =========================
   ROUTING SYSTEM
========================= */

let currentPage = 'dashboard';

// Initialize page views after DOM loads
let pageViews = {};

function navigateToPage(page) {
  // Hide all views
  Object.values(pageViews).forEach(view => {
    if (view) view.style.display = 'none';
  });
  
  // Show selected view
  if (pageViews[page]) {
    pageViews[page].style.display = 'block';
    currentPage = page;
    
    // Update page title
    const titles = {
      dashboard: "Route Planner",
      routes: "Routes",
      fleet: "Fleet",
      orders: "Orders",
      inventory: "Inventory",
      analytics: "Analytics",
      settings: "Settings"
    };
    document.getElementById("pageTitle").textContent = titles[page] || "Route Planner";
    
    // Update bottom bar active state
    document.querySelectorAll('.bottom-bar .action-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = Array.from(document.querySelectorAll('.bottom-bar .action-btn')).find(btn => 
      btn.textContent.includes(titles[page]?.split(' ')[0] || '')
    );
    if (activeBtn) activeBtn.classList.add('active');
    
    // Load page-specific data
    loadPageData(page);
  }
}

function loadPageData(page) {
  switch(page) {
    case 'routes':
      renderAllRoutes();
      break;
    case 'fleet':
      renderFleetView();
      break;
    case 'orders':
      renderOrdersView();
      break;
    case 'inventory':
      renderInventoryView();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    case 'settings':
      renderSettingsView();
      break;
  }
}

function renderAllRoutes() {
  // Get or create search container
  let searchContainer = document.getElementById("routesSearchContainer");
  if (!searchContainer) {
    const routesSection = document.getElementById("routesView").querySelector('.routes');
    searchContainer = document.createElement('div');
    searchContainer.id = 'routesSearchContainer';
    searchContainer.className = 'search-wrapper';
    searchContainer.style.margin = '16px 16px 0';
    const h4 = routesSection.querySelector('h4');
    routesSection.insertBefore(searchContainer, h4);
  }
  
  // Clear and create modern search input
  if (!searchContainer.querySelector('.search-container')) {
    const searchInput = createSearchInput('routesSearchContainer', {
      placeholder: "Search routes by name...",
      showFilters: false
    });
  }
  
  const list = document.getElementById("allRoutesList");
  list.innerHTML = "";
  
  let filteredClusters = clusters;
  
  // Render routes
  function renderRoutesList(clusterList) {
    list.innerHTML = "";
    clusterList.forEach(c => {
      const div = document.createElement("div");
      div.className = "route-card";
      if (c === activeCluster) div.classList.add("highlighted");
      
      const statusBadge = getStatusBadge(c.status);
    
    div.innerHTML = `
      <div class="route-header">
        <strong>${c.name}</strong>
        ${statusBadge}
      </div>
      <div class="route-metrics">
        <span>₹${c.totalValue.toLocaleString()}</span>
        <span>•</span>
        <span>${c.estimatedKm} km</span>
        <span>•</span>
        <span class="efficiency">₹${c.efficiency}/km</span>
      </div>
      ${c.assignedVehicle ? `<div class="vehicle-assigned">🚚 ${getVehicleName(c.assignedVehicle)}</div>` : ''}
    `;
    
    div.onclick = () => {
      activeCluster = c;
      navigateToPage('dashboard');
      setTimeout(() => {
        renderUI();
        openMap();
      }, 100);
    };
    
    list.appendChild(div);
    });
  }
  
  // Search handler
  const searchInput = searchContainer?.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', createSearchHandler((term) => {
      filteredClusters = clusters.filter(c => {
        return c.name.toLowerCase().includes(term.toLowerCase());
      });
      renderRoutesList(filteredClusters);
    }));
  }
  
  renderRoutesList(filteredClusters);
}

/* =========================
   DRAWER
========================= */

function openDrawer() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  
  // Prevent body scroll when drawer is open
  document.body.style.overflow = 'hidden';
  
  // Add classes with slight delay for smoother animation
  backdrop.classList.add("open");
  setTimeout(() => {
    drawer.classList.add("open");
  }, 10);
}

function closeDrawer() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  
  // Re-enable body scroll
  document.body.style.overflow = '';
  
  // Remove classes
  drawer.classList.remove("open");
  setTimeout(() => {
    backdrop.classList.remove("open");
  }, 200);
}

/* =========================
   UTILITIES
========================= */

function showToast(msg) {
  // Simple toast implementation
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }, 10);
}

/* =========================
   EVENT LISTENERS
========================= */

document.getElementById("hamburger").onclick = openDrawer;
document.getElementById("closeDrawer").onclick = closeDrawer;
document.getElementById("drawerBackdrop").onclick = closeDrawer;

document.getElementById("openMapBtn").onclick = openMap;
document.getElementById("closeMap").onclick = () => {
  document.getElementById("mapOverlay").style.display = "none";
};

document.getElementById("assignVehicleBtn").onclick = openFleetModal;
document.getElementById("startRouteBtn").onclick = startRouteExecution;

document.getElementById("closeExec").onclick = () => {
  document.getElementById("executionOverlay").style.display = "none";
};

// Close fleet modal on backdrop click
const fleetModal = document.getElementById("fleetModal");
if (fleetModal) {
  fleetModal.addEventListener('click', function(e) {
    if (e.target === this) {
      closeFleetModal();
    }
  });
}

/* =========================
   MOBILE VIEW RENDERING
========================= */

function renderFleetView() {
  const warehouseFleet = fleet.filter(v => v.warehouseId === activeWarehouse.id);
  document.getElementById("mobileFleetTotal").textContent = warehouseFleet.length;
  document.getElementById("mobileFleetAvailable").textContent = warehouseFleet.filter(v => v.status === "available").length;
  document.getElementById("mobileFleetAssigned").textContent = warehouseFleet.filter(v => v.status === "assigned" || v.status === "on_route").length;
  
  // Get or create search container
  let searchContainer = document.getElementById("fleetSearchContainer");
  if (!searchContainer) {
    const pageContent = document.getElementById("fleetView").querySelector('.page-content');
    searchContainer = document.createElement('div');
    searchContainer.id = 'fleetSearchContainer';
    searchContainer.className = 'search-wrapper';
    searchContainer.style.margin = '16px';
    const fleetList = document.getElementById("fleetList");
    pageContent.insertBefore(searchContainer, fleetList);
  }
  
  // Clear and create modern search input
  if (!searchContainer.querySelector('.search-container')) {
    const searchInput = createSearchInput('fleetSearchContainer', {
      placeholder: "Search vehicles by name or type...",
      showFilters: false
    });
  }
  
  const list = document.getElementById("fleetList");
  list.innerHTML = "";
  
  let filteredFleet = warehouseFleet;
  
  // Render fleet
  function renderFleetList(fleetList) {
    list.innerHTML = "";
    fleetList.forEach(v => {
      const div = document.createElement("div");
      div.className = "route-card";
      div.innerHTML = `
        <div class="route-header">
          <strong>${v.name}</strong>
          <span class="badge badge-${v.status}">${v.status.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="route-metrics">
          <span>${v.type}</span>
          <span>•</span>
          <span>${v.capacity}kg</span>
          <span>•</span>
          <span>₹${v.costPerKm}/km</span>
        </div>
        ${v.assignedRoute ? `<div style="margin-top: 8px; font-size: 0.85rem; color: var(--muted);">Route: ${v.assignedRoute}</div>` : ''}
      `;
      list.appendChild(div);
    });
  }
  
  // Search handler
  const searchInput = searchContainer?.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', createSearchHandler((term) => {
      filteredFleet = warehouseFleet.filter(v => {
        const searchText = `${v.name} ${v.type} ${v.status}`.toLowerCase();
        return searchText.includes(term.toLowerCase());
      });
      renderFleetList(filteredFleet);
    }));
  }
  
  renderFleetList(filteredFleet);
}

function renderOrdersView() {
  const orders = JSON.parse(localStorage.getItem('wholesaler_orders')) || [];
  const container = document.getElementById("ordersView").querySelector('.page-content');
  
  // Get or create search container
  let searchContainer = document.getElementById('ordersSearchContainer');
  if (!searchContainer) {
    searchContainer = document.createElement('div');
    searchContainer.id = 'ordersSearchContainer';
    searchContainer.className = 'search-wrapper';
    container.insertBefore(searchContainer, container.firstChild);
  }
  
  // Clear and create modern search input
  searchContainer.innerHTML = '';
  const searchInput = createSearchInput('ordersSearchContainer', {
    placeholder: "Search orders by ID, retailer, or address...",
    showFilters: true,
    filterButtonText: "Filter"
  });
  
  const list = document.getElementById("ordersList");
  list.innerHTML = "";
  
  if (orders.length === 0) {
    list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--muted);">No orders found</div>';
    return;
  }
  
  let filteredOrders = orders;
  
  // Render orders
  function renderOrdersList(orderList) {
    list.innerHTML = "";
    orderList.forEach(o => {
      const div = document.createElement("div");
      div.className = "route-card";
      div.innerHTML = `
        <div class="route-header">
          <strong>${o.orderId}</strong>
          <span class="badge badge-${o.status}">${o.status.toUpperCase()}</span>
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; color: var(--text);">${o.retailer}</div>
        <div style="margin-top: 4px; font-size: 0.85rem; color: var(--muted);">${o.items} • ${o.date}</div>
        <div style="margin-top: 4px; font-size: 0.85rem; color: var(--muted);">${o.address}</div>
        <div style="margin-top: 8px; font-size: 1rem; font-weight: 700; color: var(--primary);">₹${o.value.toLocaleString()}</div>
      `;
      list.appendChild(div);
    });
  }
  
  // Search handler
  if (searchInput) {
    searchInput.input.addEventListener('input', createSearchHandler((term) => {
      filteredOrders = orders.filter(o => {
        const searchText = `${o.orderId} ${o.retailer} ${o.address} ${o.status}`.toLowerCase();
        return searchText.includes(term.toLowerCase());
      });
      renderOrdersList(filteredOrders);
    }));
  }
  
  renderOrdersList(filteredOrders);
}

function renderInventoryView() {
  const inventory = JSON.parse(localStorage.getItem('wholesaler_inventory')) || [];
  const container = document.getElementById("inventoryView").querySelector('.page-content');
  
  // Get or create search container
  let searchContainer = document.getElementById('inventorySearchContainer');
  if (!searchContainer) {
    searchContainer = document.createElement('div');
    searchContainer.id = 'inventorySearchContainer';
    searchContainer.className = 'search-wrapper';
    container.insertBefore(searchContainer, container.firstChild);
  }
  
  // Clear and create modern search input
  searchContainer.innerHTML = '';
  const searchInput = createSearchInput('inventorySearchContainer', {
    placeholder: "Search products by SKU, name, or category...",
    showFilters: true,
    filterButtonText: "Filter"
  });
  
  const list = document.getElementById("inventoryList");
  list.innerHTML = "";
  
  if (inventory.length === 0) {
    list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--muted);">No inventory items</div>';
    return;
  }
  
  let filteredInventory = inventory;
  
  // Render inventory
  function renderInventoryList(invList) {
    list.innerHTML = "";
    invList.forEach(item => {
      const div = document.createElement("div");
      div.className = "route-card";
      const totalValue = item.quantity * item.price;
      div.innerHTML = `
        <div class="route-header">
          <strong>${item.sku}</strong>
          ${item.quantity === 0 ? '<span class="badge badge-danger">OUT</span>' : item.quantity < item.reorderLevel ? '<span class="badge badge-warning">LOW</span>' : ''}
        </div>
        <div style="margin-top: 8px; font-size: 0.9rem; color: var(--text);">${item.name}</div>
        <div style="margin-top: 4px; font-size: 0.85rem; color: var(--muted);">${item.category}</div>
        <div style="margin-top: 8px; display: flex; justify-content: space-between;">
          <span>Qty: <strong>${item.quantity} ${item.unit}</strong> @ ₹${item.price}/${item.unit}</span>
        </div>
        <div style="margin-top: 4px; font-size: 0.9rem; font-weight: 700; color: var(--primary);">Total: ₹${totalValue.toLocaleString()}</div>
      `;
      list.appendChild(div);
    });
  }
  
  // Search handler
  if (searchInput) {
    searchInput.input.addEventListener('input', createSearchHandler((term) => {
      filteredInventory = inventory.filter(item => {
        const searchText = `${item.sku} ${item.name} ${item.category}`.toLowerCase();
        return searchText.includes(term.toLowerCase());
      });
      renderInventoryList(filteredInventory);
    }));
  }
  
  renderInventoryList(filteredInventory);
}

function renderAnalyticsView() {
  const content = document.getElementById("analyticsContent");
  content.innerHTML = `
    <div style="margin: 16px;">
      <div class="route-card">
        <div class="route-header">
          <strong>Top Routes</strong>
        </div>
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
            <span>Nedumangad Route</span>
            <strong style="color: var(--success);">₹2,267/km</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
            <span>Attingal Route</span>
            <strong style="color: var(--success);">₹1,846/km</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span>Varkala Route</span>
            <strong style="color: var(--primary);">₹1,418/km</strong>
          </div>
        </div>
      </div>
      
      <div class="route-card" style="margin-top: 16px;">
        <div class="route-header">
          <strong>Fleet Utilization</strong>
        </div>
        <div style="margin-top: 12px; font-size: 2rem; font-weight: 700; color: var(--primary); text-align: center;">
          78%
        </div>
        <div style="text-align: center; color: var(--muted); margin-top: 8px;">6/8 vehicles active</div>
      </div>
    </div>
  `;
}

function renderSettingsView() {
  const content = document.getElementById("settingsContent");
  content.innerHTML = `
    <div style="margin: 16px;">
      <div class="route-card">
        <div class="route-header">
          <strong>General</strong>
        </div>
        <div style="margin-top: 12px;">
          <div style="padding: 12px 0; border-bottom: 1px solid var(--border);">
            <div style="font-weight: 600; margin-bottom: 4px;">Default Warehouse</div>
            <select style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--border); margin-top: 4px;">
              <option>Trivandrum Central</option>
              <option>Attingal Depot</option>
              <option>Nedumangad Hub</option>
            </select>
          </div>
          <div style="padding: 12px 0; border-bottom: 1px solid var(--border);">
            <div style="font-weight: 600; margin-bottom: 4px;">Currency</div>
            <select style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--border); margin-top: 4px;">
              <option>INR (₹)</option>
              <option>USD ($)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="route-card" style="margin-top: 16px;">
        <div class="route-header">
          <strong>Notifications</strong>
        </div>
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
            <span>Low Stock Alerts</span>
            <input type="checkbox" checked>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0;">
            <span>Route Completion</span>
            <input type="checkbox" checked>
          </div>
        </div>
      </div>
      
      <div class="route-card" style="margin-top: 16px; border-left: 4px solid var(--danger);">
        <div class="route-header">
          <strong style="color: var(--danger);">Danger Zone</strong>
        </div>
        <button class="primary-btn" style="background: var(--danger); margin-top: 12px;" onclick="if(confirm('Reset all data?')) { localStorage.clear(); location.reload(); }">
          Reset All Data
        </button>
      </div>
    </div>
  `;
}

/* =========================
   AUTHENTICATION CHECK
========================= */

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  if (!isLoggedIn || userRole !== 'wholesaler') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* =========================
   INIT
========================= */

// Run auth check before initializing
if (checkAuth()) {
  init();
}
