let glossaryData = [];
let currentChapterId = null;
let currentChapterNum = null;
let rawChapterContent = "";
let chapterSentences = [];
let currentPage = 0;
const sentencesPerPage = 20;

// Load Glossary from JSON
async function fetchGlossary(chapterId = 1) {
    try {
        const response = await fetch(window.BASE_URL + 'data/glossary.json');
        const data = await response.json();
        // Filter glossary for current chapter
        glossaryData = data.filter(item => parseInt(item.chapter_id) === parseInt(chapterId));
    } catch (error) {
        console.error("Hindi makuha ang glossary:", error);
    }
}

// Highlight words from glossary
function highlightGlossaryWords(text) {
    if (!glossaryData || glossaryData.length === 0) return text;

    let highlightedText = text;
    const sortedWords = [...glossaryData].sort((a, b) => b.word.length - a.word.length);

    sortedWords.forEach(item => {
        const regex = new RegExp(`\\b(${item.word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, (match) => {
            return `<span class="glossary-term" data-word="${item.word}">${match}</span>`;
        });
    });

    return highlightedText;
}

async function loadChapter(num) {
    currentChapterNum = parseInt(num);

    try {
        const response = await fetch(window.BASE_URL + 'data/chapters.json');
        const chapters = await response.json();

        const chapter = chapters.find(c => parseInt(c.chapter_number) === currentChapterNum);

        if (chapter) {
            // Fetch glossary after finding the internal ID if needed, 
            // but our glossary uses chapter_number as chapter_id usually in the SQL export logic
            await fetchGlossary(chapter.chapter_number);

            currentChapterId = chapter.id;
            rawChapterContent = chapter.content;
            document.getElementById('chapter-title').innerHTML = `
                <span class="chapter-number-label d-block">Kabanata ${chapter.chapter_number}</span>
                <span class="chapter-title-main">${chapter.title}</span>
            `;

            const rawContent = chapter.content.replace(/\n\n/g, " ");
            chapterSentences = rawContent.match(/[^\.!\?]+[\.!\?]+/g) || [rawContent];
            chapterSentences = chapterSentences.map(s => s.trim()).filter(s => s.length > 0);

            const savedPage = Persistence.load('current_page');
            currentPage = (savedPage !== null) ? savedPage : 0;
            
            document.getElementById('next-chapter-btn').classList.add('d-none');
            displayPage();
        } else {
            document.getElementById('chapter-content').innerHTML = `<div class="text-center p-5 text-maroon">Paumanhin, ang kabanatang ito ay hindi pa magagamit.</div>`;
        }
    } catch (error) {
        console.error("Error loading chapter:", error);
    }
}

function displayPage() {
    const contentDiv = document.getElementById('chapter-content');
    contentDiv.classList.remove('fade-in');
    void contentDiv.offsetWidth;
    contentDiv.classList.add('fade-in');

    const start = currentPage * sentencesPerPage;
    const end = start + sentencesPerPage;
    const sentencesToShow = chapterSentences.slice(start, end);

    // Join sentences and highlight words
    const pageText = sentencesToShow.join(" ");
    const highlightedContent = highlightGlossaryWords(pageText);

    let imageHtml = '';
    if (currentPage === 0) {
        imageHtml = `<div class="text-center mb-4 fade-in">
            <img src="../assets/chapterimg/chapter${currentChapterNum}img.png" class="img-fluid rounded shadow-sm border border-secondary" alt="Kabanata ${currentChapterNum} Larawan" onerror="this.style.display='none'" style="max-height: 450px; object-fit: cover;">
        </div>`;
    }

    contentDiv.innerHTML = `${imageHtml}<div class="reader-page-content">${highlightedContent}</div>`;

    setupGlossaryEvents();
    const totalPages = Math.ceil(chapterSentences.length / sentencesPerPage);
    document.getElementById('page-indicator').innerText = `Pahina ${currentPage + 1} ng ${totalPages}`;
    
    // Update progress bar
    const progress = ((currentPage + 1) / totalPages) * 100;
    document.getElementById('reading-progress-bar').style.width = `${progress}%`;

    // Save progress
    Persistence.save('current_page', currentPage);

    if (currentPage === 0) {
        document.getElementById('prev-btn').classList.add('invisible');
    } else {
        document.getElementById('prev-btn').classList.remove('invisible');
    }

    const isLastPage = (end >= chapterSentences.length);
    if (isLastPage) {
        document.getElementById('next-btn').classList.add('invisible');
    } else {
        document.getElementById('next-btn').classList.remove('invisible');
    }

    // Show next chapter button on every page, except if it's the last chapter
    if (currentChapterNum < 64) {
        document.getElementById('next-chapter-btn').classList.remove('d-none');
    } else {
        document.getElementById('next-chapter-btn').classList.add('d-none');
    }

    if (currentChapterNum > 1) {
        document.getElementById('prev-chapter-btn').classList.remove('d-none');
    } else {
        document.getElementById('prev-chapter-btn').classList.add('d-none');
    }
}

function startReading(chapterNum) {
    const finalChapterNum = chapterNum || localStorage.getItem('current_chapter') || 1;
    loadChapter(finalChapterNum);
}

// Pagination
function triggerInkTransition(callback) {
    const ink = document.getElementById('ink-transition');
    if (!ink) return callback();
    ink.classList.remove('ink-active');
    void ink.offsetWidth;
    ink.classList.add('ink-active');
    setTimeout(callback, 400);
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        triggerInkTransition(() => {
            currentPage--;
            displayPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if ((currentPage + 1) * sentencesPerPage < chapterSentences.length) {
        triggerInkTransition(() => {
            currentPage++;
            displayPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Glossary logic
function setupGlossaryEvents() {
    const chapterDiv = document.getElementById('chapter-content');
    const terms = chapterDiv.querySelectorAll('.glossary-term');
    terms.forEach(term => {
        term.addEventListener('click', (e) => {
            showTooltip(e, term.dataset.word);
        });
    });

    chapterDiv.addEventListener('dblclick', (e) => {
        // If the target is already a glossary term, let the click handler handle it
        if (e.target.classList.contains('glossary-term')) return;

        const selection = window.getSelection().toString().trim().toLowerCase();
        if (selection) {
            const cleanSelection = selection.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            showTooltip(e, cleanSelection);
        }
    });
}

function showTooltip(e, word) {
    const tooltip = document.getElementById('glossary-tooltip');
    const match = glossaryData.find(item => item.word.toLowerCase() === word.toLowerCase());

    if (match) {
        document.getElementById('tooltip-word').innerText = match.word;
        document.getElementById('tooltip-definition').innerText = match.definition;

        // Prevent clicking inside the tooltip from closing it
        tooltip.onclick = (event) => event.stopPropagation();

        let x = e.clientX;
        let y = e.clientY - 120;

        if (x + 300 > window.innerWidth) x = window.innerWidth - 320;
        if (y < 0) y = e.clientY + 20;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.classList.add('active');

        // Close when clicking outside
        const closeHandler = (event) => {
            if (!tooltip.contains(event.target)) {
                hideTooltip();
                document.removeEventListener('click', closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 100);
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('glossary-tooltip');
    if (tooltip) tooltip.classList.remove('active');
}

// PDF Export - Using html2pdf for better mobile and filename support
document.getElementById('download-pdf').addEventListener('click', function () {
    const contentDiv = document.getElementById('chapter-content');
    const originalContent = contentDiv.innerHTML;

    // Create a clean container for the PDF content
    const element = document.createElement('div');
    element.className = 'p-5 bg-white text-dark';
    element.style.fontFamily = "'Times New Roman', serif";

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)}`;
    const filename = `Kabanata_${currentChapterNum}_E-Obra_${dateStr}.pdf`;

    const cleanFullText = rawChapterContent.split('\n\n').map(p => `<p style="margin-bottom: 1.5rem; text-align: justify; line-height: 1.6; font-size: 12pt;">${p}</p>`).join('');
    
    element.innerHTML = `
        <div style="text-align: center; margin-bottom: 3rem;">
            <h1 style="font-size: 18pt; margin-bottom: 5px; color: #800000;">Noli Me Tangere</h1>
            <h2 style="font-size: 14pt; font-weight: normal;">Kabanata ${currentChapterNum}</h2>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        </div>
        <div>${cleanFullText}</div>
        <div style="margin-top: 3rem; text-align: center; font-size: 10pt; color: #888;">
            Inilathala ng E-Obra Educational Platform
        </div>
    `;

    const opt = {
        margin: [1, 1],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Show loading state
    const originalBtnText = this.innerHTML;
    this.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Inihahanda...`;
    this.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
        this.innerHTML = originalBtnText;
        this.disabled = false;
    });
});


document.getElementById('next-chapter-btn').addEventListener('click', () => {
    if (currentChapterNum < 64) {
        const nextChapter = currentChapterNum + 1;
        localStorage.setItem('current_chapter', nextChapter);
        Persistence.save('current_page', 0);
        Persistence.save('scroll_pos', 0);
        window.location.reload();
    }
});

document.getElementById('prev-chapter-btn').addEventListener('click', () => {
    if (currentChapterNum > 1) {
        const prevChapter = currentChapterNum - 1;
        localStorage.setItem('current_chapter', prevChapter);
        Persistence.save('current_page', 0);
        Persistence.save('scroll_pos', 0);
        window.location.reload();
    }
});
