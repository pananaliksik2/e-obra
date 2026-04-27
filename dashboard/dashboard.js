// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Animate Book Cards on Scroll
    const bookCards = document.querySelectorAll('.book-card-horizontal');
    
    bookCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // Starts animation when the top of the card hits 85% of viewport height
                toggleActions: "play none none none",
            },
            opacity: 0,
            y: 50,
            rotateX: -10, // Subtle 3D tilt
            duration: 1.2,
            ease: "power3.out",
            delay: index * 0.2 // Staggered reveal
        });
    });

    // Animate the intro mission text for extra polish
    gsap.from(".hero-description", {
        opacity: 0,
        y: 30,
        duration: 1.5,
        delay: 0.5,
        ease: "power2.out"
    });

    gsap.from(".feature-item", {
        opacity: 0,
        x: -20,
        stagger: 0.2,
        duration: 1,
        delay: 1,
        ease: "back.out(1.7)"
    });
});

async function selectBook(bookKey) {
    if (bookKey === 'noli') {
        window.location.href = window.BASE_URL + 'chapters/';
    } else {
        alert("Ang 'El Filibusterismo' ay paparating pa lamang. Manatiling nakasubaybay!");
    }
}

function startReading(chapterNum) {
    window.location.href = window.BASE_URL + `reader/reader.html?book=noli&chapter=${chapterNum}`;
}
