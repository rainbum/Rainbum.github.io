document.addEventListener('DOMContentLoaded', (event) => {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    if (!lastVisit || now - lastVisit > oneDay) {
        alert('Welcome to Rainbum Liquidation!');
        localStorage.setItem('lastVisit', now);
    }
});