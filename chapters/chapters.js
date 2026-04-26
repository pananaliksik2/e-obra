let allChapters = [];

async function selectBook(bookKey) {
    if (bookKey === 'noli') {
        try {
            const response = await fetch(window.BASE_URL + 'data/chapters.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            allChapters = Array.isArray(data) ? data : data.data;
            renderChapters(allChapters);
        } catch (error) {
            console.error("Error loading chapter list:", error);
            const container = document.getElementById('chapter-list-container');
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center p-4">
                        <p class="text-maroon fw-bold">Hindi maikarga ang mga kabanata.</p>
                        <p class="small text-muted">Siguraduhing gamit ang <b>http://localhost/E-Obra/</b> sa halip na buksan ang file nang direkta.</p>
                    </div>`;
            }
        }
    }
}

function renderChapters(chapters) {
    const container = document.getElementById('chapter-list-container');
    if (!container) return;

    if (chapters.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-4">Walang nahanap na kabanata.</div>';
        return;
    }

    let html = '';
    chapters.forEach(chapter => {
        html += `
        <div class="col-12 mb-2 chapter-item-wrapper">
            <div class="chapter-item-neu" onclick="startReading(${chapter.chapter_number})">
                <div class="d-flex align-items-center">
                    <div class="chapter-num">${chapter.chapter_number}</div>
                    <div class="chapter-title">${chapter.title}</div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// Search Functionality
document.getElementById('chapter-search')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    console.log("Searching for:", searchTerm); // Debugging
    
    if (searchTerm === "") {
        renderChapters(allChapters);
    } else {
        const filtered = allChapters.filter(c => {
            const numMatch = c.chapter_number && c.chapter_number.toString().includes(searchTerm);
            const titleMatch = c.title && c.title.toLowerCase().includes(searchTerm);
            return numMatch || titleMatch;
        });
        renderChapters(filtered);
    }
});

function startReading(chapterNum) {
    localStorage.setItem('current_chapter', chapterNum);
    window.location.href = window.BASE_URL + `reader/`;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Default to 'noli' as it's our primary content
    selectBook('noli');
});
