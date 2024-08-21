import React, { useState, useEffect, useContext } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../App.css';
import { fetchUserData } from '../../services/userService';
import { fetchAvailableSlotsByDate, fetchAllAvailableSlots, fetchGpSlotsByDoctorId, fetchSlotsByAddress } from '../../services/availabilityService';
import { AuthContext } from '../../context/AuthContext';
import Diversity1Icon from '@mui/icons-material/Diversity1';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: { 'en-US': new Date() },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
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
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
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
                        marginBottom: '10px'
                    }}
                >
                    Back
                </StyledButton>
                <StyledButton
                    onClick={() => onNavigate('TODAY')}
                    variant="outlined"
                    sx={{ marginBottom: '10px' }}
                >
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
                        marginBottom: '10px'
                    }}
                >
                    Next
                </StyledButton>
                <StyledButton
                    onClick={onShowGpSlots}
                    variant="outlined"
                    sx={{ marginBottom: '10px', marginLeft: '20px', borderRadius: '50px' }}
                    startIcon={<Diversity1Icon />}
                >
                    My GP
                </StyledButton>
                <FormControl
                    sx={{
                        mb: 2,
                        ml: 2,
                        minWidth: 100,
                        backgroundColor: '#f8f6f6',
                        borderRadius: '50px',
                    }}
                >
                    <InputLabel
                        id="location-select-label"
                        sx={{
                            color: '#03035d',
                            fontSize: '16px',
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
                            },
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
                    sx={{ marginBottom: '10px', marginLeft: '10px', borderRadius: '50px' }}
                >
                    Search
                </StyledButton>
            </Box>
            <Box sx={{ fontSize: '20px', color: '#03035d' }}>
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

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const data = await fetchAllAvailableSlots();
                if (data && data.length > 0) {
                    const formattedEvents = data.map(slot => ({
                        title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                        start: new Date(slot.startTime),
                        end: new Date(slot.endTime),
                        allDay: false,
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
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
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
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
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
        console.log('Clicked Show My GP\'s Slots button.');
        fetchGpSlots();
    };

    const handleAddressChange = async () => {
        try {
            const data = await fetchSlotsByAddress(address);
            if (data && data.length > 0) {
                const formattedEvents = data.map(slot => ({
                    title: `${format(new Date(slot.startTime), 'HH:mm')} - ${format(new Date(slot.endTime), 'HH:mm')}`,
                    start: new Date(slot.startTime),
                    end: new Date(slot.endTime),
                    allDay: false,
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

    return (
        <Box p={2} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" align="center" gutterBottom>
                Make an Appointment
            </Typography>
            <Typography variant="h5" align="center" gutterBottom>
                It&apos;s Quick an Easy.
            </Typography>

            <StyledPaper style={{ backgroundColor: '#f9f9f9' }}>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    step={15}
                    startAccessor="start"
                    endAccessor="end"
                    min={new Date(0, 0, 0, 8, 0, 0)}
                    max={new Date(0, 0, 0, 16, 0, 0)}
                    style={{ height: '100%', width: 1000 }}
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
                />
            </StyledPaper>
            <Box mt={2}>
                <TextField
                    label="Search by Address"
                    variant="outlined"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" onClick={handleAddressChange} sx={{ mr: 2 }}>
                    Search by Address
                </Button>
                <Button variant="contained" color="secondary" onClick={handleShowGpSlots}>
                    Show My GP's Slots
                </Button>
            </Box>
        </Box>
    );
};

export default AvailableSlotsCalendar;
