// help.js - Yordam sahifasi (FAQ, Kontakt, Chipta tekshiruvi) funksionalligi

// DOM elementlari
let faqItems;
let categoryButtons;
let searchInput;
let contactForm;

// Sahifa yuklanganda barcha funksiyalarni ishga tushirish
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    setupMobileMenu();
    updateUserName();

    // URL dan section ID ni o'qish va scroll qilish
    const urlParams = new URLSearchParams(window.location.search);
    const sectionId = urlParams.get('section');
    if (sectionId) {
        setTimeout(() => scrollToSection(sectionId), 500);
    }
    
    // Debug ma'lumotlarini ko'rsatish
    debugHelp();
});

// --- Asosiy Funksiyalar ---

/**
 * Kerakli DOM elementlarini aniqlash va ularning asl matnlarini saqlash.
 */
function initializeElements() {
    faqItems = document.querySelectorAll('.faq-item');
    categoryButtons = document.querySelectorAll('.category-btn');
    searchInput = document.getElementById('helpSearch');
    contactForm = document.getElementById('contactForm');
    
    // Har bir FAQ itemning asl matnini qidiruv uchun saqlash
    faqItems.forEach(item => {
        item.originalQuestion = item.querySelector('.faq-question h3').textContent;
        item.originalAnswer = item.querySelector('.faq-answer').textContent;
    });
}

/**
 * Barcha event listenerlarni o'rnatish.
 */
function setupEventListeners() {
    // FAQ itemlarni ochish/yopish
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => toggleFAQ(item));
    });

    // Kategoriya bo'yicha filtrlash
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => filterFAQ(button.dataset.category));
    });

    // Qidiruv (debounce bilan optimallangan)
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchFAQ, 300));
    }

    // Kontakt formani yuborish
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Tezkor harakatlar (Action Card) animatsiyasi
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

/**
 * FAQ ni ochish yoki yopish, boshqalarni yopish.
 * @param {HTMLElement} item - FAQ elementi.
 */
function toggleFAQ(item) {
    const isActive = item.classList.contains('active');

    // Barcha FAQ larni yopish
    faqItems.forEach(faq => {
        faq.classList.remove('active');
    });

    // Agar bosilgan FAQ active bo'lmasa, uni ochish va scroll qilish
    if (!isActive) {
        item.classList.add('active');

        setTimeout(() => {
            item.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
    }
}

// --- Filtrlash va Qidirish Mantiqi ---

/**
 * FAQ ni kategoriya bo'yicha filtrlash.
 * @param {string} category - Tanlangan kategoriya.
 */
function filterFAQ(category) {
    console.log('Filtering by category:', category);

    // Kategoriya buttonlarini yangilash
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    let visibleCount = 0;
    faqItems.forEach(item => {
        resetHighlight(item); // Highlightlarni olib tashlash

        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
            visibleCount++;
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });

    // Natija yo'qligi haqida xabar
    setTimeout(() => {
        if (visibleCount === 0 && category !== 'all') {
            showNoResults(category);
        } else {
            removeNoResults();
        }
    }, 400);
}

/**
 * FAQ ichidan matn bo'yicha qidirish.
 */
function searchFAQ() {
    const query = searchInput.value.toLowerCase().trim();
    console.log('Searching for:', query);

    // Har qidiruvdan oldin barcha highlight larni olib tashlash
    faqItems.forEach(item => resetHighlight(item));

    if (query.length < 2) {
        // Qidiruv bekor qilinsa, barchasini ko'rsatish
        faqItems.forEach(item => {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });
        removeNoResults();
        return;
    }

    let foundResults = false;

    faqItems.forEach(item => {
        const question = item.originalQuestion.toLowerCase();
        const answer = item.originalAnswer.toLowerCase();

        if (question.includes(query) || answer.includes(query)) {
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            foundResults = true;

            highlightText(item, query);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });

    if (!foundResults) {
        showNoResults(query);
    } else {
        removeNoResults();
    }
}

/**
 * Matn ichidagi qidiruv so'zini <mark> bilan highlight qilish.
 * @param {HTMLElement} element - FAQ elementi.
 * @param {string} query - Qidiruv so'zi.
 */
function highlightText(element, query) {
    const questionEl = element.querySelector('.faq-question h3');
    const answerEl = element.querySelector('.faq-answer');

    const highlight = (text, search) => {
        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    };

    // Har doim original matnda highlight qilish.
    questionEl.innerHTML = highlight(element.originalQuestion, query);
    answerEl.innerHTML = highlight(element.originalAnswer, query);
}

/**
 * Highlightlarni olib tashlash va matnni asl holiga qaytarish.
 * @param {HTMLElement} item - FAQ elementi.
 */
function resetHighlight(item) {
    const questionEl = item.querySelector('.faq-question h3');
    const answerEl = item.querySelector('.faq-answer');

    if (item.originalQuestion) {
        questionEl.textContent = item.originalQuestion;
    }
    if (item.originalAnswer) {
        answerEl.textContent = item.originalAnswer;
    }
}

/**
 * Qidiruvni tozalash va natijalarni qayta yuklash.
 */
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }
    searchFAQ();
    removeNoResults();
}

/**
 * Natija topilmasa xabar ko'rsatish.
 * @param {string} filter - Filter yoki qidiruv so'zi.
 */
function showNoResults(filter) {
    removeNoResults();

    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <div class="no-results-content">
            <span class="sad-emoji">😔</span>
            <h3>Hech narsa topilmadi</h3>
            <p>"${filter}" bo'yicha hech qanday natija topilmadi</p>
            <button class="btn btn-small" onclick="clearSearch()">Qidiruvni tozalash</button>
        </div>
    `;

    document.querySelector('.faq-container').appendChild(noResults);
}

function removeNoResults() {
    const existing = document.querySelector('.no-results');
    if (existing) {
        existing.remove();
    }
}

// --- Kontakt va Shikoyat Mantiqi ---

/**
 * Kontakt formani boshqarish va shikoyatni localStorage ga saqlash.
 * @param {Event} e - Submit event.
 */
function handleContactForm(e) {
    e.preventDefault();

    const formData = {
        id: Date.now(), // Unikal ID (vaqt belgisi)
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        status: 'Yangi', // Admin uchun status
        date: new Date().toLocaleDateString('uz-UZ', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Yuborilmoqda...';
    submitBtn.disabled = true;

    // --- ✅ SHIKOYATNI LOCALSTORAGE GA SAQLASH MANTIQI (ADMIN UCHUN) ---
    let complaints = JSON.parse(localStorage.getItem('complaints')) || [];
    complaints.unshift(formData); // Eng yangisini birinchi qo'shish
    localStorage.setItem('complaints', JSON.stringify(complaints));
    // --- ✅ SAQLASH MANTIQI TUGADI ---

    setTimeout(() => {
        showNotification('Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.', 'success');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

/**
 * Kontakt formasi joyiga silliq scroll qilish va highlightlash.
 */
function showContactForm() {
    scrollToSection('contact');

    const form = document.querySelector('.contact-form');
    // Vizual highlight effekti
    form.style.boxShadow = '0 0 0 3px #ff6b00'; 
    setTimeout(() => {
        form.style.boxShadow = '';
    }, 2000);
}


// --- Modal va Chiqish Funksiyalari ---

function showVerificationModal() {
    document.getElementById('verificationModal').style.display = 'block';
}

function showPasswordResetModal() {
    document.getElementById('passwordResetModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function verifyTicket() {
    const ticketId = document.getElementById('ticketId').value;
    const resultDiv = document.getElementById('verificationResult');
    // ... chipta tekshirish mantiqi (o'zgarishsiz qoldi) ...
    if (!ticketId) {
        resultDiv.innerHTML = 'Iltimos, chipta ID raqamini kiriting';
        resultDiv.className = 'verification-result invalid';
        return;
    }
    resultDiv.innerHTML = 'Tekshirilmoqda...';
    resultDiv.className = 'verification-result';
    setTimeout(() => {
        const isValid = Math.random() > 0.3; // Simulyatsiya
        resultDiv.innerHTML = isValid ? 
           `✅ <strong>Chipta haqiqiy!</strong><br>ID: ${ticketId}` : 
           `❌ <strong>Chipta topilmadi</strong><br>ID: ${ticketId}`;
        resultDiv.className = isValid ? 'verification-result valid' : 'verification-result invalid';
    }, 1500);
}

function sendResetLink() {
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        showNotification('Iltimos, email manzilingizni kiriting', 'error');
        return;
    }
    showNotification(`Parol tiklash havolasi ${email} manziliga yuborildi`, 'success');
    closeModal('passwordResetModal');
}

// --- UX/UI Yordamchi Funksiyalar ---

/**
 * Foydalanuvchi nomini localStorage dan o'qib, UI da ko'rsatish.
 */
function updateUserName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userWelcomeElements = document.querySelectorAll('.user-welcome');
    const logoutBtns = document.querySelectorAll('.logout-btn, .mobile-logout-btn');

    if (currentUser && userWelcomeElements.length > 0) {
        userWelcomeElements.forEach(element => {
            element.textContent = currentUser.name || currentUser.username;
            element.style.display = 'inline';
        });
    }

    // Chiqish tugmalarini ko'rsatish/yashirish
    logoutBtns.forEach(btn => {
        btn.style.display = currentUser ? 'inline-block' : 'none';
        if (currentUser) {
            btn.onclick = logout;
        }
    });
}

/**
 * Hisobdan chiqish mantiqi.
 */
function logout() {
    if (confirm("Hisobingizdan chiqishni xohlaysizmi?")) {
        localStorage.removeItem('currentUser');
        showNotification("Siz muvaffaqiyatli chiqdingiz!", 'info');
        window.location.reload(); 
    }
}

/**
 * Section ID bo'yicha silliq scroll qilish.
 * @param {string} sectionId - HTML elementi ID si.
 */
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        if (element.classList.contains('faq-item')) {
            toggleFAQ(element);
        }
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        element.style.backgroundColor = '#fff3cd'; // Highlight effect
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }
}

/**
 * Mobil menyuni ochish/yopish.
 */
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

/**
 * Xabarlarni o'ng yuqori burchakda ko'rsatish.
 * @param {string} message - Xabar matni.
 * @param {string} type - 'success', 'error' yoki 'info'.
 */
function showNotification(message, type = 'info') {
    // ... (Notification yaratish mantiqi o'zgarishsiz qoldi) ...
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification { position: fixed; top: 20px; right: 20px; background: white; padding: 1rem; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); z-index: 10000; animation: slideInRight 0.3s ease; border-left: 4px solid; color: #333;}
            .notification-success { border-color: #28a745; }
            .notification-error { border-color: #dc3545; }
            .notification-info { border-color: #17a2b8; }
            .notification-content { display: flex; align-items: center; gap: 0.5rem; }
            .notification-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 0; width: 20px; height: 20px; }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(styles);
    }
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) { notification.remove(); } }, 5000);
}


// --- Utility Funksiyalari ---

/**
 * Debounce funksiyasi - ketma-ket chaqiruvlarni cheklash.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- Global Funksiyalar (HTML dan chaqirish uchun) ---
window.scrollToSection = scrollToSection;
window.showContactForm = showContactForm;
window.showVerificationModal = showVerificationModal;
window.showPasswordResetModal = showPasswordResetModal;
window.closeModal = closeModal;
window.verifyTicket = verifyTicket;
window.sendResetLink = sendResetLink;
window.logout = logout;
window.clearSearch = clearSearch;

// --- Debug ---
function debugHelp() {
    console.log('=== HELP DEBUG ===');
    console.log('FAQ items:', faqItems ? faqItems.length : 0);
    console.log('Category buttons:', categoryButtons ? categoryButtons.length : 0);
    console.log('Current user:', localStorage.getItem('currentUser'));
    console.log('Total Complaints (Local):', JSON.parse(localStorage.getItem('complaints') || '[]').length);
    console.log('==================');
}