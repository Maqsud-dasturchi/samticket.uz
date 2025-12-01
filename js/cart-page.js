// js/cart-page.js - Faqat cart.html sahifasini boshqarish

document.addEventListener("DOMContentLoaded", function() {
    // CartManager mavjudligini tekshirish
    if (typeof cartManager === 'undefined') {
        console.error("Xatolik: CartManager yuklanmagan. JS fayllar tartibini tekshiring.");
        return;
    }

    const cartItemsList = document.getElementById('cart-items-list');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const totalCountSummary = document.getElementById('cart-item-count-summary');
    const totalPriceSummary = document.getElementById('cart-total-price');

    /**
     * Savat sahifasini butunlay qayta chizadi va summary'ni yangilaydi.
     */
    function renderCartPage() {
        const cart = cartManager.loadCart();
        cartItemsList.innerHTML = '';
        
        const totalItems = cartManager.getCartItemCount();
        const totalPrice = cartManager.getTotalPrice();

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">Savatingiz boʻsh. Tezda tadbirlar sahifasiga oʻting!</p>';
            checkoutBtn.disabled = true;
            clearCartBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                
                const displayCategory = item.category.charAt(0).toUpperCase() + item.category.slice(1);

                let html = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p class="item-category">Kategoriya: **${displayCategory}**</p>
                        <div class="quantity-control">
                             <button class="quantity-btn" data-id="${item.cartId}" data-action="decrement">-</button>
                             <span class="item-quantity">${item.quantity}</span>
                             <button class="quantity-btn" data-id="${item.cartId}" data-action="increment">+</button>
                        </div>
                    </div>
                    <div class="item-actions">
                        <p class="item-subtotal">${itemTotal.toLocaleString('uz-UZ')} UZS</p>
                        <button class="remove-item-btn" data-id="${item.cartId}">🗑️ O'chirish</button>
                    </div>
                `;

                // Joy Tanlash funksiyasi (Faqat Konsert uchun)
                if (item.type === 'Konsert') {
                    html += `
                        <div class="seat-selection">
                            <button class="select-seat-btn btn ghost" data-event-id="${item.id}" data-category="${item.category}">Joy Tanlash</button>
                            <p class="seat-status">*(Joy hali tanlanmagan)*</p>
                        </div>
                    `;
                }
                
                itemElement.innerHTML = html;
                cartItemsList.appendChild(itemElement);
            });
            
            checkoutBtn.disabled = false;
            clearCartBtn.disabled = false;
        }

        // Summary'ni yangilash
        totalCountSummary.textContent = `${totalItems} dona`;
        totalPriceSummary.textContent = `${totalPrice.toLocaleString('uz-UZ')} UZS`;
        
        attachCartPageListeners();
    }
    
    /**
     * Savat sahifasidagi barcha tugmalarga listener ulash.
     */
    function attachCartPageListeners() {
        // Miqdorini o'zgartirish va o'chirish
        document.querySelectorAll('.quantity-btn, .remove-item-btn').forEach(button => {
             button.addEventListener('click', (e) => {
                const cartId = e.target.dataset.id;
                const action = e.target.dataset.action; // 'increment' yoki 'decrement'
                
                if (e.target.classList.contains('remove-item-btn')) {
                    if (confirm("Ushbu chiptani savatdan olib tashlashni tasdiqlaysizmi?")) {
                        cartManager.removeItemByCartId(cartId);
                    }
                } else if (cartId) {
                    const item = cartManager.cart.find(i => i.cartId === cartId);
                    if (!item) return;

                    let newQuantity = item.quantity;
                    if (action === 'increment') {
                        newQuantity += 1;
                    } else if (action === 'decrement') {
                        newQuantity -= 1;
                    }
                    
                    cartManager.updateQuantity(cartId, newQuantity);
                }
                
                renderCartPage();
             });
        });

        // Joy tanlash
        document.querySelectorAll('.select-seat-btn').forEach(button => {
             button.addEventListener('click', () => {
                alert("Joy tanlash xaritasi hali yaratilmagan. Keyingi qadamda shuni qilishimiz mumkin.");
             });
        });
        
        // Boshqaruv tugmalari
        clearCartBtn.addEventListener('click', () => {
            if (confirm("Butun savatni tozalashni tasdiqlaysizmi?")) {
                cartManager.clearCart();
                renderCartPage();
            }
        });

        checkoutBtn.addEventListener('click', () => {
            alert("Rasmiylashtirish jarayoni boshlandi. (Keyingi sahifa: checkout.html)");
        });
    }

    // Sahifa yuklanganda savatni chizish
    renderCartPage();
});