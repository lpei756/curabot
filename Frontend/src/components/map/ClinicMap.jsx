import { useState, useEffect } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import axios from "axios";
import { getClinics } from '../../services/clinicService';

const ClinicMap = () => {
    const [userPosition, setUserPosition] = useState(null);
    const [clinicPositions, setClinicPositions] = useState([]);
    const [isUserInfoWindowOpen, setIsUserInfoWindowOpen] = useState(false);
    const [openInfoWindowId, setOpenInfoWindowId] = useState(null);

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

        // Fetch clinics from the backend
        const fetchClinics = async () => {
            try {
                const clinics = await getClinics();  // Fetch all clinics
                console.log("Fetched clinics:", clinics);  // Log the fetched clinics
                geocodeAddresses(clinics)
            } catch (error) {
                console.error("Error fetching clinics:", error);
            }
        };

        // Geocode the clinic addresses
        const geocodeAddresses = async (clinics) => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                const geocodePromises = clinics.map(async (clinic) => {
                    const encodedAddress = encodeURIComponent(clinic.address);
                    const response = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
                    );
                    if (response.data.status === "OK") {
                        const location = response.data.results[0].geometry.location;
                        return {
                            id: clinic._id, // Use the clinic's ID as a unique identifier
                            name: clinic.name,
                            address: clinic.address,
                            email: clinic.email,
                            fax: clinic.fax,
                            phone: clinic.phone,
                            hours: clinic.hours,
                            service: clinic.service,
                            lat: location.lat,
                            lng: location.lng,
                        };
                    } else {
                        console.error("Geocoding error for", clinic.address, ":", response.data.status);
                        return null;
                    }
                });

                const positions = await Promise.all(geocodePromises);
                setClinicPositions(positions.filter(position => position !== null));
            } catch (error) {
                console.error("Error fetching geocoding data:", error);
            }
        };

        // Fetch clinics and then geocode addresses
        fetchClinics();
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
                            background={"#000000"}
                            borderColor={"#000000"}
                            glyphColor={"#f8f6f6"}
                        />
                        {isUserInfoWindowOpen && (
                            <InfoWindow position={userPosition} onCloseClick={() => setIsUserInfoWindowOpen(false)}>
                                <div style={{ color: '#03035d' }}>
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
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary={clinic.name}
                                                primaryTypographyProps={{ style: { color: '#03035d' } }}
                                                secondary={
                                                    <>
                                                        <div>{clinic.address}</div>
                                                        <div>{clinic.service}</div>
                                                        <div>{clinic.hours}</div>
                                                        <div>{clinic.email}</div>
                                                        <div>Fax: {clinic.fax}</div>
                                                        <div>Phone: {clinic.phone}</div>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </List>
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
