document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const assistantInput = document.getElementById('assistantInput');
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    const createMessageBubble = (text, type) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-message ${type}`;
        bubble.textContent = text;
        chatWindow.appendChild(bubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const speak = (text) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
    };

    const fetchDashboard = async () => {
        const response = await fetch('/api/chart-data');
        if (!response.ok) return;
        const data = await response.json();
        document.getElementById('messageCount').textContent = data.totalMessages;
        document.getElementById('userCount').textContent = data.totalUsers;
    };

    const fetchUser = async () => {
        const response = await fetch('/api/user');
        if (!response.ok) return;
        const data = await response.json();
        if (data.user) {
            userInfo.innerHTML = `
                <p>Signed in as <strong>${data.user.name}</strong></p>
                <button type="button" id="logoutBtn" class="btn btn-secondary">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', async () => {
                await fetch('/api/logout');
                window.location.reload();
            });
        }
    };

    const askAssistant = async () => {
        const question = assistantInput.value.trim();
        if (!question) return;
        createMessageBubble(question, 'user');
        assistantInput.value = '';

        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });

        const result = await response.json();
        if (!response.ok) {
            createMessageBubble(result.error || 'AI service is unavailable.', 'ai');
            return;
        }

        createMessageBubble(result.answer, 'ai');
        speak(result.answer);

        await fetch('/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: question, aiResponse: result.answer }),
        });
    };

    if (sendBtn) {
        sendBtn.addEventListener('click', askAssistant);
    }

    if (assistantInput) {
        assistantInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                askAssistant();
            }
        });
    }

    if (voiceBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            voiceBtn.addEventListener('click', () => {
                recognition.start();
            });

            recognition.addEventListener('result', (event) => {
                const transcript = Array.from(event.results)
                    .map((result) => result[0].transcript)
                    .join('');
                assistantInput.value = transcript;
                askAssistant();
            });
        } else {
            voiceBtn.disabled = true;
            voiceBtn.textContent = 'Voice not supported';
        }
    }

    fetchDashboard();
    fetchUser();
});
