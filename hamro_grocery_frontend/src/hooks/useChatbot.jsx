import { useState } from 'react';

export const useChatbot = () => {
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);

    const openChatbot = () => setIsChatbotVisible(true);
    const closeChatbot = () => setIsChatbotVisible(false);
    const toggleChatbot = () => setIsChatbotVisible(prev => !prev);

    return {
        isChatbotVisible,
        openChatbot,
        closeChatbot,
        toggleChatbot,
    };
};