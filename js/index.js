// js/index.js - Barcha foydalanuvchi holati va navigatsiya mantig'i

document.addEventListener("DOMContentLoaded", function() {

    // --- 1. DOM Elementlari ---
    // 'go-register' endi "Kirish/Ro'yxatdan o'tish" funksiyasini bajaruvchi element bo'lsin.
    const registerPlaceholder = document.getElementById('register-placeholder') || document.getElementById('register-btn'); 
    
    // Agar sizning tugmangiz 'register-btn' emas, balki 'go-register' bo'lsa:
    const goRegisterBtn = document.getElementById('go-register'); 
    
    const userInfo = document.getElementById('user-info');
    const protectedBtns = document.querySelectorAll('.protected-btn');
    const adminLink = document.querySelector('.admin-link');
    
    // Foydalanuvchi holatini localStorage dan o‘qish
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // --- 2. Foydalanuvchi Holatini Boshqarish Mantig'i ---

    if (currentUser) {
        // Foydalanuvchi tizimga kirgan bo'lsa:
        
        // a) Ro'yxatdan o'tish/Kirish tugmasini "Profil" tugmasiga almashtirish
        if (registerPlaceholder) {
            // Yangi Profil tugmasini yaratish
            const profileBtn = document.createElement('a');
            profileBtn.href = "profile.html"; // Profil sahifasiga yo'naltirish
            profileBtn.textContent = "Profil";
            profileBtn.className = registerPlaceholder.className || 'button primary-button'; // Mavjud sinflarni saqlab qolish
            profileBtn.id = 'go-profile';
            
            // Eski tugmani yangisi bilan almashtirish
            registerPlaceholder.replaceWith(profileBtn);
        } else if (goRegisterBtn) {
            // Agar faqat goRegisterBtn bo'lsa, uni o'zgartiramiz
            goRegisterBtn.textContent = "Profil";
            goRegisterBtn.href = "profile.html";
            goRegisterBtn.removeEventListener('click', goRegisterBtn.click); // Eski eventni olib tashlash
            goRegisterBtn.addEventListener('click', (e) => {
                 e.preventDefault();
                 window.location.href = "profile.html";
            });
        }
        
        // b) Salomlash xabarini ko'rsatish
        if (currentUser.name) {
             userInfo.textContent = `Salom, ${currentUser.name}`;
        }
        
        // c) Admin linkini ko'rsatish
        if (currentUser.isAdmin) {
            if (adminLink) {
                adminLink.style.display = "inline-block";
            }
        } else {
            if (adminLink) {
                adminLink.style.display = "none";
            }
        }
        
    } else {
        // Foydalanuvchi tizimga kirmagan bo'lsa:
        userInfo.textContent = "";
        if (adminLink) {
            adminLink.style.display = "none";
        }
        
        // d) Ro'yxatdan o'tish tugmasini saqlab qolish va uning funksiyasini qo'shish
        if (goRegisterBtn) {
            // goRegisterBtn ni asl holatida qoldiramiz (register.html ga yo'naltiruvchi)
            goRegisterBtn.addEventListener('click', () => {
                window.location.href = "register.html";
            });
        }
    }

    // --- 3. Navigatsiya va Himoya Mantig'i ---

    // Kirish Cheklangan Tugmalarni (Protected Buttons) himoyalash
    protectedBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                
                const confirmed = confirm("Iltimos, avval ro‘yxatdan o‘ting yoki tizimga kiring. Ro'yxatdan o'tish sahifasiga o'tasizmi?");
                
                if (confirmed) {
                    window.location.href = "register.html";
                }
            }
        });
    });

});