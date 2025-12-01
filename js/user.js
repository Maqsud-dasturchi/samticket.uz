// js/user-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userNameDisplay = document.getElementById('userNameDisplay');
    const ordersListContainer = document.getElementById('orders-list-container');
    const noOrdersMessage = document.getElementById('no-orders-message');
    const loadingMessage = document.getElementById('loading-message');
    
    // Foydalanuvchini tekshirish
    if (!user || user.role === 'guest') {
        alert("Foydalanuvchi paneli uchun avval tizimga kiring.");
        window.location.href = './register.html'; // Tizimga kirish sahifasiga yo'naltirish
        return;
    }
    
    userNameDisplay.textContent = user.name || user.username || 'Foydalanuvchi';
    loadingMessage.style.display = 'none';

    // Buyurtmalarni yuklash
    function loadOrders() {
        // Buyurtmalar ro'yxatini yuklash
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        
        // Faqat joriy foydalanuvchiga tegishli buyurtmalarni filtrlash
        const userOrders = allOrders.filter(order => order.userId === user.id);
        
        if (userOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
            ordersListContainer.innerHTML = '';
            return;
        }
        
        renderOrders(userOrders);
    }

    function renderOrders(orders) {
        ordersListContainer.innerHTML = ''; // Eski kontentni tozalash
        
        orders.sort((a, b) => b.timestamp - a.timestamp); // Eng yangi buyurtmani tepaga chiqarish

        orders.forEach(order => {
            const firstItem = order.items[0]; // Chipta nomini olish uchun
            
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <h3>${firstItem.title} (${firstItem.category})</h3>
                <p>Buyurtma ID: <strong>${order.orderId}</strong></p>
                <p>Sana: ${order.purchaseDate}</p>
                <p>Jami Summa: <strong>${order.summary.total.toLocaleString('uz-UZ')} UZS</strong></p>
                <p>Chiptalar soni: ${order.items.length}</p>
                <button class="btn secondary-btn view-ticket-btn" data-order-id="${order.orderId}">Chiptani ko'rish</button>
            `;
            ordersListContainer.appendChild(orderCard);
        });

        // "Chiptani ko'rish" tugmalariga event listener qo'shish
        document.querySelectorAll('.view-ticket-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                showTicketModal(orderId, orders);
            });
        });
    }

    // Modal oynani ko'rsatish
    function showTicketModal(orderId, orders) {
        const order = orders.find(o => o.orderId === orderId);
        const modal = document.getElementById('ticket-modal');
        const detailsBody = document.getElementById('ticket-details-body');

        if (!order) return;

        // Chipta ma'lumotlarini chizish
        detailsBody.innerHTML = `
            <p><strong>Buyurtma ID:</strong> ${order.orderId}</p>
            <p><strong>Xaridor:</strong> ${order.customer.name}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <hr>
            ${order.items.map((item, index) => `
                <div class="ticket-info">
                    <h4>Chipta #${index + 1}</h4>
                    <p>Tadbir: ${item.title}</p>
                    <p>Kategoriya: ${item.category}</p>
                    ${item.seat ? `<p>Joy: ${item.seat.row} qator, ${item.seat.col}-o'rin</p>` : `<p>Joylashuv: Erkin</p>`}
                    <p>Narxi: ${item.price.toLocaleString('uz-UZ')} UZS</p>
                    <div class="qr-code-placeholder">
                        <small>QR kodi simulyatsiyasi: ${order.orderId}-${index}</small>
                    </div>
                </div>
            `).join('')}
        `;
        
        modal.classList.add('active');
    }

    // Modal oynani yopish
    document.querySelector('#ticket-modal .close-btn').addEventListener('click', () => {
        document.getElementById('ticket-modal').classList.remove('active');
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = './index.html';
    });

    // Boshlash
    loadOrders();
});