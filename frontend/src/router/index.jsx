import {Home} from "../pages/userPages/Home.jsx";
import {Calendar} from "../pages/userPages/Calendar.jsx";
import Login from "../pages/publicPages/Login.jsx";
import AuthSuccess from "../pages/publicPages/AuthSuccess.jsx";
import AdminPanel from "../pages/adminPages/AdminPanel.jsx";
import MonitorLoginPage from "../pages/monitorPages/MonitorLoginPage.jsx";
import MonitorViewPage from "../pages/monitorPages/MonitorViewPage.jsx";
import BigMonitorViewPage from "../pages/monitorPages/BigMonitorViewPage.jsx";

export const roles = {
    USER: 'user',
    ADMIN: 'admin',
    STAFF: 'staff',
}

export const adminRoutes = [
    {path: '/admin/panel', element: <AdminPanel />},
]

export const userRoutes = [
    {path: '/home', element: <Home />},
    {path: '/calendar', element: <Calendar />},
]

export const publicRoutes = [
    {path: '/', element: <Login />},
    {path: '/auth/success', element: <AuthSuccess />},
]

export const monitorRoutes = [
    {path: '/monitor/view', element: <MonitorViewPage />},
    {path: '/monitor/big/view', element: <BigMonitorViewPage />},
]