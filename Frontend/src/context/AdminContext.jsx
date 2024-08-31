import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [role, setRole] = useState(null);
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (token) {
                    const { role, _id } = parseAdminToken(token);
                    console.log("Fetched Admin Role:", role);
                    console.log("Fetched Admin ID:", _id);
                    setRole(role);
                    setAdminId(_id);
                } else {
                    console.error('Admin token is missing or invalid');
                }
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            }
        };

        fetchAdminData();
    }, []);

    if (!adminId || !role) {
        return <div>Loading...</div>;
    }

    return (
        <AdminContext.Provider value={{ role, adminId }}>
            {children}
        </AdminContext.Provider>
    );
};

AdminProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

function parseAdminToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Parsed Admin Role:", payload.user.role);
        console.log("Parsed Admin ID:", payload.user._id);
        return { role: payload.user.role, _id: payload.user._id };
    } catch (e) {
        console.error('Failed to parse admin token:', e);
        return { role: null, _id: null };
    }
}
