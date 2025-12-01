// js/payment.js - To'lov jarayoni mantig'i (Yakuniy versiya)

document.addEventListener("DOMContentLoaded", function() {
    
    // --- KONSTANTALAR VA ELEMENTLAR ---
    const PAYMENT_FORM = document.getElementById('payment-form');
    const SUMMARY_SECTION = document.getElementById('payment-summary');
    const PAYMENT_METHOD_SELECT = document.getElementById('payment-method');
    const ERROR_MESSAGE = document.getElementById('payment-error');

    // To'lov usullari uchun HTML qismlari
    const CARD_DETAILS_SECTION = document.getElementById('card-details-section');
    const PAYME_DETAILS_SECTION = document.getElementById('payme-details-section');
    const CLICK_DETAILS_SECTION = document.getElementById('click-details-section');

    const CART_STORAGE_KEY = 'shoppingCart'; 
    const ONE_TIME_ORDER_KEY = 'lastSuccessfulOrder'; // Success.html uchun bir martalik kalit
    
    let currentCart = [];
    let summary = {};

    // --- 1. To'lov Usulini Boshqarish ---

    function handlePaymentMethodChange() {
        const selectedMethod = PAYMENT_METHOD_SELECT.value;

        // Barcha detallarni yashirish
        CARD_DETAILS_SECTION.style.display = 'none';
        PAYME_DETAILS_SECTION.style.display = 'none';
        CLICK_DETAILS_SECTION.style.display = 'none';

        // Tanlangan usulga mos detalni ko'rsatish
        if (selectedMethod === 'card') {
            CARD_DETAILS_SECTION.style.display = 'block';
        } else if (selectedMethod === 'payme') {
            PAYME_DETAILS_SECTION.style.display = 'block';
        } else if (selectedMethod === 'click') {
            CLICK_DETAILS_SECTION.style.display = 'block';
        }
    }
    
    // --- 2. Savat Ma'lumotlarini Yuklash ---

    function loadCartAndSummary() {
        if (typeof cartManager === 'undefined' || !cartManager.getCart) {
            console.error("cartManager moduli yuklanmadi. JS skriptlarini tekshiring.");
            return false;
        }

        currentCart = cartManager.getCart();
        
        if (!currentCart || currentCart.length === 0) {
            alert("Savatingiz bo'sh. Iltimos, tadbir tanlang.");
            window.location.href = './events.html';
            return false;
        }

        summary = cartManager.calculateSummary();
        renderSummary();
        return true;
    }

    // --- 3. HTML Render Qilish (Xulosa) ---

    function renderSummary() {
        if (!SUMMARY_SECTION) return;

        const subtotalFormatted = summary.subtotal.toLocaleString('uz-UZ', {minimumFractionDigits: 0});
        const feeFormatted = summary.fee.toLocaleString('uz-UZ', {minimumFractionDigits: 0});
        const totalFormatted = summary.total.toLocaleString('uz-UZ', {minimumFractionDigits: 0});

        SUMMARY_SECTION.innerHTML = `
            <h2>2. Buyurtma Xulosasi</h2>
            <div class="summary-line"><span>Chiptalar Soni:</span> <strong>${summary.count} ta</strong></div>
            <div class="summary-line"><span>Umumiy Narx:</span> <strong>${subtotalFormatted} UZS</strong></div>
            <div class="summary-line special"><span>Xizmat Komissiyasi (5%):</span> <strong>${feeFormatted} UZS</strong></div>
            <hr>
            <div class="summary-line total-line"><span>JAMI TO'LOV:</span> <strong id="final-total">${totalFormatted} UZS</strong></div>
        `;
    }

    // --- 4. Buyurtmani Yakunlash Mantig'i ---

    function finalizeOrder(customerDetails, paymentMethod) {
        const orderId = 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
        
        const newOrderDetails = {
            orderId: orderId,
            purchaseDate: new Date().toISOString(),
            customer: customerDetails,
            items: currentCart, 
            summary: summary,
            paymentMethod: paymentMethod,
            status: 'Paid'
        };

        // 1. ✅ Vaqtincha chek ma'lumotini saqlash (Success.html uchun)
        try {
            localStorage.setItem(ONE_TIME_ORDER_KEY, JSON.stringify(newOrderDetails));
        } catch(e) {
            console.error("Vaqtincha buyurtma saqlanmadi:", e);
        }
        
        // 2. Savatni tozalash
        if (typeof cartManager.clearCart === 'function') {
            cartManager.clearCart(); 
        } else {
            localStorage.removeItem(CART_STORAGE_KEY);
        }

        // 3. ✅ Muvaffaqiyat sahifasiga yo'naltirish
        window.location.href = './success.html'; 
    }


    // --- 5. Formani Yuborish ---

    function handlePayment(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const paymentMethod = PAYMENT_METHOD_SELECT.value;

        // --- Validatsiya ---
        if (!customerName || !customerPhone || paymentMethod === '') {
            ERROR_MESSAGE.textContent = "Iltimos, barcha zarur maydonlarni to'ldiring.";
            ERROR_MESSAGE.style.display = 'block';
            return;
        }

        // Karta tanlangan bo'lsa, qo'shimcha maydonlarni tekshirish (Simulyatsiya)
        if (paymentMethod === 'card' && (!document.getElementById('card-number').value || !document.getElementById('card-expiry').value)) {
             ERROR_MESSAGE.textContent = "Iltimos, karta ma'lumotlarini kiriting.";
             ERROR_MESSAGE.style.display = 'block';
             return;
        }
        // --- /Validatsiya ---

        ERROR_MESSAGE.style.display = 'none';

        const customerDetails = { name: customerName, phone: customerPhone };
        
        const submitBtn = PAYMENT_FORM.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'To\'lanmoqda...';

        // Simulyatsiyani minimal kutish vaqti bilan bajarish
        setTimeout(() => {
            finalizeOrder(customerDetails, paymentMethod);
        }, 100); 
    }
    
    // --- 6. Boshlash ---

    if (loadCartAndSummary()) {
        PAYMENT_FORM.addEventListener('submit', handlePayment);
        PAYMENT_METHOD_SELECT.addEventListener('change', handlePaymentMethodChange);
        
        // Sahifa yuklanganda birinchi marta tekshirish (agar avvaldan tanlangan bo'lsa)
        handlePaymentMethodChange(); 
    }
});