from flask import Flask, render_template, request, jsonify, send_from_directory
from gtts import gTTS
import base64
from io import BytesIO
import os
import time

app = Flask(__name__)

# Mapping Braille dots to characters
braille_dict = {
    '100000': 'A', '110000': 'B', '100100': 'C', '100110': 'D',
    '100010': 'E', '110100': 'F', '110110': 'G', '110010': 'H',
    '010100': 'I', '010110': 'J', '101000': 'K', '111000': 'L',
    '101100': 'M', '101110': 'N', '101010': 'O', '111100': 'P',
    '111110': 'Q', '111010': 'R', '011100': 'S', '011110': 'T',
    '101001': 'U', '111001': 'V', '010111': 'W', '101101': 'X',
    '101111': 'Y', '101011': 'Z', '000000': ' '  # Space
}

input_delay = 0.5  # Jeda 0.5 detik antar input
last_input_time = 0

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/translate', methods=['POST'])
def translate():
    global last_input_time
    current_time = time.time()
    
    # Periksa jeda waktu
    if current_time - last_input_time < input_delay:
        return jsonify({'error': 'Too fast, please wait'}), 429
    
    data = request.json
    braille_input = data.get('braille')
    
    # Validasi format input
    if not isinstance(braille_input, list):
        return jsonify({'error': 'Input must be a list'}), 400
        
    # Validasi setiap kode braille
    for code in braille_input:
        if not isinstance(code, str) or len(code) != 6 or not all(c in '01' for c in code):
            return jsonify({'error': 'Invalid braille code format'}), 400
        if code not in braille_dict:
            return jsonify({'error': f'Invalid braille pattern: {code}'}), 400
    
    # Terjemahkan kode yang valid
    translated_text = []
    for code in braille_input:
        if code in braille_dict:
            translated_text.append(braille_dict[code])
    
    translated_text_str = ''.join(translated_text)
    
    # Update waktu input terakhir
    last_input_time = current_time
    
    # Jika tidak ada teks yang valid
    if not translated_text_str:
        return jsonify({'error': 'No valid translation'}), 400

    # Convert translated text to speech
    tts = gTTS(text=translated_text_str, lang='id')
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')

    return jsonify({
        'translated_text': translated_text_str,
        'braille_code': braille_input[0],
        'audio': audio_base64
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
