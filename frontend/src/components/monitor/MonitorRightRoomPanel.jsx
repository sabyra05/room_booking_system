import React from 'react';

export const MonitorRightRoomPanel = ({ isMeetingRoom, roomNumber, roomColor }) => {
    return (
        <div className="right-panel">
            {isMeetingRoom ? (
                <div className='flex flex-col items-center w-150'>
                    <span className='font-extrabold meeting-sign'>MEETING</span>
                    <span className='font-extrabold raum-sign'>RAUM</span>
                </div>
            ) : (
                <div className='flex flex-col items-center w-150'>
                    <span className='font-extrabold room-text-sign'>RAUM</span>
                    <span style={{ color: roomColor }} className='font-extrabold room-number-sign'>
                        0{roomNumber}
                    </span>
                </div>
            )}
        </div>
    );
};

export default MonitorRightRoomPanel;
