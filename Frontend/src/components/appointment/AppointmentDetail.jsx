import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Modal, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import { createAppointment } from '../../services/appointmentService';
import { getDoctorById } from '../../services/doctorService';
import { getClinicById } from '../../services/clinicService';
import { sendUserMessage } from '../../services/NotificationService';
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import PropTypes from 'prop-types';

const StyledModal = styled(Modal)(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto'
}));

const StyledBox = styled(Box)(() => ({
    color: 'black',
    padding: '24px',
    backgroundColor: '#f8f6f6',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    width: '1000px',
    height: '600px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
}));

const TextContainer = styled(Box)(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
}));

const ImageAndMapContainer = styled(Box)(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
}));

const StyledImage = styled('img')(() => ({
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
}));

const GoogleMapSection = styled(Box)(() => ({
    width: '100%',
    height: '300px',
}));

const AppointmentDetail = ({ open, onClose, event }) => {
    const [doctor, setDoctor] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const { userId, authToken } = useContext(AuthContext);

    useEffect(() => {
        if (event?.doctorID) {
            const fetchData = async () => {
                try {
                    const doctorData = await getDoctorById(event.doctorID);
                    setDoctor(doctorData);

                    const clinicData = await getClinicById(doctorData.clinic);
                    setClinic(clinicData);

                    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                    const encodedAddress = encodeURIComponent(clinicData.address);
                    const response = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
                    );

                    if (response.data.status === "OK") {
                        const location = response.data.results[0].geometry.location;
                        setLocation(location);
                    } else {
                        console.error('Geocoding failed:', response.data.status);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            setLoading(false);
        }
    }, [event?.doctorID]);

    const handleBooking = async () => {
        if (!event || !doctor || !clinic) return;

        const appointmentData = {
            dateTime: event.start,
            clinic: clinic._id,
            slotId: event.slotId,
            assignedGP: doctor.doctorID
        };

        try {
            const result = await createAppointment(appointmentData);
            console.log('Appointment Created:', result);
            console.log('Doctor ID:', doctor._id);
            const formData = new FormData();
            formData.append('senderId', userId);
            formData.append('receiverId', doctor._id);
            formData.append('message', `You have a new appointment with ${event.title} on ${new Date(event.start).toLocaleString()}.`);
            formData.append('senderModel', 'User');
            formData.append('receiverModel', 'Doctor');

            await sendUserMessage(formData, authToken);
            console.log('Notification sent to doctor:', formData);

            onClose();
        } catch (error) {
            console.error('Error saving appointment or sending notification:', error.response ? error.response.data : error.message);
        }
    };

    if (!event || loading) return null;

    const clinicImage = clinic ? `/clinics/${clinic._id}.jpg` : '';

    return (
        <StyledModal
            open={open}
            onClose={onClose}
            aria-labelledby="appointment-details-title"
            aria-describedby="appointment-details-description"
        >
            <StyledBox>
                <TextContainer>
                    <Typography id="appointment-details-title" variant="h6" gutterBottom>
                        Appointment Details
                    </Typography>
                    <Typography variant="body1">
                        <strong>Title:</strong> {event.title}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Start:</strong> {new Date(event.start).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                        <strong>End:</strong> {new Date(event.end).toLocaleString()}
                    </Typography>
                    {doctor && (
                        <Typography variant="body1">
                            <strong>Doctor:</strong> {`${doctor.firstName} ${doctor.lastName}`}
                        </Typography>
                    )}
                    {clinic && (
                        <>
                            <Typography variant="body1">
                                <strong>Clinic:</strong> {clinic.name}



                            </Typography>
                            <Typography variant="body1">
                                <strong>Location:</strong> {clinic.address}
                            </Typography>
                        </>
                    )}
                    {doctor?.languagesSpoken && doctor.languagesSpoken.length > 0 && (
                        <Typography variant="body1">
                            <strong>Languages Spoken:</strong> {doctor.languagesSpoken.join(', ')}
                        </Typography>
                    )}
                    <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                        <Button sx={{ backgroundColor: '#03035d' }} variant="contained" onClick={handleBooking}>
                            Book Appointment
                        </Button>
                        <Button sx={{ backgroundColor: '#f8f6f6', color: '#03035d', border: '1px solid #03035d' }} variant="contained" onClick={onClose}>
                            Close
                        </Button>
                    </Box>
                </TextContainer>

                <ImageAndMapContainer>
                    {clinicImage && (
                        <StyledImage
                            src={clinicImage}
                            alt={clinic.name}
                        />
                    )}
                    {location && (
                        <GoogleMapSection>
                            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                                <Map
                                    defaultZoom={13}
                                    defaultCenter={{ lat: location.lat, lng: location.lng }}
                                    mapId={import.meta.env.VITE_MAP_ID}
                                >
                                    <AdvancedMarker position={{ lat: location.lat, lng: location.lng }}>
                                        <Pin background={"#03035d"} borderColor={"#03035d"} glyphColor={"#f8f6f6"} />
                                    </AdvancedMarker>
                                </Map>
                            </APIProvider>
                        </GoogleMapSection>
                    )}
                </ImageAndMapContainer>

            </StyledBox>
        </StyledModal>
    );
};

AppointmentDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    event: PropTypes.shape({
        doctorID: PropTypes.string.isRequired,
        start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        title: PropTypes.string.isRequired,
        slotId: PropTypes.string.isRequired,
    }),
};

export default AppointmentDetail;
