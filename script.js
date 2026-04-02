let score = 0;
let timeLeft = 10;
let timerInterval;

const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const gameArea = document.getElementById('game-area');

const BALL_SIZE = 60; // CSS에서 설정한 공 크기

// 게임 시작 함수
function startGame() {
    score = 0;
    timeLeft = 10;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    startBtn.style.display = 'none';
    ball.style.display = 'block';
    
    // 공을 처음 중앙으로 위치
    moveBallCenter();

    // 1초마다 타이머 감소
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 공 위치를 랜덤하게 이동시키는 함수
function moveBall() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    // 게임 영역 안에서만 움직이도록 여백 계산
    const randomX = Math.floor(Math.random() * (areaWidth - BALL_SIZE));
    const randomY = Math.floor(Math.random() * (areaHeight - BALL_SIZE));

    // CSS transform을 초기화하고 left/top으로만 위치 조정
    ball.style.transform = 'none'; 
    ball.style.left = randomX + 'px';
    ball.style.top = randomY + 'px';
}

// 처음 시작할 때만 중앙에 배치 (transform 사용)
function moveBallCenter() {
    ball.style.left = '50%';
    ball.style.top = '50%';
    ball.style.transform = 'translate(-50%, -50%)';
}

// 공 클릭 이벤트
ball.addEventListener('click', () => {
    // 게임 중일 때만 점수 올리기
    if (timeLeft > 0) {
        score++;
        scoreDisplay.textContent = score;
        moveBall();
    }
});

// 게임 종료 함수
function endGame() {
    clearInterval(timerInterval);
    ball.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = '다시 시작!';
    alert(`게임 종료! 귀여운 친구들과 함께 ${score}점을 기록했습니다!`);
}

// 시작 버튼 이벤트
startBtn.addEventListener('click', startGame);