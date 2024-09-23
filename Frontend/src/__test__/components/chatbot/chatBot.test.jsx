import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ChatBot from '../../../components/chatbot/ChatBot';
import { useChatbot } from '../../../context/ChatbotContext';
import { AuthContext } from '../../../context/AuthContext';
import { sendChatMessage } from '../../../services/chatService';

beforeAll(() => {
    // Mock the geolocation API
    global.navigator.geolocation = {
        getCurrentPosition: vi.fn().mockImplementationOnce((success) => 
            Promise.resolve(success({
                coords: {
                    latitude: 52.5200,
                    longitude: 13.4050
                }
            }))
        )
    };
});

// Mock the useChatbot function
vi.mock('../../../context/ChatbotContext', () => ({
    useChatbot: () => ({
        toggleChatbot: vi.fn(), // Provide a mock function for toggleChatbot
    }),
}));

vi.mock('../../../services/chatService', () => ({
    sendChatMessage: vi.fn().mockResolvedValue({
        data: { reply: 'Hello from the bot', sessionId: 'test-session-id' }
    }),
}));

// Mock the AuthContext
const mockAuthContextValue = {
    authToken: 'test-auth-token',
};

// Mock the API service to return a bot reply
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
    expect(screen.getByText('Cura')).toBeInTheDocument(); // Check if the header is rendered
});

// Test for when the user is logged in
test('ChatBot renders the history button when logged in', () => {
    const mockAuthContextValue = {
        authToken: 'test-auth-token', // Simulate user logged in
    };

    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    // Check that the History button is visible using getByTestId
    expect(screen.getByTestId('HistoryRoundedIcon')).toBeInTheDocument();
});

// Test for when the user is not logged in
test('ChatBot does not render the history button when not logged in', () => {
    const mockAuthContextValue = {
        authToken: null, // Simulate user not logged in
    };

    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot />
        </AuthContext.Provider>
    );

    // Check that the History button is not visible
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
    expect(sendButton).not.toBeInTheDocument(); // Button shouldn't appear when input is empty

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello!' } });

    expect(screen.getByLabelText('send')).toBeInTheDocument(); // Button should appear when there's input
});

test('Sending a message adds it to the chat', async () => {
    render(
        <AuthContext.Provider value={mockAuthContextValue}>
            <ChatBot/>
        </AuthContext.Provider>
    );

    // Type a message in the input field
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello!' } });

    // Simulate clicking the send button
    fireEvent.click(screen.getByLabelText('send'));

    // Check if user's message is added
    expect(screen.getByText('Hello!')).toBeInTheDocument();

    // Use `within` to search specifically in the chat container
    const chatBox = screen.getByTestId('chatbot-container');
    await within(chatBox).findByText((content) => content.includes('Hello from the bot'));

    // Ensure the bot's reply is in the document
    expect(screen.getByText((content) => content.includes('Hello from the bot'))).toBeInTheDocument();
});