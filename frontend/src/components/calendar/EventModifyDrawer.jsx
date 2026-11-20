import React from 'react';
import { Button, Card, Drawer, Select } from 'antd';
import dayjs from 'dayjs';

const roomOptions = Array.from({ length: 8 }, (_, i) => ({
    value: i,
    label: i,
}));

export const EventModifyDrawer = ({
    chosenEvent,
    isOpen,
    onClose,
    onRoomSelect,
    onModifyEvent,
}) => {
    const actions = [
        <div className='flex flex-row justify-around'>
            <Button style={{ marginLeft: '40px', marginRight: '40px' }} onClick={onModifyEvent}>
                <p className='text-lg p-3'>Modify Event</p>
            </Button>
        </div>,
    ];

    return (
        <Drawer title={'Modify Event'} onClose={onClose} open={isOpen} placement='bottom'>
            <Card actions={actions} style={{ minWidth: 300, marginBottom: '30px' }}>
                <Card.Meta
                    title={
                        <div className='flex flex-row justify-between'>
                            <h1 className='text-2xl text-left font-bold'>{chosenEvent.event.title}</h1>
                            {chosenEvent.event.start && chosenEvent.event.start !== 'None' ? (
                                <h2 className='text-xl font-medium'>
                                    {dayjs(chosenEvent.event.start).format('HH:mm')} - {dayjs(chosenEvent.event.end).format('HH:mm')}
                                </h2>
                            ) : (
                                <h2 className='text-xl font-medium'>No time :(</h2>
                            )}
                        </div>
                    }
                    description={
                        <div className='font-normal text-black flex flex-row justify-between'>
                            <div>
                                <h1 className='text-xl'>{chosenEvent.event.extendedProps.teacher}</h1>
                                <h1 className='mt-5 text-left text-lg'>
                                    Date: {dayjs(chosenEvent.event.start).format('DD.MM.YYYY')}
                                </h1>
                                {chosenEvent.event.extendedProps.description ? (
                                    <p className='mt-5 text-left text-lg max-w-2xl'>
                                        {chosenEvent.event.extendedProps.description}
                                    </p>
                                ) : (
                                    <p className='mt-5 text-left text-lg'>No description :(</p>
                                )}
                            </div>
                            <div className='flex flex-row justify-between text-left text-lg'>
                                <div className='flex flex-col items-end'>
                                    <Select
                                        defaultValue={chosenEvent.event.extendedProps.room}
                                        style={{ width: 120 }}
                                        disabled={false}
                                        options={roomOptions}
                                        onSelect={value => onRoomSelect(value)}
                                    />
                                    <Button style={{ marginTop: '20px' }} onClick={onModifyEvent}>
                                        <p className='text-lg p-3'>Modify Event</p>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    }
                />
            </Card>
        </Drawer>
    );
};

export default EventModifyDrawer;
