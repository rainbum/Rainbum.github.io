document.addEventListener('DOMContentLoaded', (event) => {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    if (!lastVisit || now - lastVisit > oneDay) {
        alert('Welcome to Rainbum Liquidation!');
        localStorage.setItem('lastVisit', now);
    }
<<<<<<< HEAD
});
=======
});
>>>>>>> 585cc31b6086117d262b76c571b57a4a0544c3b2
