import React from 'react';

export const MonitorSchoolInfoFooter = ({ logoUrl }) => {
    return (
        <div className="school-info">
            <div
                className='logo'
                style={{
                    backgroundImage: `url(${logoUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            <div className="vertical-separator" />
            <div className="footer">
                <div className="contact-info">
                    <p>www.atelier04.at</p>
                    <p>office@atelier04.at</p>
                </div>
                <div className="vertical-separator"></div>
                <div className="contact-details">
                    <p>+43 (0) 1/208 76 71</p>
                    <p>Amerlingstraße 19/26, A-1060 Wien</p>
                </div>
            </div>
        </div>
    );
};

export default MonitorSchoolInfoFooter;
