import React, { useEffect } from 'react';
import { Button, Card, Table } from 'antd';
import { useNavigate } from 'react-router';
import {
    createUserRequest,
    deleteUserRequest,
    fetchUsersList,
    modifyUserRequest,
} from '../../api/userApi.js';
import DeleteUserModal from '../../components/admin/DeleteUserModal.jsx';
import UserFormDrawer from '../../components/admin/UserFormDrawer.jsx';

const AdminPanel = () => {
    const [users, setUsers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [openDrawer, setOpenDrawer] = React.useState(false);
    const [chosenUser, setChosenUser] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isCreatingUser, setIsCreatingUser] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getUsersList = async () => {
            try {
                const response = await fetchUsersList();
                setUsers(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        getUsersList();
    }, []);

    const onClose = () => {
        setOpenDrawer(false);
        setChosenUser(null);
    };

    const onOpenDrawer = (e) => {
        setOpenDrawer(true);
        setChosenUser(e);
    };

    const modifyUser = async () => {
        try {
            await modifyUserRequest(chosenUser);
        } catch (error) {
            console.log(error);
        } finally {
            setUsers(prevUsers =>
                prevUsers.map(user => (user.id === chosenUser.id ? chosenUser : user))
            );
            setOpenDrawer(false);
            setChosenUser(null);
        }
    };

    const onDrawerChange = (e) => {
        if (e.target.name === 'is_admin')
            setChosenUser({ ...chosenUser, [e.target.name]: e.target.checked });
        else
            setChosenUser({ ...chosenUser, [e.target.name]: e.target.value });
    };

    const onOpenModal = (e) => {
        setIsModalOpen(true);
        setChosenUser(e);
    };

    const handleOk = async () => {
        setUsers(prevUser => prevUser.filter(user => user.email !== chosenUser.email));
        try {
            await deleteUserRequest(chosenUser);
        } catch (error) {
            console.log(error);
        } finally {
            setIsModalOpen(false);
            setChosenUser(null);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setChosenUser(null);
    };

    const openCreateNewUserDrawer = () => {
        const newUser = {
            id: '',
            username: '',
            email: '',
            is_admin: false,
            key: users.length + 1,
        };
        setChosenUser({ ...newUser });
        setOpenDrawer(true);
        setIsCreatingUser(true);
    };

    const createNewUser = async () => {
        setUsers([...users, chosenUser]);
        try {
            await createUserRequest(chosenUser);
        } catch (error) {
            console.log(error);
        } finally {
            setOpenDrawer(false);
            setChosenUser(null);
            setIsCreatingUser(false);
        }
    };

    const columns = [
        {
            title: 'Number',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Is Admin',
            key: 'isAdmin',
            render: (e) => (e.is_admin ? <h1>Yes</h1> : <h1>No</h1>),
        },
        {
            title: 'Action',
            key: 'action',
            render: (e) => (
                <div>
                    <Button type='text' onClick={() => onOpenDrawer(e)}>Modify</Button>
                    <Button color='danger' variant='text' onClick={() => onOpenModal(e)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            {isLoading ? (
                <div>
                    <Card loading={true} style={{ minWidth: 300, marginBottom: '20px' }} />
                    <Card loading={true} style={{ minWidth: 300, marginBottom: '20px' }} />
                    <Card loading={true} style={{ minWidth: 300, marginBottom: '20px' }} />
                </div>
            ) : (
                <div>
                    <Button
                        style={{ marginBottom: 30 }}
                        onClick={openCreateNewUserDrawer}
                        size='large'
                    >
                        Create New User
                    </Button>
                    <Button
                        style={{ marginBottom: 30, marginLeft: 30 }}
                        size='large'
                        onClick={() => navigate('/home')}
                    >
                        Go Home
                    </Button>
                    <Table columns={columns} dataSource={users} />
                </div>
            )}
            {chosenUser ? (
                <div>
                    <DeleteUserModal
                        isOpen={isModalOpen}
                        chosenUser={chosenUser}
                        onOk={handleOk}
                        onCancel={handleCancel}
                    />
                    <UserFormDrawer
                        isOpen={openDrawer}
                        onClose={onClose}
                        chosenUser={chosenUser}
                        isCreatingUser={isCreatingUser}
                        onDrawerChange={onDrawerChange}
                        onModifyUser={modifyUser}
                        onCreateNewUser={createNewUser}
                    />
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default AdminPanel;
