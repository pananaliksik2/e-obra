/**
 * E-Obra Dashboard (Chapter Selection)
 * ============================================================
 * Displays all chapters with user progress, stats, and 
 * provides navigation to the reader.
 * ============================================================
 */

(function () {
    'use strict';

    // DOM Elements
    const loadingScreen = document.getElementById('loadingScreen');
    const dashboardPage = document.getElementById('dashboardPage');
    const navUserName = document.getElementById('navUserName');
    const navUserAvatar = document.getElementById('navUserAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const heroGreeting = document.getElementById('heroGreeting');
    const chaptersGrid = document.getElementById('chaptersGrid');
    const statChapters = document.getElementById('statChapters');
    const statRead = document.getElementById('statRead');
    const statQuiz = document.getElementById('statQuiz');
    const overallPercent = document.getElementById('overallPercent');
    const overallProgressFill = document.getElementById('overallProgressFill');

    let currentUser = null;

    // =============================================
    // Auth Guard
    // =============================================

    function checkAuth() {
        auth.onAuthStateChanged((firebaseUser) => {
            const storedUser = sessionStorage.getItem('eobra_user');

            if (firebaseUser && storedUser) {
                currentUser = JSON.parse(storedUser);
                initDashboard();
            } else {
                window.location.href = 'index.php';
            }
        });
    }

    // =============================================
    // Initialize Dashboard
    // =============================================

    async function initDashboard() {
        // Set user info in nav
        navUserName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
        navUserAvatar.src = currentUser.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.first_name) + '&background=C9A84C&color=1A1410';

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) heroGreeting.textContent = 'Magandang umaga';
        else if (hour < 18) heroGreeting.textContent = 'Magandang hapon';
        else heroGreeting.textContent = 'Magandang gabi';

        heroGreeting.textContent += `, ${currentUser.first_name}!`;

        // Fetch chapters
        await loadChapters();

        // Hide loading, show dashboard
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                dashboardPage.style.display = 'block';
                animateEntrance();
            }
        });
    }

    // =============================================
    // Load Chapters from API
    // =============================================

    async function loadChapters() {
        try {
            const res = await fetch(`${API_BASE}/chapters.php?user_id=${currentUser.user_id}`);
            const data = await res.json();

            if (data.status === 'success') {
                renderChapters(data.chapters);
                updateStats(data.chapters);
            }
        } catch (error) {
            console.error('Error loading chapters:', error);
            chaptersGrid.innerHTML = `
                <div class="card text-center" style="grid-column: 1/-1; padding: 3rem;">
                    <p style="color: var(--color-error);">Hindi ma-load ang mga kabanata. Pakitiyak na tumatakbo ang XAMPP server.</p>
                </div>
            `;
        }
    }

    // =============================================
    // Render Chapter Cards
    // =============================================

    function renderChapters(chapters) {
        chaptersGrid.innerHTML = '';

        chapters.forEach((chapter, index) => {
            const isRead = chapter.is_read == 1;
            const hasQuiz = chapter.quiz_score > 0;
            const score = chapter.quiz_score || 0;
            const total = chapter.total_items || 0;

            let statusBadge, statusText, statusIcon;

            if (hasQuiz) {
                statusBadge = 'badge-success';
                statusText = `Marka: ${score}/${total}`;
                statusIcon = '✅';
            } else if (isRead) {
                statusBadge = 'badge-pending';
                statusText = 'Nabasa na — Pagsusulit: Hindi pa';
                statusIcon = '📖';
            } else {
                statusBadge = 'badge-locked';
                statusText = 'Hindi pa nabasa';
                statusIcon = '📕';
            }

            const cardClass = hasQuiz ? 'completed' : '';

            const card = document.createElement('div');
            card.className = `chapter-card ${cardClass}`;
            card.setAttribute('data-chapter-id', chapter.chapter_id);
            card.innerHTML = `
                <div class="chapter-card-header">
                    <div class="chapter-number">
                        <span>${chapter.chapter_number}</span>
                    </div>
                    <div class="chapter-info">
                        <p class="chapter-label">Kabanata ${chapter.chapter_number}</p>
                        <h3 class="chapter-title">${chapter.title}</h3>
                    </div>
                </div>
                <div class="chapter-card-body">
                    <p class="chapter-summary">${chapter.chapter_summary || ''}</p>
                </div>
                <div class="chapter-card-footer">
                    <div class="chapter-progress-info">
                        <span class="icon">${statusIcon}</span>
                        <span class="badge ${statusBadge}">${statusText}</span>
                    </div>
                    <div class="chapter-action">
                        Basahin <span>→</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                navigateToChapter(chapter.chapter_id);
            });

            chaptersGrid.appendChild(card);
        });
    }

    // =============================================
    // Update Stats
    // =============================================

    function updateStats(chapters) {
        const totalChapters = chapters.length;
        const readCount = chapters.filter(c => c.is_read == 1).length;
        const quizCount = chapters.filter(c => c.quiz_score > 0).length;
        const progressPercent = totalChapters > 0 ? Math.round((quizCount / totalChapters) * 100) : 0;

        // Animate numbers
        animateCounter(statChapters, totalChapters);
        animateCounter(statRead, readCount);
        animateCounter(statQuiz, quizCount);

        overallPercent.textContent = progressPercent + '%';
        
        gsap.to(overallProgressFill, {
            width: progressPercent + '%',
            duration: 1.5,
            delay: 0.5,
            ease: 'power2.out'
        });
    }

    function animateCounter(el, target) {
        let current = 0;
        const increment = Math.ceil(target / 30);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 30);
    }

    // =============================================
    // Navigate to Chapter
    // =============================================

    function navigateToChapter(chapterId) {
        gsap.to(dashboardPage, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                window.location.href = `reader.html?chapter=${chapterId}`;
            }
        });
    }

    // =============================================
    // Entrance Animations
    // =============================================

    function animateEntrance() {
        const tl = gsap.timeline();

        tl.from('.main-nav', {
            y: -64,
            duration: 0.5,
            ease: 'power3.out'
        })
        .from('.dashboard-hero', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.2')
        .from('.stat-item', {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.overall-progress', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power3.out'
        }, '-=0.2')
        .from('.chapters-header', {
            opacity: 0,
            x: -20,
            duration: 0.4,
            ease: 'power3.out'
        }, '-=0.2')
        .from('.chapter-card', {
            opacity: 0,
            y: 30,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out'
        }, '-=0.2');
    }

    // =============================================
    // Logout
    // =============================================

    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            sessionStorage.removeItem('eobra_user');
            window.location.href = 'index.php';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // =============================================
    // Initialize
    // =============================================

    checkAuth();

})();
