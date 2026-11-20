import React from 'react';
import {Navigate, Outlet, useLocation} from "react-router";
import useAuth from "../context/useAuth.js";

const ProtectedRoute = ({allowedRoles}) => {
    const {user} = useAuth()
    const location = useLocation()

    if (!user)
        return <Navigate to="/login" state={{ from: location }} replace />

    if (!allowedRoles.includes(user.role))
        return <Navigate to="/login" state={{ from: location }} replace />

    return (
        <Outlet />
    );
};

export default ProtectedRoute;