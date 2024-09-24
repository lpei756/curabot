import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { vi, beforeAll, describe, it, expect, test } from 'vitest';
import ChatBot from '../../../components/chatbot/ChatBot';
import { useChatbot } from '../../../context/ChatbotContext';
import { AuthContext } from '../../../context/AuthContext';
import { sendChatMessage } from '../../../services/chatService';

if (typeof global.navigator === 'undefined') {
    global.navigator = {};
}

beforeAll(() => {
    global.navigator.geolocation = {
        getCurrentPosition: vi.fn().mockImplementationOnce((success) => {
            success({
                coords: {
                    latitude: 52.5200,
                    longitude: 13.4050
                }
            });
        })
    };
});

vi.mock('../../../context/ChatbotContext', () => ({
    useChatbot: () => ({
        toggleChatbot: vi.fn(),
    }),
}));

vi.mock('../../../services/chatService', () => ({
    sendChatMessage: vi.fn().mockResolvedValue({
        data: { reply: 'Hello from the bot', sessionId: 'test-session-id' }
    }),
}));

const mockAuthContextValue = {
    authToken: 'test-auth-token',
};

vi.mock('../../../services/chatService', () => ({
    sendChatMessage: vi.fn().mockResolvedValue({
        data: { reply: 'Hello from the bot', sessionId: 'test-session-id' }
    }),
}));

test('sendChatMessage resolves correctly', async () => {
    const response = await sendChatMessage({ message: 'test' });
    expect(response.data.reply).toBe('Hello from the bot');
});

test('ChatBot renders without crashing', () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );
    expect(screen.getByText('Cura')).toBeInTheDocument();
});

test('ChatBot renders the history button when logged in', () => {
    const mockAuthContextValue = {
        authToken: 'test-auth-token',
    };

    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    expect(screen.getByTestId('HistoryRoundedIcon')).toBeInTheDocument();
});

test('ChatBot does not render the history button when not logged in', () => {
    const mockAuthContextValue = {
        authToken: null,
    };

    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    expect(screen.queryByTestId('HistoryRoundedIcon')).not.toBeInTheDocument();
});

test('Typing in the message input updates the input value', () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello!' } });

    expect(input.value).toBe('Hello!');
});

test('Send button is disabled when input is empty', () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    const sendButton = screen.queryByLabelText('send');
    expect(sendButton).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello!' } });

    expect(screen.getByLabelText('send')).toBeInTheDocument();
});

test('Sending a message adds it to the chat', async () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot/>
        </AuthContext.Provider>
    );

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello!' } });

    fireEvent.click(screen.getByLabelText('send'));

    expect(screen.getByText('Hello!')).toBeInTheDocument();

    const chatBox = screen.getByTestId('chatbot-container');
    await within(chatBox).findByText((content) => content.includes('Hello from the bot'));

    expect(screen.getByText((content) => content.includes('Hello from the bot'))).toBeInTheDocument();
});
