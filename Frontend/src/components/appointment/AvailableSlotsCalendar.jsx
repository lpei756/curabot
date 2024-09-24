import { useState, useEffect, useContext } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../App.css';
import { fetchUserData } from '../../services/userService.js';
import { fetchAvailableSlotsByDate, fetchAllAvailableSlots, fetchGpSlotsByDoctorId, fetchSlotsByAddress } from '../../services/availabilityService.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import AppointmentDetail from './AppointmentDetail.jsx';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': new Date() },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
}));

const StyledButton = styled(Button)(({ theme, rounded }) => ({
    backgroundColor: '#f8f6f6',
    color: '#03035d',
    borderColor: '#03035d',
    borderRadius: rounded ? '50px' : '0px',
    border: '1px solid #03035d',
    margin: '0',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: '#03035d',
        color: '#f8f6f6',
        borderColor: '#03035d',
    },
}));

const CustomToolbar = ({ label, onNavigate, onShowGpSlots, onSelectLocation, selectedLocation, onSearchAddress }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8f6f6',
                padding: '0 16px',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    mb: { xs: 2, lg: 0 },
                }}
            >
                <StyledButton
                    onClick={() => onNavigate('PREV')}
                    variant="outlined"
                    sx={{
                        borderTopRightRadius: '0',
                        borderBottomRightRadius: '0',
                        borderTopLeftRadius: '50px',
                        borderBottomLeftRadius: '50px',
                        marginRight: '-1px',
                    }}
                >
                    Back
                </StyledButton>
                <StyledButton onClick={() => onNavigate('TODAY')} variant="outlined">
                    Today
                </StyledButton>
                <StyledButton
                    onClick={() => onNavigate('NEXT')}
                    variant="outlined"
                    sx={{
                        borderTopLeftRadius: '0',
                        borderBottomLeftRadius: '0',
                        borderTopRightRadius: '50px',
                        borderBottomRightRadius: '50px',
                        marginLeft: '-1px',
                    }}
                >
                    Next
                </StyledButton>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    width: '100%'
                }}
            >
                <StyledButton
                    onClick={onShowGpSlots}
                    variant="outlined"
                    sx={{ marginBottom: { xs: '10px', sm: '0' }, marginLeft: { xs: '0%', lg: '2%' }, borderRadius: '50px' }}
                    startIcon={<Diversity1Icon />}
                >
                    My GP
                </StyledButton>
                <FormControl
                    sx={{
                        mb: { xs: 2, sm: 0 },
                        ml: { xs: 2 },
                        minWidth: 100,
                        backgroundColor: '#f8f6f6',
                        borderRadius: '50px',
                    }}
                >
                    <InputLabel
                        id="location-select-label"
                        sx={{
                            color: '#03035d',
                            fontSize: '16px'
                        }}
                    >
                        Location
                    </InputLabel>
                    <Select
                        labelId="location-select-label"
                        value={selectedLocation}
                        onChange={(e) => onSelectLocation(e.target.value)}
                        label="Location"
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: '50px',
                            borderColor: '#03035d',
                            '& .MuiSelect-select': {
                                padding: '10px',
                                fontSize: '16px',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#03035d',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#03035d',
                            }
                        }}
                    >
                        <MenuItem value="Auckland">Auckland</MenuItem>
                        <MenuItem value="Wellington">Wellington</MenuItem>
                        <MenuItem value="Tauranga">Tauranga</MenuItem>
                        <MenuItem value="Dunedin">Dunedin</MenuItem>
                        <MenuItem value="Christchurch">Christchurch</MenuItem>
                        <MenuItem value="Invercargill">Invercargill</MenuItem>
                        <MenuItem value="Hamilton">Hamilton</MenuItem>
                    </Select>
                </FormControl>
                <StyledButton
                    onClick={onSearchAddress}
                    variant="contained"
                    color="primary"
                    sx={{ marginBottom: { xs: '10px', sm: '0' }, marginLeft: { xs: '10px' }, borderRadius: '50px' }}
                >
                    Search
                </StyledButton>
            </Box>
            <Box sx={{ fontSize: '20px', color: '#03035d', mt: { xs: 2, sm: 0 } }}>
                {label}
            </Box>
        </Box>
    );
};

const AvailableSlotsCalendar = () => {
    const [events, setEvents] = useState([]);
    const [date, setDate] = useState(new Date());
    const [allSlots, setAllSlots] = useState([]);
    const [currentViewRange, setCurrentViewRange] = useState({ start: new Date(), end: new Date() });
    const [gpSlots, setGpSlots] = useState([]);
    const [address, setAddress] = useState('');
    const { userId } = useContext(AuthContext);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const data = await fetchAllAvailableSlots();
                if (data && data.length > 0) {
                    const formattedEvents = data.map(slot => ({
                        slotId: slot._id,
                        title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                        start: new Date(slot.startTime),
                        end: new Date(slot.endTime),
                        allDay: false,
                        doctorID: slot.doctorID
                    }));
                    setAllSlots(formattedEvents);
                } else {
                    setAllSlots([]);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
            }
        };

        fetchSlots();
    }, []);

    useEffect(() => {
        const start = startOfWeek(date, { weekStartsOn: 0 });
        const end = addWeeks(start, 1);
        setCurrentViewRange({ start, end });

        const fetchSlotsForRange = async () => {
            const slotsInRange = allSlots.filter(slot =>
                slot.start >= start && slot.end < end
            );
            setEvents(slotsInRange);
        };

        fetchSlotsForRange();
    }, [date, allSlots]);

    const handleDateChange = async (newDate) => {
        const selectedDate = format(newDate, 'yyyy-MM-dd');
        try {
            const data = await fetchAvailableSlotsByDate(selectedDate);
            if (data && data.length > 0) {
                const formattedEvents = data.map(slot => ({
                    slotId: slot._id,
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
                    doctorID: slot.doctorID
                }));
                setEvents(formattedEvents);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const fetchGpSlots = async () => {
        try {
            const userData = await fetchUserData(userId);
            const gpId = userData.gp;

            if (!gpId || gpId === 'Not assigned') {
                setGpSlots([]);
                return;
            }

            const gpSlotsData = await fetchGpSlotsByDoctorId(gpId);

            const gpSlotsArray = Array.isArray(gpSlotsData) ? gpSlotsData : [gpSlotsData];

            if (gpSlotsArray.length > 0) {
                const formattedGpSlots = gpSlotsArray.map(slot => ({
                    slotId: slot._id,
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
                    doctorID: slot.doctorID
                }));
                setGpSlots(formattedGpSlots);
                setEvents(formattedGpSlots);
            } else {
                setGpSlots([]);
                setEvents([]);
            }
        } catch (error) {
            console.error('Error fetching GP slots:', error);
        }
    };

    const handleShowGpSlots = () => {
        fetchGpSlots();
    };

    const handleAddressChange = async () => {
        try {
            const data = await fetchSlotsByAddress(address);
            if (data && data.length > 0) {
                const formattedEvents = data.map(slot => ({
                    slotId: slot._id,
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
                    doctorID: slot.doctorID
                }));
                setEvents(formattedEvents);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Error fetching slots by address:', error);
            setEvents([]);
        }
    };

    const handleLocationChange = (location) => {
        setSelectedLocation(location);
        setAddress(location);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    return (
        <Box p={2} display="flex" justifyContent="center" alignItems="center">
            <Box flex={1} display="flex" flexDirection="column" sx={{ 
                    maxWidth: '100vw', 
                    width: '90%', 
                    backgroundColor: '#f9f9f9', 
                    padding: '16px', 
                    overflowX: 'auto'
                }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ color: 'black'}}>
                    Make an Appointment
                </Typography>
                <Typography variant="h5" align="center" gutterBottom sx={{ color: 'black'}}>
                    It&apos;s Quick and Easy.
                </Typography>

                <StyledPaper style={{ backgroundColor: '#f9f9f9', padding: '16px' }}>
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        step={15}
                        startAccessor="start"
                        endAccessor="end"
                        min={new Date(0, 0, 0, 8, 0, 0)}
                        max={new Date(0, 0, 0, 16, 0, 0)}
                        style={{ height: '100%', width: '100%', maxWidth: '100vw' }}
                        views={['week']}
                        defaultView="week"
                        components={{
                            toolbar: (props) => (
                                <CustomToolbar
                                    {...props}
                                    onShowGpSlots={handleShowGpSlots}
                                    onSelectLocation={handleLocationChange}
                                    selectedLocation={selectedLocation}
                                    onSearchAddress={handleAddressChange}
                                />
                            )
                        }}
                        onNavigate={(newDate) => {
                            setDate(newDate);

                            const newViewStart = startOfWeek(newDate, { weekStartsOn: 0 });
                            const newViewEnd = addWeeks(newViewStart, 1);
                            const isNavigatingWeek = newViewStart.getTime() !== currentViewRange.start.getTime();

                            if (isNavigatingWeek) {
                                setEvents(allSlots.filter(slot =>
                                    slot.start >= newViewStart && slot.end < newViewEnd
                                ));
                                setCurrentViewRange({ start: newViewStart, end: newViewEnd });
                            } else {
                                handleDateChange(newDate);
                            }
                        }}
                        onSelectEvent={handleEventClick}
                    />
                </StyledPaper>
            </Box>

            <AppointmentDetail
                open={modalOpen}
                onClose={handleCloseModal}
                event={selectedEvent}
            />
        </Box>
    );
};

export default AvailableSlotsCalendar;
