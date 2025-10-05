// Elemen DOM
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Fungsi untuk mengirim pesan
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') {
        return;
    }
    
    // Tampilkan pesan user
    addMessage(message, 'user');
    
    // Kosongkan input
    userInput.value = '';
    
    // Disable button saat loading
    sendBtn.disabled = true;
    sendBtn.textContent = 'Mengirim...';
    
    // Tampilkan loading indicator
    const loadingId = addMessage('Sedang mengetik', 'bot', true);
    
    try {
        // Kirim request ke backend Express
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hapus loading indicator
        removeMessage(loadingId);
        
        // Tampilkan response dari bot
        if (data.response) {
            addMessage(data.response, 'bot');
        } else {
            addMessage('Maaf, saya tidak dapat memproses permintaan Anda.', 'bot');
        }
        
    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'bot');
    } finally {
        // Enable button kembali
        sendBtn.disabled = false;
        sendBtn.textContent = 'Kirim';
        userInput.focus();
    }
}

// Fungsi untuk menambahkan pesan ke chat box
function addMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'user') {
        contentDiv.innerHTML = `<strong>Anda:</strong> ${escapeHtml(text)}`;
    } else {
        if (isLoading) {
            contentDiv.innerHTML = `<strong>Bot:</strong> <span class="loading">${escapeHtml(text)}</span>`;
        } else {
            contentDiv.innerHTML = `<strong>Bot:</strong> ${escapeHtml(text)}`;
        }
    }
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    
    // Scroll ke bawah
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageId;
}

// Fungsi untuk menghapus pesan (untuk loading indicator)
function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

// Fungsi untuk escape HTML (mencegah XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Focus pada input saat halaman dimuat
window.addEventListener('load', () => {
    userInput.focus();
});
