# Braille Translator Web Application

## Overview
This project is a Braille Translator web application built using Flask for the backend. The application allows users to input Braille patterns using a virtual keyboard and translates them into text and audio output. The audio output is generated using Google Text-to-Speech (gTTS).
![image](https://github.com/user-attachments/assets/2b879e22-c4bf-4607-9776-ed0671891464)


## Features
- Input Braille patterns using a virtual keyboard.
- Translate Braille to text and audio output.
- Responsive design for mobile and desktop devices.
- Swipe right to read the entire translated text as a single audio output.

## Prerequisites
- Python 3.6 or higher
- pip (Python package installer)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/p0t4rr/beello.git
   cd beello
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application
1. Start the Flask server:
   ```bash
   python3 app.py
   ```

2. Open your web browser and go to `http://localhost:5001` to access the application.

## Usage
- Click on the Braille dots to input a Braille character.
- The application will translate the input into text and play the corresponding audio.
- Swipe right on mobile devices to read the entire translated text as a single audio output.

## License
This project is licensed under the MIT License.
