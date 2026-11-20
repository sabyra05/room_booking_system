import React, { useEffect, useState } from 'react';
import { fetchBigMonitorData } from '../../api/monitorApi.js';
import BigMonitorScheduleColumn from '../../components/monitor/BigMonitorScheduleColumn.jsx';
import {
    formatBigMonitorEvents,
    formatGermanMonitorDate,
} from '../../utils/monitorFormatters.js';
import Calendar from './media/Calendar Icon.png';
import NachMittag from './media/Nachmittag_Icon.png';
import VorMittag from './media/Vormittag_Icon.png';
import Background from './media/bigBackground.jpg';
import PlanImport from './media/plan_info.png';
import './styles/BigMonitorViewPage.css';

const BigMonitorViewPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [formattedMorningEvents, setFormattedMorningEvents] = useState([]);
    const [formattedAfternoonEvents, setFormattedAfternoonEvents] = useState([]);
    const [formattedDate, setFormattedDate] = useState([]);
    const [intervalFlag, setIntervalFlag] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => setIntervalFlag(new Date()), 300000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchBigMonitorData();
                const receivedData = response.data;

                console.log(receivedData);

                setFormattedMorningEvents(formatBigMonitorEvents(receivedData.morning));
                setFormattedAfternoonEvents(formatBigMonitorEvents(receivedData.afternoon));
                setFormattedDate(formatGermanMonitorDate());
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [intervalFlag]);

    useEffect(() => {
        console.log(formattedMorningEvents);
    }, [formattedMorningEvents]);

    if (isLoading)
        return <div>Loading...</div>;

    return (
        <div
            className='flex items-center justify-center main'
            style={{
                backgroundImage: `url(${Background})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                minWidth: '3840px',
                minHeight: '2160px',
                color: 'white',
                fontSize: '2rem',
            }}
        >
            <div className='w-925.5 h-500 bg-white/30 backdrop-blur-xl rounded-[50px] flex'>
                <BigMonitorScheduleColumn
                    title="Vormittag"
                    iconUrl={VorMittag}
                    events={formattedMorningEvents}
                    containerClassName="mt-13 flex flex-col"
                />
                <BigMonitorScheduleColumn
                    title="Nachmittag"
                    iconUrl={NachMittag}
                    events={formattedAfternoonEvents}
                    containerClassName="ml-15 mt-13 flex flex-col"
                />
                <div
                    className='mt-22 flex flex-col justify-start items-end '
                    style={{
                        backgroundImage: `url(${PlanImport})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        width: '1374px',
                        height: '1819px',
                        transform: 'scale(1.05, 1.08)',
                    }}
                >
                    <div className='flex flex-col items-end mt-84'>
                        <div
                            style={{
                                backgroundImage: `url(${Calendar})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                width: '239px',
                                height: '239px',
                                transform: 'scale(1.05, 1.08)',
                            }}
                        >
                            <h2 className='text-9xl text-center text-black mt-20'>{formattedDate[1]}</h2>
                        </div>
                        <h2 className='text-8xl text-center text-black mt-10'>
                            {formattedDate[2]} {formattedDate[3]}
                        </h2>
                        <span className='text-8xl text-center text-black'>{formattedDate[0]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BigMonitorViewPage;
