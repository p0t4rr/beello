# Braille Translator

A web-based Braille translator application that converts Braille input into text and speech. Built with Flask and JavaScript.

## Features

- Real-time Braille to text translation
- Text-to-speech conversion
- Support for keyboard input
- Visual Braille dot display
- Multiple key press support with timing control

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd braille
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open http://localhost:5000 in your browser

## Usage

- Use keyboard keys (F, D, S, J, K, L) to input Braille dots
- Press multiple keys within 0.5 seconds for combined dots
- Space to reset input
- Text will be translated and spoken automatically

## Keyboard Mapping

- F: Dot 1
- D: Dot 2
- S: Dot 3
- J: Dot 4
- K: Dot 5
- L: Dot 6
