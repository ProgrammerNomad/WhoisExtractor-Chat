import React, { useState } from 'react';
import styles from '../styles/ChatWidget.module.css';

const ChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
        });

        const data = await response.json();
        const botMessage = { text: data.response, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setInput('');
    };

    return (
        <div className={styles.chatWidget}>
            <div className={styles.messages}>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className={styles.input}
            />
            <button onClick={handleSend} className={styles.sendButton}>Send</button>
        </div>
    );
};

export default ChatWidget;