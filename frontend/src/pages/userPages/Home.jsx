import React, { useEffect, useState } from 'react';
import { Button, Card } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { fetchHomeEventsList } from '../../api/eventApi.js';
import { Event } from '../../components/Event.jsx';
import useAuth from '../../context/useAuth.js';

export const Home = () => {
    const [isZeroEvents, setIsZeroEvents] = useState(true);
    const [events, setEvents] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const start = dayjs().set('hour', 0).set('minute', 0);
                const end = dayjs().set('hour', 23).set('minute', 59);
                const response = await fetchHomeEventsList({
                    room: -1,
                    start: start.toISOString(),
                    end: end.toISOString(),
                });
                setEvents(response.data);
                if (response.data.length > 0) {
                    setIsZeroEvents(false);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (events.length === 0) {
            setIsZeroEvents(true);
        }
    }, [events]);

    return (
        <div>
            <div>
                {isLoading ? (
                    <div>
                        <Card style={{ marginBottom: '30px' }} loading={isLoading} />
                        <Card style={{ marginBottom: '30px' }} loading={isLoading} />
                        <Card style={{ marginBottom: '30px' }} loading={isLoading} />
                    </div>
                ) : (
                    <div>
                        {isZeroEvents ? (
                            <div>
                                <h2 className='text-2xl text-left mb-5'>You Don't Have Any Events Today</h2>
                                <h2 className='text-2xl text-left mb-5'>Want To Check Calendar?</h2>
                                <Button size='large' onClick={() => navigate('/calendar')}>Go To Calendar</Button>
                                {['admin'].includes(user.role) ? (
                                    <Button style={{ marginLeft: '30px' }} size='large' onClick={() => navigate('/admin/panel')}>Admin Panel</Button>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className='flex flex-row'>
                                    <h2 className='text-2xl text-left mb-5'>Today You Have This Events:</h2>
                                    {['admin'].includes(user.role) ? (
                                        <Button size='large' onClick={() => navigate('/admin/panel')}>Admin Panel</Button>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                                {events.map((item, index) => (
                                    <Event key={index} props={item} isLoading={isLoading}></Event>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
