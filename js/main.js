// js/main.js yoki shunga o'xshash fayl

// DOM elementlari
const goRegisterBtn = document.getElementById('go-register');
const userInfo = document.getElementById('user-info');
const protectedBtns = document.querySelectorAll('.protected-btn');
const adminLink = document.querySelector('.admin-link');
const registerBtnContainer = document.getElementById('register-btn-container'); // Ro'yxatdan o'tish tugmasi turgan konteyner (yoki o'zi)
const loginLink = document.getElementById('login-link'); // "Kirish" havolasi (agar mavjud bo'lsa)

// Foydalanuvchi holatini localStorage dan o‘qish
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// --- 1. Foydalanuvchi holatini boshqarish va sahifani himoyalash ---

if (currentUser) {
    // 1a. Foydalanuvchi ro‘yxatdan o‘tgan
    
    // Ismini ko'rsatish
    // ⭐️ TALAB: Chiqish tugmasidan oldin ismini ko‘rsatish
    userInfo.innerHTML = `Salom, <strong>${currentUser.name}</strong>`;
    
    // Ro'yxatdan o'tish/Kirish tugmasini Chiqish tugmasiga almashtirish
    if (registerBtnContainer) {
        registerBtnContainer.innerHTML = '<button id="logout-btn" class="btn btn-danger">Chiqish</button>';
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
    
} else {
    // 1b. Foydalanuvchi ro‘yxatdan o‘tmagan (currentUser === null)
    
    userInfo.textContent = ""; 
    
    // ⭐️ TALAB: Agar bu sahifa himoyalangan bo'lsa (index.html emas, lekin siz shunday xohladingiz)
    // Agar sahifa 'index.html' bo'lmasa, quyidagi shartni qo'yishingiz mumkin.
    // Hozircha faqat index.html da registerga o'tkazishni yoqamiz.
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        // alert("Iltimos, avval ro‘yxatdan o‘ting!");
        // window.location.href = "register.html";
        
        // Asosiy sahifani himoyalash mantiqi:
        console.log("Foydalanuvchi ro'yxatdan o'tmagan. Sahifani faqat ko'rish rejimida qoldiramiz.");
    }
}

// --- 2. Admin va Chiqish mantig‘i ---

// Admin faqat ko‘rishi
if(currentUser && currentUser.isAdmin){
    adminLink.style.display = "inline-block";
} else {
    adminLink.style.display = "none";
}

// Chiqish (Logout) funksiyasi
function handleLogout() {
    localStorage.removeItem('currentUser');
    // Bosh sahifaga qaytish va yangilash
    window.location.reload(); 
}

// --- 3. Qo'shimcha tugmalar va himoyalash ---

// Ro‘yxatdan o‘tish tugmasi (FAQAT agar foydalanuvchi mavjud bo'lmasa)
if (goRegisterBtn) {
    goRegisterBtn.addEventListener('click', ()=>{
        window.location.href = "register.html";
    });
}


// Protected buttonlar
protectedBtns.forEach(btn => {
    btn.addEventListener('click', (e)=>{
        if(!currentUser){
            e.preventDefault();
            alert("Iltimos, avval ro‘yxatdan o‘ting!");
            // Iltimos qilganingizdek, ro'yxatdan o'tish sahifasiga o'tkazish:
            window.location.href = "register.html"; 
        }
    });
});