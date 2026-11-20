import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet } from 'react-router';
import { logoutUserPost } from '../api/authApi.js';

const { Header, Content, Footer } = Layout;

export const BasePageLayout = ({ contentClassName = '' }) => {
    const logout = async () => {
        try {
            const response = await logoutUserPost();
            console.log(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('email');
            localStorage.removeItem('givenName');
            window.location.href = import.meta.env.VITE_BASE_FRONTEND_URL;
        }
    };

    const items = [
        { label: 'Logout', onClick: logout },
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    style={{ flex: 1, minWidth: 0 }}
                    items={items}
                />
            </Header>
            <Content style={{ padding: '0 48px' }}>
                <div
                    style={{
                        padding: 24,
                        minHeight: 380,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        marginTop: 20,
                    }}
                >
                    <div>
                        {contentClassName ? (
                            <div className={contentClassName}>
                                <Outlet />
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }} />
        </Layout>
    );
};

export default BasePageLayout;
