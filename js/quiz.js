let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

async function startQuiz(chapterId) {
    if (!chapterId) return;
    
    try {
        const response = await fetch(window.BASE_URL + 'data/quizzes.json');
        const data = await response.json();
        
        // Find the quiz for this chapter
        const quiz = data.quizzes.find(q => parseInt(q.chapter_id) === parseInt(chapterId));
        
        if (quiz) {
            // Find questions for this quiz
            quizQuestions = data.questions.filter(q => parseInt(q.quiz_id) === parseInt(quiz.id));
            
            currentQuestionIndex = 0;
            score = 0;
            showQuestion();
            
            document.getElementById('quiz-content').style.display = 'block';
            document.getElementById('quiz-result').style.display = 'none';
        } else {
            alert("Paumanhin, wala pang pagsusulit para sa kabanatang ito.");
            if (typeof window.location.href !== 'undefined') {
                window.location.href = window.BASE_URL + 'reader/reader.html?book=noli&chapter=' + chapterId;
            }
        }
    } catch (error) {
        console.error("Error loading quiz:", error);
    }
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = question.question_text;
    document.getElementById('question-counter').innerText = `${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    const options = [
        { label: 'A', text: question.option_a },
        { label: 'B', text: question.option_b },
        { label: 'C', text: question.option_c },
        { label: 'D', text: question.option_d }
    ];
    
    options.forEach(opt => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        
        const btn = document.createElement('button');
        btn.className = 'neu-opt-btn fade-in';
        btn.innerHTML = `<span class="text-maroon fw-bold me-2">${opt.label}.</span> ${opt.text}`;
        btn.onclick = () => handleAnswer(opt.label, question.correct_answer, btn);
        
        col.appendChild(btn);
        container.appendChild(col);
    });
}

function handleAnswer(selected, correct, btn) {
    const buttons = document.querySelectorAll('.neu-opt-btn');
    buttons.forEach(b => b.disabled = true);
    
    btn.classList.add('selected');
    
    setTimeout(() => {
        if (selected === correct) {
            btn.classList.add('correct');
            score++;
        } else {
            btn.classList.add('wrong');
            // Ipakita ang tamang sagot
            buttons.forEach(b => {
                if (b.innerText.trim().startsWith(correct)) {
                    b.classList.add('correct');
                }
            });
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1200);
    }, 500);
}

function showResult() {
    document.getElementById('quiz-content').style.display = 'none';
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.style.display = 'block';
    
    const percentage = (score / quizQuestions.length) * 100;
    let message = "";
    let icon = "bi-emoji-smile";
    
    if (percentage >= 80) {
        message = "Napakahusay!";
        icon = "bi-trophy-fill";
    } else if (percentage >= 60) {
        message = "Magaling!";
        icon = "bi-star-fill";
    } else {
        message = "Ipagpatuloy ang pag-aaral.";
        icon = "bi-book";
    }
    
    const iconBox = resultDiv.querySelector('.neu-icon-box i');
    iconBox.className = `bi ${icon} display-4 text-maroon`;

    document.getElementById('score-text').innerHTML = `
        <div class="h4 text-maroon mb-2">${message}</div>
        <div class="display-5 fw-bold">${score} / ${quizQuestions.length}</div>
    `;
}
