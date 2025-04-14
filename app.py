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
    '101111': 'Y', '101011': 'Z', '000000': ' ' 
}

input_delay = 0.1  
last_input_time = 0

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

def text_to_speech(text, read_as_character=False):
    if read_as_character and len(text) == 1 and text.isalpha():
        text = f"{text}"
    
    if not read_as_character:
        text = ' '.join(text.split()) 
    
    tts = gTTS(text=text, lang='id', slow=False)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    return base64.b64encode(audio_buffer.read()).decode('utf-8')

@app.route('/translate', methods=['POST'])
def translate():
    global last_input_time
    current_time = time.time()
    
    data = request.json
    
    if 'read_text' in data:
        text_to_read = data['read_text'].strip()
        if text_to_read:
            text_to_read = ' '.join(text_to_read.split())  # Menghapus spasi berlebih
            audio_base64 = text_to_speech(text_to_read, read_as_character=False)
            return jsonify({
                'audio': audio_base64
            })
        return jsonify({'error': 'No text to read'}), 100
    
    if current_time - last_input_time < input_delay:
        return jsonify({'error': 'Too fast, please wait'}), 100
    
    braille_input = data.get('braille')
    
    if not isinstance(braille_input, list):
        return jsonify({'error': 'Input must be a list'}), 100
        
    for code in braille_input:
        if not isinstance(code, str) or len(code) != 6 or not all(c in '01' for c in code):
            return jsonify({'error': 'Invalid braille code format'}), 400
        if code not in braille_dict:
            return jsonify({'error': f'Invalid braille pattern: {code}'}), 400
    
    translated_text = []
    for code in braille_input:
        if code in braille_dict:
            translated_text.append(braille_dict[code])
    
    translated_text_str = ''.join(translated_text)
    
    last_input_time = current_time
    
    combined_text = ''.join(translated_text)

    if not combined_text.strip():
        return jsonify({'error': 'No text to translate'}), 400

    audio_base64 = text_to_speech(combined_text, read_as_character=False)

    return jsonify({
        'translated_text': combined_text,
        'braille_code': braille_input,
        'audio': audio_base64
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
