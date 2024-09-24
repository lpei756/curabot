import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ClinicMap from '../../../components/map/ClinicMap';
import { getClinics } from '../../../services/clinicService';
import axios from 'axios';

// Mock Google Maps and Geolocation API
vi.mock('@vis.gl/react-google-maps', () => ({
    APIProvider: ({ children }) => <div>{children}</div>,  // Mocking Google Maps
    Map: ({ children }) => <div>{children}</div>,  // Mocking Map
    AdvancedMarker: ({ children, ...props }) => (
        <div {...props} onClick={props.onClick}>
            {children}
        </div>
    ),  // Mocking Marker with onClick
    Pin: () => <div>Pin</div>,  // Mocking Pin
    InfoWindow: ({ children }) => <div>{children}</div>,  // Mocking InfoWindow
}));

// Mock the getClinics function
vi.mock('../../../services/clinicService', () => ({
    getClinics: vi.fn(),
}));

// Mock the navigator.geolocation
beforeAll(() => {
    global.navigator.geolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success) => success({
            coords: { latitude: 52.52, longitude: 13.4050 }
        })),
    };
});

// Mock axios and its interceptors
vi.mock('axios', () => {
    return {
        default: {
            create: () => ({
                interceptors: {
                    request: { use: vi.fn(), eject: vi.fn() },
                    response: { use: vi.fn(), eject: vi.fn() },
                },
                get: vi.fn(),  // Mock axios GET method
            }),
            get: vi.fn(),  // Also mock the get method for direct use
        },
    };
});

describe('ClinicMap', () => {
    test('displays loading animation while fetching data', () => {
        render(<ClinicMap />);
        
        // Check if the loading animation is displayed initially
        const loadingAnimation = screen.getByTestId('lottie-animation');
        expect(loadingAnimation).toBeInTheDocument();
    });

    test('renders map and clinics after data is fetched', async () => {
        // Mock the clinic data
        getClinics.mockResolvedValue([
            { _id: '1', name: 'Clinic A', address: 'Address A' },
            { _id: '2', name: 'Clinic B', address: 'Address B' },
        ]);

        // Mock axios geocode response for each clinic
        axios.get
            .mockResolvedValueOnce({
                data: {
                    status: 'OK',
                    results: [{ geometry: { location: { lat: 52.5200, lng: 13.4050 } } }],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    status: 'OK',
                    results: [{ geometry: { location: { lat: 52.5300, lng: 13.4050 } } }],
                },
            });

        // Render the component
        render(<ClinicMap />);

        // Wait for clinics and map to appear
        await waitFor(() => {
            const pins = screen.getAllByText('Pin');
            expect(pins).toHaveLength(3);  // 1 user pin + 2 clinic pins
        });

        // Simulate clicking on the first clinic marker to show the InfoWindow
        const markers = screen.getAllByText('Pin');
        fireEvent.click(markers[1]);  // Click the first clinic's marker

        // Ensure the clinic info is shown in the InfoWindow
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('Clinic A'))).toBeInTheDocument();
        });
    });
});