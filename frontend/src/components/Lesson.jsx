import React, {useEffect} from 'react';
import '../pages/monitorPages/styles/BigMonitorViewPage.css'

export const Lesson = ({props}) => {

    const [isVisible, setIsVisible] = React.useState(true);

    let room = null

    if (props.room === 8)
        room = '07'
    else if (props.room === 9)
        room = 'M'
    else
        room = '0' + props.room

    const ifMeetingRoom = () => {
        if (room === 'M')
            return true
        return false
    }

    const isIdNaN = () => {
        if (props.id === null)
            return true
        return false
    }

    const colors = {
        'M': '#9e9e9e', '01': '#ae0018',
        '02': '#018f89', '03': '#329730',
        '04': '#3096c8', '05': '#d88200',
        '06': '#292974', '07': '#742e52',
        '08': '#742e52'
    }

    return (
        <div>
            <div className='w-270 h-40 flex text-black'>
                <div style={{background: colors[room]}} className='w-26 h-40'></div>
                <div className='flex flex-col justify-between items-center ml-6'>
                    <span className='text-3xl'>Raum</span>
                    <h2 className='text-9xl font-bold leading-38'>{room}</h2>
                </div>
                {
                    !isIdNaN() ? <div className='flex flex-col justify-center items-start ml-6'>
                        <h2 className='text-4xl mb-4'>{props.title}</h2>
                        <div className='flex items-end'>
                            <div className='flex flex-col pr-5'>
                                <span className='text-4xl mb-2'>{props.courseFormat}</span>
                                <span className='text-5xl'>{props.time} Uhr</span>
                            </div>
                            <div className='w-1 h-20  border-r-2 mr-5'></div>
                            <div className='flex flex-col justify-between h-20 pr-5'>
                                <h2 className='text-3xl'>Kursleitung:</h2>
                                <span className='text-3xl'>{props.teacher}</span>
                            </div>
                            <div className='w-1 h-20  border-r-2 mr-5'></div>
                            <div className='flex flex-col justify-between h-20 pr-5'>
                                <h2 className='text-3xl'>Teilnehmer*in:</h2>
                                <span className='text-3xl'>{props.peopleQuantity} Person</span>
                            </div>
                        </div>
                    </div> : null
                }
            </div>
            {
                ifMeetingRoom() ? null : <div className='w-260 mt-4 mb-4 border-black border-b-1'></div>
            }
        </div>
    );
};

export default Lesson;