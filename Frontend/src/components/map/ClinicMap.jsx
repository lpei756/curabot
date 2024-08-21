import { useState, useEffect } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
} from "@vis.gl/react-google-maps";
import { Box } from "@mui/material";
import axios from "axios";

const ClinicMap = () => {
    const [userPosition, setUserPosition] = useState(null);
    const [clinicPositions, setClinicPositions] = useState([]);

    const addresses = [
        "10 Queen St, Auckland, 1010",
        "15 Mount Eden Rd, Auckland, 1024",
        "77 Molesworth St, Wellington, 6011",
        "12 Victoria St, Tauranga, 3110",
        "44 George St, Dunedin, 9016",
        "22 Colombo St, Christchurch, 8011",
        "5 Willow St, Tauranga, 3110",
        "100 Tay St, Invercargill, 9810",
        "12 Grafton Rd, Wellington, 6021",
        "34 Symonds St, Auckland, 1010",
        "88 Riccarton Rd, Christchurch, 8011",
        "50 Lambton Quay, Wellington, 6011",
        "123 Albert St, Auckland, 1010",
        "77 Victoria St, Hamilton, 3204",
        "33 Princes St, Dunedin, 9016",
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

    if (!userPosition || clinicPositions.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <Box style={{ height: "100vh" }}>
                <Map defaultZoom={13} defaultCenter={userPosition} mapId={import.meta.env.VITE_MAP_ID}>
                    <AdvancedMarker position={userPosition}>
                    <Pin
                                background={"#03035d"}
                                borderColor={"#03035d"}
                                glyphColor={"#f8f6f6"}
                            />
                    </AdvancedMarker>
                    {clinicPositions.map((clinic, index) => (
                        <AdvancedMarker
                            key={index}
                            position={{ lat: clinic.lat, lng: clinic.lng }}>
                            <Pin
                                background={"#03035d"}
                                borderColor={"#03035d"}
                                glyphColor={"#f8f6f6"}
                            />
                        </AdvancedMarker>
                    ))}
                </Map>
            </Box>
        </APIProvider>
    );
}

export default ClinicMap;