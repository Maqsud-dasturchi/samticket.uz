// js/checkout.js - Buyurtmani rasmiylashtirish mantig'i

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Elementlarga kirish ---
    const elements = {
        checkoutForm: document.getElementById('checkout-form'),
        checkoutItemsList: document.getElementById('checkout-items-list'),
        totalCountEl: document.getElementById('total-count'),
        grandTotalEl: document.getElementById('grand-total'),
        placeOrderBtn: document.getElementById('place-order-btn'),
        checkoutError: document.getElementById('checkout-error')
    };
    
    // global cartManager mavjudligini tekshirish
    if (typeof cartManager === 'undefined' || !elements.placeOrderBtn) {
        if (elements.checkoutError) {
             elements.checkoutError.textContent = "Tizim xatosi: Savat mantig'i yuklanmadi.";
             elements.checkoutError.style.display = 'block';
        }
        return;
    }
    
    const currentCart = cartManager.getCart();

    // --- 2. Tekshirish va Renderlash Funksiyalari ---

    /**
     * Savat elementlarini Checkout Summary qismida chizadi.
     */
    function renderCheckoutSummary() {
        if (currentCart.length === 0) {
            elements.checkoutItemsList.innerHTML = `
                <p class="error-message"><i class="fas fa-exclamation-triangle"></i> Savat bo'sh. Iltimos, avval chipta tanlang.</p>
            `;
            // Savat bo'sh bo'lsa, tugmani o'chirish
            elements.placeOrderBtn.disabled = true;
            return;
        }

        let html = '';
        let totalCount = 0;
        let grandTotal = 0;

        currentCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            totalCount += item.quantity;
            
            const seatInfo = item.seat 
                ? ` (Joy: ${item.seat.row}-${item.seat.col})` 
                : '';
                
            html += `
                <div class="checkout-item-summary">
                    <p class="item-title">${item.title}</p>
                    <p class="item-details">${item.ticketType} ${seatInfo}</p>
                    <p class="item-price">${item.quantity} x ${window.formatCurrency(item.price)} = <strong>${window.formatCurrency(itemTotal)}</strong></p>
                </div>
            `;
        });
        
        elements.checkoutItemsList.innerHTML = html;
        elements.totalCountEl.textContent = totalCount;
        elements.grandTotalEl.textContent = window.formatCurrency(grandTotal);
        
        // Agar barcha elementlar yuklangan bo'lsa, tugmani faollashtirish
        elements.placeOrderBtn.disabled = false;
    }

    /**
     * Ma'lumotlarni tekshiradi va Buyurtmani saqlaydi.
     */
    function validateAndPlaceOrder(e) {
        e.preventDefault(); // Formaning default submitini to'xtatish
        
        // Form ma'lumotlarini olish
        const formData = new FormData(elements.checkoutForm);
        const fullName = formData.get('fullName').trim();
        const email = formData.get('email').trim();
        const phone = formData.get('phone').trim();
        const paymentMethod = formData.get('payment_method');
        
        // Oddiy tekshiruvlar
        if (fullName === "" || email === "" || phone === "") {
            alert("Iltimos, barcha shaxsiy ma'lumotlarni to'ldiring.");
            return;
        }
        
        if (currentCart.length === 0) {
            alert("Savat bo'sh. Buyurtma berish mumkin emas.");
            return;
        }
        
        // Buyurtma obyekti
        const order = {
            id: Date.now(), // Buyurtma ID si (vaqt belgisi)
            customer: { fullName, email, phone },
            items: currentCart,
            totalAmount: cartManager.getTotal(),
            paymentMethod: paymentMethod,
            date: new Date().toISOString(),
            status: 'Pending Payment' 
        };
        
        // Buyurtmani LocalStorage'ga saqlash
        saveOrder(order);

        // Savatni tozalash (Chiptalar sotib olindi)
        cartManager.clearCart(); 

        // To'lov sahifasiga/Yakunlash sahifasiga yo'naltirish
        window.location.href = `./order_success.html?orderId=${order.id}`;
    }

    /**
     * Buyurtmani LocalStorage'ga saqlash (Admin panel uchun)
     */
    function saveOrder(order) {
        let orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        orders.push(order);
        localStorage.setItem('allOrders', JSON.stringify(orders));
    }
    
    // --- 3. Event Listenerlar ---
    
    // Formani yuborish tugmasi
    elements.placeOrderBtn.addEventListener('click', validateAndPlaceOrder);

    // --- 4. Boshlash ---
    renderCheckoutSummary();
    
    // Agar savat bo'sh bo'lsa, buyurtma tugmasini yashirish
    if (currentCart.length === 0) {
        elements.placeOrderBtn.style.display = 'none';
    }
});