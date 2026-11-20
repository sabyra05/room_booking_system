import React, { useEffect } from 'react';
import { faCloudSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchMonitorRoomData, fetchViennaWeatherData } from '../../api/monitorApi.js';
import MonitorRightRoomPanel from '../../components/monitor/MonitorRightRoomPanel.jsx';
import MonitorSchoolInfoFooter from '../../components/monitor/MonitorSchoolInfoFooter.jsx';
import { buildFormattedMonitorEventData } from '../../utils/monitorFormatters.js';
import ScreenSaver0 from './media/Raum_00.jpg';
import ScreenSaver1 from './media/Raum_01.jpg';
import ScreenSaver2 from './media/Raum_02.jpg';
import ScreenSaver3 from './media/Raum_03.jpg';
import ScreenSaver4 from './media/Raum_04.jpg';
import ScreenSaver5 from './media/Raum_05.jpg';
import ScreenSaver6 from './media/Raum_06.jpg';
import ScreenSaver7 from './media/Raum_07.jpg';
import BackgroundImage from './media/background.jpg';
import BigLogo from './media/logo.png';
import './styles/MonitorViewPage.css';

const ScreenSavers = {
    1: ScreenSaver1,
    2: ScreenSaver2,
    3: ScreenSaver3,
    4: ScreenSaver4,
    5: ScreenSaver5,
    6: ScreenSaver6,
    7: ScreenSaver7,
    0: ScreenSaver0,
};

const ScreenColors = {
    1: '#f4052e',
    2: '#01a099',
    3: '#39a934',
    4: '#36a8e0',
    5: '#f29100',
    6: '#83335c',
    7: '#2d2e82',
};

const MonitorViewPage = () => {
    const currentUrl = window.location.href;
    const paramsUrl = currentUrl.split('?')[1];
    const params = paramsUrl.split('&');
    const password = params[0].split('=')[1];
    const room = params[1].split('=')[1];

    const [event, setEvent] = React.useState(null);
    const [freeTime, setFreeTime] = React.useState(null);
    const [isNoEvents, setIsNoEvents] = React.useState(false);
    const [currentDateTime, setCurrentDateTime] = React.useState(new Date());
    const [formattedEventData, setFormattedEventData] = React.useState(null);
    const [intervalFlag, setIntervalFlag] = React.useState(0);
    const [weatherData, setWeatherData] = React.useState(null);

    const roomFromLocalStorage = room;

    useEffect(() => {
        const intervalId = setInterval(() => setIntervalFlag(new Date()), 300000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if ((hours === 7 && minutes >= 50) || (hours === 8 && minutes === 0)) {
            window.location.reload();
        }
    }, [intervalFlag]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchMonitorRoomData(password, room);
                if (response.status === 200) {
                    setEvent(response.data.event);
                    setFreeTime(response.data.free_time);
                } else if (response.status === 204) {
                    setIsNoEvents(true);
                    console.log(response);
                }
            } catch (error) {
                console.log(error);
            }
        };

        const fetchWeatherData = async () => {
            try {
                const response = await fetchViennaWeatherData();
                setWeatherData(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchWeatherData();
        fetchData();
    }, [intervalFlag]);

    useEffect(() => {
        setCurrentDateTime(new Date());
        const intervalId = setInterval(() => setCurrentDateTime(new Date()), 60000);
        return () => clearInterval(intervalId);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const formattedTime = currentDateTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    useEffect(() => {
        if (event && freeTime && weatherData) {
            setFormattedEventData(
                buildFormattedMonitorEventData(event, freeTime, weatherData, currentDateTime)
            );
        }
    }, [event, weatherData, freeTime]);

    const enterFullScreenMode = () => {
        const mainContainer = document.getElementById('mainContainer');
        mainContainer.requestFullscreen();
    };

    const ifMeetingRoom = () => {
        if (roomFromLocalStorage === '0')
            return true;
        return false;
    };

    return (
        <div id='mainContainer' onClick={enterFullScreenMode}>
            <div
                style={{
                    backgroundImage: `url(${ScreenSavers[roomFromLocalStorage]})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    color: 'white',
                    fontSize: '2rem',
                    display: isNoEvents ? 'block' : 'none',
                }}
            />
            <div
                style={{
                    backgroundImage: `url(${BackgroundImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    color: 'white',
                    fontSize: '2rem',
                    display: isNoEvents ? 'none' : 'flex',
                }}
                className='flex main'
            >
                <div className="left-panel">
                    <div className="weather-info">
                        <div className="weather-icon">
                            <FontAwesomeIcon icon={faCloudSun} />
                        </div>
                        <div className="temperature flex align-center justify-between w-65">
                            <span className="temp-value text-3xl">
                                {formattedEventData ? formattedEventData.weatherNow : '-'}°
                            </span>
                            <div className="location flex flex-col w-50">
                                <span>Wien</span>
                                <span className="temp-range">
                                    {formattedEventData ? formattedEventData.weatherHighest : '-'}° / {formattedEventData ? formattedEventData.weatherLowest : '-'}°
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="date-time">
                        <span id="date" className="date">{formattedDate}</span>
                        <span className="separator">|</span>
                        <span className="time">{formattedTime}</span>
                        <span className="separator">|</span>
                        <span className="classroom">
                            Kursraum <span className="not-available">(Reserviert)</span>
                        </span>
                    </div>

                    <div className="schedule-item current">
                        <h2 className="class-name">{formattedEventData?.title || "—"}</h2>
                        <div className="meta-info">
                            <h2 className="class-time">
                                {formattedEventData?.start || "—"} – {formattedEventData?.end || "—"}
                            </h2>
                            <p className="teacher">TrainerIn: {formattedEventData?.teacher || "—"}</p>
                        </div>
                    </div>

                    <div className="schedule-item available">
                        <h2 className="class-time">
                            {formattedEventData ? formattedEventData.freeTimeStart : '-'} - {formattedEventData ? formattedEventData.freeTimeEnd : '-'}
                        </h2>
                        <p className="availability">Dieser Raum ist frei</p>
                    </div>

                    <MonitorSchoolInfoFooter logoUrl={BigLogo} />
                </div>

                <MonitorRightRoomPanel
                    isMeetingRoom={ifMeetingRoom()}
                    roomNumber={roomFromLocalStorage}
                    roomColor={ScreenColors[roomFromLocalStorage]}
                />
            </div>
        </div>
    );
};

export default MonitorViewPage;
