// js/events.js

document.addEventListener("DOMContentLoaded", function() {
    const eventsGrid = document.getElementById("eventsGrid");
    const filterButtons = document.querySelectorAll(".filter-buttons button");
    
    let allEvents = [];

    if (typeof cartManager === 'undefined') {
        console.error("Xatolik: CartManager yuklanmagan.");
    }

    /**
     * Tadbirlarni localStorage'dan yuklaydi va qayta ishlaydi.
     */
    function loadEvents() {
        try {
            // !!! MUHIM: ADMIN PANEL QAYSI KALITDAN FOYDALANSA, SHUNI ISHLATING
            const STORAGE_KEY = 'allEvents'; // Ko'pchilik adminlar shu nomdan foydalanadi
            
            const data = localStorage.getItem(STORAGE_KEY);
            allEvents = data ? JSON.parse(data) : [];

            // Agar tadbirlar bo'sh bo'lsa, konsolga xabar berish
            if (allEvents.length === 0) {
                 console.warn(`[Tadbirlar Yuklash] ${STORAGE_KEY} kalitida tadbirlar topilmadi. Admin panelni tekshiring.`);
                 return;
            }
            
            // Ma'lumot strukturasini to'g'irlash va standartlashtirish
            allEvents = allEvents.map(event => {
                // ID raqam ekanligiga ishonch hosil qilish
                event.id = Number(event.id);
                
                // Categories ni tekshirish
                if (!event.categories && event.price) {
                    // Agar categories mavjud bo'lmasa, uni bitta narxdan yaratish
                    event.categories = { general: Number(event.price) };
                }
                
                // Type ni standartlashtirish
                if (event.type) {
                    event.type = event.type.charAt(0).toUpperCase() + event.type.slice(1).toLowerCase();
                }
                return event;
            });

        } catch (error) {
            // Agar JSON.parse()da xato bo'lsa (noto'g'ri format)
            console.error("Tadbirlarni yuklashda yoki JSON formatida xatolik:", error);
            allEvents = [];
        }
    }
    
    /**
     * Tadbirlarni filterlaydi va ekranga chiqaradi.
     */
    function displayEvents(filterType = 'all') {
        loadEvents(); // Har safar chaqiramiz

        eventsGrid.innerHTML = ''; // Ro'yxatni tozalash

        if (allEvents.length === 0) {
            eventsGrid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:#E74C3C; padding: 40px; font-weight: 600;">
                Hozirda hech qanday tadbir yuklanmagan. Admin panel orqali qo'shing yoki "localStorage" kalitini tekshiring.
            </p>`;
            return;
        }

        const filteredEvents = filterType === 'all'
            ? allEvents
            : allEvents.filter(event => 
                event.type && event.type.toLowerCase() === filterType.toLowerCase()
              );

        // ... (Qolgan renderlash mantig'i o'zgarishsiz qoladi) ...
        filteredEvents.forEach(event => {
            const card = document.createElement("div");
            card.classList.add("event-card");

            let minPrice = 'Narxi aniqlanmagan';
            let firstCategory = 'general';
            
            if (event.categories && Object.keys(event.categories).length > 0) {
                const prices = Object.values(event.categories).map(Number);
                const cheapest = Math.min(...prices.filter(p => !isNaN(p)));
                minPrice = `Narxi: ${cheapest.toLocaleString('uz-UZ')} UZS dan`;
                firstCategory = Object.keys(event.categories).find(key => event.categories[key] === cheapest) || Object.keys(event.categories)[0];
            } else if (event.price) {
                minPrice = `Narxi: ${Number(event.price).toLocaleString('uz-UZ')} UZS`;
            }

            const detailLink = `./event_detail.html?id=${event.id}`;

            card.innerHTML = `
                <a href="${detailLink}" class="event-link-wrapper">
                    <img src="${event.image || './images/default.jpg'}" alt="${event.title}" class="event-image">
                    <div class="event-body">
                        <h3>${event.title}</h3>
                        <p class="event-date">${new Date(event.date).toLocaleDateString()} | ${event.location}</p>
                        <p class="event-description">${event.description.substring(0, 80)}...</p>
                        <p class="event-price">**${minPrice}**</p>
                    </div>
                </a>
                <div class="card-actions">
                    
                </div>
            `;

            eventsGrid.appendChild(card);
        });
    }

    // --- Filter Tugmalariga Listenerlar ---
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const type = button.dataset.type;
            displayEvents(type);
        });
    });

    // Sahifa yuklanganda barcha tadbirlarni chiqarish
    displayEvents('all');

});

// --- Global Funksiya: Savatga Qo'shish va Yo'naltirish ---
function addToCartAndRedirect(eventId, category) {
    const allEvents = JSON.parse(localStorage.getItem('allEvents')) || [];
    const eventData = allEvents.find(ev => ev.id === eventId);
    
    if (eventData) {
        // Savatga qo'shish
        cartManager.addItem(eventData, category, 1);
        
        // Savat sahifasiga yo'naltirish
        window.location.href = "cart.html"; 
        
    } else {
        alert("Xatolik: Tadbir ma'lumotlari topilmadi. Savatga qo'shish amalga oshmadi.");
    }
}