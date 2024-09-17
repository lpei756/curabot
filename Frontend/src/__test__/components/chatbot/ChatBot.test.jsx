import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from '../chatbot/ChatBot';  // Adjust the path based on your file structure
import { AuthContext } from '../../context/AuthContext';
import { ChatbotContext } from '../../context/ChatbotContext';
import { fetchChatHistoryBySessionId, sendChatMessage } from '../../services/chatService';
import { fetchUserChatHistories } from '../../services/chatService';
import { act } from 'react-dom/test-utils';

// Mocking the services
jest.mock('../../services/chatService', () => ({
    fetchChatHistoryBySessionId: jest.fn(),
    sendChatMessage: jest.fn(),
    fetchUserChatHistories: jest.fn()
}));

describe('ChatBot Component', () => {
    const mockAuthContextValue = { authToken: 'mock-token', userId: '123' };
    const mockChatbotContextValue = { toggleChatbot: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders chatbot UI components correctly', () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <ChatbotContext.Provider value={mockChatbotContextValue}>
                    <ChatBot />
                </ChatbotContext.Provider>
            </AuthContext.Provider>
        );

        // Check that the chatbot header renders
        expect(screen.getByText('Cura')).toBeInTheDocument();

        // Check if initial bot message is rendered
        expect(screen.getByText('Kia Ora! My name is Cura. How can I assist you today?')).toBeInTheDocument();

        // Check that input and send button are rendered
        expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
        expect(screen.getByLabelText('send')).toBeInTheDocument();
    });

    test('sends a user message and displays bot response', async () => {
        // Mock API responses
        sendChatMessage.mockResolvedValue({
            data: {
                sessionId: 'mock-session-id',
                reply: 'Hello, how can I help?',
            },
        });

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <ChatbotContext.Provider value={mockChatbotContextValue}>
                    <ChatBot />
                </ChatbotContext.Provider>
            </AuthContext.Provider>
        );

        // Type a message in the text field
        fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
            target: { value: 'Hi' },
        });

        // Click the send button
        fireEvent.click(screen.getByLabelText('send'));

        // Wait for the bot response to be displayed
        await waitFor(() => {
            expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument();
        });

        // Check if the user message is displayed
        expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    test('fetches and displays chat history', async () => {
        const mockChatHistory = {
            messages: [
                { message: 'Welcome back!', sender: 'bot', timestamp: new Date().toISOString() },
            ],
        };

        // Mock fetchChatHistoryBySessionId service
        fetchChatHistoryBySessionId.mockResolvedValue(mockChatHistory);

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <ChatbotContext.Provider value={mockChatbotContextValue}>
                    <ChatBot />
                </ChatbotContext.Provider>
            </AuthContext.Provider>
        );

        // Check that the chat history is rendered correctly
        await waitFor(() => {
            expect(screen.getByText('Welcome back!')).toBeInTheDocument();
        });
    });

    test('opens and closes the drawer on history icon click', () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <ChatbotContext.Provider value={mockChatbotContextValue}>
                    <ChatBot />
                </ChatbotContext.Provider>
            </AuthContext.Provider>
        );

        // Find the history button (using the icon label)
        const historyButton = screen.getByLabelText('history');

        // Simulate clicking the history button to open the drawer
        fireEvent.click(historyButton);

        // Expect the drawer to open (check if a search input field is rendered)
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

        // Simulate clicking the close button to close the drawer
        fireEvent.click(screen.getByLabelText('clear'));

        // Ensure that the search input is no longer visible (drawer closed)
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
});