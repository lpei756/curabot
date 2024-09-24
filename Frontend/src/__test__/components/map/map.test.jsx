import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ClinicMap from '../../../components/map/ClinicMap';
import { getClinics } from '../../../services/clinicService';
import axios from 'axios';

vi.mock('@vis.gl/react-google-maps', () => ({
    APIProvider: ({ children }) => <div>{children}</div>,
    Map: ({ children }) => <div>{children}</div>,
    AdvancedMarker: ({ children, ...props }) => (
        <div {...props} onClick={props.onClick}>
            {children}
        </div>
    ),
    Pin: () => <div>Pin</div>,
    InfoWindow: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../../services/clinicService', () => ({
    getClinics: vi.fn(),
}));

beforeAll(() => {
    global.navigator.geolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success) => success({
            coords: { latitude: 52.52, longitude: 13.4050 }
        })),
    };
});

vi.mock('axios', () => {
    return {
        default: {
            create: () => ({
                interceptors: {
                    request: { use: vi.fn(), eject: vi.fn() },
                    response: { use: vi.fn(), eject: vi.fn() },
                },
                get: vi.fn(),
            }),
            get: vi.fn(),
        },
    };
});

describe('ClinicMap', () => {
    test('displays loading animation while fetching data', () => {
        render(<ClinicMap />);

        const loadingAnimation = screen.getByTestId('lottie-animation');
        expect(loadingAnimation).toBeInTheDocument();
    });

    test('renders map and clinics after data is fetched', async () => {
        getClinics.mockResolvedValue([
            { _id: '1', name: 'Clinic A', address: 'Address A' },
            { _id: '2', name: 'Clinic B', address: 'Address B' },
        ]);

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
        render(<ClinicMap />);

        await waitFor(() => {
            const pins = screen.getAllByText('Pin');
            expect(pins).toHaveLength(3);
        });

        const markers = screen.getAllByText('Pin');
        fireEvent.click(markers[1]);

        await waitFor(() => {
            expect(screen.getByText((content) => content.includes('Clinic A'))).toBeInTheDocument();
        });
    });
});
