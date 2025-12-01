// js/event_detail.js - Tadbir tafsiloti va Savatga qo'shish mantig'i (Joy tanlash mantig'i tiklandi)

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Elementlarga kirish ---
    const elements = {
        eventInfoSection: document.getElementById('event-info-section'),
        seatMapContainer: document.getElementById('seat-map-container'),
        categorySelector: document.getElementById('category-selector'),
        quantityInputGroup: document.getElementById('quantity-input-group'),
        quantityInput: document.getElementById('ticket-quantity'),
        selectionDetailsEl: document.getElementById('selection-details'),
        selectedCountEl: document.getElementById('selected-count'),
        selectedTotalEl: document.getElementById('selected-total'),
        addToCartBtn: document.getElementById('add-to-cart-btn'),
        errorMsgEl: document.getElementById('error-message')
    };

    // Asosiy tekshiruvlar
    if (!elements.eventInfoSection || !elements.addToCartBtn || typeof cartManager === 'undefined') {
         console.error("Initialization Failed: Asosiy HTML elementlar yoki CartManager topilmadi.");
         if (elements.eventInfoSection) elements.eventInfoSection.innerHTML = '<p class="error-message">Tizim yuklanmadi. Barcha skriptlar ulanishini tekshiring.</p>';
         return;
    }

    // --- 2. Global Holat va Konfiguratsiya ---
    let currentEvent = null;
    let selectedSeats = []; // Joy tanlovi rejimida tanlangan joylar ro'yxati
    let selectedCategory = null; 
    let selectionType = 'seat'; 

    // Konsert va Teatr uchun joy xaritasi konfiguratsiyasi
    const SEAT_MAP_CONFIG = {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], 
        cols: 25, 
        reservedSeats: [
            {row: 'A', col: 5}, {row: 'B', col: 18}, {row: 'C', col: 7}, 
            {row: 'D', col: 12}, {row: 'F', col: 10}, {row: 'J', col: 2},
            {row: 'L', col: 25}
        ]
    };
    
    /**
     * Admin paneldan kelgan narxlarni standart joy toifalariga moslashtirish
     */
    function mapAdminPricesToSeats(adminCategories) {
        const prices = Object.values(adminCategories || {}).map(Number).sort((a, b) => b - a);
        
        let vipPrice = prices[0] || 500000;
        let regularPrice = prices[1] || vipPrice * 0.7; 
        let generalPrice = prices[2] || regularPrice * 0.5;

        if(generalPrice <= 0) generalPrice = 100000; 

        return {
            'VIP': vipPrice,
            'REGULAR': regularPrice,
            'GENERAL': generalPrice
        };
    }
    
    // --- 3. Tadbirni Yuklash ---

    function getEventIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return Number(params.get('id'));
    }

    function loadEventData(id) {
        const data = localStorage.getItem('allEvents');
        if (!data) return null;
        
        try {
            const allEvents = JSON.parse(data);
            const event = allEvents.find(e => Number(e.id) === id);

            if (!event) return null;
            
            let categories = event.categories || {};
            if (Object.keys(categories).length === 0 && event.price) {
                 categories = { 'GENERAL': Number(event.price) };
            }
            
            // Joy tanlash talab qilinsa
            if (['Konsert', 'Teatr'].includes(event.type)) {
                event.standardizedCategories = mapAdminPricesToSeats(categories); 
            } else {
                event.standardizedCategories = categories; 
            }
            
            return event;
        } catch (e) {
            console.error("Ma'lumotlarni yuklashda/JSONda kutilmagan xato:", e);
            return null;
        }
    }

    // --- 4. Render Funksiyalari (Tadbir turiga asoslangan interfeys) ---

    function renderEventInfo() {
        if (!currentEvent) return;
        
        // Asosiy ma'lumotlarni chizish
        elements.eventInfoSection.innerHTML = `
            <div class="event-header">
                <img src="${currentEvent.image || './images/default.jpg'}" alt="${currentEvent.title}" class="event-image-detail">
                <div class="event-meta">
                    <h1>${currentEvent.title}</h1>
                    <p>📅 Sana: ${new Date(currentEvent.date).toLocaleDateString()} | ${currentEvent.location}</p>
                    <p>🎫 Turi: ${currentEvent.type}</p>
                </div>
            </div>
            <p class="event-description-full">**Tafsilot:** ${currentEvent.description}</p>
        `;
        
        const seatSelectionTypes = ['Konsert', 'Teatr']; 
        
        if (seatSelectionTypes.includes(currentEvent.type)) {
            // Rejim: JOY TANLASH
            selectionType = 'seat';
            
            if (elements.seatMapContainer) {
                elements.seatMapContainer.style.display = 'block';
                renderSeatMap(currentEvent.standardizedCategories); // Joy xaritasini chizish
            }
            if (elements.quantityInputGroup) elements.quantityInputGroup.style.display = 'none';
            if (elements.categorySelector) elements.categorySelector.style.display = 'none';

        } else {
            // Rejim: TOIFA / MIQDOR TANLASH
            selectionType = 'category';
            
             if (elements.seatMapContainer) elements.seatMapContainer.style.display = 'none';
            
            if (elements.quantityInputGroup) elements.quantityInputGroup.style.display = 'flex'; 
            if (elements.categorySelector) {
                 elements.categorySelector.style.display = 'block';
                 renderCategorySelector(currentEvent.standardizedCategories);
            }
        }
        
        updateSummary();
    }
    
    // Toifa tanlagichni chizish
    function renderCategorySelector(categories) {
        if (!elements.categorySelector) return;
        // ... (renderCategorySelector mantig'i avvalgidek qoladi) ...
        
        elements.categorySelector.innerHTML = '';
        Object.entries(categories).forEach(([category, price]) => {
            const radioId = `cat-${category}`;
            const categoryEl = document.createElement('div');
            categoryEl.classList.add('category-radio');
            
            categoryEl.innerHTML = `
                <input type="radio" id="${radioId}" name="ticket_category" value="${category}" data-price="${price}">
                <label for="${radioId}">${category} (${window.formatCurrency(Number(price))})</label>
            `;
            elements.categorySelector.appendChild(categoryEl);
        });

        elements.categorySelector.addEventListener('change', handleCategoryChange);
        if (Object.keys(categories).length > 0) {
            const firstRadio = elements.categorySelector.querySelector('input');
            if(firstRadio) {
                firstRadio.checked = true;
                selectedCategory = firstRadio.value;
            }
        }
    }
    
    // ✅ JOY XARITASINI CHIZISH FUNKSIYASI (Tiklandi)
    function renderSeatMap(prices) {
        if (!elements.seatMapContainer) return;
        
        elements.seatMapContainer.innerHTML = '<div class="seat-map"><div class="stage">SAHNA</div></div>';
        const seatMapEl = elements.seatMapContainer.querySelector('.seat-map');

        SEAT_MAP_CONFIG.rows.forEach(rowLabel => {
            const rowEl = document.createElement('div');
            rowEl.classList.add('row');
            rowEl.innerHTML = `<span class="row-label">${rowLabel}</span>`;
            
            let category = (rowLabel <= 'D') ? 'VIP' : (rowLabel <= 'H') ? 'REGULAR' : 'GENERAL';
            const seatPrice = prices[category];

            for (let i = 1; i <= SEAT_MAP_CONFIG.cols; i++) {
                const seatEl = document.createElement('div');
                seatEl.classList.add('seat', category); 
                seatEl.textContent = i;
                seatEl.dataset.row = rowLabel;
                seatEl.dataset.col = i;
                seatEl.dataset.category = category;
                seatEl.dataset.price = seatPrice; 

                const isReserved = SEAT_MAP_CONFIG.reservedSeats.some(r => r.row === rowLabel && r.col === i);

                if (isReserved) {
                    seatEl.classList.add('reserved');
                } else {
                    seatEl.classList.add('available');
                    // ✅ Joy click event listener'i
                    seatEl.addEventListener('click', handleSeatClick);
                }
                
                const isSelected = selectedSeats.some(s => s.row === rowLabel && s.col === i);
                if (isSelected) {
                    seatEl.classList.add('selected');
                }

                rowEl.appendChild(seatEl);
            }
            seatMapEl.appendChild(rowEl);
        });
    }

    // --- 5. Interaktiv Mantiq (Click/Input Handlers) ---

    // ✅ JOYNI TANLASH FUNKSIYASI (Tiklandi)
    function handleSeatClick(e) {
        const seat = e.target;
        if (seat.classList.contains('reserved')) return;
        
        const row = seat.dataset.row;
        const col = Number(seat.dataset.col);
        const category = seat.dataset.category;
        const price = Number(seat.dataset.price);

        const existingIndex = selectedSeats.findIndex(s => s.row === row && s.col === col);

        if (existingIndex > -1) {
            selectedSeats.splice(existingIndex, 1);
            seat.classList.remove('selected');
        } else {
            selectedSeats.push({row, col, category, price});
            seat.classList.add('selected');
        }
        
        updateSummary();
    }
    
    function handleCategoryChange(e) {
        selectedCategory = e.target.value;
        updateSummary();
    }
    
    if (elements.quantityInput) {
        elements.quantityInput.addEventListener('input', updateSummary);
    }
    
    // --- 6. Summary'ni Yangilash (Narx hisobi to'g'ri) ---
    function updateSummary() {
        let count = 0;
        let total = 0;
        
        if (elements.selectionDetailsEl) elements.selectionDetailsEl.innerHTML = '';
        if (elements.errorMsgEl) elements.errorMsgEl.textContent = '';
        
        if (selectionType === 'seat') {
            count = selectedSeats.length;
            total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
            
            // Joy tanlovi summary HTML chizish (sizning oldingi kodingizdan olingan)
             if (count > 0 && elements.selectionDetailsEl) {
                // Joyli summary chizish
                const groupedSeats = selectedSeats.reduce((acc, seat) => {
                    const key = `${seat.category} - ${window.formatCurrency(seat.price)}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(seat);
                    return acc;
                }, {});

                Object.entries(groupedSeats).forEach(([key, seats]) => {
                    elements.selectionDetailsEl.innerHTML += `
                        <div class="selected-item-summary">
                            <p><strong>${key}</strong>: ${seats.length} dona chipta</p>
                            <p style="font-size:0.85rem; color:#666;">Joylar: ${seats.map(s => `${s.row}-${s.col}`).join(', ')}</p>
                        </div>
                    `;
                });
            } else if (elements.errorMsgEl) {
                elements.errorMsgEl.textContent = 'Iltimos, joy tanlovini yakunlang.';
            }

        } else if (selectionType === 'category') {
            count = (elements.quantityInput ? Number(elements.quantityInput.value) : 0) || 0;
            
            let price = 0;
            if (selectedCategory && currentEvent && currentEvent.standardizedCategories) {
                price = currentEvent.standardizedCategories[selectedCategory] || 0;
            }
            
            total = price * count;

            if (selectedCategory && count > 0) {
                 if (elements.selectionDetailsEl) {
                    elements.selectionDetailsEl.innerHTML = `
                        <div class="selected-item-summary">
                            <p>✅ Toifa: <strong>${selectedCategory}</strong></p>
                            <p>✅ Miqdor: <strong>${count} dona</strong></p>
                            <p>✅ Narx/dona: <strong>${window.formatCurrency(price)}</strong></p>
                        </div>
                    `;
                 }
            } else if (elements.errorMsgEl) {
                elements.errorMsgEl.textContent = 'Iltimos, toifani va miqdorni tanlang.';
            }
        }
        
        // Yakuniy qiymatlarni yangilash va tugmani boshqarish
        if (elements.selectedCountEl) elements.selectedCountEl.textContent = count;
        if (elements.selectedTotalEl) elements.selectedTotalEl.textContent = window.formatCurrency(total);
        if (elements.addToCartBtn) elements.addToCartBtn.disabled = total === 0;
    }


    // --- 7. SAVATGA QO'SHISH FUNKSIYASI ---
    // js/event_detail.js - 7. SAVATGA QO'SHISH FUNKSIYASI (Mustahkamlangan versiya)

    elements.addToCartBtn.addEventListener('click', () => {
        
        if (elements.addToCartBtn.disabled || !currentEvent) return;
        
        let itemsAdded = false;
        
        try {
            if (selectionType === 'seat') {
                if (selectedSeats.length === 0) return;
                
                // Joylar ro'yxatini shakllantirish va cartManager ga yuborish
                selectedSeats.map(seat => ({
                    id: currentEvent.id, title: currentEvent.title, price: seat.price, quantity: 1, 
                    ticketType: seat.category, seat: { row: seat.row, col: seat.col } 
                })).forEach(item => cartManager.addItem(item)); 
                
                alert(`Savatga ${selectedSeats.length} ta joyli chipta qo'shildi!`);
                itemsAdded = true;
                
            } else if (selectionType === 'category') {
                const quantity = Number(elements.quantityInput.value);
                if (!selectedCategory || quantity <= 0) return;
                
                const price = currentEvent.standardizedCategories[selectedCategory];

                // Yagona toifa obyektini shakllantirish
                cartManager.addItem({
                    id: currentEvent.id, title: currentEvent.title, price: price, quantity: quantity, 
                    ticketType: selectedCategory, seat: null 
                }); 
                
                alert(`Savatga ${quantity} dona chipta (${selectedCategory}) qo'shildi!`);
                itemsAdded = true;
            }
        } catch (e) {
            console.error("Savatga qo'shishda xato yuz berdi:", e);
            alert("Xatolik: Chiptalarni savatga qo'shishda muammo yuz berdi. Konsolni tekshiring.");
            return; // Xato yuz bersa, yo'naltirmaymiz.
        }
        
        // Agar chiptalar muvaffaqiyatli qo'shilgan bo'lsa, yo'naltirish
        if (itemsAdded) {
            window.location.href = './cart.html'; 
        }
    });
    
    // --- Boshlash Qismi ---
    const eventId = getEventIdFromUrl();
    if (eventId) {
        currentEvent = loadEventData(eventId);
        if (currentEvent) {
            renderEventInfo();
        } else {
            elements.eventInfoSection.innerHTML = '<p class="error-message">Tadbir ma\'lumoti topilmadi.</p>';
        }
    } else {
        elements.eventInfoSection.innerHTML = '<p class="error-message">Tadbir ID raqami URL\'da topilmadi.</p>';
    }
});