import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addWeeks } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchAvailableSlotsByDate, fetchAllAvailableSlots } from '../../services/availabilityService';

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

const AvailableSlotsCalendar = () => {
    const [events, setEvents] = useState([]);
    const [date, setDate] = useState(new Date());
    const [allSlots, setAllSlots] = useState([]);
    const [currentViewRange, setCurrentViewRange] = useState({ start: new Date(), end: new Date() });

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

    return (
        <Box p={2} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5" gutterBottom>
                Available Slots for {format(date, 'MMMM dd, yyyy')}
            </Typography>
            <StyledPaper>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    step={15}
                    startAccessor="start"
                    endAccessor="end"
                    min={new Date(0, 0, 0, 8, 0, 0)}
                    max={new Date(0, 0, 0, 16, 0, 0)}
                    style={{ height: '100%', width: 700 }}
                    views={['week']}
                    defaultView="week"
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
        </Box>
    );
};

export default AvailableSlotsCalendar;