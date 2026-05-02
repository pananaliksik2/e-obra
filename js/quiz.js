let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentChapter = null;

async function startQuiz(chapterNumber) {
    // Priority: 1. Argument, 2. LocalStorage, 3. Default to 1
    const finalChapterNum = parseInt(chapterNumber || localStorage.getItem('current_chapter') || 1);
    console.log("Starting quiz for chapter:", finalChapterNum);
    
    try {
        // Use window.BASE_URL if available, otherwise calculate it
        const baseUrl = window.BASE_URL || (window.location.origin + window.location.pathname.split('/quiz/')[0] + '/');
        
        // 1. Fetch chapters to identify the chapter object (with cache busting)
        const chaptersResponse = await fetch(baseUrl + 'data/chapters.json?v=' + new Date().getTime());
        const chapters = await chaptersResponse.json();
        currentChapter = chapters.find(c => parseInt(c.chapter_number) === finalChapterNum);
        
        if (!currentChapter) {
            console.error("Chapter not found in chapters.json:", finalChapterNum);
            throw new Error("Kabanata hindi nahanap.");
        }

        const chapterId = parseInt(currentChapter.id);

        // 2. Fetch quizzes.json (with cache busting)
        const quizResponse = await fetch(baseUrl + 'data/quizzes.json?v=' + new Date().getTime());
        if (!quizResponse.ok) throw new Error("Hindi maikarga ang quizzes.json");
        const quizData = await quizResponse.json();
        
        // 3. Find the quiz entry. Loose matching for robustness.
        const quizMetadata = quizData.quizzes.find(q => {
            const q_cid = String(q.chapter_id).trim();
            return q_cid == String(chapterId) || q_cid == String(finalChapterNum);
        });
        
        if (quizMetadata) {
            console.log("Quiz metadata found:", quizMetadata);
            // 4. Filter questions belonging to this quiz
            const targetQuizId = String(quizMetadata.id).trim();
            const rawQuestions = quizData.questions.filter(q => String(q.quiz_id).trim() == targetQuizId);
            
            if (rawQuestions && rawQuestions.length > 0) {
                console.log(`Found ${rawQuestions.length} questions.`);
                // Map the data format to what the UI expects
                quizQuestions = rawQuestions.map(q => ({
                    question: q.question_text,
                    options: [q.option_a, q.option_b, q.option_c, q.option_d],
                    // Robust answer parsing
                    answer: (q.correct_answer || 'A').trim().toUpperCase().charCodeAt(0) - 65 
                }));
                
                const titleElem = document.getElementById('quiz-chapter-title');
                if (titleElem) titleElem.innerText = `Pagsusulit: Kabanata ${currentChapter.chapter_number}`;
                
                currentQuestionIndex = 0;
                score = 0;
                showQuestion();
                
                const contentDiv = document.getElementById('quiz-content');
                const resultDiv = document.getElementById('quiz-result');
                if (contentDiv) contentDiv.style.display = 'block';
                if (resultDiv) resultDiv.style.display = 'none';
                return;
            }
        }
        
        // If no quiz or questions found
        alert(`Paumanhin, wala pang pagsusulit para sa kabanatang ito. (Chapter: ${finalChapterNum}, ID: ${chapterId})`);
        window.location.href = baseUrl + `reader/`;
        
    } catch (error) {
        console.error("Critical error in startQuiz:", error);
        alert("Nagkaroon ng problema sa pag-load ng pagsusulit.");
    }
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    if (!question) return;

    const qTextElem = document.getElementById('question-text');
    const qCounterElem = document.getElementById('question-counter');
    const progressElem = document.getElementById('quiz-progress');

    if (qTextElem) qTextElem.innerText = question.question;
    if (qCounterElem) qCounterElem.innerText = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    
    // Update progress bar
    if (progressElem) {
        const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
        progressElem.style.width = `${progress}%`;
    }
    
    const container = document.getElementById('options-container');
    if (!container) return;
    container.innerHTML = '';
    
    const labels = ['A', 'B', 'C', 'D'];
    
    // Create an array of option objects with their original index to track the correct answer
    let optionsWithMeta = question.options.map((opt, index) => ({
        text: opt,
        originalIndex: index
    }));
    
    // Shuffle the options randomly
    optionsWithMeta.sort(() => Math.random() - 0.5);
    
    optionsWithMeta.forEach((opt, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        
        const btn = document.createElement('button');
        btn.className = 'neu-opt-btn';
        btn.innerHTML = `<span class="text-maroon fw-bold me-3">${labels[index]}.</span> ${opt.text}`;
        
        const isCorrect = opt.originalIndex === question.answer;
        btn.onclick = () => handleAnswer(isCorrect, btn);
        if (isCorrect) btn.dataset.correct = "true";
        
        col.appendChild(btn);
        container.appendChild(col);
    });
}

function handleAnswer(isCorrect, btn) {
    const buttons = document.querySelectorAll('.neu-opt-btn');
    buttons.forEach(b => b.disabled = true);
    
    btn.classList.add('selected');
    
    setTimeout(() => {
        if (isCorrect) {
            btn.classList.add('correct');
            score++;
        } else {
            btn.classList.add('wrong');
            buttons.forEach(b => {
                if (b.dataset.correct === "true") b.classList.add('correct');
            });
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1500);
    }, 600);
}

function showResult() {
    const contentDiv = document.getElementById('quiz-content');
    const resultDiv = document.getElementById('quiz-result');
    if (contentDiv) contentDiv.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'block';
    
    const percentage = (score / quizQuestions.length) * 100;
    let message = "";
    let icon = "bi-emoji-smile";
    
    if (percentage >= 90) {
        message = "Napakagaling! Ikaw ay isang eksperto.";
        icon = "bi-trophy-fill";
    } else if (percentage >= 70) {
        message = "Mahusay na trabaho!";
        icon = "bi-star-fill";
    } else if (percentage >= 50) {
        message = "Hindi masama! Ipagpatuloy ang pag-aaral.";
        icon = "bi-hand-thumbs-up";
    } else {
        message = "Huwag mawalan ng pag-asa. Basahin muli ang kabanata.";
        icon = "bi-book";
    }
    
    const iconBox = resultDiv.querySelector('.neu-icon-box i');
    if (iconBox) iconBox.className = `bi ${icon} display-4 text-maroon`;

    const scoreTextElem = document.getElementById('score-text');
    if (scoreTextElem) {
        scoreTextElem.innerHTML = `
            <div class="h4 text-maroon mb-2">${message}</div>
            <div class="display-3 fw-bold mb-1">${score} / ${quizQuestions.length}</div>
        `;
    }

    // Trigger confetti if score is high
    if (score >= quizQuestions.length * 0.6 && typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#800000', '#c5a059', '#ffffff']
        });
    }
}
