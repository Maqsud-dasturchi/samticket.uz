document.addEventListener('DOMContentLoaded', () => {

    // Helper funksiyani aniqlash (Agar u global darajada ishlatilmasa)
    window.showTab = function(tabId){
        document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        if(tabId === 'loginTab'){
            document.getElementById('loginForm').classList.add('active');
            document.querySelector(`.tab-btn[onclick="showTab('loginTab')"]`).classList.add('active');
        } else {
            document.getElementById('registerForm').classList.add('active');
            document.querySelector(`.tab-btn[onclick="showTab('registerTab')"]`).classList.add('active');
        }

        document.getElementById('loginMessage').style.display = 'none';
        document.getElementById('registerMessage').style.display = 'none';
    }

    // ------------------------------------
    // Register
    // ------------------------------------
    document.getElementById('registerForm').addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const messageEl = document.getElementById('registerMessage');

        if(!name || !username || !email || !password || !confirmPassword){
            messageEl.textContent = "Iltimos, barcha maydonlarni to'ldiring!";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }

        if(password.length < 6){
            messageEl.textContent = "Parol kamida 6 belgidan iborat bo'lishi kerak!";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }

        if(password !== confirmPassword){
            messageEl.textContent = "Parollar mos kelmadi!";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }

        // ✅ TUZATISH: 'users' kalitini 'allUsers' kalitiga o'zgartirish
        const users = JSON.parse(localStorage.getItem('allUsers')) || []; 
        if(users.some(u => u.email === email || u.username === username)){
            messageEl.textContent = "Bu email yoki username allaqachon mavjud!";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }

        const newUser = {id:Date.now(),name,username,email,password,role:'user', blocked: false, registeredAt: Date.now()}; // blocked va registeredAt qo'shildi
        users.push(newUser);
        // ✅ TUZATISH: 'users' kalitini 'allUsers' kalitiga o'zgartirish
        localStorage.setItem('allUsers', JSON.stringify(users)); 
        localStorage.setItem('currentUser', JSON.stringify({id:newUser.id,name,username,email,role:'user'}));

        messageEl.textContent = "Ro‘yxatdan o‘tish muvaffaqiyatli!";
        messageEl.className = 'message success';
        messageEl.style.display = 'block';
        document.getElementById('registerForm').reset();

        setTimeout(()=> window.location.href='./index.html',1500);
    });

    // ------------------------------------
    // Login
    // ------------------------------------
    document.getElementById('loginForm').addEventListener('submit', (e)=>{
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('loginMessage');

        // Admin (Bu Admin Panel faqat bitta admin mavjudligini hisobga olib yozilgan)
        if(email==='admin' && password==='12345'){
            localStorage.setItem('currentUser', JSON.stringify({id:1,name:'Admin',username:'admin',email:'admin',role:'admin'}));
            messageEl.textContent = "Admin sifatida kirish muvaffaqiyatli!";
            messageEl.className = 'message success';
            messageEl.style.display = 'block';
            setTimeout(()=> window.location.href='./admin.html',1500);
            return;
        }

        // ✅ TUZATISH: 'users' kalitini 'allUsers' kalitiga o'zgartirish
        const users = JSON.parse(localStorage.getItem('allUsers')) || []; 
        const user = users.find(u => (u.email===email || u.username===email) && u.password===password);

        if(!user){
            messageEl.textContent = "Email/Username yoki parol noto‘g‘ri!";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }
        
        // Agar foydalanuvchi bloklangan bo'lsa
        if(user.blocked){
            messageEl.textContent = "Sizning hisobingiz bloklangan. Iltimos, administrator bilan bog'laning.";
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify({id:user.id,name:user.name,username:user.username,email:user.email,role:user.role}));
        messageEl.textContent = `Xush kelibsiz, ${user.name}!`;
        messageEl.className = 'message success';
        messageEl.style.display = 'block';
        document.getElementById('loginForm').reset();

        setTimeout(()=> window.location.href='./index.html',1500);
    });
});