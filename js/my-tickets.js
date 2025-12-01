// js/my-tickets.js - Yakunlangan buyurtmalar tarixini ko'rsatish

document.addEventListener("DOMContentLoaded", function() {

    const ORDER_LIST_EL = document.getElementById('order-history-list');
    const EMPTY_MESSAGE_EL = document.getElementById('empty-history-message');
    // Modal elementlari
    const MODAL_OVERLAY = document.getElementById('order-details-modal'); 
    const CLOSE_MODAL_BTN = document.getElementById('close-modal-btn');
    
    const CONFIRMED_ORDERS_KEY = 'confirmedOrdersList'; 
    let confirmedOrdersCache = []; // Ma'lumotni keshga olish

    // --- 1. Ma'lumotni Yuklash ---

    function loadConfirmedOrders() {
        if (typeof cartManager === 'undefined' || !cartManager.getEventDetails) {
            console.error("cartManager topilmadi. JS fayllari tartibini tekshiring.");
            return [];
        }

        try {
            const storedOrders = localStorage.getItem(CONFIRMED_ORDERS_KEY);
            confirmedOrdersCache = JSON.parse(storedOrders) || []; 
            return confirmedOrdersCache;
        } catch (e) {
            console.error("Buyurtmalar ro'yxatini yuklashda xato:", e);
            return [];
        }
    }

    // --- 2. Buyurtma Tarixini Chizish ---
    
    function renderOrderHistory() {
        const orders = loadConfirmedOrders(); 

        if (!ORDER_LIST_EL || !EMPTY_MESSAGE_EL) {
            console.error("HTML elementlari topilmadi. ID nomlarini tekshiring.");
            return;
        }

        if (!orders || orders.length === 0) {
            ORDER_LIST_EL.innerHTML = '';
            ORDER_LIST_EL.style.display = 'none';
            EMPTY_MESSAGE_EL.style.display = 'block';
            return;
        }
        
        ORDER_LIST_EL.style.display = 'grid';
        EMPTY_MESSAGE_EL.style.display = 'none';

        let html = orders.map(order => {
            if (!order || !order.summary || !order.items || order.items.length === 0) {
                return '';
            }
            
            const primaryItem = order.items[0];
            
            // Tadbir ma'lumotlarini topish (cart.js dan)
            const eventDetails = cartManager.getEventDetails(primaryItem.eventId);
            
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const statusClass = order.status === 'Paid' ? 'status-paid' : 'status-pending';
            const formattedTotal = order.summary.total.toLocaleString('uz-UZ', {minimumFractionDigits: 0});
            const formattedDate = new Date(order.purchaseDate).toLocaleDateString('uz-UZ');
            
            const eventLocation = eventDetails ? eventDetails.location : 'Noma\'lum Joy';
            
            return `
                <div class="order-card">
                    <div class="card-header">
                        <span class="order-id">#${order.orderId || 'N/A'}</span>
                        <span class="order-status ${statusClass}">${order.status || 'Noma\'lum'}</span>
                    </div>
                    <div class="card-body">
                        <h3>${primaryItem.title || 'Noma\'lum Tadbir'}</h3>
                        <p class="order-location"><i class="fas fa-map-marker-alt"></i> ${eventLocation}</p>
                        <p class="order-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</p>
                        <p class="order-details">
                            <i class="fas fa-ticket-alt"></i> ${totalItems} ta chipta
                        </p>
                        <p class="order-total">
                            <i class="fas fa-money-bill-wave"></i> Jami: <strong>${formattedTotal} UZS</strong>
                        </p>
                    </div>
                    <div class="card-footer">
                        <button class="btn secondary-btn view-details" data-order-id="${order.orderId}">
                            Chekni Ko'rish
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        ORDER_LIST_EL.innerHTML = html;

        // Modal tugmalarini ulash
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', handleViewDetails);
        });
    }

    // --- 3. Modal Mantig'i (Chekni Chizish) ---

    function handleViewDetails(e) {
        const orderId = e.currentTarget.dataset.orderId;
        const order = confirmedOrdersCache.find(o => o.orderId === orderId);

        if (!order) {
            alert("Buyurtma topilmadi!");
            return;
        }
        
        renderReceipt(order); 
        if(MODAL_OVERLAY) MODAL_OVERLAY.style.display = 'flex';
    }

    function renderReceipt(order) {
        // ... (Bu funksiya yuqorida biz yaratgan modal kontentini JS orqali to'ldiradi) ...
        // HTML element IDlarini tekshiring: ticket-order-details, ticket-items-list, ticket-summary-details

        const eventDetails = cartManager.getEventDetails(order.items[0].eventId);

        document.getElementById('ticket-order-details').innerHTML = `
            <p><strong>Buyurtma ID:</strong> #${order.orderId}</p>
            <p><strong>Tadbir:</strong> ${order.items[0].title}</p>
            <p><strong>Manzil:</strong> ${eventDetails ? eventDetails.location : 'Noma\'lum'}</p>
            <p><strong>Sana/Vaqt:</strong> ${new Date(order.purchaseDate).toLocaleDateString()} / ${eventDetails ? eventDetails.time : 'N/A'}</p>
            <p><strong>Xaridor:</strong> ${order.customer.name}</p>
        `;

        // ... qolgan modal rendering qismi avvalgidek qoladi ...
        document.getElementById('ticket-items-list').innerHTML = `
            ${order.items.map(item => `
                <div class="ticket-item">
                    <span>${item.quantity} x ${item.title}</span>
                    <strong>${(item.quantity * item.price).toLocaleString('uz-UZ')} UZS</strong>
                </div>
            `).join('')}
        `;

        document.getElementById('ticket-summary-details').innerHTML = `
            <div class="summary-line-modal"><span>Jami Narxi:</span><strong>${order.summary.subtotal.toLocaleString('uz-UZ')} UZS</strong></div>
            <div class="summary-line-modal"><span>Komissiya:</span><strong>${order.summary.fee.toLocaleString('uz-UZ')} UZS</strong></div>
            <div class="summary-line-modal total"><span>YAKUNIY TO'LOV:</span><strong>${order.summary.total.toLocaleString('uz-UZ')} UZS</strong></div>
        `;
    }

    // --- 4. Modalni Yopish ---
    
    function closeModal() {
        if(MODAL_OVERLAY) MODAL_OVERLAY.style.display = 'none';
    }

    if(CLOSE_MODAL_BTN) {
        CLOSE_MODAL_BTN.addEventListener('click', closeModal);
    }
    if(MODAL_OVERLAY) {
        MODAL_OVERLAY.addEventListener('click', (e) => {
            if (e.target === MODAL_OVERLAY) {
                closeModal();
            }
        });
    }

    // Sahifani ishga tushirish
    renderOrderHistory();
});