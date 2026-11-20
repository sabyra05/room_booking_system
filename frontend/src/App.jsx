import React from 'react';
import { BrowserRouter } from 'react-router';
import './App.css';
import { AuthProvider } from './context/index.js';
import AppRouter from './router/AppRouter.jsx';

const App = () => {
    return (
        <div>
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
};

export default App;
