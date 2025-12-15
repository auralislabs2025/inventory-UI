/* ======================
   DATA
====================== */
const warehouses = [
  { id: 1, name: "Trivandrum Central Godown", lat: 8.5241, lng: 76.9366 },
  { id: 2, name: "Attingal Depot", lat: 8.6960, lng: 76.8150 }
];

const clusters = [
  {
    name: "Attingal – Kallambalam Belt",
    revenue: 96000,
    stops: [
      [8.6961, 76.8154], // Attingal
      [8.7148, 76.8031], // Kallambalam
      [8.7353, 76.7945]  // Navaikulam
    ]
  },
  {
    name: "Varkala – Paravur Belt",
    revenue: 78000,
    stops: [
      [8.7379, 76.7163], // Varkala
      [8.7552, 76.7012], // Edava
      [8.7785, 76.6849]  // Paravur
    ]
  },
  {
    name: "Kilimanoor – Nagaroor Belt",
    revenue: 88000,
    stops: [
      [8.7526, 76.8731], // Kilimanoor
      [8.7639, 76.8614], // Nagaroor
      [8.7812, 76.8523]  // Pazhayakunnummel
    ]
  },
  {
    name: "Nedumangad – Vattapara Belt",
    revenue: 102000,
    stops: [
      [8.6010, 77.0014], // Nedumangad
      [8.6168, 76.9913], // Vattapara
      [8.6365, 76.9782]  // Karakulam
    ]
  }
];


let activeWarehouse = warehouses[0];
let activeCluster = clusters[0];
let map, routeLayer;

/* ======================
   INIT WAREHOUSE SELECT
====================== */
const whSelect = document.getElementById("warehouseSelect");
warehouses.forEach(w => {
  const opt = document.createElement("option");
  opt.value = w.id;
  opt.textContent = w.name;
  whSelect.appendChild(opt);
});
whSelect.onchange = () => {
  activeWarehouse = warehouses.find(w => w.id == whSelect.value);
  document.getElementById("activeWarehouseLabel").innerText = activeWarehouse.name;
  recalc();
};

/* ======================
   METRICS
====================== */
function recalc() {
  clusters.forEach(c => {
    c.km = Math.round(
      Math.sqrt(
        Math.pow(c.stops[0][0] - activeWarehouse.lat, 2) +
        Math.pow(c.stops[0][1] - activeWarehouse.lng, 2)
      ) * 111
    );
    c.score = Math.round(c.revenue / c.km);
  });

  clusters.sort((a,b) => b.score - a.score);
  activeCluster = clusters[0];
  renderUI();
}

/* ======================
   UI
====================== */
function renderUI() {
  document.getElementById("bestRouteName").innerText = activeCluster.name;
  document.getElementById("bestRevenue").innerText = "₹" + activeCluster.revenue;
  document.getElementById("bestKm").innerText = activeCluster.km + " km";
  document.getElementById("bestScore").innerText = "₹" + activeCluster.score;

  const list = document.getElementById("routeList");
  list.innerHTML = "";
  clusters.forEach(c => {
    const div = document.createElement("div");
    div.className = "route-card";
    div.innerHTML = `<strong>${c.name}</strong><br/>₹${c.revenue} • ${c.km} km`;
    div.onclick = () => {
      activeCluster = c;
      renderUI();
      openMap();
    };
    list.appendChild(div);
  });
}

/* ======================
   MAP + OSRM (MULTI-STOP)
====================== */
function openMap() {
  document.getElementById("mapOverlay").style.display = "flex";
  document.getElementById("mapTitle").innerText = activeCluster.name;

  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([activeWarehouse.lat, activeWarehouse.lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    }

    if (routeLayer) map.removeLayer(routeLayer);

    const coords = [
      `${activeWarehouse.lng},${activeWarehouse.lat}`,
      ...activeCluster.stops.map(s => `${s[1]},${s[0]}`)
    ].join(";");

    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(d => {
        routeLayer = L.geoJSON(d.routes[0].geometry, {
          style: { color: "#2563eb", weight: 5 }
        }).addTo(map);

        // START
        L.marker([activeWarehouse.lat, activeWarehouse.lng], {
          icon: L.icon({
            iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
            iconSize: [32,32]
          })
        }).addTo(map);

        // END
        const last = activeCluster.stops.at(-1);
        L.marker(last, {
          icon: L.icon({
            iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
            iconSize: [32,32]
          })
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds());
      });

    map.invalidateSize();
  }, 200);
}

/* ======================
   EVENTS
====================== */
document.getElementById("openMapBtn").onclick = openMap;
document.getElementById("closeMap").onclick = () =>
  document.getElementById("mapOverlay").style.display = "none";

const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("drawerBackdrop");

function openDrawer() {
  drawer.classList.add("open");
  backdrop.classList.add("open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
}

document.getElementById("hamburger").onclick = openDrawer;
document.getElementById("closeDrawer").onclick = closeDrawer;
backdrop.onclick = closeDrawer;


/* INIT */
recalc();
