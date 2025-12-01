// js/order_success.js - Muvaffaqiyatli buyurtma ma'lumotlarini ko'rsatish

document.addEventListener("DOMContentLoaded", function() {
    
    const orderIdDisplay = document.getElementById('order-id-display');
    const orderTotalDisplay = document.getElementById('order-total-display');

    function getOrderIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return Number(params.get('orderId'));
    }

    function loadOrderDetails(orderId) {
        let orders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        return orders.find(order => order.id === orderId);
    }

    const orderId = getOrderIdFromUrl();
    
    if (orderId && orderIdDisplay) {
        
        const orderDetails = loadOrderDetails(orderId);
        
        if (orderDetails) {
            // Buyurtma raqamini ko'rsatish
            orderIdDisplay.textContent = orderDetails.id; 
            
            // Jami summani ko'rsatish (formatCurrency global funksiyasidan foydalanamiz)
            if (orderTotalDisplay && typeof window.formatCurrency === 'function') {
                orderTotalDisplay.textContent = window.formatCurrency(orderDetails.totalAmount);
            }
            
        } else {
            // Buyurtma topilmasa
            if (orderIdDisplay) orderIdDisplay.textContent = "Buyurtma topilmadi";
            if (orderTotalDisplay) orderTotalDisplay.textContent = "N/A";
            
        }
    } else {
        // orderId URL da mavjud bo'lmasa
        if (orderIdDisplay) orderIdDisplay.textContent = "ID yo'q";
        if (orderTotalDisplay) orderTotalDisplay.textContent = "N/A";
    }
});