import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { getGoogleAuthLoginUrl } from '../../api/authApi.js';

const Login = () => {
    const navigate = useNavigate();
    return (
        <div>
            <Button size='large' onClick={() => (window.location.href = getGoogleAuthLoginUrl())}>
                Login via google
            </Button>
            <Button style={{ marginLeft: '20px' }} size='large' onClick={() => navigate('/home')}>
                Go Home
            </Button>
        </div>
    );
};

export default Login;
