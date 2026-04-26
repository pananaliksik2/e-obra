let glossaryData = [];
let currentChapterId = null;
let currentChapterNum = null;
let chapterParagraphs = [];
let currentPage = 0;
const paragraphsPerPage = 3; 

// Load Glossary from API
async function fetchGlossary(chapterId = 1) {
    try {
        const response = await fetch(BASE_URL + `api/get_glossary.php?chapter_id=${chapterId}`);
        const data = await response.json();
        if (data.status === 'success') {
            glossaryData = data.data;
        }
    } catch (error) {
        console.error("Hindi makuha ang glossary:", error);
    }
}

// Load Chapter
// Highlight words from glossary
function highlightGlossaryWords(text) {
    if (!glossaryData || glossaryData.length === 0) return text;
    
    let highlightedText = text;
    
    // Sort words by length descending to avoid partial matches (e.g., "punla" before "pun")
    const sortedWords = [...glossaryData].sort((a, b) => b.word.length - a.word.length);
    
    sortedWords.forEach(item => {
        // Use regex to match word with word boundaries, case insensitive
        // We use a special placeholder to avoid re-matching already replaced spans
        const regex = new RegExp(`\\b(${item.word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, (match) => {
            return `<span class="glossary-term" data-word="${item.word}">${match}</span>`;
        });
    });
    
    return highlightedText;
}

async function loadChapter(num) {
    currentChapterNum = num;
    await fetchGlossary(num);
    
    try {
        const response = await fetch(BASE_URL + `api/get_chapter.php?num=${num}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            const chapter = data.data;
            currentChapterId = chapter.id;
            currentChapterNum = parseInt(chapter.chapter_number);
            document.getElementById('chapter-title').innerText = `Kabanata ${chapter.chapter_number}: ${chapter.title}`;
            
            // Split content into paragraphs
            chapterParagraphs = chapter.content.split('\n\n').filter(p => p.trim() !== "");
            currentPage = 0;
            document.getElementById('next-chapter-btn').classList.add('d-none');
            displayPage();
        }
    } catch (error) {
        console.error("Error loading chapter:", error);
    }
}

// Display current page of paragraphs
function displayPage() {
    const contentDiv = document.getElementById('chapter-content');
    contentDiv.classList.remove('fade-in');
    void contentDiv.offsetWidth; // Trigger reflow
    contentDiv.classList.add('fade-in');

    const start = currentPage * paragraphsPerPage;
    const end = start + paragraphsPerPage;
    const pToShow = chapterParagraphs.slice(start, end);

    let html = "";
    pToShow.forEach(p => {
        const highlightedP = highlightGlossaryWords(p);
        html += `<p class="mb-4">${highlightedP}</p>`;
    });

    contentDiv.innerHTML = html;
    setupGlossaryEvents();
    document.getElementById('page-indicator').innerText = `Pahina ${currentPage + 1} ng ${Math.ceil(chapterParagraphs.length / paragraphsPerPage)}`;
    
    // Update button states
    document.getElementById('prev-btn').disabled = (currentPage === 0);
    const isLastPage = (end >= chapterParagraphs.length);
    document.getElementById('next-btn').disabled = isLastPage;

    // Show "Next Chapter" button if it's the last page
    if (isLastPage) {
        document.getElementById('next-chapter-btn').classList.remove('d-none');
    } else {
        document.getElementById('next-chapter-btn').classList.add('d-none');
    }

    setupGlossaryEvents();
}

// Pagination Event Listeners
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if ((currentPage + 1) * paragraphsPerPage < chapterParagraphs.length) {
        currentPage++;
        displayPage();
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
});

// Interactive glossary logic
function setupGlossaryEvents() {
    const tooltip = document.getElementById('glossary-tooltip');
    const chapterDiv = document.getElementById('chapter-content');

    // Click on highlighted terms
    const terms = chapterDiv.querySelectorAll('.glossary-term');
    terms.forEach(term => {
        term.addEventListener('click', (e) => {
            showTooltip(e, term.dataset.word);
        });
    });

    // Also support double-click for any other words
    chapterDiv.addEventListener('dblclick', (e) => {
        const selection = window.getSelection().toString().trim().toLowerCase();
        if (selection) {
            const cleanSelection = selection.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
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
        document.getElementById('tooltip-context').innerText = match.modern_context || "";
        
        let x = e.clientX;
        let y = e.clientY - 120;
        
        if (x + 300 > window.innerWidth) x = window.innerWidth - 320;
        if (y < 0) y = e.clientY + 20;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.classList.add('active');

        setTimeout(() => {
            document.addEventListener('click', hideTooltip, { once: true });
        }, 100);
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('glossary-tooltip');
    tooltip.classList.remove('active');
}

// PDF Export integration
document.getElementById('download-pdf').addEventListener('click', async function() {
    const btn = this;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Inihahanda...';
    btn.disabled = true;

    try {
        const title = document.getElementById('chapter-title').innerText;
        
        // Gumawa ng hidden container para sa kumpletong nilalaman (hindi lang yung isang pahina)
        const printContainer = document.createElement('div');
        printContainer.style.padding = '40px';
        printContainer.style.background = '#ffffff';
        printContainer.style.color = '#000000';
        printContainer.style.fontFamily = 'serif';
        printContainer.style.lineHeight = '1.8';

        // Idagdag ang pamagat
        const h1 = document.createElement('h1');
        h1.innerText = title;
        h1.style.textAlign = 'center';
        h1.style.marginBottom = '40px';
        h1.style.color = '#800000';
        printContainer.appendChild(h1);

        // Idagdag ang lahat ng talata
        chapterParagraphs.forEach(p => {
            const pElement = document.createElement('p');
            pElement.style.marginBottom = '20px';
            pElement.style.textAlign = 'justify';
            pElement.style.fontSize = '12pt';
            
            // Re-apply glossary formatting for the PDF
            let formattedP = p;
            glossaryData.forEach(item => {
                const regex = new RegExp(`\\b${item.word}\\b`, 'gi');
                formattedP = formattedP.replace(regex, `<b style="color: #800000;">$&</b>`);
            });
            
            pElement.innerHTML = formattedP;
            printContainer.appendChild(pElement);
        });

        // Documentation footer
        const footer = document.createElement('div');
        footer.innerHTML = `<hr><center><small>Mula sa E-Obra: Panitikan at Teknolohiya - Noli Me Tangere</small></center>`;
        footer.style.marginTop = '40px';
        printContainer.appendChild(footer);

        const opt = {
            margin: [0.75, 0.75],
            filename: `${title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                letterRendering: true,
                useCORS: true,
                logging: false
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // I-execute ang paggawa ng PDF
        await html2pdf().set(opt).from(printContainer).save();
        
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("Nagkaroon ng problema sa pag-download ng PDF. Pakisubukang muli.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// Navigation logic
function showSection(sectionId) {
    const sections = ['library-view', 'chapter-list-view', 'reader-view'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (id === sectionId) {
            el.classList.remove('d-none');
            const navLink = document.getElementById('nav-' + id.split('-')[0]);
            if (navLink) navLink.classList.add('active');
        } else {
            el.classList.add('d-none');
            const navLink = document.getElementById('nav-' + id.split('-')[0]);
            if (navLink) navLink.classList.remove('active');
        }
    });

    // Handle Navbar States
    const navLib = document.getElementById('nav-library');
    const navRead = document.getElementById('nav-reader');
    const navQuiz = document.getElementById('nav-quiz');

    if (sectionId === 'library-view' || sectionId === 'chapter-list-view') {
        if (navLib) navLib.classList.add('active');
        if (navRead) navRead.classList.add('disabled');
        if (navQuiz) navQuiz.classList.add('disabled');
    } else {
        if (navLib) navLib.classList.remove('active');
        if (navRead) navRead.classList.remove('disabled');
        if (navQuiz) navQuiz.classList.remove('disabled');
    }
}

async function selectBook(bookKey) {
    if (bookKey === 'noli') {
        document.getElementById('book-title-header').innerText = 'Noli Me Tangere';
        showSection('chapter-list-view');
        
        try {
            const response = await fetch(BASE_URL + 'api/get_chapters_list.php');
            const data = await response.json();
            
            if (data.status === 'success') {
                const container = document.getElementById('chapter-list-container');
                let html = '';
                data.data.forEach(chapter => {
                    html += `
                    <div class="col-12 mb-2">
                        <div class="neu-card p-3 d-flex align-items-center justify-content-between" style="cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='rgba(128, 0, 0, 0.05)'" onmouseout="this.style.backgroundColor=''" onclick="startReading(${chapter.chapter_number})">
                            <div class="d-flex align-items-center gap-3">
                                <div class="neu-icon-box-sm">
                                    <span class="text-maroon fw-bold">${chapter.chapter_number}</span>
                                </div>
                                <h6 class="mb-0 text-maroon">${chapter.title}</h6>
                            </div>
                            <i class="bi bi-chevron-right text-muted"></i>
                        </div>
                    </div>`;
                });
                container.innerHTML = html;
            }
        } catch (error) {
            console.error("Error loading chapter list:", error);
            document.getElementById('chapter-list-container').innerHTML = '<p class="text-center text-danger">Nabigong i-load ang mga kabanata.</p>';
        }
    } else {
        alert("Ang 'El Filibusterismo' ay paparating pa lamang. Manatiling nakasubaybay!");
    }
}

function startReading(chapterNum) {
    const isReaderPage = window.location.pathname.includes('reader.php');
    
    if (!isReaderPage) {
        window.location.href = BASE_URL + `reader/reader.php?book=noli&chapter=${chapterNum}`;
        return;
    }

    loadChapter(chapterNum);
    showSection('reader-view');
    
    // Enable nav links once reading starts
    const navRead = document.getElementById('nav-reader');
    const navQuiz = document.getElementById('nav-quiz');
    if (navRead) navRead.classList.remove('disabled');
    if (navQuiz) navQuiz.classList.remove('disabled');
}

document.getElementById('brand-home').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('library-view');
});

document.getElementById('nav-library').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('library-view');
});

document.getElementById('nav-reader').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentChapterId) showSection('reader-view');
});

document.getElementById('start-quiz').addEventListener('click', () => {
    showSection('quiz-view');
    if (typeof startQuiz === 'function') {
        startQuiz(currentChapterId);
    }
});

document.getElementById('next-chapter-btn').addEventListener('click', () => {
    if (currentChapterNum < 64) {
        startReading(currentChapterNum + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Naabot mo na ang huling kabanata ng Noli Me Tangere.");
    }
});

document.getElementById('nav-quiz').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentChapterId) document.getElementById('start-quiz').click();
});
