import React, { useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
    fetchEventsList,
    modifyEventRoomRequest,
    refreshEventsRequest,
} from '../../api/eventApi.js';
import EventModifyDrawer from '../../components/calendar/EventModifyDrawer.jsx';

export const Calendar = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [chosenEvent, setChosenEvent] = useState(null);
    const [room, setRoom] = useState(-1);

    useEffect(() => {
        const start = dayjs().set('date', 1).set('hour', 0).set('minute', 0);
        const end = dayjs().set('month', dayjs().get('month') + 1).endOf('month');
        const getEvents = async () => {
            try {
                const response = await fetchEventsList({
                    start: start.toISOString(),
                    end: end.toISOString(),
                });
                const receivedData = response.data?.content || response.data;
                console.log(receivedData);
                setEvents([...receivedData]);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        getEvents();
    }, []);

    const handleEventClick = (arg) => {
        setOpenModal(true);
        setChosenEvent(arg);
    };

    const onClose = () => {
        setOpenModal(false);
        setChosenEvent(null);
        setRoom(-1);
    };

    const updateEventRoom = (field, id, newValue) => {
        setEvents(prev =>
            prev.map(event =>
                event.id === id ? { ...event, [field]: newValue } : event
            )
        );
    };

    const modifyEvent = async () => {
        const body = {
            id: chosenEvent.event.id,
            room: room,
        };
        try {
            await modifyEventRoomRequest(body);
        } catch (error) {
            console.log(error);
        } finally {
            const bgColors = ['gray', 'green', 'red', 'yellow', 'orange', 'pink', 'purple', 'cyan'];
            const bgColor = bgColors[room];

            let textColor = '';
            const brightBgColors = [3, 7, 5];

            if (brightBgColors.includes(room))
                textColor = 'black';

            setOpenModal(false);
            updateEventRoom('room', chosenEvent.event.id, room);
            updateEventRoom('color', chosenEvent.event.id, bgColor);
            updateEventRoom('textColor', chosenEvent.event.id, textColor);
            setRoom(-1);
            setChosenEvent(null);
        }
    };

    const refreshEvents = async () => {
        setIsLoading(true);
        try {
            await refreshEventsRequest();
        } catch (error) {
            console.log(error);
        } finally {
            window.location.reload();
        }
    };

    return isLoading ? (
        <h1 className='text-3xl'>Loading...</h1>
    ) : (
        <div className='flex flex-col'>
            <div className='text-left mb-5'>
                <Button color="default" size='large' style={{ marginBottom: '30px' }} onClick={() => navigate('/home')}>
                    <span className='text-xl py-5'>Go Home</span>
                </Button>
                <Button color="default" size='large' style={{ marginBottom: '30px', marginLeft: '25px' }} onClick={refreshEvents}>
                    <span className='text-xl py-5'>Refresh</span>
                </Button>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                    views={{
                        timeGridWorkWeekDay: {
                            type: 'timeGridWeek',
                            duration: { days: 5 },
                            buttonText: 'Work week',
                        },
                    }}
                    eventBorderColor={'none'}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }}
                    expandRows={true}
                    allDaySlot={false}
                    slotMinTime='07:00:00'
                    slotMaxTime='21:00:00'
                    firstDay={1}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }}
                    initialView="timeGridWorkWeekDay"
                    headerToolbar={{
                        left: 'today prev,next',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWorkWeekDay,timeGridDay',
                    }}
                    eventClick={handleEventClick}
                    events={events}
                    eventMouseEnter={(info) => {
                        tippy(info.el, {
                            content: `<h1 class="text-2xl">Room: ${info.event.extendedProps.room}</h1>`,
                            allowHTML: true,
                            placement: 'bottom',
                        });
                    }}
                />
            </div>
            {chosenEvent ? (
                <EventModifyDrawer
                    chosenEvent={chosenEvent}
                    isOpen={openModal}
                    onClose={onClose}
                    onRoomSelect={setRoom}
                    onModifyEvent={modifyEvent}
                />
            ) : null}
        </div>
    );
};

export default Calendar;
