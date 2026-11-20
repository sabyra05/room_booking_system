import React from 'react';
import { Button, Card, Checkbox, Drawer, Input } from 'antd';

export const UserFormDrawer = ({
    isOpen,
    onClose,
    chosenUser,
    isCreatingUser,
    onDrawerChange,
    onModifyUser,
    onCreateNewUser,
}) => {
    const actions = [
        <div className='flex flex-row justify-around'>
            {!isCreatingUser ? (
                <Button style={{ marginLeft: '40px', marginRight: '40px' }} onClick={onModifyUser}>
                    <p className='text-lg p-3'>Modify User</p>
                </Button>
            ) : (
                <Button style={{ marginLeft: '40px', marginRight: '40px' }} onClick={onCreateNewUser}>
                    <p className='text-lg p-3'>Create New User</p>
                </Button>
            )}
        </div>,
    ];

    return (
        <Drawer size='default' title={'Modify User'} onClose={onClose} open={isOpen} placement='right'>
            <Card actions={actions} style={{ minWidth: 300, marginBottom: '30px' }}>
                <Card.Meta
                    title={<h1>User ID: {chosenUser.id}</h1>}
                    description={
                        <div className='flex flex-col justify-between'>
                            <h1 className='text-xl font-medium text-black mb-3 mt-4'>Name</h1>
                            <Input
                                style={{ marginBottom: 30 }}
                                size='large'
                                name='username'
                                value={chosenUser.username}
                                onChange={e => onDrawerChange(e)}
                            />
                            <h1 className='text-xl font-medium text-black mb-3'>Email</h1>
                            <Input
                                style={{ marginBottom: 30 }}
                                size='large'
                                name='email'
                                value={chosenUser.email}
                                onChange={e => onDrawerChange(e)}
                            />
                            <h1 className='text-xl font-medium text-black mb-3'>Is Admin</h1>
                            <Checkbox
                                size='large'
                                name='is_admin'
                                defaultChecked={chosenUser.is_admin}
                                onChange={e => onDrawerChange(e)}
                            />
                        </div>
                    }
                />
            </Card>
        </Drawer>
    );
};

export default UserFormDrawer;
