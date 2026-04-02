const container = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');

// --- 게임 설정 상수 ---
const PLAYER_SIZE = 25; // CSS와 동일하게
const ZOMBIE_SIZE = 35; // CSS와 동일하게
const ZOMBIE_SPEED = 2.2; // 살짝 더 빠르게
const SEPARATION_DIST = 45; // 좀비끼리 최소 거리
const SEPARATION_FORCE = 1.2; // 밀어내는 힘 살짝 강화

// --- 게임 상태 변수 ---
let playerX = 300, playerY = 200; // 초기 위치는 중앙
let zombies = [];
let score = 0;
let isGameOver = false;

// --- 1. 마우스 위치 업데이트 (플레이어 이동) ---
container.addEventListener('mousemove', (e) => {
    if (isGameOver) return;
    const rect = container.getBoundingClientRect();
    
    // 게임판 안에서의 마우스 좌표 계산
    playerX = e.clientX - rect.left;
    playerY = e.clientY - rect.top;
    
    // 캐릭터 위치 업데이트
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
});

// --- 2. 좀비 생성 함수 (가장자리에서 생성) ---
function createZombie() {
    const zombieEl = document.createElement('div');
    zombieEl.className = 'zombie';
    zombieEl.innerText = '🧟'; // 이모지 사용
    
    // 화면 가장자리(4면) 중 한 곳에서 생성
    let x, y;
    if (Math.random() < 0.5) {
        // 좌우 옆면
        x = Math.random() < 0.5 ? -ZOMBIE_SIZE : 600 + ZOMBIE_SIZE;
        y = Math.random() * 400;
    } else {
        // 상하 윗면
        x = Math.random() * 600;
        y = Math.random() < 0.5 ? -ZOMBIE_SIZE : 400 + ZOMBIE_SIZE;
    }
    
    zombieEl.style.left = `${x}px`;
    zombieEl.style.top = `${y}px`;
    
    container.appendChild(zombieEl);
    
    // 좀비 데이터 배열에 저장
    zombies.push({ element: zombieEl, x: x, y: y });
}

// --- 3. 게임 메인 루프 (30ms마다 실행 - 물리 계산 및 충돌) ---
const gameLoop = setInterval(() => {
    if (isGameOver) return;

    zombies.forEach((zombie, index) => {
        // A. 플레이어를 향한 기본 이동 방향 계산
        const dx = playerX - zombie.x;
        const dy = playerY - zombie.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy); // 플레이어와의 거리

        let moveX = 0;
        let moveY = 0;
        if (distToPlayer > 0) {
            // 정규화(방향만 남김) 후 속도 곱하기
            moveX = (dx / distToPlayer) * ZOMBIE_SPEED;
            moveY = (dy / distToPlayer) * ZOMBIE_SPEED;
        }

        // B. 다른 좀비와 안 뭉치게 하는 힘 계산 (분리)
        let sepX = 0;
        let sepY = 0;
        zombies.forEach((otherZombie, otherIndex) => {
            if (index === otherIndex) return; // 자기 자신 제외

            const sDx = zombie.x - otherZombie.x;
            const sDy = zombie.y - otherZombie.y;
            const sDist = Math.sqrt(sDx * sDx + sDy * sDy); // 다른 좀비와의 거리

            // 너무 가까우면 반대 방향으로 밀어내는 힘을 더함
            if (sDist > 0 && sDist < SEPARATION_DIST) {
                sepX += (sDx / sDist) * SEPARATION_FORCE;
                sepY += (sDy / sDist) * SEPARATION_FORCE;
            }
        });

        // C. 최종 위치 반영 (플레이어 향하는 힘 + 서로 밀어내는 힘)
        zombie.x += moveX + sepX;
        zombie.y += moveY + sepY;

        // 좀비 DOM 요소 위치 업데이트
        zombie.element.style.left = `${zombie.x}px`;
        zombie.element.style.top = `${zombie.y}px`;

        // D. 충돌 체크 (거리 기반)
        // 반지름의 합보다 거리가 가까우면 충돌로 간주 (살짝 여유를 둠)
        const hitLimit = (PLAYER_SIZE / 2 + ZOMBIE_SIZE / 2) - 8;
        if (distToPlayer < hitLimit) {
            gameOver();
        }
    });
}, 30);

// --- 4. 점수 기록 및 10초마다 좀비 추가 (1초마다 실행) ---
const scoreTimer = setInterval(() => {
    if (isGameOver) return;
    score++;
    scoreElement.innerText = `SURVIVED: ${score}s`;

    // 10초마다 좀비 추가
    if (score > 0 && score % 10 === 0) {
        createZombie();
    }
}, 1000);

// --- 5. 게임 오버 처리 ---
function gameOver() {
    isGameOver = true;
    
    // 타이머 멈춤
    clearInterval(gameLoop);
    clearInterval(scoreTimer);
    
    // 테마에 맞춘 게임 오버 연출
    container.style.boxShadow = "0 0 50px rgba(255, 0, 0, 1), inset 0 0 100px rgba(255, 0, 0, 0.5)"; // 화면이 붉게 변함
    container.style.transition = "box-shadow 0.5s ease";
    
    // 좀비들을 흐릿하게 만들고 멈춤
    zombies.forEach(z => {
        z.element.style.opacity = '0.3';
        z.element.style.filter = 'blur(2px)';
        z.element.style.transition = 'all 0.5s ease';
    });
    
    // 플레이어 빛을 끔
    player.style.boxShadow = "none";
    player.style.background = "#555";
    
    // 약간의 지연 후 알림창 표시
    setTimeout(() => {
        alert(`당신은 '낙원'에서 ${score}초 동안 생존했습니다. 🧟떼에게 붙잡혔습니다.`);
        location.reload(); // 페이지 새로고침으로 재시작
    }, 500);
}

// 초기 좀비 1개 생성하여 게임 시작
createZombie();