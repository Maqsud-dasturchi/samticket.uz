// js/common.js - Umumiy yordamchi funksiyalar va global UI mantig'i

document.addEventListener("DOMContentLoaded", function() {
    
    // Header navigatsiya qismidagi foydalanuvchi linki (Agar HTMLda mavjud bo'lsa)
    const authLinkContainer = document.getElementById('auth-link-container');
    const user = localStorage.getItem('currentUser'); 
    
    function updateAuthLink() {
        if (!authLinkContainer) return;

        if (user) {
            // Tizimga kirgan
            const username = JSON.parse(user).username || 'Foydalanuvchi';
            authLinkContainer.innerHTML = `
                <div class="user-menu-container">
                    <button class="btn user-profile-btn"><i class="fas fa-user-circle"></i> ${username}</button>
                    <div class="dropdown-content">
                        <a href="./admin.html">Admin Panel</a>
                        <a href="#" id="logout-link">Chiqish</a>
                    </div>
                </div>
            `;
            
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                alert("Tizimdan chiqdingiz.");
                window.location.reload(); 
            });

        } else {
            // Tizimga kirmagan
            authLinkContainer.innerHTML = `
                <a href="./login.html" class="btn secondary-btn">Kirish</a>
            `;
        }
    }

    updateAuthLink();

});

// Global yordamchi: Boshqa skriptlar uchun pulni formatlash
window.formatCurrency = function(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0 UZS';
    return amount.toLocaleString('uz-UZ') + ' UZS';
};