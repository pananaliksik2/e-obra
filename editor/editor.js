/**
 * E-Obra: Chapter Editor
 * Manages viewing and editing of Noli Me Tangere chapters
 */

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_PASSWORD = "327892";
    let chaptersData = [];
    let currentChapterIndex = -1;

    // Elements
    const passwordScreen = document.getElementById('password-screen');
    const editorInterface = document.getElementById('editor-interface');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-editor-btn');
    const passwordError = document.getElementById('password-error');
    
    const chapterListContainer = document.getElementById('chapter-list');
    const searchInput = document.getElementById('search-chapters');
    const editorForm = document.getElementById('editor-form');
    const noChapterSelected = document.getElementById('no-chapter-selected');
    
    const editTitle = document.getElementById('edit-chapter-title');
    const editContent = document.getElementById('edit-chapter-content');
    const updateBtn = document.getElementById('update-chapter-btn');
    const saveAllBtn = document.getElementById('save-all-btn');

    // Login Logic
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    function handleLogin() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            passwordScreen.classList.add('d-none');
            editorInterface.classList.remove('d-none');
            loadChapters();
        } else {
            passwordError.classList.remove('d-none');
            passwordInput.classList.add('is-invalid');
            setTimeout(() => {
                passwordInput.classList.remove('is-invalid');
            }, 500);
        }
    }

    // Load Chapters
    async function loadChapters() {
        try {
            const response = await fetch('../data/chapters.json');
            chaptersData = await response.json();
            renderChapterList();
        } catch (error) {
            console.error("Failed to load chapters:", error);
            chapterListContainer.innerHTML = `<div class="text-danger text-center py-5">Error: Hindi ma-load ang kabanata.</div>`;
        }
    }

    // Render List
    function renderChapterList(filter = '') {
        const filtered = chaptersData.filter(ch => 
            ch.title.toLowerCase().includes(filter.toLowerCase()) || 
            ch.chapter_number.toString().includes(filter)
        );

        if (filtered.length === 0) {
            chapterListContainer.innerHTML = `<div class="text-muted text-center py-5">Walang nahanap.</div>`;
            return;
        }

        chapterListContainer.innerHTML = filtered.map((ch, idx) => {
            const globalIndex = chaptersData.indexOf(ch);
            return `
                <div class="editor-list-item ${globalIndex === currentChapterIndex ? 'active' : ''}" data-index="${globalIndex}">
                    <h6>Kabanata ${ch.chapter_number}</h6>
                    <p class="text-truncate">${ch.title}</p>
                </div>
            `;
        }).join('');

        // Add Click Listeners
        document.querySelectorAll('.editor-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                selectChapter(index);
            });
        });
    }

    // Search logic
    searchInput.addEventListener('input', () => {
        renderChapterList(searchInput.value);
    });

    // Select Chapter for Editing
    function selectChapter(index) {
        currentChapterIndex = index;
        const chapter = chaptersData[index];

        // UI feedback
        document.querySelectorAll('.editor-list-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.index) === index) item.classList.add('active');
        });

        noChapterSelected.classList.add('d-none');
        editorForm.classList.remove('d-none');

        editTitle.value = chapter.title;
        editContent.value = chapter.content;
    }

    // Update Logic (Save to Server)
    updateBtn.addEventListener('click', async () => {
        if (currentChapterIndex === -1) return;

        // Show loading state on button
        const originalBtnHtml = updateBtn.innerHTML;
        updateBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Ina-update...`;
        updateBtn.disabled = true;

        // Update local memory
        chaptersData[currentChapterIndex].title = editTitle.value;
        chaptersData[currentChapterIndex].content = editContent.value;

        try {
            const response = await fetch('save_chapters.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chaptersData)
            });
            const result = await response.json();

            if (result.success) {
                // Show success toast
                const toastEl = document.getElementById('success-toast');
                const toast = new bootstrap.Toast(toastEl);
                toast.show();
                renderChapterList(searchInput.value);
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Save failed:", error);
            alert("Hindi ma-save ang kabanata. Siguraduhin na tumatakbo ang XAMPP/PHP.");
        } finally {
            updateBtn.innerHTML = originalBtnHtml;
            updateBtn.disabled = false;
        }
    });

    // Save/Download Logic
    saveAllBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chaptersData, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "chapters.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
});
