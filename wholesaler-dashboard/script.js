/* =========================
   WAREHOUSES (START POINT)
========================= */
const warehouses = [
  {
    id: 1,
    name: "Aluva Main Godown",
    lat: 10.1100,
    lng: 76.3500,
    vehicles: 3
  },
  {
    id: 2,
    name: "Angamaly Secondary Store",
    lat: 10.1960,
    lng: 76.3860,
    vehicles: 1
  }
];

let activeWarehouse = warehouses[0];

/* =========================
   CLUSTERS (RETAILERS)
========================= */
const clusters = [
  {
    name: "Aluva Cluster",
    retailers: [
      { name: "Retailer A", lat: 10.1076, lng: 76.3516, value: 25000 },
      { name: "Retailer B", lat: 10.1100, lng: 76.3600, value: 18000 }
    ]
  },
  {
    name: "Angamaly Cluster",
    retailers: [
      { name: "Retailer C", lat: 10.2100, lng: 76.3950, value: 30000 }
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

let routeLayer;
let warehouseMarker;
let currentCluster;

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
  activeWarehouse = warehouses.find(
    w => w.id == warehouseSelect.value
  );
  updateWarehouse();
};

function updateWarehouse() {
  warehouseInfo.textContent =
    `📍 ${activeWarehouse.vehicles} Vehicles Available`;

  if (warehouseMarker) map.removeLayer(warehouseMarker);

  warehouseMarker = L.marker(
    [activeWarehouse.lat, activeWarehouse.lng],
    { title: activeWarehouse.name }
  ).addTo(map);

  map.setView([activeWarehouse.lat, activeWarehouse.lng], 11);
}

updateWarehouse();

/* =========================
   CLUSTER UI
========================= */
const clusterDiv = document.getElementById("clusters");

clusters.forEach(cluster => {
  const div = document.createElement("div");
  div.className = "cluster";
  div.innerHTML = `
    <strong>${cluster.name}</strong>
    Retailers: ${cluster.retailers.length}<br/>
    Value: ₹${cluster.retailers.reduce((s, r) => s + r.value, 0)}
  `;
  div.onclick = () => analyzeCluster(cluster);
  clusterDiv.appendChild(div);
});

/* =========================
   ROUTE ANALYSIS
========================= */
function analyzeCluster(cluster) {
  currentCluster = cluster;

  const totalValue = cluster.retailers.reduce((s, r) => s + r.value, 0);
  const totalKm = estimateDistance(cluster.retailers);
  const score = (totalValue / totalKm).toFixed(0);

  document.getElementById("routeDetails").innerHTML = `
    <p><strong>Warehouse:</strong> ${activeWarehouse.name}</p>
    <p><strong>Cluster:</strong> ${cluster.name}</p>
    <p><strong>Total Value:</strong> ₹${totalValue}</p>
    <p><strong>Estimated KM:</strong> ${totalKm.toFixed(1)}</p>
    <p><strong>₹ / KM:</strong> ${score}</p>
  `;

  document.getElementById("kpiKm").innerText = totalKm.toFixed(1);
  document.getElementById("kpiScore").innerText = score;
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
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) *
      Math.cos(b.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

/* =========================
   DRAW ROUTE
========================= */
document.getElementById("planRouteBtn").onclick = () => {
  if (!currentCluster) return alert("Select a cluster");

  if (routeLayer) map.removeLayer(routeLayer);

  const points = [
    [activeWarehouse.lat, activeWarehouse.lng],
    ...currentCluster.retailers.map(r => [r.lat, r.lng])
  ];

  routeLayer = L.polyline(points, { color: "blue" }).addTo(map);
  map.fitBounds(routeLayer.getBounds());
};
