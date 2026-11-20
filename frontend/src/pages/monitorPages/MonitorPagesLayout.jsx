import React from 'react';
import {Outlet} from "react-router";

const MonitorPagesLayout = () => {
    return (
        <div className="public-layout">
            <Outlet />
        </div>
    );
};

export default MonitorPagesLayout;