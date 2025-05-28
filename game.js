// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Keep track of canvas dimensions for resize handling
let previousWidth = window.innerWidth * (2/3);
let previousHeight = window.innerHeight;

// Set initial canvas size
function resizeCanvas() {
    console.log('Resizing canvas...');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth * (2/3); // Set to 2/3 of screen width
    console.log('New canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Center the canvas
    canvas.style.position = 'absolute';
    canvas.style.left = `${window.innerWidth * (1/6)}px`;
}

// Initialize canvas size
resizeCanvas();

// Sprite loading
const birdSprite = new Image();
const pipeSprite = new Image();
const backgroundSprite = new Image();
const tilesetSprite = new Image();

// Debug loading of sprites
birdSprite.onerror = (e) => console.error('Failed to load bird sprite:', e);
pipeSprite.onerror = (e) => console.error('Failed to load pipe sprite:', e);
backgroundSprite.onerror = (e) => console.error('Failed to load background sprite:', e);
tilesetSprite.onerror = (e) => console.error('Failed to load tileset sprite:', e);

// Track sprite loading
let spritesLoaded = 0;
const TOTAL_SPRITES = 4; // Updated to include tileset
const loadingScreen = document.getElementById('loadingScreen');

// Add pipe sprite constants after sprite loading section
let PIPE_SPRITE_SINGLE_WIDTH = 0; // Width of a single pipe in the sprite sheet
let PIPE_SPRITE_HEIGHT = 0;      // Height of a single pipe

// Add level-specific constants
const LEVEL_SCORE_THRESHOLD = 10;
const LEVEL_TWO_WIN_SCORE = 20;
let currentLevel = 1;
let levelTransitioning = false;
let gameWon = false;

// Modify sprite loading section
const levelBackgrounds = {
    1: './assets/Background/Background5.png',
    2: './assets/Background/Background1.png'
};

// Add pipe color configurations for each level
const PIPE_COLORS_BY_LEVEL = {
    1: {
        WHITE: { index: 0, offset: 0, useTopRow: false },     // First pipe, bottom row
        YELLOW: { index: 1, offset: 0, useTopRow: true },     // Second pipe, top row
        BLUE: { index: 3, offset: 0, useTopRow: true }        // Fourth pipe, top row (was incorrectly set to 2)
    },
    2: {
        RED: { index: 2, offset: 0, useTopRow: true },      // Third pipe, top row
        PINK: { index: 1, offset: 0, useTopRow: false },    // Second pipe, bottom row
        ORANGE: { index: 3, offset: 0, useTopRow: false }   // Fourth pipe, bottom row
    }
};

function onSpriteLoad() {
    spritesLoaded++;
    console.log('Sprite loaded, total loaded:', spritesLoaded);
    if (spritesLoaded === TOTAL_SPRITES) {
        console.log('All sprites loaded successfully');
        loadingScreen.classList.add('hidden');
        
        // Calculate frame width based on actual sprite width
        BIRD_FRAME_WIDTH = birdSprite.width / 4; // Divide by number of frames
        BIRD_FRAME_HEIGHT = birdSprite.height;
        console.log('Bird frame dimensions:', BIRD_FRAME_WIDTH, 'x', BIRD_FRAME_HEIGHT);
        
        // Calculate pipe sprite dimensions
        PIPE_SPRITE_SINGLE_WIDTH = pipeSprite.width / 4;
        PIPE_SPRITE_HEIGHT = pipeSprite.height / 2;
        
        // Set the offsets for all levels
        for (let level of [1, 2]) {
            const colors = PIPE_COLORS_BY_LEVEL[level];
            for (let color of Object.values(colors)) {
                color.offset = color.index * PIPE_SPRITE_SINGLE_WIDTH;
            }
        }
        
        // Calculate tileset dimensions
        TILE_SIZE = Math.floor(canvas.height * 0.05); // 5% of canvas height
        console.log('Tile size:', TILE_SIZE);
    }
}

// Set sprite sources after setting up error handlers
birdSprite.onload = onSpriteLoad;
pipeSprite.onload = onSpriteLoad;
backgroundSprite.onload = onSpriteLoad;
tilesetSprite.onload = onSpriteLoad;

// Set correct paths for sprites
birdSprite.src = './assets/Player/StyleBird1/Bird1-2.png';
pipeSprite.src = './assets/Tiles/Style 1/PipeStyle1.png';
backgroundSprite.src = './assets/Background/Background5.png';
tilesetSprite.src = './assets/Tiles/Style 1/TileStyle1.png';

// Sprite constants - make frame width/height variables so they can be updated after loading
let BIRD_FRAME_WIDTH = 32;  // This will be updated when sprite loads
let BIRD_FRAME_HEIGHT = 32; // This will be updated when sprite loads
const BIRD_FRAMES = 4;      // Number of animation frames
const FRAME_DURATION = 100; // milliseconds per frame
let currentFrame = 0;
let lastFrameTime = 0;

// Game constants
const GRAVITY = 0.375;
const FLAP_SPEED = -8;
const BIRD_SIZE = Math.min(canvas.width, canvas.height) * 0.05;
const PIPE_WIDTH = Math.min(canvas.width, canvas.height) * 0.15; // Increased from 0.1 to 0.15 to show full pipe width
const PIPE_GAP = Math.min(canvas.width, canvas.height) * 0.25;
const PIPE_SPEED = canvas.width * 0.003;
const PIPE_SPAWN_DISTANCE = canvas.width * 0.6;
const COUNTDOWN_TIME = 3000;
const BG_SCROLL_SPEED = PIPE_SPEED * 0.5;

// Add tile constants
let TILE_SIZE;
const FLOOR_HEIGHT = 2; // Number of tiles in height for the floor

// Game state
const bird = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    velocity: 0
};

let pipes = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let countdownStart = 0;
let bgX = 0;

// Add dev mode state
let devMode = false;
const DEV_BIRD_SPEED = 20; // Speed for up/down movement in dev mode

// Add transition state variables
let fadeAlpha = 1;
let transitionState = 'none'; // none, fadeOut, celebrate, fadeIn
const FADE_SPEED = 0.02;
const CELEBRATION_DURATION = 1500; // 1.5 second celebration
let celebrationStart = 0;

// Add splash screen state
let showingSplash = true;
let selectedLevel = 0; // Index of selected level in splash screen
const AVAILABLE_LEVELS = ['Level One', 'Level Two'];
const SPLASH_BIRDS_COUNT = 12; // Number of background birds
const SPLASH_BIRDS = [];

// Create a class for background birds
class BackgroundBird {
    constructor() {
        this.reset();
        // Randomize initial animation frame
        this.frame = Math.floor(Math.random() * BIRD_FRAMES);
        this.lastFrameTime = Date.now() - Math.random() * FRAME_DURATION;
    }

    reset() {
        // Random position
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height * 0.8); // Keep birds in upper 80% of screen
        // Random movement
        this.speed = (Math.random() * 2 + 2) * (canvas.width / 1000); // Scale with canvas width
        this.rotation = (Math.random() - 0.5) * Math.PI / 2; // Random rotation ±45 degrees
        // Random size between 50% and 100% of normal bird size
        this.size = BIRD_SIZE * (0.5 + Math.random() * 0.5);
    }

    update(currentTime) {
        // Move bird
        this.x += this.speed;
        
        // Reset if off screen
        if (this.x > canvas.width + this.size) {
            this.x = -this.size;
            this.y = Math.random() * (canvas.height * 0.8);
        }

        // Update animation frame
        if (currentTime - this.lastFrameTime > FRAME_DURATION) {
            this.frame = (this.frame + 1) % BIRD_FRAMES;
            this.lastFrameTime = currentTime;
        }
    }

    draw(ctx) {
        if (spritesLoaded < TOTAL_SPRITES) return;

        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        ctx.rotate(this.rotation);
        
        const sourceX = this.frame * BIRD_FRAME_WIDTH;
        
        ctx.drawImage(
            birdSprite,
            sourceX, 0,
            BIRD_FRAME_WIDTH, BIRD_FRAME_HEIGHT,
            -this.size/2, -this.size/2,
            this.size, this.size
        );
        
        ctx.restore();
    }
}

// Initialize background birds
function initBackgroundBirds() {
    SPLASH_BIRDS.length = 0; // Clear existing birds
    for (let i = 0; i < SPLASH_BIRDS_COUNT; i++) {
        SPLASH_BIRDS.push(new BackgroundBird());
    }
}

// Add function to return to title screen
function returnToTitleScreen() {
    showingSplash = true;
    selectedLevel = 0;
    score = 0;
    gameOver = false;
    gameStarted = false;
    devMode = false;
    gameWon = false;
    transitionState = 'none';
    bgX = 0;
    initBackgroundBirds(); // Reinitialize birds when returning to title
}

// Modify event listeners
document.addEventListener('keydown', (e) => {
    // Handle escape key at any time during gameplay
    if (e.code === 'Escape' && !showingSplash) {
        returnToTitleScreen();
        return;
    }

    if (showingSplash) {
        switch (e.code) {
            case 'ArrowUp':
                selectedLevel = Math.max(0, selectedLevel - 1);
                break;
            case 'ArrowDown':
                selectedLevel = Math.min(AVAILABLE_LEVELS.length - 1, selectedLevel + 1);
                break;
            case 'Space':
            case 'Enter':
                showingSplash = false;
                startLevel(selectedLevel + 1);
                break;
        }
        return;
    }

    // Dev mode activation during countdown
    if (!gameStarted && e.code === 'KeyK') {
        devMode = true;
        console.log('Developer mode activated!');
        return;
    }

    // Normal game controls
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
            devMode = false;
        } else if (gameStarted && !devMode) {
            bird.velocity = FLAP_SPEED;
        }
    }
    
    // Dev mode controls
    if (devMode && gameStarted && !gameOver) {
        if (e.code === 'ArrowUp') {
            bird.y = Math.max(0, bird.y - DEV_BIRD_SPEED);
        } else if (e.code === 'ArrowDown') {
            bird.y = Math.min(canvas.height - BIRD_SIZE, bird.y + DEV_BIRD_SPEED);
        }
    }
});

// Modify click handler
canvas.addEventListener('click', () => {
    if (showingSplash) {
        showingSplash = false;
        startLevel(selectedLevel + 1);
        return;
    }

    if (gameOver) {
        resetGame();
        devMode = false;
    } else if (gameStarted && !devMode) {
        bird.velocity = FLAP_SPEED;
    }
});

function startLevel(level) {
    currentLevel = level;
    levelTransitioning = level > 1;
    gameWon = false;
    
    if (level === 1) {
        // Only reset score when starting level 1
        score = 0;
    }
    
    if (level > 1 && score >= LEVEL_SCORE_THRESHOLD) {
        // Only show transition sequence if we completed the previous level
        transitionState = 'fadeOut';
        fadeAlpha = 0;
        celebrationStart = 0;
    } else {
        // Regular level start
        transitionState = 'none';
        fadeAlpha = 1;
        countdownStart = Date.now();
    }
    
    // Reset bird position
    bird.x = canvas.width / 3;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Clear pipes
    pipes = [];
    
    // Load new background
    backgroundSprite.src = levelBackgrounds[level];
    
    gameStarted = false;
    gameOver = false;
}

function createPipe() {
    const baseGap = PIPE_GAP;
    const minGapStart = baseGap;
    let maxGapStart = canvas.height - (baseGap * 2);
    
    // Level 2: Increase gap variation by 20%
    if (currentLevel === 2) {
        const currentRange = maxGapStart - minGapStart;
        const increasedRange = currentRange * 1.2;
        maxGapStart = minGapStart + increasedRange;
        // Ensure we don't exceed canvas bounds
        maxGapStart = Math.min(maxGapStart, canvas.height - baseGap);
    }
    
    const gapStart = Math.random() * (maxGapStart - minGapStart) + minGapStart;
    
    // Get current level's pipe colors
    const colorOptions = Object.values(PIPE_COLORS_BY_LEVEL[currentLevel]);
    const selectedColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    
    pipes.push({
        x: canvas.width,
        gapStart: gapStart,
        gapEnd: gapStart + baseGap,
        passed: false,
        color: selectedColor
    });
}

function update() {
    if (transitionState === 'fadeOut') {
        fadeAlpha = Math.min(1, fadeAlpha + FADE_SPEED);
        if (fadeAlpha >= 1) {
            transitionState = 'celebrate';
            celebrationStart = Date.now();
        }
        return;
    }
    
    if (transitionState === 'celebrate') {
        if (Date.now() - celebrationStart >= CELEBRATION_DURATION) {
            if (gameWon) {
                transitionState = 'fadeIn';
                fadeAlpha = 1;
            } else {
                transitionState = 'fadeIn';
                countdownStart = Date.now();
            }
        }
        return;
    }
    
    if (transitionState === 'fadeIn') {
        fadeAlpha = Math.max(0, fadeAlpha - FADE_SPEED);
        if (fadeAlpha <= 0) {
            transitionState = 'none';
            if (gameWon) {
                returnToTitleScreen();
            }
        }
    }

    if (!gameStarted) {
        const elapsed = Date.now() - countdownStart;
        if (elapsed >= COUNTDOWN_TIME) {
            gameStarted = true;
            levelTransitioning = false;
        }
        return;
    }
    
    if (gameOver || gameWon) return;

    // Check for level completion
    if (currentLevel === 1 && score >= LEVEL_SCORE_THRESHOLD) {
        startLevel(2);
        return;
    } else if (currentLevel === 2 && score >= LEVEL_TWO_WIN_SCORE) {
        // Player has won the game!
        gameWon = true;
        transitionState = 'fadeOut';
        fadeAlpha = 0;
        celebrationStart = 0;
        return;
    }

    // Update bird only if not in dev mode
    if (!devMode) {
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;

        // Check collisions with canvas bounds
        if (bird.y < 0) bird.y = 0;
        if (bird.y > canvas.height - BIRD_SIZE) {
            gameOver = true;
        }
    }

    // Update pipes
    for (let pipe of pipes) {
        pipe.x -= PIPE_SPEED;

        // Check collisions with pipes
        if (bird.x + BIRD_SIZE > pipe.x && bird.x < pipe.x + PIPE_WIDTH) {
            if (bird.y < pipe.gapStart || bird.y + BIRD_SIZE > pipe.gapEnd) {
                gameOver = true;
            }
        }

        // Score points
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
            score++;
            pipe.passed = true;
        }
    }

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

    // Modify pipe creation for Level 2
    if (pipes.length === 0 || 
        pipes[pipes.length - 1].x < canvas.width - (PIPE_SPAWN_DISTANCE * (currentLevel === 2 ? 0.8 : 1))) {
        createPipe();
    }
}

// Modified draw function for sprite-based bird
function drawBird() {
    if (spritesLoaded < TOTAL_SPRITES) return;
    
    ctx.save();
    ctx.translate(bird.x + BIRD_SIZE/2, bird.y + BIRD_SIZE/2);
    
    // Rotate based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);
    
    // Calculate the source x position based on current frame
    const sourceX = currentFrame * BIRD_FRAME_WIDTH;
    
    // Draw the current frame of the bird sprite
    ctx.drawImage(
        birdSprite,
        sourceX, 0,                    // Source x, y
        BIRD_FRAME_WIDTH, BIRD_FRAME_HEIGHT, // Source width, height
        -BIRD_SIZE/2, -BIRD_SIZE/2,   // Destination x, y
        BIRD_SIZE, BIRD_SIZE          // Destination width, height
    );
    
    ctx.restore();
}

// Modify the pipe drawing function
function drawPipes() {
    if (spritesLoaded < TOTAL_SPRITES) return;
    
    console.log('Drawing pipes, count:', pipes.length);
    
    for (let pipe of pipes) {
        const sourceX = pipe.color.offset;
        const sourceY = pipe.color.useTopRow ? 0 : PIPE_SPRITE_HEIGHT;
        
        // Top pipe
        ctx.save();
        ctx.translate(pipe.x + PIPE_WIDTH, pipe.gapStart);
        ctx.scale(1, -1); // Flip vertically
        ctx.drawImage(
            pipeSprite,
            sourceX, sourceY,                    // Source x, y - using correct row based on color
            PIPE_SPRITE_SINGLE_WIDTH, PIPE_SPRITE_HEIGHT,  // Source width, height
            -PIPE_WIDTH, 0,                     // Destination x, y
            PIPE_WIDTH, pipe.gapStart           // Destination width, height
        );
        ctx.restore();

        // Bottom pipe
        ctx.drawImage(
            pipeSprite,
            sourceX, sourceY,                    // Source x, y - using correct row based on color
            PIPE_SPRITE_SINGLE_WIDTH, PIPE_SPRITE_HEIGHT,  // Source width, height
            pipe.x, pipe.gapEnd,                // Destination x, y
            PIPE_WIDTH, canvas.height - pipe.gapEnd // Destination width, height
        );
    }
}

function drawBackground() {
    if (spritesLoaded < TOTAL_SPRITES) {
        // Draw a temporary background while assets load
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    // Scale based on height to show the full background height
    const scale = canvas.height / backgroundSprite.height;
    const scaledWidth = Math.floor(backgroundSprite.width * scale);  // Ensure width is a whole number
    const scaledHeight = canvas.height;
    
    // Calculate position to center the background
    const x = Math.floor((canvas.width - scaledWidth) / 2);  // Ensure x position is a whole number
    const y = 0;
    
    // Disable image smoothing for crisp pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    
    // Fill any empty space on the sides with a color that matches the background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate exact pixel position for the background
    // Ensure scrollOffset stays negative to maintain correct direction
    const scrollOffset = Math.floor(bgX) % scaledWidth;
    
    // Draw multiple copies of the background for seamless scrolling
    // We'll draw 4 copies total: 1 behind and 3 ahead to ensure coverage
    for (let i = -1; i <= 2; i++) {
        ctx.drawImage(
            backgroundSprite,
            x + scrollOffset + (scaledWidth * i), y,
            scaledWidth, scaledHeight
        );
    }

    // Update background scroll position
    if (gameStarted && !gameOver) {
        bgX -= BG_SCROLL_SPEED;
    }
    
    // Re-enable image smoothing for other game elements
    ctx.imageSmoothingEnabled = true;
}

// Function to draw the floor
function drawFloor() {
    if (spritesLoaded < TOTAL_SPRITES) return;
    
    const floorY = canvas.height - (TILE_SIZE * FLOOR_HEIGHT);
    
    // Calculate how many tiles we need to cover the width
    const tilesNeeded = Math.ceil(canvas.width / TILE_SIZE) + 2; // +2 for smooth scrolling
    
    // Calculate scroll offset for tiles
    const tileOffset = Math.floor(bgX * 0.5) % TILE_SIZE; // Scroll at half background speed
    
    // Draw the floor tiles
    for (let i = -1; i < tilesNeeded; i++) {
        const x = (i * TILE_SIZE) + tileOffset;
        
        // Draw the tile from the bottom quarter of the right side
        ctx.drawImage(
            tilesetSprite,
            TILESET_OFFSET_X, TILESET_OFFSET_Y,  // Source x, y (bottom quarter, right side)
            TILE_SIZE, TILE_SIZE,                // Source width, height
            x, floorY,                           // Destination x, y
            TILE_SIZE, TILE_SIZE                 // Destination width, height
        );
    }
}

// Add splash screen drawing function
function drawSplashScreen(currentTime) {
    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw background birds
    for (let bird of SPLASH_BIRDS) {
        bird.update(currentTime);
        bird.draw(ctx);
    }

    const fontSize = Math.min(canvas.width, canvas.height) * 0.05;
    ctx.textAlign = 'center';
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize * 3}px Arial`;
    ctx.fillText('Flappy Bird!', canvas.width/2, canvas.height * 0.2);
    
    // Select Level text
    ctx.font = `${fontSize * 2}px Arial`;
    ctx.fillText('Select Level', canvas.width/2, canvas.height * 0.4);
    
    // Level options
    ctx.font = `${fontSize * 1.5}px Arial`;
    AVAILABLE_LEVELS.forEach((level, index) => {
        ctx.fillStyle = index === selectedLevel ? '#FFD700' : 'white'; // Yellow highlight for selected
        ctx.fillText(level, canvas.width/2, canvas.height * (0.55 + index * 0.1));
    });
    
    // Controls text
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText('↑↓ to select, Space/Enter to confirm', canvas.width/2, canvas.height * 0.8);
}

// Update the main draw function
function draw(currentTime) {
    if (showingSplash) {
        drawSplashScreen(currentTime);
        return;
    }

    // Draw background first
    drawBackground();
    
    // Draw game elements
    if (transitionState !== 'celebrate') {
        // Always update bird animation, but at a controlled rate
        if (currentTime - lastFrameTime > FRAME_DURATION) {
            currentFrame = (currentFrame + 1) % BIRD_FRAMES;
            lastFrameTime = currentTime;
        }
        
        drawPipes();
        drawBird();
    }

    // Handle transition effects
    if (transitionState !== 'none') {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (transitionState === 'celebrate' || transitionState === 'fadeIn') {
            const fontSize = Math.min(canvas.width, canvas.height) * 0.05;
            ctx.fillStyle = 'white';
            ctx.font = `${fontSize * 2}px Arial`;
            ctx.textAlign = 'center';
            
            if (transitionState === 'celebrate' || (transitionState === 'fadeIn' && gameWon)) {
                if (gameWon) {
                    ctx.fillText('You Win!', canvas.width/2, canvas.height/2 - fontSize * 2);
                    ctx.font = `${fontSize}px Arial`;
                    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
                    ctx.fillText('Returning to title screen...', canvas.width/2, canvas.height/2 + fontSize * 2);
                } else {
                    ctx.fillText('Level Complete!', canvas.width/2, canvas.height/2 - fontSize * 2);
                    ctx.font = `${fontSize}px Arial`;
                    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2);
                }
            } else if (!gameWon) {
                ctx.fillText('Level Two!', canvas.width/2, canvas.height/2 - fontSize * 2);
                const secondsLeft = Math.ceil((COUNTDOWN_TIME - (Date.now() - countdownStart)) / 1000);
                ctx.fillText(secondsLeft.toString(), canvas.width/2, canvas.height/2 + fontSize);
            }
            ctx.textAlign = 'left';
        }
    }

    // Draw regular game text
    if (transitionState === 'none') {
        // Draw score
        const fontSize = Math.min(canvas.width, canvas.height) * 0.05;
        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(`Score: ${score}`, fontSize/2, fontSize * 1.2);
        
        if (devMode) {
            ctx.fillStyle = '#FF0000';
            ctx.fillText('DEV MODE', fontSize/2, fontSize * 2.4);
            ctx.fillStyle = 'white';
        }

        // Draw countdown or game over message
        if (!gameStarted) {
            ctx.font = `${fontSize * 2}px Arial`;
            ctx.textAlign = 'center';
            const levelText = currentLevel === 1 ? 'Level One!' : 'Level Two!';
            ctx.fillText(levelText, canvas.width/2, canvas.height/2 - fontSize * 2);
            const secondsLeft = Math.ceil((COUNTDOWN_TIME - (Date.now() - countdownStart)) / 1000);
            ctx.fillText(secondsLeft.toString(), canvas.width/2, canvas.height/2 + fontSize);
            if (!devMode) {
                ctx.textAlign = 'left';
                ctx.font = `${fontSize}px Arial`;
                ctx.fillStyle = '#FF0000';
                ctx.fillText('Press K for dev mode', fontSize/2, fontSize * 2.4);
                ctx.fillStyle = 'white';
            }
            ctx.textAlign = 'left';
        } else if (gameOver) {
            ctx.fillStyle = 'white';
            ctx.font = `${fontSize * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText('Click or press Space to restart', canvas.width/2, canvas.height/2 + fontSize * 1.5);
            ctx.textAlign = 'left';
        }
    }
}

// Modify gameLoop to pass timestamp
function gameLoop(timestamp) {
    update();
    draw(timestamp);
    requestAnimationFrame(gameLoop);
}

// Start the game
console.log('Starting game...');
countdownStart = Date.now();
requestAnimationFrame(gameLoop);

// Modify resetGame to handle all level restarts the same way
function resetGame() {
    // Reset score
    score = 0;
    // Stay on current level but restart it
    backgroundSprite.src = levelBackgrounds[currentLevel];
    startLevel(currentLevel);
    devMode = false;
    bgX = 0;
}

// Add function to handle game completion (when finishing level 2)
function completeGame() {
    showingSplash = true;
    selectedLevel = 0;
    score = 0;
}

// Start with splash screen instead of immediately starting game
showingSplash = true;
selectedLevel = 0;

// Initialize birds at startup
initBackgroundBirds(); 