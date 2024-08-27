import { useState, useEffect } from "react";
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import { getClinics } from '../../services/clinicService';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ClinicMap = () => {
    const [userPosition, setUserPosition] = useState(null);
    const [clinicPositions, setClinicPositions] = useState([]);
    const [isUserInfoWindowOpen, setIsUserInfoWindowOpen] = useState(false);
    const [openInfoWindowId, setOpenInfoWindowId] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting user location:", error);
                setUserPosition({ lat: -36.8485, lng: 174.7633 });
            }
        );

        const fetchClinics = async () => {
            try {
                const clinics = await getClinics();
                geocodeAddresses(clinics);
            } catch (error) {
                console.error("Error fetching clinics:", error);
            }
        };

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
                            id: clinic._id,
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

        fetchClinics();
    }, []);

    const handleUserMarkerClick = () => {
        setIsUserInfoWindowOpen(prev => !prev);
    };

    const handleMarkerClick = (id) => {
        const selectedClinic = clinicPositions.find(clinic => clinic.id === id);
        if (selectedClinic && userPosition) {
            const distance = haversineDistance(
                userPosition.lat,
                userPosition.lng,
                selectedClinic.lat,
                selectedClinic.lng
            );
            selectedClinic.distance = distance.toFixed(2);
        }
        setOpenInfoWindowId((prevId) => {
            return prevId === id ? null : id;
        });
    };

    if (!userPosition || clinicPositions.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <Lottie
                    animationData={animationData}
                    style={{
                        width: '200px',
                        height: '200px',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
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
                                                        {clinic.address}<br />
                                                        {clinic.service}<br />
                                                        {clinic.hours}<br />
                                                        {clinic.email}<br />
                                                        Fax: {clinic.fax}<br />
                                                        Phone: {clinic.phone}<br />
                                                        {userPosition && clinic.distance && (
                                                            <div>
                                                                Distance from you: {clinic.distance} km
                                                            </div>
                                                        )}
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
};

export default ClinicMap;
