import React from 'react';
import { Modal } from 'antd';

export const DeleteUserModal = ({ isOpen, chosenUser, onOk, onCancel }) => {
    return (
        <Modal size='large' title="Delete User" open={isOpen} onOk={onOk} onCancel={onCancel}>
            <p className='text-base font-medium'>Are You sure, that You want to delete this account?</p>
            <p>User ID: {chosenUser.id}</p>
            <p>Email: {chosenUser.email}</p>
            <p>Username: {chosenUser.username}</p>
        </Modal>
    );
};

export default DeleteUserModal;
