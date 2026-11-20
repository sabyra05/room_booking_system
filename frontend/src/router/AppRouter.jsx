import { Route, Routes} from "react-router";
import {adminRoutes, monitorRoutes, publicRoutes, userRoutes} from "./index.jsx";
import useAuth from "../context/useAuth.js";
import PublicPagesLayout from "../pages/publicPages/PublicPagesLayout.jsx"
import AdminPagesLayout from "../pages/adminPages/AdminPagesLayout.jsx";
import UserPagesLayout from "../pages/userPages/UserPagesLayout.jsx";
import Login from "../pages/publicPages/Login.jsx";
import MonitorPagesLayout from "../pages/monitorPages/MonitorPagesLayout.jsx";


const AppRouter = () => {
    const { isLoading, user, login, logout } = useAuth();

    return (
        <div>
            <Routes>
                <Route element={<MonitorPagesLayout />}>
                    {
                        monitorRoutes.map((route, index) => (
                            <Route path={route.path} key={index} element={route.element} />
                        ))
                    }
                </Route>
                <Route element={<PublicPagesLayout />}>
                    <Route path='*' element={<Login />} />
                    {
                        publicRoutes.map((route, index) => (
                            <Route path={route.path} key={index} element={route.element} />
                        ))
                    }
                </Route>
                {
                    (user?.role === 'admin' && !isLoading) ?
                        <Route element={<AdminPagesLayout />}>
                            {
                                adminRoutes.map((route, index) => (
                                    <Route path={route.path} key={index} element={route.element} />
                                ))
                            }
                        </Route>
                    :
                        null
                }
                {
                    (['admin', 'user'].includes(user?.role) && !isLoading) ?
                        <Route element={<UserPagesLayout />}>
                            {
                                userRoutes.map((route, index) => (
                                    <Route path={route.path} key={index} element={route.element} />
                                ))
                            }
                        </Route>
                    :
                        null
                }
            </Routes>
        </div>
    );
};

export default AppRouter;