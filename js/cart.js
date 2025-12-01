// js/cart.js - Savatni boshqarish mantig'i (CartManager obyekti)

// --- 1. CartManager ni e'lon qilish ---
const cartManager = (function() {
    const CART_STORAGE_KEY = 'shoppingCart';
    let cart = loadCart();

    /**
     * LocalStorage'dan savatni yuklaydi.
     * @returns {Array} Savat ro'yxati yoki bo'sh massiv.
     */
    function loadCart() {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (e) {
            console.error("Savatni yuklashda xato:", e);
            return [];
        }
    }

    /**
     * Savatni LocalStorage'ga saqlaydi va UI ni yangilaydi.
     */
    function saveCart() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            renderCart(); // Savatni saqlagandan so'ng UI ni yangilash
        } catch (e) {
            console.error("Savatni saqlashda xato:", e);
        }
    }
    
    /**
     * Elementni savatga qo'shadi yoki mavjudini yangilaydi.
     * @param {Object} item Qo'shilayotgan obyekt.
     */
    function addItem(item) {
        // Joyli chiptalar alohida element hisoblanadi (quantity har doim 1)
        if (item.seat) {
            cart.push(item);
        } else {
            // Joyi bo'lmagan chiptalar (umumiy toifa)
            const existingItem = cart.find(
                c => c.id === item.id && c.ticketType === item.ticketType && c.seat === null
            );

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push(item);
            }
        }
        saveCart();
    }

    /**
     * Savatdagi elementni o'chiradi.
     * @param {number} index O'chiriladigan elementning massivdagi indeksi.
     */
    function removeItem(index) {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            saveCart();
        }
    }
    
    /**
     * Savatni tozalaydi.
     */
    function clearCart() {
        cart = [];
        saveCart();
    }
    
    /**
     * Savat elementlarini HTML'da chizish va jami narxni hisoblash.
     * Bu funksiya faqat 'cart.html' sahifasidagi elementlar mavjud bo'lsagina ishlaydi.
     */
    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalEl = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        const cartEmptyEl = document.getElementById('cart-empty-message');
        
        // ✅ Xatoni tuzatish: Faqat kerakli elementlar (cart.html da bo'lishi kerak) mavjud bo'lsa ishlaydi.
        if (!cartItemsContainer || !cartTotalEl) {
            return; 
        }

        let grandTotal = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (cartEmptyEl) cartEmptyEl.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            cartTotalEl.textContent = window.formatCurrency(0);
            return;
        }

        if (cartEmptyEl) cartEmptyEl.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        let html = '';

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            
            const seatInfo = item.seat 
                ? `<span class="cart-seat-info">Joy: ${item.seat.row}-${item.seat.col}</span>` 
                : '';

            html += `
                <div class="cart-item" data-index="${index}">
                    <div class="item-details">
                        <p class="item-title">${item.title}</p>
                        <p class="item-type">${item.ticketType} ${seatInfo}</p>
                        <p class="item-price">${window.formatCurrency(item.price)} x ${item.quantity}</p>
                    </div>
                    <div class="item-actions">
                        <p class="item-total-price">${window.formatCurrency(itemTotal)}</p>
                        <button class="btn btn-sm remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalEl.textContent = window.formatCurrency(grandTotal);

        // O'chirish event listener'larini ulash
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = Number(e.currentTarget.dataset.index);
                removeItem(index);
            });
        });
    }

    // Savatni ochirish tugmasi event listener'i (Agar cart.html da mavjud bo'lsa)
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Savatni boshqa sahifada ko'rsatish uchun (Masalan, Bosh sahifa ikonkasida)
    document.addEventListener("DOMContentLoaded", renderCart);


    // --- 2. Tashqi foydalanish uchun funksiyalar (event_detail.js uchun kerakli) ---
    return {
        addItem: addItem,
        removeItem: removeItem,
        clearCart: clearCart,
        getCart: () => cart,
        getTotal: () => cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        renderCart: renderCart // Agar boshqa skriptlar uni chaqirishi kerak bo'lsa
    };
})();
// js/cart.js fayli ichida, eng pastki qismda:

    // Checkout tugmasini ulash (Agar cart.html sahifasida bo'lsak)
    document.addEventListener("DOMContentLoaded", function() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = './checkout.html';
            });
        }
        // Savat sahifasida doimo renderCart ni chaqirish
        cartManager.renderCart(); 
    });