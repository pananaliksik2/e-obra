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
            document.getElementById('chapter-title').innerText = `Kabanata ${chapter.chapter_number}: ${chapter.title}`;

            const rawContent = chapter.content.replace(/\n\n/g, " ");
            chapterSentences = rawContent.match(/[^\.!\?]+[\.!\?]+/g) || [rawContent];
            chapterSentences = chapterSentences.map(s => s.trim()).filter(s => s.length > 0);

            currentPage = 0;
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

    contentDiv.innerHTML = `<div class="reader-page-content">${highlightedContent}</div>`;

    setupGlossaryEvents();
    document.getElementById('page-indicator').innerText = `Pahina ${currentPage + 1} ng ${Math.ceil(chapterSentences.length / sentencesPerPage)}`;

    document.getElementById('prev-btn').disabled = (currentPage === 0);
    const isLastPage = (end >= chapterSentences.length);
    document.getElementById('next-btn').disabled = isLastPage;

    // Show next chapter button on every page, except if it's the last chapter
    if (currentChapterNum < 64) {
        document.getElementById('next-chapter-btn').classList.remove('d-none');
    } else {
        document.getElementById('next-chapter-btn').classList.add('d-none');
    }
}

function startReading(chapterNum) {
    const finalChapterNum = chapterNum || localStorage.getItem('current_chapter') || 1;
    loadChapter(finalChapterNum);
}

// Pagination
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if ((currentPage + 1) * sentencesPerPage < chapterSentences.length) {
        currentPage++;
        displayPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
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

// PDF Export - (Modified for Static Site: export full chapter text)
document.getElementById('download-pdf').addEventListener('click', function () {
    const contentDiv = document.getElementById('chapter-content');
    const originalContent = contentDiv.innerHTML;

    // Create clean full text without glossary spans
    // rawChapterContent is already available in the global scope
    const cleanFullText = rawChapterContent.split('\n\n').map(p => `<p class="mb-4">${p}</p>`).join('');

    // Scroll to top to prevent browsers from clipping the top of the document during print
    window.scrollTo(0, 0);

    // Temporarily swap content for printing
    contentDiv.innerHTML = `<div class="reader-page-content">${cleanFullText}</div>`;

    // Use a small timeout to ensure the DOM has updated before the print dialog opens
    setTimeout(() => {
        // Set dynamic filename via document.title
        const originalTitle = document.title;
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const dateStr = `${dd}-${mm}-${yy}`; // Using dashes because slashes are illegal in filenames

        document.title = `Kabanata ${currentChapterNum}_E-Obra_${dateStr}`;

        window.print();

        // Restore state
        document.title = originalTitle;
        contentDiv.innerHTML = originalContent;
        setupGlossaryEvents(); // Re-bind glossary events
    }, 250);
});

document.getElementById('next-chapter-btn').addEventListener('click', () => {
    if (currentChapterNum < 64) {
        const nextChapter = currentChapterNum + 1;
        localStorage.setItem('current_chapter', nextChapter);
        window.location.reload();
    }
});
