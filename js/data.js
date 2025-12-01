// js/data.js (Taxminiy ma'lumotlar massivi)

const initialEvents = [
    {
        id: 101,
        title: "Shahzoda Konserti",
        type: "Konsert",
        date: "2025-12-15T20:00",
        location: "Istiqlol San'at Saroyi",
        image: "./images/shahzoda.jpg",
        description: "Eng so'nggi hitlar bilan yakkaxon konsert dasturi.",
        // Tadbir narxlari kategoriyalar bo'yicha. Admin panelda buni saqlash kerak.
        categories: { 
            economy: 150000,
            middle: 250000,
            vip: 500000
        }
        // Admin panelda yaratilgan `price` maydonini biz `economy` deb qabul qilamiz
        // yoki eng arzon narx deb olamiz.
    },
    {
        id: 102,
        title: "Bunyodkor - Paxtakor",
        type: "Sport",
        date: "2025-11-30T16:00",
        location: "Bunyodkor Stadioni",
        image: "./images/football.jpg",
        description: "Superliga doirasidagi markaziy uchrashuv.",
        categories: { 
            general: 80000,
            stand: 120000
        }
    },
    // ... boshqa tadbirlar
];

// LocalStoragega ma'lumotlarni birinchi marta yuklash (Agar mavjud bo'lmasa)
if (!localStorage.getItem('allEvents')) {
    localStorage.setItem('allEvents', JSON.stringify(initialEvents));
}