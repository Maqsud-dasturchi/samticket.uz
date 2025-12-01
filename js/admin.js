/* Admin Panel JS - interactive, feature-rich
 * - Works with localStorage keys: allEvents, allUsers, orders, siteSettings, complaints
 * - Requires currentUser.role === "admin"
 * * ✅ Barcha muammolar, jumladan, Foydalanuvchi sonini hisoblash va Modal muammosi bartaraf etildi.
 */

// ---------- Auth check ----------
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
if (!currentUser || currentUser.role !== "admin") {
    alert("Admin huquqi talab etiladi. Iltimos account orqali admin kirish qiling.");
    window.location.href = "./register.html";
}

// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const uid = () => Date.now() + Math.floor(Math.random() * 1000);

function readLS(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function writeLS(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// ---------- Data sources ----------
let allEvents = readLS("allEvents", []);
let allUsers = readLS("allUsers", []);
let orders = readLS("orders", []);
let siteSettings = readLS("siteSettings", { title: "Samticket", footer: "© 2025 Samticket" });
let complaints = readLS("complaints", []);

// ---------- UI Elements ----------
const pages = { 
    dashboard: $("#dashboardPage"), 
    events: $("#eventsPage"), 
    users: $("#usersPage"), 
    orders: $("#ordersPage"), 
    settings: $("#settingsPage"),
    complaints: $("#complaintsPage")
};
const menuItems = $$(".menu-item");

const adminName = $("#adminName"); 
adminName.textContent = currentUser.name || currentUser.username || "Admin";
$("#connectedUser").textContent = currentUser.name || currentUser.username || "admin";

/* Dashboard cards */
const cardEvents = $("#cardEvents"), cardUsers = $("#cardUsers"), cardTickets = $("#cardTickets"), cardRevenue = $("#cardRevenue");
const latestOrders = $("#latestOrders");
const cardComplaints = $("#cardComplaints"); 

/* Events UI */
const eventsGrid = $("#eventsGrid");
const eventModal = $("#eventModal");
const closeModal = $("#closeModal");
const evId = $("#evId"), evTitle = $("#evTitle"), evType = $("#evType"), evDate = $("#evDate"),
    evLocation = $("#evLocation"), evPrice = $("#evPrice"), evTickets = $("#evTickets"),
    evImageUrl = $("#evImageUrl"), evImageFile = $("#evImageFile"), imgPreview = $("#imgPreview"),
    evDesc = $("#evDesc"), saveEventBtn = $("#saveEvent"), cancelEventBtn = $("#cancelEvent"),
    eventsSearch = $("#eventsSearch"), filterType = $("#filterType");

/* Users */
const usersTableBody = $("#usersTable tbody");

/* Orders */
const ordersTableBody = $("#ordersTable tbody");

/* Settings */
const siteTitleInput = $("#siteTitle"), footerTextInput = $("#footerText"), saveSettingsBtn = $("#saveSettings");

/* Search & Theme */
const globalSearch = $("#globalSearch");
const themeToggle = $("#themeToggle");

/* Chart */
const revenueChartCtx = $("#revenueChart") ? $("#revenueChart").getContext("2d") : null;
let revenueChart = null;

/* Complaints UI */
const complaintsTableBody = $("#complaintsTable tbody"); 
const complaintsModal = $("#complaintsModal"); 
const complaintDetails = $("#complaintDetails"); 
const closeComplaintsModalBtn = $("#closeComplaintsModal");

// ---------- Navigation & Page Loading ----------
menuItems.forEach(btn => {
    btn.addEventListener("click", () => {
        menuItems.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // Show/hide pages
        Object.values(pages).forEach(p => p.classList.add("hidden"));
        const page = btn.dataset.page;
        if (pages[page]) pages[page].classList.remove("hidden");
        
        // Refresh data for page
        if (page === "events") renderEvents();
        if (page === "users") renderUsers();
        if (page === "orders") renderOrders();
        if (page === "complaints") renderComplaints();
        if (page === "dashboard") refreshDashboard();
    });
});

// ---------- Logout ----------
$("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "./index.html";
});

// ---------- Dashboard ----------
function refreshDashboard() {
    // ✅ Foydalanuvchilar ma'lumotlarini eng so'nggi holatini yuklash
    allUsers = readLS("allUsers", []); 

    const totalEvents = allEvents.length;
    const totalUsers = allUsers.length; // ✅ ENDI TO'G'RI HISOBLANADI
    const totalTicketsSold = orders.reduce((s, o) => s + (o.quantity || 1), 0);
    const totalRevenue = orders.reduce((s, o) => s + (Number(o.price) || 0) * (o.quantity || 1), 0);
    const newComplaintsCount = complaints.filter(c => c.status === 'Yangi').length;

    cardEvents.textContent = totalEvents;
    cardUsers.textContent = totalUsers;
    cardTickets.textContent = totalTicketsSold;
    cardRevenue.textContent = totalRevenue.toLocaleString();
    
    if (cardComplaints) cardComplaints.textContent = newComplaintsCount;

    // Latest orders
    latestOrders.innerHTML = "";
    orders.slice().reverse().slice(0, 6).forEach(o => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${o.event}</strong> — ${o.user}</div><div class="muted">${new Date(o.date).toLocaleString()}</div>`;
        latestOrders.appendChild(li);
    });

    if (revenueChartCtx) renderRevenueChart();
}


// ---------- Revenue Chart (Logic unchanged) ----------
function renderRevenueChart() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleString('default', { month: 'short', year: 'numeric' }), start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0) });
    }
    const data = months.map(m => {
        const total = orders.reduce((s, o) => {
            const od = new Date(o.date);
            if (od >= m.start && od <= m.end) return s + (Number(o.price) || 0) * (o.quantity || 1);
            return s;
        }, 0);
        return total;
    });

    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(revenueChartCtx, {
        type: 'line',
        data: { labels: months.map(m => m.label), datasets: [{ label: 'Revenue', data, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.12)', tension: 0.35, fill: true }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// ---------- Events render (Logic unchanged) ----------
function renderEvents(filter = 'all', search = '') {
    eventsGrid.innerHTML = "";
    const list = allEvents.slice().filter(ev => {
        if (filter !== 'all' && ev.type !== filter) return false;
        if (search && !(`${ev.title} ${ev.description} ${ev.location} ${ev.type}`.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
    });

    if (list.length === 0) {
        eventsGrid.innerHTML = `<div class="muted">No events found.</div>`;
        return;
    }

    list.forEach(ev => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <img src="${ev.image || ''}" onerror="this.style.display='none'"/>
            <div class="event-body">
              <div class="event-title">${ev.title}</div>
              <div class="event-meta">${ev.type} • ${new Date(ev.date).toLocaleString()}</div>
              <div class="event-meta">${ev.location}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                <div style="font-weight:700">${Number(ev.price).toLocaleString()} so'm</div>
                <div class="event-actions">
                  <button class="action-btn btn" data-action="edit" data-id="${ev.id}">Edit</button>
                  <button class="action-btn btn ghost" data-action="delete" data-id="${ev.id}">Delete</button>
                </div>
              </div>
            </div>
          `;
        eventsGrid.appendChild(card);
    });

    eventsGrid.querySelectorAll('[data-action="edit"]').forEach(b => b.addEventListener('click', e => openEditModal(e.target.dataset.id)));
    eventsGrid.querySelectorAll('[data-action="delete"]').forEach(b => b.addEventListener('click', e => { 
        if (confirm("O'chirishni tasdiqlaysizmi?")) deleteEvent(Number(e.target.dataset.id)); 
    }));
}

// ---------- Add / Edit modal (Tuzatilgan: aria-hidden) ----------
function openAddModal() {
    resetModal();
    $("#modalTitle").textContent = "New Event";
    eventModal.setAttribute('aria-hidden', 'false'); // ✅ Fix: Modalni ochish
    evTitle.focus();
}

function openEditModal(id) {
    const ev = allEvents.find(x => String(x.id) === String(id));
    if (!ev) return alert("Event not found");
    $("#modalTitle").textContent = "Edit Event";
    evId.value = ev.id;
    evTitle.value = ev.title;
    evType.value = ev.type || 'Sport';
    evDate.value = ev.date;
    evLocation.value = ev.location;
    evPrice.value = ev.price;
    evTickets.value = ev.tickets || ev.totalTickets || 0;
    evImageUrl.value = ev.image || '';
    evDesc.value = ev.description || '';
    if (ev.image) { imgPreview.src = ev.image; imgPreview.style.display = 'block'; }
    else { imgPreview.style.display = 'none'; }
    eventModal.setAttribute('aria-hidden', 'false'); // ✅ Fix: Modalni ochish
}

function resetModal() {
    evId.value = ""; evTitle.value = ""; evType.value = "Sport"; evDate.value = ""; evLocation.value = ""; evPrice.value = "0"; evTickets.value = "0";
    evImageUrl.value = ""; evDesc.value = ""; evImageFile.value = ""; imgPreview.src = ""; imgPreview.style.display = 'none';
}

$("#openAddEvent").addEventListener("click", openAddModal);

function closeEventModal() {
    eventModal.setAttribute('aria-hidden', 'true');
}
closeModal.addEventListener("click", closeEventModal);
cancelEventBtn.addEventListener("click", closeEventModal);


evImageUrl.addEventListener("input", () => {
    const url = evImageUrl.value.trim();
    if (!url) { imgPreview.style.display = 'none'; return; }
    imgPreview.src = url; imgPreview.style.display = 'block';
});

evImageFile.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        imgPreview.src = evt.target.result; imgPreview.style.display = 'block';
        evImageUrl.value = evt.target.result; 
    };
    reader.readAsDataURL(f);
});

// save event
saveEventBtn.addEventListener("click", () => {
    const title = evTitle.value.trim();
    if (!title) return showNotification("Title required", 'error');
    
    const obj = {
        id: evId.value ? Number(evId.value) : uid(),
        title,
        type: evType.value,
        date: evDate.value,
        location: evLocation.value,
        price: Number(evPrice.value) || 0,
        totalTickets: Number(evTickets.value) || 0,
        availableTickets: Number(evTickets.value) || 0,
        image: evImageUrl.value.trim(),
        description: evDesc.value.trim()
    };

    if (evId.value) {
        allEvents = allEvents.map(e => e.id === obj.id ? { ...e, ...obj } : e);
    } else {
        allEvents.push(obj);
    }
    writeLS("allEvents", allEvents);
    closeEventModal();
    renderEvents(filterType.value, eventsSearch.value);
    refreshDashboard();
    showNotification("Event saved successfully!", 'success');
});

// delete
function deleteEvent(id) {
    allEvents = allEvents.filter(e => e.id !== id);
    writeLS("allEvents", allEvents);
    renderEvents(filterType.value, eventsSearch.value);
    refreshDashboard();
    showNotification("Event deleted.", 'info');
}

// ---------- Users ----------
function renderUsers() {
    // Ro'yxatdan o'tgan foydalanuvchilarning eng so'nggi ma'lumotlarini yuklash
    allUsers = readLS("allUsers", []); 
    
    const tbody = usersTableBody;
    tbody.innerHTML = "";
    allUsers.forEach((u, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${i + 1}</td><td>${u.name || u.username || '—'}</td><td>${u.email || '—'}</td><td>${new Date(u.registered || u.registeredAt || Date.now()).toLocaleString()}</td>
          <td><button class="action-btn btn" data-uid="${u.id}" data-action="block">${u.blocked ? 'Unblock' : 'Block'}</button></td>`;
        tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-action="block"]').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = b.dataset.uid;
            allUsers = allUsers.map(u => u.id == id ? { ...u, blocked: !u.blocked } : u);
            writeLS("allUsers", allUsers);
            renderUsers();
            showNotification(`User ${u.blocked ? 'unblocked' : 'blocked'}`, 'info');
        });
    });
}

// ---------- Orders (Logic unchanged) ----------
function renderOrders() {
    const tbody = ordersTableBody;
    tbody.innerHTML = "";
    orders.slice().reverse().forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${o.id}</td><td>${o.user}</td><td>${o.event}</td><td>${o.quantity || 1}</td><td>${Number(o.price).toLocaleString()}</td><td>${new Date(o.date).toLocaleString()}</td>
          <td><button class="action-btn btn" data-id="${o.id}" data-action="refund">Refund</button></td>`;
        tbody.appendChild(tr);
    });
    tbody.querySelectorAll('[data-action="refund"]').forEach(b => b.addEventListener('click', e => {
        const id = b.dataset.id;
        if (!confirm("Refund va o'chirish?")) return;
        orders = orders.filter(x => x.id != id);
        writeLS("orders", orders);
        renderOrders(); refreshDashboard();
        showNotification(`Order #${id} refunded.`, 'success');
    }));
}


// ----------------------------------------------------------------
// SHIKOYATLAR SAHIFASI (Tuzatilgan: aria-hidden)
// ----------------------------------------------------------------

function renderComplaints() {
    complaints = readLS("complaints", []); 
    const sortedComplaints = complaints.slice().sort((a, b) => b.id - a.id); 
    complaintsTableBody.innerHTML = "";

    if (sortedComplaints.length === 0) {
        complaintsTableBody.innerHTML = `<tr><td colspan="6" class="muted" style="text-align: center;">Hozircha shikoyatlar yo'q.</td></tr>`;
        return;
    }
    
    sortedComplaints.forEach(c => {
        const tr = document.createElement("tr");
        const statusClass = c.status === 'Yangi' ? 'status-new' : (c.status === "Ko'rildi" || c.status === "Yechildi") ? 'status-viewed' : 'status-closed';
        
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.subject.length > 50 ? c.subject.substring(0, 50) + '...' : c.subject}</td>
            <td>${new Date(c.date).toLocaleString()}</td>
            <td>
                <span class="status-badge ${statusClass}">${c.status}</span>
            </td>
            <td>
                <button class="action-btn btn" data-action="view" data-id="${c.id}">Ko'rish</button>
            </td>
        `;
        complaintsTableBody.appendChild(tr);
    });
    
    complaintsTableBody.querySelectorAll('[data-action="view"]').forEach(b => {
        b.addEventListener('click', (e) => openComplaintDetails(Number(e.target.dataset.id)));
    });

    refreshDashboard();
}

function openComplaintDetails(id) {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return showNotification("Shikoyat topilmadi!", 'error');

    complaintDetails.innerHTML = `
        <h3>Shikoyat ID: ${complaint.id}</h3>
        <p><strong>Yuboruvchi:</strong> ${complaint.name} (${complaint.email})</p>
        <p><strong>Sana:</strong> ${new Date(complaint.date).toLocaleString()}</p>
        <p><strong>Mavzu:</strong> ${complaint.subject}</p>
        <hr>
        <p><strong>Xabar:</strong></p>
        <div class="complaint-message-box">${complaint.message}</div>
        <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
            <strong>Holat:</strong>
            <select id="complaintStatusSelect" data-id="${complaint.id}">
                <option value="Yangi" ${complaint.status === 'Yangi' ? 'selected' : ''}>Yangi</option>
                <option value="Ko'rildi" ${complaint.status === "Ko'rildi" ? 'selected' : ''}>Ko'rildi</option>
                <option value="Yechildi" ${complaint.status === "Yechildi" ? 'selected' : ''}>Yechildi</option>
                <option value="Yopildi" ${complaint.status === 'Yopildi' ? 'selected' : ''}>Yopildi</option>
            </select>
        </div>
    `;

    // ✅ FIX: Modalni aria-hidden orqali ochish
    complaintsModal.setAttribute('aria-hidden', 'false');

    $("#complaintStatusSelect").addEventListener('change', (e) => {
        updateComplaintStatus(id, e.target.value);
    });

    // Avtomatik ravishda 'Yangi' holatni 'Ko'rildi' ga o'zgartirish
    if (complaint.status === 'Yangi') {
        updateComplaintStatus(id, "Ko'rildi", false); 
        $("#complaintStatusSelect").value = "Ko'rildi";
    }
}

function updateComplaintStatus(id, newStatus, shouldRender = true) {
    complaints = complaints.map(c => c.id === id ? { ...c, status: newStatus } : c);
    writeLS("complaints", complaints);
    if (shouldRender) {
        renderComplaints();
        showNotification(`Shikoyat #${id} holati "${newStatus}" ga o'zgartirildi.`, 'info');
    }
}

// ✅ FIX: Modalni aria-hidden orqali yopish
closeComplaintsModalBtn.addEventListener('click', () => {
    complaintsModal.setAttribute('aria-hidden', 'true');
    renderComplaints();
});

// ----------------------------------------------------------------
// SHIKOYATLAR MANTIQI TUGADI
// ----------------------------------------------------------------

// ---------- Settings ----------
siteTitleInput.value = siteSettings.title || "";
footerTextInput.value = siteSettings.footer || "";
saveSettingsBtn.addEventListener("click", () => {
    siteSettings.title = siteTitleInput.value;
    siteSettings.footer = footerTextInput.value;
    writeLS("siteSettings", siteSettings);
    showNotification("Settings Saved", 'success');
});

// ---------- Search & filter (Logic unchanged) ----------
eventsSearch.addEventListener("input", () => renderEvents(filterType.value, eventsSearch.value));
filterType.addEventListener("change", () => renderEvents(filterType.value, eventsSearch.value));
globalSearch.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderEvents('all', q);
});

// ---------- Theme toggle (Tuzatilgan: data-theme) ----------
themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    
    themeToggle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 300 });
});


// ---------- Notification helper (CSS faylga qo'shish tavsiya etilgan) ----------
function showNotification(message, type = 'info') {
    const notificationContainer = document.querySelector('.notification-container') || document.createElement('div');
    if (!notificationContainer.classList.contains('notification-container')) {
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Notification CSS allaqachon admin.css da bor deb hisoblanadi.
    
    notificationContainer.appendChild(notification);
    // Animatsiya
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// ---------- Initial render ----------
renderEvents();
renderUsers();
renderOrders();
renderComplaints();
refreshDashboard();

// Ensure the default page is Dashboard
const dashboardBtn = $('[data-page="dashboard"]');
const activePage = $(".menu-item.active");

if (activePage && activePage.dataset.page !== 'dashboard') {
    // Agar dastlabki faol sahifa Dashboard bo'lmasa, uni ko'rsatish
    Object.values(pages).forEach(p => p.classList.add("hidden"));
    pages[activePage.dataset.page].classList.remove('hidden');
} else if (dashboardBtn) {
    // Agar menyu bo'lsa va hali sahifa ko'rsatilmagan bo'lsa, Dashboardni ko'rsatish
    dashboardBtn.classList.add('active');
    pages.dashboard.classList.remove('hidden');
}
