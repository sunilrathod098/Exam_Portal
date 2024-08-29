let questions = [];
let currentQuestionIndex = 0;
let timer;
let score = 0;
const TIMER_DURATION = 60 * 15;
let selectedAnswers = []; // Array to keep track of selected answers
let shuffledOptions = []; // Array to keep track of shuffled options

function startExam(category) {
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('category-list').style.display = 'none';

    fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`)
        .then(response => response.json())
        .then(data => {
            if (data.response_code === 0) {
                questions = data.results;
                currentQuestionIndex = 0;
                score = 0;
                selectedAnswers = Array(questions.length).fill(null); // Initialize selected answers array
                shuffledOptions = Array(questions.length).fill(null); // Initialize shuffled options array
                document.getElementById('category-title').innerText = `Exam for ${questions[0].category}`;
                document.getElementById('exam-section').style.display = 'block';
                document.getElementById('category-list').style.display = 'none';
                document.getElementById('reg').style.display = 'none';
                document.getElementById('spinner').style.display = 'none';

                loadQuestion();
                startTimer();
            } else {
                alert('Error fetching questions. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Error fetching questions. Please try again.');
        });
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endExam();
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;

    // Check if the options are already shuffled for this question
    if (!shuffledOptions[currentQuestionIndex]) {
        const options = [...question.incorrect_answers, question.correct_answer];
        shuffledOptions[currentQuestionIndex] = shuffleArray(options);
    }

    const options = shuffledOptions[currentQuestionIndex];
    let html = `<h3>Question ${questionNumber}: ${question.question}</h3>`;

    if (question.type === 'multiple') {
        options.forEach((option, index) => {
            const isChecked = selectedAnswers[currentQuestionIndex] === option ? 'checked' : '';
            html += `
                <div>
                    <input type="radio" name="option" id="option${index}" value="${option}" ${isChecked}>
                    <label class="custom-radio" for="option${index}">${option}</label>
                </div>`;
        });
    } else if (question.type === 'boolean') {
        const trueChecked = selectedAnswers[currentQuestionIndex] === 'True' ? 'checked' : '';
        const falseChecked = selectedAnswers[currentQuestionIndex] === 'False' ? 'checked' : '';
        html += `
            <div>
                <input type="radio" name="option" id="optionTrue" value="True" ${trueChecked}>
                <label class="custom-radio" for="optionTrue">True</label>
            </div>
            <div>
                <input type="radio" name="option" id="optionFalse" value="False" ${falseChecked}>
                <label class="custom-radio" for="optionFalse">False</label>
            </div>`;
    }

    // Show Previous button if not on the first question
    if (currentQuestionIndex > 0) {
        html += `<button id="previous-button" onclick="loadPreviousQuestion()">Previous Question</button>`;
    }

    // Show Next button or Submit button based on the question index
    if (currentQuestionIndex === questions.length - 1) {
        html += `<button id="submit-button" onclick="submitExam()">Submit</button>`;
    } else {
        html += `<button id="next-button" onclick="loadNextQuestion()">Next Question</button>`;
    }

    document.getElementById('question-container').innerHTML = html;
}

function loadNextQuestion() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
        checkAnswer(selectedOption.value);
    }
    currentQuestionIndex++;
    loadQuestion();
}

function loadPreviousQuestion() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
    }
    currentQuestionIndex--;
    loadQuestion();
}

function checkAnswer(selectedAnswer) {
    const question = questions[currentQuestionIndex];
    if (selectedAnswer === question.correct_answer) {
        score++;
    }
}

function endExam() {
    clearInterval(timer);
    document.getElementById('exam-section').style.display = 'none';
    document.getElementById('scorecard').style.display = 'block';
    document.getElementById('score').innerText = `You answered ${score} out of ${questions.length} questions correctly in ${questions[0].category}`;
}

function submitExam() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectedAnswers[currentQuestionIndex] = selectedOption.value; // Store selected answer
        checkAnswer(selectedOption.value);
    }
    endExam();
}

function startTimer() {
    let timeLeft = TIMER_DURATION;
    document.getElementById('timer-count').innerText = formatTime(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-count').innerText = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timer);
            endExam();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}








function endExam() {
    clearInterval(timer);

    // Hide the exam section and show the scorecard
    document.getElementById('exam-section').style.display = 'none';
    document.getElementById('scorecard').style.display = 'block';
    document.getElementById('score').innerText = `You answered ${score} out of ${questions.length} questions correctly in ${questions[0].category}`;

    // Save results to the server
    saveResultsToServer();
}

function saveResultsToServer() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    if (user) {
        const userId = user.id;
        const examCategory = questions[0].category;
        const timeTaken = document.getElementById('timer-count').innerText;

        // Prepare the data to be sent
        const resultData = {
            user_id: userId,
            exam_category: examCategory,
            score: score,
            total_questions: questions.length,
            correct_answers: score,
            incorrect_answers: questions.length - score,
            time_taken: timeTaken
        };

        // Make the POST request to save results
        fetch('http://localhost:3000/results', {  // Adjust URL based on your server setup
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resultData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save results');
            return response.text();
        })
        .then(message => alert(message))
        .catch(error => alert('Error saving exam results: ' + error.message));
    } else {
        alert('User not logged in.');
    }
}
