const keys = document.querySelectorAll('.key');
let brailleCode = '000000';
let touchStartX = 0;
let inputTimer = null;
let isProcessing = false;
let tempDots = new Set(); // Untuk menyimpan input sementara

function submitBrailleCode() {
    if (isProcessing || tempDots.size === 0) return;
    isProcessing = true;

    // Buat kode braille dari tombol yang ditekan
    let code = '000000'.split('');
    tempDots.forEach(index => {
        code[index] = '1';
    });
    code = code.join('');

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ braille: [code] })
    })
    .then(response => response.json())
    .then(data => {
        if (data.translated_text && data.translated_text.trim() !== '') {
            const outputText = document.getElementById('translated-text');
            outputText.innerText += data.translated_text;
            document.getElementById('braille-dots').innerText = code;
        }
    })
    .catch(error => console.error('Error:', error))
    .finally(() => {
        isProcessing = false;
        resetInput();
    });
}

function resetInput() {
    brailleCode = '000000';
    tempDots.clear();
    keys.forEach(key => key.classList.remove('active'));
    if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
    }
}

function handleKeyInput(index) {
    if (isProcessing) return;
    
    // Tambahkan tombol ke set sementara
    tempDots.add(index);
    keys[index].classList.add('active');

    // Reset timer jika ada
    if (inputTimer) {
        clearTimeout(inputTimer);
    }

    // Set timer baru untuk submit setelah 800ms
    inputTimer = setTimeout(() => {
        submitBrailleCode();
    }, 800);
}

// Event listener untuk klik pada tombol piano
keys.forEach(key => {
    key.addEventListener('click', () => {
        const index = parseInt(key.getAttribute('data-value')) - 1;
        handleKeyInput(index);
    });
});

// Event listener untuk keyboard
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;

    let keyIndex = -1;
    switch(event.key.toLowerCase()) {
        case 'f': keyIndex = 0; break;
        case 'd': keyIndex = 1; break;
        case 's': keyIndex = 2; break;
        case 'j': keyIndex = 3; break;
        case 'k': keyIndex = 4; break;
        case 'l': keyIndex = 5; break;
        case ' ':
            resetInput();
            return;
    }

    if (keyIndex !== -1) {
        handleKeyInput(keyIndex);
    }
});

// Event listener untuk reset dengan swipe ke kanan (mobile)
document.body.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
}, false);

document.body.addEventListener('touchend', function(event) {
    let touchEndX = event.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 50) {
        resetInput();
    }
}, false);

document.addEventListener('DOMContentLoaded', function() {
    let brailleDots = ['0', '0', '0', '0', '0', '0'];
    const brailleDotsElement = document.getElementById('braille-dots');
    const translatedTextElement = document.getElementById('translated-text');
    let isProcessing = false;
    let fullText = '';
    let activeButtons = new Set();
    let touchStartX = 0;
    let touchStartY = 0;

    // Fungsi untuk mengupdate tampilan dot
    function updateDots() {
        brailleDotsElement.textContent = brailleDots.join('');
    }

    // Fungsi untuk mereset input
    function resetInput() {
        brailleDots = ['0', '0', '0', '0', '0', '0'];
        activeButtons.clear();
        document.querySelectorAll('.braille-dot').forEach(button => {
            button.classList.remove('active');
        });
        updateDots();
    }

    // Fungsi untuk membaca teks
    function readText() {
        const textToRead = fullText.trim();
        if (textToRead) {
            fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    braille: ['000000'], // Dummy braille code
                    read_text: textToRead // Tambahkan teks yang akan dibaca
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.audio) {
                    const audio = new Audio('data:audio/mp3;base64,' + data.audio);
                    audio.play();
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Event listener untuk touch events
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // Deteksi swipe kanan (threshold 50px horizontal dan max 30px vertical)
        if (deltaX > 50 && deltaY < 30) {
            readText();
        }
    });

    // Fungsi untuk mengatur status aktif tombol
    async function toggleDot(button, index) {
        if (isProcessing) return;

        // Toggle status tombol
        if (activeButtons.has(index)) {
            activeButtons.delete(index);
            brailleDots[index] = '0';
            button.classList.remove('active');
        } else {
            activeButtons.add(index);
            brailleDots[index] = '1';
            button.classList.add('active');
        }
        
        updateDots();
        
        // Jika ada tombol yang aktif, mulai timer untuk translasi
        if (activeButtons.size > 0) {
            // Tunggu sebentar untuk memungkinkan input kombinasi
            clearTimeout(window.translateTimer);
            window.translateTimer = setTimeout(async () => {
                isProcessing = true;
                await translateBraille();
                resetInput();
                isProcessing = false;
            }, 700); // Ubah ke 700ms (0.7 detik)
        }
    }

    // Event listener untuk tombol Braille
    document.querySelectorAll('.braille-dot').forEach(button => {
        button.addEventListener('click', function() {
            if (!isProcessing) {
                const dotIndex = parseInt(this.getAttribute('data-value')) - 1;
                toggleDot(this, dotIndex);
            }
        });
    });

    // Keyboard controls
    const keyMap = {
        'f': 0, // Dot 1
        'd': 1, // Dot 2
        's': 2, // Dot 3
        'j': 3, // Dot 4
        'k': 4, // Dot 5
        'l': 5  // Dot 6
    };

    document.addEventListener('keydown', function(event) {
        if (isProcessing) return;

        const key = event.key.toLowerCase();
        
        if (key === ' ') {
            fullText = '';
            translatedTextElement.textContent = '';
            resetInput();
            clearTimeout(window.translateTimer);
            event.preventDefault();
            return;
        }

        if (key in keyMap) {
            const dotIndex = keyMap[key];
            const button = document.querySelector(`.braille-dot[data-value="${dotIndex + 1}"]`);
            toggleDot(button, dotIndex);
            event.preventDefault();
        }
    });

    // Fungsi untuk menerjemahkan kode Braille
    async function translateBraille() {
        const currentCode = brailleDots.join('');
        
        try {
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    braille: [currentCode]
                })
            });

            const data = await response.json();
            
            if (data.translated_text) {
                fullText += data.translated_text;
                translatedTextElement.textContent = fullText;
                
                // Play audio if available
                if (data.audio) {
                    const audio = new Audio('data:audio/mp3;base64,' + data.audio);
                    audio.play();
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
