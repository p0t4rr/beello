const dots = document.querySelectorAll('.dot');
let brailleCode = '000000';
let touchStartX = 0;
let inputTimer = null;
let isProcessing = false;
let lastProcessedTime = 0;
let tempDots = new Set(); // Untuk menyimpan dot sementara
const INPUT_DELAY = 500; // 500ms delay
const PROCESS_DELAY = 1000; // 1000ms delay between processes

function submitBrailleCode() {
    const currentTime = Date.now();
    if (currentTime - lastProcessedTime < PROCESS_DELAY) {
        return; 
    }

    if (isProcessing || tempDots.size === 0) return;
    isProcessing = true;
    lastProcessedTime = currentTime;

    // Buat kode braille dari dot yang terkumpul
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
        if (data.translated_text && data.translated_text !== ' ') {
            const outputText = document.getElementById('translated-text');
            outputText.innerText = outputText.innerText + data.translated_text;
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
    dots.forEach(dot => dot.classList.remove('active'));
    if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
    }
}

function handleDotInput(index) {
    if (isProcessing) return;
    
    // Tambahkan dot ke set sementara
    tempDots.add(index);
    dots[index].classList.add('active');

    // Reset timer jika ada
    if (inputTimer) {
        clearTimeout(inputTimer);
    }

    // Set timer baru untuk submit
    inputTimer = setTimeout(() => {
        submitBrailleCode();
    }, 800); // Tunggu 800ms untuk input tambahan
}

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const index = dot.getAttribute('data-value') - 1;
        handleDotInput(index);
    });
});

// Touch events
document.body.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
}, false);

document.body.addEventListener('touchend', function(event) {
    let touchEndX = event.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 50) {
        resetInput();
    }
}, false);

// Keyboard events
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    
    let dotIndex = -1;
    switch(event.key.toLowerCase()) {
        case 'f': dotIndex = 0; break;
        case 'd': dotIndex = 1; break;
        case 's': dotIndex = 2; break;
        case 'j': dotIndex = 3; break;
        case 'k': dotIndex = 4; break;
        case 'l': dotIndex = 5; break;
        case ' ':
            resetInput();
            return;
    }

    if (dotIndex !== -1) {
        handleDotInput(dotIndex);
    }
});
