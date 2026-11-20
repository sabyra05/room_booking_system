import React from 'react';
import { Lesson } from '../Lesson.jsx';

export const BigMonitorScheduleColumn = ({ title, iconUrl, events, containerClassName }) => {
    return (
        <div className={containerClassName}>
            <div className='flex items-end justify-start ml-35 mb-13'>
                <div
                    style={{
                        backgroundImage: `url(${iconUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        width: '170px',
                        height: '117px',
                        color: 'white',
                        fontSize: '2rem',
                    }}
                />
                <h2 className='text-black text-7xl leading-20 ml-10'>{title}</h2>
            </div>
            <div>
                {events.map((item, index) => (
                    <Lesson key={index} props={item} />
                ))}
            </div>
        </div>
    );
};

export default BigMonitorScheduleColumn;
