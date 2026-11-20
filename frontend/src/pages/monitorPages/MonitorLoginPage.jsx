import React, { useEffect } from 'react';
import { Button, Card, Divider, Input, Select } from 'antd';
import { useNavigate } from 'react-router';
import { submitMonitorLoginRequest } from '../../api/monitorApi.js';

const options = Array.from({ length: 8 }, (_, i) => ({
    value: i,
    label: i.toString(),
}));

const MonitorLoginPage = () => {
    const [password, setPassword] = React.useState('');
    const [room, setRoom] = React.useState(-1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCorrectCredentials, setCorrectCredentials] = React.useState(true);
    const [response, setResponse] = React.useState(null);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleRoomChange = (e) => {
        setRoom(e);
    };

    const submitData = async (e) => {
        e.preventDefault();
        localStorage.setItem('room', room);
        setIsLoading(true);
        try {
            const res = await submitMonitorLoginRequest(password, room, () =>
                setCorrectCredentials(false)
            );
            setResponse(res);
        } catch (error) {
            null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            if (response.status === 200) {
                navigate('/monitor/view');
            }
        } catch (error) {
            null;
        }
    }, [response]);

    return (
        <div>
            <Card style={{ width: 500, margin: 'auto', marginTop: 200 }}>
                <h1 className='text-3xl mb-5 text-center font-medium'>Monitor Login Form</h1>
                <Divider style={{ marginBottom: 25 }} />
                <div className='flex justify-between'>
                    <h2 className='text-xl font-normal text-center'>Password:</h2>
                    <Input disabled={isLoading} style={{ width: 275 }} onChange={handlePasswordChange} />
                </div>
                <Divider style={{ marginBottom: 25 }} />
                <div className='flex justify-between'>
                    <h2 className='text-xl font-normal text-center'>Room:</h2>
                    <Select
                        disabled={isLoading}
                        value={room}
                        style={{ width: 120 }}
                        onChange={handleRoomChange}
                        options={options}
                    />
                </div>
                <Divider style={{ marginBottom: 25 }} />
                {isCorrectCredentials ? null : (
                    <div>
                        <h3 className='text-lg text-red-500 mb-5'>Password is not correct!</h3>
                    </div>
                )}
                <Button disabled={isLoading} color="cyan" size='large' onClick={submitData} variant="solid">
                    Submit
                </Button>
                <Button disabled={isLoading} style={{ marginLeft: 20 }} color="red" size='large' variant="solid">
                    Cancel
                </Button>
            </Card>
        </div>
    );
};

export default MonitorLoginPage;
