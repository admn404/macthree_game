// Константы игры
const ROWS = 8;
const COLS = 8;
const TILE_SIZE = 60;
const COLORS = ['#ff4b4b', '#4b7bff', '#4bff62', '#ffd54b'];
const NUM_COLORS = 4;

// Состояние игры
let gameState = {
    screen: 'menu',
    nickname: 'Player',
    score: 0,
    nextAchievementScore: 500,
    board: [],
    selectedTile: null,
    isBusy: false,
    scores: [],
    images: [] // Загруженные изображения еды
};

// Изображения еды
const FOOD_IMAGES = ['Burger.png', 'HotDog.png', 'PattatoFree.png', 'Pizza.png'];

// Элементы DOM
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const scoresScreen = document.getElementById('scores-screen');
const loginInput = document.getElementById('login-input');
const canvas = document.getElementById('game-canvas');
let ctx = null;
const scoreValue = document.getElementById('score-value');
const achievementOverlay = document.getElementById('achievement-overlay');
const achievementPoints = document.getElementById('achievement-points');
const scoresList = document.getElementById('scores-list');

// Загрузка изображений еды
function loadFoodImages() {
    return new Promise((resolve, reject) => {
        let loaded = 0;
        const total = FOOD_IMAGES.length;
        gameState.images = [];
        
        if (total === 0) {
            resolve();
            return;
        }
        
        FOOD_IMAGES.forEach((filename, index) => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                if (loaded === total) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn(`Не удалось загрузить изображение: ${filename}`);
                loaded++;
                if (loaded === total) {
                    resolve();
                }
            };
            img.src = filename;
            gameState.images[index] = img;
        });
    });
}

// Инициализация
function init() {
    try {
        // Проверяем, что все элементы найдены
        if (!canvas) {
            console.error('Canvas элемент не найден');
            alert('Ошибка: Canvas элемент не найден. Проверьте HTML.');
            return;
        }
        
        // Получаем контекст canvas
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Не удалось получить контекст canvas');
            alert('Ошибка: Не удалось инициализировать canvas.');
            return;
        }
        
        // Загружаем изображения еды
        loadFoodImages().then(() => {
            setupCanvas();
            setupEventListeners();
            loadScores();
            showScreen('menu');
        });
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка при запуске игры: ' + error.message);
    }
}

function setupCanvas() {
    // Проверяем, что canvas существует
    if (!canvas) {
        console.error('Canvas элемент не найден');
        return;
    }
    
    // Устанавливаем размер canvas с квадратными клетками
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 100;
    
    // Вычисляем размер тайла так, чтобы клетки были квадратными
    // Используем минимальный размер, чтобы поле было квадратным
    const tileSizeByWidth = availableWidth / COLS;
    const tileSizeByHeight = availableHeight / ROWS;
    const tileSize = Math.min(tileSizeByWidth, tileSizeByHeight, TILE_SIZE);
    
    const displayWidth = COLS * tileSize;
    const displayHeight = ROWS * tileSize;
    
    // Устанавливаем размеры canvas (внутренние размеры для отрисовки)
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Устанавливаем CSS размеры (отображаемые размеры) - должны совпадать с внутренними
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    canvas.style.maxWidth = displayWidth + 'px';
    canvas.style.maxHeight = displayHeight + 'px';
    canvas.style.objectFit = 'none'; // Предотвращаем растягивание
    
    // Сбрасываем трансформацию
    if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // Сохраняем размер тайла для использования в отрисовке
    canvas.tileSize = tileSize;
}

function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('scores-btn').addEventListener('click', () => showScreen('scores'));
    document.getElementById('exit-btn').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            window.close();
        }
    });
    document.getElementById('back-btn').addEventListener('click', backToMenu);
    document.getElementById('scores-back-btn').addEventListener('click', () => showScreen('menu'));
    
    // Обработка кликов по canvas
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleCanvasClick({ offsetX: x, offsetY: y });
}

function showScreen(screen) {
    menuScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    scoresScreen.classList.remove('active');
    
    gameState.screen = screen;
    
    if (screen === 'menu') {
        menuScreen.classList.add('active');
        loginInput.value = gameState.nickname;
    } else if (screen === 'game') {
        gameScreen.classList.add('active');
        // Пересчитываем размер canvas при показе игрового экрана
        setTimeout(() => {
            setupCanvas();
            drawBoard();
        }, 10);
    } else if (screen === 'scores') {
        scoresScreen.classList.add('active');
        displayScores();
    }
}

function startGame() {
    gameState.nickname = loginInput.value.trim() || 'Player';
    gameState.score = 0;
    gameState.nextAchievementScore = 500;
    gameState.selectedTile = null;
    gameState.isBusy = false;
    scoreValue.textContent = '0';
    
    initBoard();
    showScreen('game');
    
    // Удаляем начальные совпадения
    setTimeout(() => {
        resolveBoard();
    }, 100);
}

function initBoard() {
    // Сначала создаем всю структуру доски, заполняя null
    gameState.board = [];
    for (let r = 0; r < ROWS; r++) {
        gameState.board[r] = [];
        for (let c = 0; c < COLS; c++) {
            gameState.board[r][c] = null;
        }
    }
    
    // Теперь заполняем значениями, проверяя совпадения
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            while (true) {
                const colorId = Math.floor(Math.random() * NUM_COLORS);
                gameState.board[r][c] = colorId;
                if (!causesMatch(r, c)) {
                    break;
                }
            }
        }
    }
}

function causesMatch(row, col) {
    // Проверяем, что элемент существует и не null
    if (!gameState.board[row] || gameState.board[row][col] === undefined || gameState.board[row][col] === null) {
        return false;
    }
    
    const colorId = gameState.board[row][col];
    
    // Горизонталь
    let count = 1;
    let i = col - 1;
    while (i >= 0 && gameState.board[row] && gameState.board[row][i] !== null && gameState.board[row][i] === colorId) {
        count++;
        i--;
    }
    i = col + 1;
    while (i < COLS && gameState.board[row] && gameState.board[row][i] !== null && gameState.board[row][i] === colorId) {
        count++;
        i++;
    }
    if (count >= 3) return true;
    
    // Вертикаль
    count = 1;
    i = row - 1;
    while (i >= 0 && gameState.board[i] && gameState.board[i][col] !== null && gameState.board[i][col] === colorId) {
        count++;
        i--;
    }
    i = row + 1;
    while (i < ROWS && gameState.board[i] && gameState.board[i][col] !== null && gameState.board[i][col] === colorId) {
        count++;
        i++;
    }
    if (count >= 3) return true;
    
    return false;
}

function findMatches() {
    const toClear = new Set();
    
    // Горизонтальные совпадения
    for (let r = 0; r < ROWS; r++) {
        let c = 0;
        while (c < COLS) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                c++;
                continue;
            }
            const start = c;
            while (c + 1 < COLS && gameState.board[r][c + 1] === colorId) {
                c++;
            }
            const length = c - start + 1;
            if (length >= 3) {
                for (let x = start; x <= c; x++) {
                    toClear.add(`${r},${x}`);
                }
            }
            c++;
        }
    }
    
    // Вертикальные совпадения
    for (let c = 0; c < COLS; c++) {
        let r = 0;
        while (r < ROWS) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                r++;
                continue;
            }
            const start = r;
            while (r + 1 < ROWS && gameState.board[r + 1][c] === colorId) {
                r++;
            }
            const length = r - start + 1;
            if (length >= 3) {
                for (let x = start; x <= r; x++) {
                    toClear.add(`${x},${c}`);
                }
            }
            r++;
        }
    }
    
    // Диагональ \
    for (let r = 0; r < ROWS; r++) {
        let c = 0;
        while (r < ROWS && c < COLS) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                r++;
                continue;
            }
            let rr = r, cc = c;
            while (rr + 1 < ROWS && cc + 1 < COLS && gameState.board[rr + 1][cc + 1] === colorId) {
                rr++;
                cc++;
            }
            const length = rr - r + 1;
            if (length >= 3) {
                for (let k = 0; k < length; k++) {
                    toClear.add(`${r + k},${c + k}`);
                }
            }
            r = rr + 1;
        }
    }
    
    for (let c = 1; c < COLS; c++) {
        let r = 0;
        while (r < ROWS && c < COLS) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                c++;
                continue;
            }
            let rr = r, cc = c;
            while (rr + 1 < ROWS && cc + 1 < COLS && gameState.board[rr + 1][cc + 1] === colorId) {
                rr++;
                cc++;
            }
            const length = rr - r + 1;
            if (length >= 3) {
                for (let k = 0; k < length; k++) {
                    toClear.add(`${r + k},${c + k}`);
                }
            }
            c = cc + 1;
        }
    }
    
    // Диагональ /
    for (let r = 0; r < ROWS; r++) {
        let c = COLS - 1;
        while (r < ROWS && c >= 0) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                r++;
                continue;
            }
            let rr = r, cc = c;
            while (rr + 1 < ROWS && cc - 1 >= 0 && gameState.board[rr + 1][cc - 1] === colorId) {
                rr++;
                cc--;
            }
            const length = rr - r + 1;
            if (length >= 3) {
                for (let k = 0; k < length; k++) {
                    toClear.add(`${r + k},${c - k}`);
                }
            }
            r = rr + 1;
        }
    }
    
    for (let c = COLS - 2; c >= 0; c--) {
        let r = 0;
        while (r < ROWS && c >= 0) {
            const colorId = gameState.board[r][c];
            if (colorId === null) {
                c--;
                continue;
            }
            let rr = r, cc = c;
            while (rr + 1 < ROWS && cc - 1 >= 0 && gameState.board[rr + 1][cc - 1] === colorId) {
                rr++;
                cc--;
            }
            const length = rr - r + 1;
            if (length >= 3) {
                for (let k = 0; k < length; k++) {
                    toClear.add(`${r + k},${c - k}`);
                }
            }
            c = cc - 1;
        }
    }
    
    return toClear;
}

function clearMatches(matches) {
    if (matches.size === 0) return;
    
    const destroyed = matches.size;
    const gained = destroyed * 5;
    gameState.score += gained;
    scoreValue.textContent = gameState.score;
    
    checkAchievements();
    
    matches.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        gameState.board[r][c] = null;
    });
}

function collapseBoard() {
    const moves = [];
    
    for (let c = 0; c < COLS; c++) {
        let writeRow = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (gameState.board[r][c] !== null) {
                if (r !== writeRow) {
                    gameState.board[writeRow][c] = gameState.board[r][c];
                    gameState.board[r][c] = null;
                    moves.push({ fromR: r, fromC: c, toR: writeRow, toC: c });
                }
                writeRow--;
            }
        }
        for (let rr = writeRow; rr >= 0; rr--) {
            gameState.board[rr][c] = null;
        }
    }
    
    return moves;
}

function refillBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (gameState.board[r][c] === null) {
                gameState.board[r][c] = Math.floor(Math.random() * NUM_COLORS);
            }
        }
    }
}

function resolveBoard() {
    const matches = findMatches();
    if (matches.size === 0) {
        gameState.isBusy = false;
        drawBoard();
        return;
    }
    
    gameState.isBusy = true;
    
    // Анимация исчезновения
    animateClear(matches, () => {
        clearMatches(matches);
        const moves = collapseBoard();
        const newCells = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (gameState.board[r][c] === null) {
                    newCells.push([r, c]);
                }
            }
        }
        refillBoard();
        
        // Анимация падения
        animateFall(moves, newCells, () => {
            setTimeout(() => {
                resolveBoard();
            }, 150);
        });
    });
}

// Анимация исчезновения фишек
function animateClear(matches, onComplete) {
    let progress = 0;
    const duration = 300;
    const startTime = Date.now();
    const matchArray = Array.from(matches);
    
    function animate() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Сохраняем прозрачность для анимации
        gameState._fadeAlpha = gameState._fadeAlpha || {};
        matchArray.forEach(key => {
            gameState._fadeAlpha[key] = 1 - progress;
        });
        
        drawBoardWithFade();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            delete gameState._fadeAlpha;
            if (onComplete) onComplete();
        }
    }
    
    animate();
}

// Анимация падения фишек
function animateFall(moves, newCells, onComplete) {
    if (moves.length === 0 && newCells.length === 0) {
        if (onComplete) onComplete();
        return;
    }
    
    let progress = 0;
    const duration = 400;
    const startTime = Date.now();
    const tileSize = canvas.tileSize;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing
        const ease = 1 - Math.pow(1 - progress, 3);
        
        gameState._fallOffset = gameState._fallOffset || {};
        
        // Существующие фишки падают
        moves.forEach(move => {
            const key = `${move.toR},${move.toC}`;
            const distance = (move.toR - move.fromR) * tileSize;
            gameState._fallOffset[key] = { x: 0, y: -distance * (1 - ease) };
        });
        
        // Новые фишки появляются сверху
        newCells.forEach(([r, c]) => {
            const key = `${r},${c}`;
            const distance = ROWS * tileSize;
            gameState._fallOffset[key] = { x: 0, y: -distance * (1 - ease) };
            gameState._fadeAlpha = gameState._fadeAlpha || {};
            gameState._fadeAlpha[key] = ease;
        });
        
        drawBoardWithFade();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            delete gameState._fallOffset;
            delete gameState._fadeAlpha;
            if (onComplete) onComplete();
        }
    }
    
    animate();
}

// Отрисовка с учетом прозрачности
function drawBoardWithFade() {
    if (!canvas || !ctx || !canvas.tileSize) return;
    
    const tileSize = canvas.tileSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameState.board || gameState.board.length === 0) return;
    
    const animOffset = gameState._fallOffset || {};
    const fadeAlpha = gameState._fadeAlpha || {};
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = gameState.board[r][c];
            if (val === null || val === undefined) continue;
            
            const key = `${r},${c}`;
            const offset = animOffset[key] || { x: 0, y: 0 };
            const alpha = fadeAlpha[key] !== undefined ? fadeAlpha[key] : 1;
            
            if (alpha <= 0) continue;
            
            const x = c * tileSize + offset.x;
            const y = r * tileSize + offset.y;
            const centerX = x + tileSize / 2;
            const centerY = y + tileSize / 2;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Фон
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            
            // Рамка
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            
            // Изображение еды
            const img = gameState.images && gameState.images.length > 0 
                ? gameState.images[val % gameState.images.length] 
                : null;
            if (img && img.complete) {
                const imgSize = tileSize * 0.85;
                const imgX = centerX - imgSize / 2;
                const imgY = centerY - imgSize / 2;
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } else {
                // Fallback: цветной кружок
                const radius = tileSize * 0.35;
                ctx.fillStyle = COLORS[val % COLORS.length];
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}

function handleCanvasClick(e) {
    if (gameState.isBusy) return;
    if (!canvas || !canvas.tileSize) return;
    
    // Получаем координаты клика относительно canvas с учетом масштаба
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.offsetX !== undefined ? e.offsetX * scaleX : (e.clientX - rect.left) * scaleX);
    const y = (e.offsetY !== undefined ? e.offsetY * scaleY : (e.clientY - rect.top) * scaleY);
    
    const tileSize = canvas.tileSize;
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    
    if (gameState.selectedTile === null) {
        gameState.selectedTile = { row, col };
        drawBoard();
    } else {
        const { row: r0, col: c0 } = gameState.selectedTile;
        if (r0 === row && c0 === col) {
            gameState.selectedTile = null;
            drawBoard();
            return;
        }
        
        const dr = Math.abs(row - r0);
        const dc = Math.abs(col - c0);
        if (Math.max(dr, dc) === 1) {
            swapAndCheck({ row: r0, col: c0 }, { row, col });
        } else {
            gameState.selectedTile = { row, col };
            drawBoard();
        }
    }
}

function swapAndCheck(cell1, cell2) {
    gameState.isBusy = true;
    gameState.selectedTile = null;
    
    const { row: r1, col: c1 } = cell1;
    const { row: r2, col: c2 } = cell2;
    
    // Анимация обмена
    animateSwap(cell1, cell2, () => {
        // Меняем местами
        const temp = gameState.board[r1][c1];
        gameState.board[r1][c1] = gameState.board[r2][c2];
        gameState.board[r2][c2] = temp;
        
        drawBoard();
        
        const matches = findMatches();
        if (matches.size === 0) {
            // Возвращаем обратно с анимацией
            animateSwap(cell1, cell2, () => {
                const temp = gameState.board[r1][c1];
                gameState.board[r1][c1] = gameState.board[r2][c2];
                gameState.board[r2][c2] = temp;
                gameState.isBusy = false;
                drawBoard();
            });
        } else {
            resolveBoard();
        }
    });
}

// Анимация обмена двух фишек
function animateSwap(cell1, cell2, onComplete) {
    const { row: r1, col: c1 } = cell1;
    const { row: r2, col: c2 } = cell2;
    const tileSize = canvas.tileSize;
    
    const startX1 = c1 * tileSize;
    const startY1 = r1 * tileSize;
    const startX2 = c2 * tileSize;
    const startY2 = r2 * tileSize;
    
    const dx = startX2 - startX1;
    const dy = startY2 - startY1;
    
    let progress = 0;
    const duration = 200; // миллисекунды
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для плавности
        const ease = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const offsetX1 = dx * ease;
        const offsetY1 = dy * ease;
        const offsetX2 = -dx * ease;
        const offsetY2 = -dy * ease;
        
        // Сохраняем оригинальные значения
        const temp1 = gameState.board[r1][c1];
        const temp2 = gameState.board[r2][c2];
        
        // Временно помечаем для отрисовки со смещением
        gameState._animOffset = gameState._animOffset || {};
        gameState._animOffset[`${r1},${c1}`] = { x: offsetX1, y: offsetY1 };
        gameState._animOffset[`${r2},${c2}`] = { x: offsetX2, y: offsetY2 };
        
        drawBoardAnimated();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            delete gameState._animOffset;
            if (onComplete) onComplete();
        }
    }
    
    animate();
}

// Отрисовка с учетом анимации
function drawBoardAnimated() {
    if (!canvas || !ctx || !canvas.tileSize) return;
    
    const tileSize = canvas.tileSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameState.board || gameState.board.length === 0) return;
    
    const animOffset = gameState._animOffset || {};
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = gameState.board[r][c];
            if (val === null || val === undefined) continue;
            
            const offset = animOffset[`${r},${c}`] || { x: 0, y: 0 };
            const x = c * tileSize + offset.x;
            const y = r * tileSize + offset.y;
            const centerX = x + tileSize / 2;
            const centerY = y + tileSize / 2;
            
            // Фон клетки
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            
            // Рамка
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
            
            // Изображение еды
            const img = gameState.images && gameState.images.length > 0 
                ? gameState.images[val % gameState.images.length] 
                : null;
            if (img && img.complete) {
                const imgSize = tileSize * 0.85;
                const imgX = centerX - imgSize / 2;
                const imgY = centerY - imgSize / 2;
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } else {
                // Fallback: цветной кружок
                const radius = tileSize * 0.35;
                ctx.fillStyle = COLORS[val % COLORS.length];
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function drawBoard() {
    // Проверяем, что canvas инициализирован
    if (!canvas || !ctx || !canvas.tileSize) {
        console.error('Canvas не инициализирован');
        return;
    }
    
    const tileSize = canvas.tileSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Проверяем, что доска инициализирована
    if (!gameState.board || gameState.board.length === 0) {
        console.error('Доска не инициализирована');
        return;
    }
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = gameState.board[r][c];
            if (val === null || val === undefined) continue;
            
            const x = c * tileSize;
            const y = r * tileSize;
            const centerX = x + tileSize / 2;
            const centerY = y + tileSize / 2;
            
            // Фон клетки (темный)
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            
            // Рамка клетки
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            
            // Изображение еды
            const img = gameState.images && gameState.images.length > 0 
                ? gameState.images[val % gameState.images.length] 
                : null;
            if (img && img.complete) {
                const imgSize = tileSize * 0.85;
                const imgX = centerX - imgSize / 2;
                const imgY = centerY - imgSize / 2;
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } else {
                // Fallback: цветной кружок, если изображение не загружено
                const radius = tileSize * 0.35;
                ctx.fillStyle = COLORS[val % COLORS.length];
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Подсветка выбранной клетки
            if (gameState.selectedTile && 
                gameState.selectedTile.row === r && 
                gameState.selectedTile.col === c) {
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                
                // Дополнительное свечение
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 10;
                ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
                ctx.shadowBlur = 0;
            }
        }
    }
}

// Вспомогательные функции для работы с цветами
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
    const b = Math.max(0, (num & 0x0000FF) - percent);
    return `rgb(${r}, ${g}, ${b})`;
}

function checkAchievements() {
    while (gameState.score >= gameState.nextAchievementScore) {
        showAchievement(gameState.nextAchievementScore);
        gameState.nextAchievementScore += 500;
    }
}

function showAchievement(points) {
    achievementPoints.textContent = points;
    achievementOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        achievementOverlay.classList.add('hidden');
    }, 1500);
}

function backToMenu() {
    if (gameState.score > 0) {
        addScore(gameState.nickname, gameState.score);
    }
    showScreen('menu');
}

// Управление рекордами
function loadScores() {
    const saved = localStorage.getItem('macthree_scores');
    if (saved) {
        try {
            gameState.scores = JSON.parse(saved);
            gameState.scores.sort((a, b) => b.score - a.score);
        } catch (e) {
            gameState.scores = [];
        }
    }
}

function saveScores() {
    localStorage.setItem('macthree_scores', JSON.stringify(gameState.scores));
}

function addScore(name, score) {
    name = (name || 'Player').trim() || 'Player';
    gameState.scores.push({ name, score });
    gameState.scores.sort((a, b) => b.score - a.score);
    gameState.scores = gameState.scores.slice(0, 20);
    saveScores();
}

function displayScores() {
    scoresList.innerHTML = '';
    
    if (gameState.scores.length === 0) {
        scoresList.innerHTML = '<div class="empty-scores">Пока нет рекордов. Сыграй первую игру!</div>';
        return;
    }
    
    gameState.scores.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'score-item';
        item.innerHTML = `
            <span class="rank">${(index + 1).toString().padStart(2, ' ')}.</span>
            <span class="name">${entry.name.padEnd(12, ' ')}</span>
            <span class="score">${entry.score.toString().padStart(6, ' ')}</span>
        `;
        scoresList.appendChild(item);
    });
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    if (gameState.screen === 'game') {
        setupCanvas();
        drawBoard();
    }
});

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM уже загружен
    init();
}


