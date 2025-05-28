# Flappy Bird Clone

A modern implementation of the classic Flappy Bird game, built with HTML5 Canvas and JavaScript. This version features multiple levels, beautiful pixel art graphics, and smooth animations.

## Features

- Two unique levels with increasing difficulty
- Different pipe colors and backgrounds for each level
- Smooth bird animations and responsive controls
- Developer mode for testing (press 'K' during countdown)
- Animated title screen with flying birds
- Mobile-friendly responsive design

## Play Online

You can play the game directly in your browser at: [Add your GitHub Pages URL here]

## Local Development

1. Clone the repository:
```bash
git clone [your-repo-url]
cd flappy-bird-clone
```

2. Serve the files using a local web server. For example, using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Or using Node.js:
```bash
npx http-server
```

3. Open your browser and navigate to `http://localhost:8000`

## Controls

- Space/Click: Flap
- ↑/↓: Navigate menu
- Enter/Space: Select menu option
- Escape: Return to title screen
- K: Activate developer mode (during countdown)

Developer Mode Controls:
- ↑/↓: Move bird up/down
- No gravity effects

## Deployment

To deploy the game to GitHub Pages:

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select your main branch as the source
5. Your game will be available at `https://[username].github.io/[repo-name]`

## Project Structure

```
flappy-bird-clone/
├── index.html          # Main HTML file
├── game.js            # Game logic
├── assets/            # Game assets
│   ├── Player/        # Bird sprites
│   ├── Background/    # Background images
│   └── Tiles/        # Pipe and tile sprites
└── README.md         # This file
```

## Credits

- Bird and pipe sprites from [Add credit source]
- Background art from [Add credit source]

## License

[Add your chosen license] 