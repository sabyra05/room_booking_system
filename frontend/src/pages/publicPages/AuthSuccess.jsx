import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { sendGoogleAuthCode } from '../../api/authApi.js';
import useAuth from '../../context/useAuth.js';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [dResponseData, setDResponseData] = useState({});
    const params = new URLSearchParams(document.location.search);
    const authentication_code = params.get('code');
    const state = params.get('state');

    useEffect(() => {
        const sendAuthCode = async () => {
            try {
                const response = await sendGoogleAuthCode(authentication_code, state);
                setDResponseData(prev => ({
                    ...prev,
                    ...response.data,
                }));
                await login();
                navigate('/home');
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        sendAuthCode();
    }, []);

    const testFunction = event => {
        event.preventDefault();
        navigate('/home');
    };

    return (
        <div className=''>
            <h1 className='text-3xl mb-3'>Redirecting To Home Page...</h1>
            {!isLoading ? (
                <Button color="cyan" variant="solid" size='large' onClick={testFunction}>
                    <span className='text-2xl'>Go home</span>
                </Button>
            ) : (
                <h1 className='text-3xl'>Loading...</h1>
            )}
        </div>
    );
};

export default AuthSuccess;
