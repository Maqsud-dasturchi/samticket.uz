// scripts/about.js - Statistikani sanash va LocalStorage ma'lumotlarini ko'rsatish mantig'i

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. Ma'lumotlarni LocalStorage'dan Yuklash ---

    function getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Local Storage dan ${key} yuklashda xato:`, e);
            return [];
        }
    }

    // --- 2. Statistikani Animatsiya Qilish (Counter) ---

    const statItems = document.querySelectorAll('.stat-number');
    let isCountingStarted = false; 
    
    // ... (animateCount funksiyasi avvalgidek qoladi) ...
    
    /**
     * Berilgan elementni 0 dan target qiymatiga qadar animatsiya qiladi.
     */
    function animateCount(element, target, duration) {
        let start = 0;
        const startTime = performance.now();
        const step = (timestamp) => {
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const value = Math.floor(percentage * target);

            element.textContent = value.toLocaleString('en-US'); 

            if (percentage < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }
    
    // --- 3. Ko'rsatkichlarni Real Ma'lumotlar Bilan Yangilash ---

    function updateStatsTargets() {
        const allUsers = getLocalData('users');
        const allEvents = getLocalData('allEvents');
        
        const userCount = allUsers.length;
        const eventCount = allEvents.length;

        // Stat elementlarini topish
        statItems.forEach(item => {
            const labelEl = item.nextElementSibling;
            if (!labelEl) return;

            const label = labelEl.textContent.trim();
            let newTarget = parseInt(item.dataset.target) || 0;
            
            // Faol foydalanuvchi sonini yangilash
            if (label.includes("Faol foydalanuvchi")) {
                // Agar real user mavjud bo'lsa, ularni default targetga qo'shamiz (yoki o'rniga qo'yamiz)
                // Demo maqsadida: 50000 ni minimal base qilib, ustiga real user sonini qo'shamiz.
                newTarget = Math.max(newTarget, 50000) + userCount; 
                item.dataset.target = newTarget;
            } 
            // Tadbir sonini yangilash
            else if (label.includes("Tadbir")) {
                // Demo maqsadida: 1000 ni minimal base qilib, ustiga real tadbir sonini qo'shamiz
                newTarget = Math.max(newTarget, 1000) + eventCount; 
                item.dataset.target = newTarget;
            }
            
            // Qolgan statlar o'zgarishsiz qoladi (Hamkor, Shahar kabi)
            // Boshlang'ich qiymatni 0 ga qo'yish
            item.textContent = '0';
        });
    }

    /**
     * Foydalanuvchi scroll qilganda statistikani ko'rinish zonasida bo'lishini tekshirish
     */
    function checkStatsVisibility() {
        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();

        // Stats bo'limi ko'rinish zonasida bo'lsa va sanash boshlanmagan bo'lsa
        if (rect.top < window.innerHeight && rect.bottom >= 0 && !isCountingStarted) {
            
            statItems.forEach(item => {
                const target = parseInt(item.dataset.target);
                if (!isNaN(target)) {
                    animateCount(item, target, 2000); // 2 soniyalik animatsiya
                }
            });
            isCountingStarted = true; 
            window.removeEventListener('scroll', checkStatsVisibility);
        }
    }

    // --- 4. Boshlash ---

    // 4.1. Sanashdan avval target qiymatlarni LocalStorage ma'lumotlari bilan yangilash
    updateStatsTargets(); 
    
    // 4.2. Scroll event listener'ini qo'shish
    window.addEventListener('scroll', checkStatsVisibility);
    
    // Sahifa yuklanishi bilan bir marta tekshirish
    checkStatsVisibility(); 
});