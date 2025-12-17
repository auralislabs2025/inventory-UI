/* =========================
   WAREHOUSE (START POINT)
========================= */
const warehouses = [
  {
    id: 1,
    name: "Trivandrum Central Godown",
    lat: 8.5241,
    lng: 76.9366,
    vehicles: 4
  }
];

let activeWarehouse = warehouses[0];

/* =========================
   CLUSTERS (7 ROUTES)
========================= */
const clusters = [
  {
    name: "Attingal Route",
    retailers: [
      { name: "Retailer A", lat: 8.6953, lng: 76.8150, value: 28000 }
    ]
  },
  {
    name: "Varkala Route",
    retailers: [
      { name: "Retailer B", lat: 8.7379, lng: 76.7163, value: 32000 }
    ]
  },
  {
    name: "Kilimanoor Route",
    retailers: [
      { name: "Retailer C", lat: 8.7700, lng: 76.8700, value: 18000 }
    ]
  },
  {
    name: "Chirayinkeezhu Route",
    retailers: [
      { name: "Retailer D", lat: 8.6670, lng: 76.7810, value: 22000 }
    ]
  },
  {
    name: "Kallambalam Route",
    retailers: [
      { name: "Retailer E", lat: 8.7260, lng: 76.7450, value: 26000 }
    ]
  },
  {
    name: "Venjaramoodu Route",
    retailers: [
      { name: "Retailer F", lat: 8.6715, lng: 76.9380, value: 15000 }
    ]
  },
  {
    name: "Nedumangad Route",
    retailers: [
      { name: "Retailer G", lat: 8.6100, lng: 77.0100, value: 24000 }
    ]
  }
];

/* =========================
   MAP INIT
========================= */
const map = L.map("map").setView(
  [activeWarehouse.lat, activeWarehouse.lng],
  10
);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let routeLayer = null;
let warehouseMarker = null;
let markers = [];
let currentCluster = null;

/* =========================
   HELPERS
========================= */
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

/* =========================
   WAREHOUSE UI
========================= */
const warehouseSelect = document.getElementById("warehouseSelect");
const warehouseInfo = document.getElementById("warehouseInfo");

warehouses.forEach(w => {
  const opt = document.createElement("option");
  opt.value = w.id;
  opt.textContent = w.name;
  warehouseSelect.appendChild(opt);
});

warehouseSelect.onchange = () => {
  activeWarehouse = warehouses.find(w => w.id == warehouseSelect.value);
  updateWarehouse();
};

function updateWarehouse() {
  warehouseInfo.textContent =
    `📍 ${activeWarehouse.vehicles} Vehicles Available`;

  if (warehouseMarker) map.removeLayer(warehouseMarker);

  warehouseMarker = L.marker(
    [activeWarehouse.lat, activeWarehouse.lng],
    {
      icon: L.icon({
        iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }
  )
    .addTo(map)
    .bindPopup("Warehouse (Start)");

  map.setView([activeWarehouse.lat, activeWarehouse.lng], 11);
}

updateWarehouse();

/* =========================
   CLUSTER UI + BEST ₹/KM
========================= */
const clusterDiv = document.getElementById("clusters");

// Pre-calculate efficiency for all clusters
clusters.forEach(c => {
  c.totalValue = c.retailers.reduce((s, r) => s + r.value, 0);
  c.estimatedKm = estimateDistance(c.retailers);
  c.efficiency = c.totalValue / c.estimatedKm;
});

// Find best route
const bestCluster = clusters.reduce((best, c) =>
  c.efficiency > best.efficiency ? c : best
);

clusters.forEach(cluster => {
  const div = document.createElement("div");
  div.className = "cluster";

  const isBest = cluster === bestCluster;

  div.style.border = isBest ? "2px solid #2f80ed" : "1px solid #ddd";
  div.style.background = isBest ? "#eaf3ff" : "#fff";

  div.innerHTML = `
    <strong>${cluster.name}</strong> ${isBest ? "⭐ Best Route" : ""}<br/>
    Value: ₹${cluster.totalValue}<br/>
    Est. KM: ${cluster.estimatedKm.toFixed(1)}<br/>
    ₹ / KM: ${cluster.efficiency.toFixed(0)}
  `;

  div.onclick = () => analyzeCluster(cluster);
  clusterDiv.appendChild(div);
});

/* =========================
   ROUTE ANALYSIS
========================= */
function analyzeCluster(cluster) {
  currentCluster = cluster;

  document.getElementById("routeDetails").innerHTML = `
    <p><strong>Warehouse:</strong> ${activeWarehouse.name}</p>
    <p><strong>Route:</strong> ${cluster.name}</p>
    <p><strong>Total Value:</strong> ₹${cluster.totalValue}</p>
    <p><strong>Estimated KM:</strong> ${cluster.estimatedKm.toFixed(1)}</p>
    <p><strong>Sales Efficiency:</strong> ₹${cluster.efficiency.toFixed(0)} / km</p>
  `;

  document.getElementById("kpiKm").innerText =
    cluster.estimatedKm.toFixed(1);

  document.getElementById("kpiScore").innerText =
    `₹${cluster.efficiency.toFixed(0)} / km`;
}

/* =========================
   DISTANCE CALCULATION
========================= */
function estimateDistance(retailers) {
  let dist = 0;
  let prev = activeWarehouse;
  retailers.forEach(r => {
    dist += haversine(prev, r);
    prev = r;
  });
  return dist;
}

function haversine(a, b) {
  const R = 6371;
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
   OSRM ROUTING
========================= */
function buildOSRMCoords(points) {
  return points.map(p => `${p.lng},${p.lat}`).join(";");
}

async function fetchRoute(points) {
  const coords = buildOSRMCoords(points);
  const radiuses = points.map(() => 50).join(";");

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coords}` +
    `?overview=full&geometries=geojson&radiuses=${radiuses}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || !data.routes.length) {
    throw new Error("No route found");
  }

  return data.routes[0].geometry.coordinates;
}

/* =========================
   DRAW ROUTE
========================= */
document.getElementById("planRouteBtn").onclick = async () => {
  if (!currentCluster) return alert("Select a route first");

  if (routeLayer) map.removeLayer(routeLayer);
  clearMarkers();

  const points = [
    { lat: activeWarehouse.lat, lng: activeWarehouse.lng },
    ...currentCluster.retailers
  ];

  let routeCoords;
  try {
    routeCoords = await fetchRoute(points);
  } catch {
    routeCoords = points.map(p => [p.lng, p.lat]);
  }

  const latLngs = routeCoords.map(c => [c[1], c[0]]);

  routeLayer = L.polyline(latLngs, {
    color: "blue",
    weight: 5
  }).addTo(map);

  map.fitBounds(routeLayer.getBounds());

  // Start marker
  const startMarker = L.marker(
    [activeWarehouse.lat, activeWarehouse.lng],
    {
      icon: L.icon({
        iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }
  )
    .addTo(map)
    .bindPopup("Warehouse (Start)");

  markers.push(startMarker);

  // Stop markers
  currentCluster.retailers.forEach((r, i) => {
    const m = L.marker(
      [r.lat, r.lng],
      {
        icon: L.icon({
          iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }
    )
      .addTo(map)
      .bindPopup(`Stop ${i + 1}: ${r.name}`);

    markers.push(m);
  });
};


let fullMap = null;
let fullRouteLayer = null;

document.getElementById("expandMapBtn").onclick = () => {
  document.getElementById("mapOverlay").classList.remove("hidden");

  // Init map only once
  if (!fullMap) {
    fullMap = L.map("mapFull").setView(
      [activeWarehouse.lat, activeWarehouse.lng],
      11
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(fullMap);
  }

  // Draw same route
  if (fullRouteLayer && fullMap.hasLayer(fullRouteLayer)) {
    fullMap.removeLayer(fullRouteLayer);
  }

  if (routeLayer) {
    fullRouteLayer = L.polyline(routeLayer.getLatLngs(), {
      color: "blue",
      weight: 6
    }).addTo(fullMap);

    fullMap.fitBounds(fullRouteLayer.getBounds());
  }
};

document.getElementById("closeMapOverlay").onclick = () => {
  document.getElementById("mapOverlay").classList.add("hidden");
};

