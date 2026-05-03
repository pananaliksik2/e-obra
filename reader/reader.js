let glossaryData = [];
let currentChapterId = null;
let currentChapterNum = null;
let currentChapterTitle = "";
let rawChapterContent = "";
let chapterPages = [];
let currentPage = 0;
const TARGET_CHARS_PER_PAGE = 1000;
const MAX_PARAGRAPHS_PER_PAGE = 8;
const MIN_PARAGRAPHS_PER_PAGE = 3;

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
            currentChapterNum = chapter.chapter_number;
            currentChapterTitle = chapter.title;
            rawChapterContent = chapter.content;
            document.getElementById('chapter-title').innerHTML = `
                <span class="chapter-number-label d-block">Kabanata ${chapter.chapter_number}</span>
                <span class="chapter-title-main">${chapter.title}</span>
            `;

            const rawContent = chapter.content.trim();
            const allParagraphs = rawContent.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
            
            // Group paragraphs into pages dynamically
            chapterPages = [];
            let currentPageContent = [];
            let currentCharCount = 0;

            allParagraphs.forEach((p, index) => {
                currentPageContent.push(p);
                currentCharCount += p.length;

                const isLastParagraph = index === allParagraphs.length - 1;
                const exceedsTargetChars = currentCharCount >= TARGET_CHARS_PER_PAGE;
                const exceedsMaxParagraphs = currentPageContent.length >= MAX_PARAGRAPHS_PER_PAGE;
                const hasMinParagraphs = currentPageContent.length >= MIN_PARAGRAPHS_PER_PAGE;

                if (isLastParagraph || ((exceedsTargetChars || exceedsMaxParagraphs) && hasMinParagraphs)) {
                    chapterPages.push(currentPageContent.map(para => {
                        const isLong = para.length > 150;
                        return `<p class="${isLong ? 'indented' : ''}">${para}</p>`;
                    }).join(""));
                    currentPageContent = [];
                    currentCharCount = 0;
                }
            });

            const savedPage = Persistence.load('current_page');
            currentPage = (savedPage !== null && savedPage < chapterPages.length) ? savedPage : 0;
            
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

    // Join paragraphs and highlight words
    const pageText = chapterPages[currentPage];
    const highlightedContent = highlightGlossaryWords(pageText);

    let imageHtml = '';
    if (currentPage === 0) {
        imageHtml = `<div class="text-center mb-5 fade-in chapter-image-container">
            <div class="neu-image-frame p-2 mb-2">
                <img src="../assets/chapterimg/chapter${currentChapterNum}img.png" 
                     class="img-fluid rounded shadow-sm" 
                     alt="Kabanata ${currentChapterNum} Larawan" 
                     onerror="this.closest('.chapter-image-container').style.display='none'" 
                     style="max-height: 500px; width: 100%; object-fit: contain; background: rgba(255,255,255,0.5);">
            </div>
            <div class="ai-disclaimer text-muted small mb-2" style="font-family: 'Playfair Display', serif; font-style: italic;">
                Ang larawang ito ay nilikha gamit ang AI.
            </div>
            <div class="neu-divider-sm mx-auto opacity-50"></div>
        </div>`;
    }

    contentDiv.innerHTML = `${imageHtml}<div class="reader-page-content">${highlightedContent}</div>`;

    setupGlossaryEvents();
    const totalPages = chapterPages.length;
    document.getElementById('page-indicator').innerText = `Pahina ${currentPage + 1} ng ${totalPages}`;
    
    // Update progress bar
    const progress = ((currentPage + 1) / totalPages) * 100;
    document.getElementById('reading-progress-bar').style.width = `${progress}%`;

    // Save progress
    Persistence.save('current_page', currentPage);

    if (currentPage === 0) {
        document.getElementById('prev-btn').classList.add('invisible');
        document.getElementById('first-page-btn').classList.add('invisible');
    } else {
        document.getElementById('prev-btn').classList.remove('invisible');
        document.getElementById('first-page-btn').classList.remove('invisible');
    }

    const isLastPage = (currentPage === totalPages - 1);
    if (isLastPage) {
        document.getElementById('next-btn').classList.add('invisible');
        document.getElementById('last-page-btn').classList.add('invisible');
    } else {
        document.getElementById('next-btn').classList.remove('invisible');
        document.getElementById('last-page-btn').classList.remove('invisible');
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

document.getElementById('first-page-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        triggerInkTransition(() => {
            currentPage = 0;
            displayPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

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
    if (currentPage < chapterPages.length - 1) {
        triggerInkTransition(() => {
            currentPage++;
            displayPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

document.getElementById('last-page-btn').addEventListener('click', () => {
    if (currentPage < chapterPages.length - 1) {
        triggerInkTransition(() => {
            currentPage = chapterPages.length - 1;
            displayPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Glossary logic
let currentTooltipHandler = null;
let activeTooltipSource = null; // Can be an Element or a Range

function setupGlossaryEvents() {
    const chapterDiv = document.getElementById('chapter-content');
    const terms = chapterDiv.querySelectorAll('.glossary-term');
    terms.forEach(term => {
        term.addEventListener('click', (e) => {
            e.stopPropagation();
            showTooltip(term, term.dataset.word);
        });
    });

    chapterDiv.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('glossary-term')) return;

        const selection = window.getSelection();
        const text = selection.toString().trim().toLowerCase();
        if (text) {
            e.stopPropagation();
            const range = selection.getRangeAt(0);
            const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
            showTooltip(range, cleanText);
        }
    });
}

function updateTooltipPosition() {
    if (!activeTooltipSource) return;
    
    const tooltip = document.getElementById('glossary-tooltip');
    if (!tooltip.classList.contains('active')) return;

    let rect;
    if (activeTooltipSource instanceof Range) {
        rect = activeTooltipSource.getBoundingClientRect();
    } else {
        rect = activeTooltipSource.getBoundingClientRect();
    }

    // Close if the source is out of view
    const isOutOfView = (
        rect.bottom < 0 || 
        rect.top > window.innerHeight || 
        rect.right < 0 || 
        rect.left > window.innerWidth
    );

    if (isOutOfView) {
        hideTooltip();
        return;
    }

    // Positioning logic
    const tooltipWidth = tooltip.offsetWidth || 300;
    const tooltipHeight = tooltip.offsetHeight || 100;
    
    let x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let y = rect.top - tooltipHeight - 15; // Top by default

    // If not enough space at top, show below
    if (y < 10) {
        y = rect.bottom + 15;
    }

    // Screen boundary checks
    const padding = 10;
    if (x < padding) x = padding;
    if (x + tooltipWidth > window.innerWidth - padding) x = window.innerWidth - tooltipWidth - padding;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

// Global listeners for dynamic tooltip
window.addEventListener('scroll', updateTooltipPosition, { passive: true });
window.addEventListener('resize', updateTooltipPosition, { passive: true });

function showTooltip(source, word) {
    const tooltip = document.getElementById('glossary-tooltip');
    const match = glossaryData.find(item => item.word.toLowerCase() === word.toLowerCase());

    if (match) {
        activeTooltipSource = source;
        
        if (currentTooltipHandler) {
            document.removeEventListener('click', currentTooltipHandler);
            currentTooltipHandler = null;
        }

        document.getElementById('tooltip-word').innerText = match.word;
        document.getElementById('tooltip-definition').innerText = match.definition;

        // Make tooltip interactive when active
        tooltip.style.pointerEvents = 'auto';
        tooltip.onclick = (event) => event.stopPropagation();

        // Initial position
        tooltip.classList.add('active');
        
        // Use requestAnimationFrame for precise initial positioning
        requestAnimationFrame(() => {
            updateTooltipPosition();
        });

        currentTooltipHandler = (event) => {
            if (!tooltip.contains(event.target)) {
                hideTooltip();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', currentTooltipHandler, { once: true });
        }, 50);
    }
}

function hideTooltip() {
    const tooltip = document.getElementById('glossary-tooltip');
    if (tooltip) {
        tooltip.classList.remove('active');
        tooltip.style.pointerEvents = 'none';
    }
    if (currentTooltipHandler) {
        document.removeEventListener('click', currentTooltipHandler);
        currentTooltipHandler = null;
    }
    activeTooltipSource = null;
}


// PDF Export - Using html2pdf for better mobile and filename support
document.getElementById('download-pdf').addEventListener('click', function () {
    console.log("Sinisimulan ang pag-export ng PDF gamit ang jsPDF...");
    
    // Using the explicitly loaded UMD version from index.html
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
        console.error("Hindi mahanap ang window.jspdf.jsPDF.");
        alert("Paumanhin, hindi ma-load ang PDF library. Pakisuri ang iyong internet connection.");
        return;
    }



    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Configuration
    const margin = 25.4; 
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    const paragraphSpacing = 4;
    
    // Show loading state
    const loadingOverlay = document.getElementById('pdf-loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    const originalBtnText = this.innerHTML;
    this.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Inihahanda...`;
    this.disabled = true;

    try {
        console.log("Ipinoproseso ang kabanata:", currentChapterNum);
        
        if (!rawChapterContent) {
            throw new Error("Walang nilalaman ang kabanata.");
        }

        // 1. Draw Header
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(128, 0, 0); // Maroon
        doc.text("NOLI ME TANGERE", pageWidth / 2, 25, { align: 'center' });
        
        doc.setFont("times", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("ni José Rizal", pageWidth / 2, 32, { align: 'center' });
        doc.text('salin ni Virgilio "Rio Alma" Almario', pageWidth / 2, 38, { align: 'center' });
        
        doc.setFont("times", "italic");
        doc.setFontSize(15);
        doc.setTextColor(50, 50, 50);
        doc.text(`Kabanata ${currentChapterNum}: ${currentChapterTitle}`, pageWidth / 2, 48, { align: 'center' });
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(128, 0, 0);
        doc.line(margin, 52, pageWidth - margin, 52);
        
        // 2. Draw Content
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        
        let y = 62; // Start position on first page adjusted for taller header
        // Split by one or more newlines to ensure we capture all paragraphs
        const paragraphs = rawChapterContent.split(/\n+/);
        console.log(`Natagpuan ang ${paragraphs.length} na talata.`);
        
        paragraphs.forEach((para, index) => {
            const cleanPara = para.trim();
            if (!cleanPara) return;

            // Indentation logic similar to the reader
            // In the reader, long paragraphs or those with specific context get indented
            const isLong = cleanPara.length > 150;
            const xPos = isLong ? margin + 10 : margin; // Indent if long
            const currentMaxWidth = isLong ? maxWidth - 10 : maxWidth;

            const lines = doc.splitTextToSize(cleanPara, currentMaxWidth);
            const blockHeight = lines.length * lineHeight;
            
            // Page break check - if paragraph won't fit, move to next page
            if (y + blockHeight > pageHeight - margin) {
                console.log("Nagdadagdag ng bagong pahina sa y =", y);
                doc.addPage();
                y = margin; // Reset to top margin
            }
            
            // Draw the paragraph
            doc.text(cleanPara, xPos, y, { 
                maxWidth: currentMaxWidth, 
                align: 'justify' 
            });
            
            y += blockHeight + paragraphSpacing;
        });

        // 3. Add Footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        console.log(`Tapos na! Kabuuang pahina: ${pageCount}`);
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`E-Obra | Pahina ${i} ng ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }


        // 4. Save
        const filename = `Kabanata_${currentChapterNum}_E-Obra.pdf`;
        doc.save(filename);

    } catch (err) {
        console.error('PDF Generation Error:', err);
        alert('Nagkaroon ng problema sa paggawa ng PDF. Mangyaring subukan muli.');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
        this.innerHTML = originalBtnText;
        this.disabled = false;
    }
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
