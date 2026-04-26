let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentChapter = null;

async function startQuiz(chapterNumber) {
    const finalChapterNum = chapterNumber || localStorage.getItem('current_chapter') || 1;
    
    try {
        // Fetch chapters.json (using BASE_URL to ensure correct path)
        const baseUrl = window.location.origin + window.location.pathname.split('/quiz/')[0] + '/';
        const response = await fetch(baseUrl + 'data/chapters.json');
        const chapters = await response.json();
        
        // Find the specific chapter
        currentChapter = chapters.find(c => parseInt(c.chapter_number) === parseInt(finalChapterNum));
        
        if (currentChapter && currentChapter.quiz) {
            quizQuestions = currentChapter.quiz;
            
            // Update title
            document.getElementById('quiz-chapter-title').innerText = `Pagsusulit: Kabanata ${currentChapter.chapter_number}`;
            
            currentQuestionIndex = 0;
            score = 0;
            showQuestion();
            
            document.getElementById('quiz-content').style.display = 'block';
            document.getElementById('quiz-result').style.display = 'none';
        } else {
            alert("Paumanhin, wala pang pagsusulit para sa kabanatang ito.");
            window.location.href = `../reader/`;
        }
    } catch (error) {
        console.error("Error loading quiz:", error);
        alert("Nagkaroon ng problema sa pag-load ng pagsusulit.");
    }
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = question.question;
    document.getElementById('question-counter').innerText = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('quiz-progress').style.width = `${progress}%`;
    
    const container = document.getElementById('options-container');
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
        
        // Check if this option's original index matches the correct answer index
        const isCorrect = opt.originalIndex === question.answer;
        
        btn.onclick = () => handleAnswer(isCorrect, btn);
        
        // Add a marker to identify the correct button for feedback later
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
            // Find and highlight the correct button
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
    document.getElementById('quiz-content').style.display = 'none';
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.style.display = 'block';
    
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
    iconBox.className = `bi ${icon} display-4 text-maroon`;

    document.getElementById('score-text').innerHTML = `
        <div class="h4 text-maroon mb-2">${message}</div>
        <div class="display-3 fw-bold mb-1">${score} / ${quizQuestions.length}</div>
    `;

    // Trigger confetti if score is 6 or higher
    if (score >= 6) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#800000', '#c5a059', '#ffffff']
        });
    }
}
