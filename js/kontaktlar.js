document.addEventListener('DOMContentLoaded', () => {
    // 1. Kerakli elementlarni tanlab olish
    const contactForm = document.getElementById('contact-form');
    const messageStatus = document.getElementById('message-status');

    if (contactForm) {
        // 2. Formani yuborish hodisasini tinglash
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Sahifaning yangilanishini to'xtatish

            // Yuborish tugmasini vaqtinchalik o'chirib qo'yish
            const submitBtn = contactForm.querySelector('.btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...';

            // Xabarni tozalash
            hideMessageStatus();

            // Formadan ma'lumotlarni yig'ish (Real serverga yuborish uchun)
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            console.log('Yuborilayotgan ma\'lumotlar:', data);

            // 3. Serverga so'rovni simulyatsiya qilish (Real sharoitda bu yerda Fetch API ishlatiladi)
            
            // 2 soniya kutishni simulyatsiya qilamiz
            setTimeout(() => {
                // Simulyatsiya natijasi: Muvaffaqiyatli yuborildi
                const success = true; // TEST UCHUN: false qilsangiz xato xabari chiqadi

                if (success) {
                    showMessageStatus('Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.', 'success');
                    contactForm.reset(); // Formani tozalash
                } else {
                    showMessageStatus('Xabarni yuborishda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring yoki to\'g\'ridan-to\'g\'ri email orqali bog\'laning.', 'error');
                }

                // Tugmani asl holiga qaytarish
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Xabarni yuborish';

            }, 2000); // 2000 millisekund = 2 soniya
        });
    }

    // 4. Xabar statusini ko'rsatish funksiyasi
    function showMessageStatus(message, type) {
        messageStatus.textContent = message;
        messageStatus.className = 'message-status'; // Avvalgi klasslarni tozalash
        messageStatus.classList.add(type);
        messageStatus.style.visibility = 'visible';
        messageStatus.style.opacity = '1';
    }

    // 5. Xabar statusini yashirish funksiyasi
    function hideMessageStatus() {
        messageStatus.style.visibility = 'hidden';
        messageStatus.style.opacity = '0';
    }
});