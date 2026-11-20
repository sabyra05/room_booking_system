import React, {useEffect} from 'react';
import {Button, Card} from "antd";
import dayjs from "dayjs";
import {useNavigate} from "react-router";

export const Event = ({props, isLoading}) => {

    const navigate = useNavigate();

    const goToCalendar = () => {
        navigate(`/calendar`);
    }

    const actions = [
        <div className='flex flex-row justify-around'>
            <Button style={{marginLeft: '40px', marginRight: '40px',}} onClick={goToCalendar}><p className='text-lg p-3'>View Event In Calendar</p></Button>
        </div>,
    ]

    return (
        <div>
            <Card loading={isLoading} actions={actions} style={{ minWidth: 300, marginBottom: '30px'}}>
                <Card.Meta
                    title={
                        <div className='flex flex-row justify-between'>
                            <h1 className='text-3xl text-left font-bold'>{props.title}</h1>
                            {
                                props.start && props.start !== 'None'
                                    ? <h2 className='text-2xl font-medium'>{dayjs(props.start).format('HH:mm')} - {dayjs(props.end).format('HH:mm')}</h2>
                                    : <h2 className='text-2xl font-medium'>No time :(</h2>
                            }
                        </div>
                    }
                    description={
                        <div className='font-normal text-black'>
                            <div className='flex flex-row justify-between text-left text-xl'>
                                <h2>{props.teacher}</h2>
                                <h2>Room: {props.room}</h2>
                            </div>
                            <div>
                                <h2 className='mt-5 text-left text-lg'>Date: {dayjs(props.start).format('DD.MM.YYYY')}</h2>
                            </div>
                            {
                                props.description ?
                                    <p className='mt-5 text-left text-lg'>{props.description.slice(0, 30)}...</p>
                                    : <p className='mt-5 text-left text-lg'>No description :(</p>
                            }
                        </div>
                    }
                />
            </Card>
        </div>
    );
};

export default Event;