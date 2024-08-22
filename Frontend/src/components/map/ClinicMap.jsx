import { useState, useEffect } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import { Box } from "@mui/material";
import axios from "axios";

const ClinicMap = () => {
    const [userPosition, setUserPosition] = useState(null);
    const [clinicPositions, setClinicPositions] = useState([]);
    const [isUserInfoWindowOpen, setIsUserInfoWindowOpen] = useState(false);
    const [openInfoWindowId, setOpenInfoWindowId] = useState(null);

    const addresses = [
        "10 Queen St, Auckland, 1010",
        "15 Mount Eden Rd, Auckland, 1024",
        "34 Symonds St, Auckland, 1010",
        "123 Albert St, Auckland, 1010",
    ];

    useEffect(() => {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting user location:", error);
                // Fallback to a default location if geolocation fails
                setUserPosition({ lat: -36.8485, lng: 174.7633 }); // Default to Auckland, NZ
            }
        );

        // Geocode the clinic addresses
        const geocodeAddresses = async () => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                const geocodePromises = addresses.map(async (address) => {
                    const encodedAddress = encodeURIComponent(address);
                    const response = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
                    );
                    if (response.data.status === "OK") {
                        const location = response.data.results[0].geometry.location;
                        return {
                            id: address, // Use the address as a unique ID
                            address,
                            lat: location.lat,
                            lng: location.lng,
                        };
                    } else {
                        console.error("Geocoding error for", address, ":", response.data.status);
                        return null;
                    }
                });

                const positions = await Promise.all(geocodePromises);
                setClinicPositions(positions.filter(position => position !== null));
            } catch (error) {
                console.error("Error fetching geocoding data:", error);
            }
        };

        geocodeAddresses();
    }, []);

    const handleUserMarkerClick = () => {
        setIsUserInfoWindowOpen(prev => !prev);
    };

    const handleMarkerClick = (id) => {
        setOpenInfoWindowId((prevId) => {
            return prevId === id ? null : id;
        });
    };

    if (!userPosition || clinicPositions.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <Box style={{ height: "100vh" }}>
                <Map defaultZoom={13} defaultCenter={userPosition} mapId={import.meta.env.VITE_MAP_ID}>
                    <AdvancedMarker position={userPosition} onClick={handleUserMarkerClick}>
                        <Pin
                            background={"#03035d"}
                            borderColor={"#03035d"}
                            glyphColor={"#f8f6f6"}
                        />
                        {isUserInfoWindowOpen && (
                            <InfoWindow position={userPosition} onCloseClick={() => setIsUserInfoWindowOpen(false)}>
                                <div style={{color: '#03035d' }}>
                                    You are here
                                </div>
                            </InfoWindow>
                        )}
                    </AdvancedMarker>
                    {clinicPositions.map((clinic, index) => (
                        <AdvancedMarker
                            key={index}
                            position={{ lat: clinic.lat, lng: clinic.lng }}
                            onClick={() => handleMarkerClick(clinic.id)}
                        >
                            <Pin
                                background={"#03035d"}
                                borderColor={"#03035d"}
                                glyphColor={"#f8f6f6"}
                            />
                            {openInfoWindowId === clinic.id && (
                                <InfoWindow position={{ lat: clinic.lat, lng: clinic.lng }} onCloseClick={() => setOpenInfoWindowId(null)}>
                                    <div style={{color: '#03035d' }}>{clinic.address}</div>
                                </InfoWindow>
                            )}
                        </AdvancedMarker>
                    ))}
                </Map>
            </Box>
        </APIProvider>
    );
}

export default ClinicMap;
