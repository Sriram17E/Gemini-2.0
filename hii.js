const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const API_KEY = "AIzaSyDX9kUvPoUB_XXY3Lc2eAPwmvAkVulIwGE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";

const createMsgElement = (content, className) => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", className);
    msgDiv.innerHTML = content;
    return msgDiv;
};

const typingEffect = (text, textElement) => {
    textElement.textContent = "";
    let charIndex = 0;
    const typingInterval = setInterval(() => {
        if (charIndex < text.length) {
            textElement.textContent += text[charIndex++];
        } else {
            clearInterval(typingInterval);
        }
    }, 40);
};

const generateResponse = async (botMsgDiv) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API request failed");
        
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";
        botMsgDiv.querySelector(".avatar").classList.remove("loading");
        typingEffect(botReply, botMsgDiv.querySelector(".message-text"));
    } catch (error) {
        console.error("Error fetching response:", error);
        botMsgDiv.querySelector(".message-text").textContent = "Oops! Something went wrong.";
        botMsgDiv.querySelector(".avatar").classList.remove("loading");
    }
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    const userMsgHTML = '<p class="message-text"></p>';
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    promptInput.value = "";

    setTimeout(() => {
        const botMsgHTML = `
            <img src="gemini-chatbot-logo.svg" class="avatar loading">
            <p class="message-text"></p>
        `;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message");
        chatsContainer.appendChild(botMsgDiv);
        generateResponse(botMsgDiv);
    }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);
