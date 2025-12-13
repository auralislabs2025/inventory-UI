/* ===============================
   Utility Functions
=============================== */

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&"'<>]/g, function (m) {
        return { "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" }[m];
    });
}

/* ===============================
   Marketplace Data
=============================== */

const marketplaceProducts = [
    { id: 1, name: "Wireless Mouse Pro", category: "Electronics",
      img: "https://images.unsplash.com/photo-1527864550417-7fd4c7c1b8f7?w=400",
      neededBy: "2025-12-20",
      offers: [
        { vendor: "TechSupplier Inc", price: 22.50, moq: 100, delivery: "5 days", rating: 4.8 },
        { vendor: "Global Electronics", price: 21.90, moq: 50, delivery: "7 days", rating: 4.6 },
        { vendor: "Component World", price: 23.20, moq: 200, delivery: "3 days", rating: 4.9 }
      ]
    },

    { id: 2, name: "USB-C Hub 7-in-1", category: "Accessories",
      img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
      neededBy: "2025-12-18",
      offers: [
        { vendor: "Budget Parts Co", price: 38.00, moq: 30, delivery: "10 days", rating: 4.2 },
        { vendor: "TechSupplier Inc", price: 36.50, moq: 50, delivery: "6 days", rating: 4.8 }
      ]
    },

    { id: 3, name: "Mechanical Keyboard RGB", category: "Electronics",
      img: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400",
      neededBy: "2025-12-25",
      offers: [
        { vendor: "Component World", price: 118.00, moq: 20, delivery: "4 days", rating: 4.9 },
        { vendor: "Global Electronics", price: 122.50, moq: 10, delivery: "8 days", rating: 4.6 }
      ]
    },

    { id: 4, name: "HDMI Cable 2m", category: "Cables",
      img: "https://images.unsplash.com/photo-1591395604231-0d9e2a5c89df?w=400",
      neededBy: "2025-12-22",
      offers: []
    }
];

/* ===============================
   Marketplace UI Rendering
=============================== */

function renderMarketplace() {
    const grid = document.getElementById("marketplaceGrid");

    grid.innerHTML = marketplaceProducts
        .map(p => {
            const minPrice = p.offers.length
                ? Math.min(...p.offers.map(o => o.price)).toFixed(2)
                : "N/A";

            return `
            <div class="market-card" onclick="openProductModal(${p.id})">
                <img src="${p.img}">
                <div class="market-card-body">
                    <div class="market-card-title">${escapeHtml(p.name)}</div>
                    <div class="market-card-text">${escapeHtml(p.category)} • Need by ${p.neededBy}</div>
                    <div class="market-price-range">From $${minPrice}</div>
                    <span class="market-offers">${p.offers.length} offers</span>
                </div>
            </div>
        `;
        })
        .join("");
}

/* ===============================
   Marketplace Product Modal
=============================== */

let selectedProduct = null;

function openProductModal(id) {
    selectedProduct = marketplaceProducts.find(p => p.id === id);
    if (!selectedProduct) return showToast("Product not found");

    document.getElementById("modalProductName").textContent = selectedProduct.name;
    document.getElementById("modalCategory").textContent = selectedProduct.category;
    document.getElementById("modalNeededBy").textContent = selectedProduct.neededBy;
    document.getElementById("modalProductImage").src = selectedProduct.img;

    const tbody = document.getElementById("vendorOffersBody");
    const offers = selectedProduct.offers.slice().sort((a, b) => a.price - b.price);

    if (!offers.length) {
        tbody.innerHTML =
            `<tr><td colspan="6" style="padding:20px;text-align:center;color:#777">No offers available.</td></tr>`;
        document.getElementById("createPOBtn").style.display = "none";
    } else {
        tbody.innerHTML = offers
            .map((o, i) => `
            <tr style="${i === 0 ? "background:#e8f5e8" : ""}">
              <td><strong>${escapeHtml(o.vendor)}</strong></td>
              <td>$${o.price}</td>
              <td>${o.moq}</td>
              <td>${o.delivery}</td>
              <td>${"★".repeat(Math.floor(o.rating))}${"☆".repeat(5 - Math.floor(o.rating))}</td>
              <td><input type="radio" name="selectedOffer" value="${i}" ${i === 0 ? "checked" : ""}></td>
            </tr>
        `)
            .join("");

        document.getElementById("createPOBtn").style.display = "inline-block";
    }

    openModal("marketplaceModal");
}

function createPOFromOffer() {
    const selected = document.querySelector('input[name="selectedOffer"]:checked');
    if (!selected) return showToast("Select a vendor offer");

    const offer = selectedProduct.offers[selected.value];

    showToast(`PO created with ${offer.vendor} @ $${offer.price}/unit`);
    closeModal();
}

/* ===============================
   Modal Helpers
=============================== */

function openModal(id) {
    document.getElementById(id).classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
    document.body.style.overflow = "";
}

/* ===============================
   Vendor Listing
=============================== */

function renderVendors() {
    const grid = document.getElementById("vendorGrid");
    grid.innerHTML = "";

    window.VENDORS.forEach(v => {
        grid.innerHTML += `
        <div class="vendor-card">
            <div>
                <div class="vendor-name">${escapeHtml(v.name)}</div>
                <div style="color:#666;font-size:0.9rem">${escapeHtml(v.contact)}</div>
            </div>

            <div class="vendor-actions">
                <button class="btn btn-sm" onclick="openVendorModal(${v.id})">View Products</button>
                <button class="btn btn-sm btn-primary" onclick="openVendorModal(${v.id}, {autoFocusFirst:true})">
                    Place Order
                </button>
            </div>
        </div>
        `;
    });
}

/* ===============================
   Vendor Modal Functions
=============================== */

function openVendorModal(id, opts = {}) {
    const vendor = window.VENDORS.find(v => v.id === id);
    if (!vendor) return;

    document.getElementById("vendorModalTitle").textContent =
        `${vendor.name} — ${vendor.contact}`;

    const container = document.getElementById("vendorProductsContainer");
    container.innerHTML = "";

    vendor.products.forEach(prod => {
        container.innerHTML += `
        <div style="border:1px solid #eee;padding:12px;border-radius:8px;margin-bottom:10px;display:flex;justify-content:space-between">
            <div>
                <div style="font-weight:600">${escapeHtml(prod.name)}</div>
                <div style="font-size:12px;color:#666">
                    SKU: ${prod.sku} • Stock: ${prod.stock}
                </div>
            </div>

            <div style="display:flex;align-items:center;gap:10px">
                <strong>₹${prod.price}</strong>
                <input type="number" min="1" max="${prod.stock}" value="1"
                       class="vendor-order-qty" data-pid="${prod.id}"
                       style="width:70px;padding:6px;border-radius:6px;border:1px solid #ccc">
                <button class="btn btn-success btn-sm"
                        onclick="placeOrder(${vendor.id}, ${prod.id})">
                    Order
                </button>
            </div>
        </div>`;
    });

    openModal("vendorModal");

    if (opts.autoFocusFirst) {
        setTimeout(() => {
            const input = container.querySelector(".vendor-order-qty");
            if (input) input.focus();
        }, 150);
    }
}

function closeVendorModal() {
    closeModal();
}

/* ===============================
   Place Order (Vendor)
=============================== */

function placeOrder(vendorId, productId) {
    const vendor = window.VENDORS.find(v => v.id === vendorId);
    const product = vendor.products.find(p => p.id === productId);

    const qtyInput = document.querySelector(`input[data-pid='${productId}']`);
    let qty = Number(qtyInput.value);
    if (qty < 1) qty = 1;

    if (qty > product.stock)
        return showToast("Quantity exceeds available stock");

    const order = {
        id: "VO-" + Date.now(),
        vendor: vendor.name,
        product: product.name,
        qty,
        total: qty * product.price,
        ts: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem("vendor_orders") || "[]");
    existing.push(order);
    localStorage.setItem("vendor_orders", JSON.stringify(existing));

    product.stock -= qty;

    showToast("Order placed successfully");
    openVendorModal(vendorId);
}

/* ===============================
   Init
=============================== */

renderMarketplace();
renderVendors();
