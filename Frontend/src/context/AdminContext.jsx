import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tokenStorage } from "../utils/localStorage.js";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [adminToken, setAdminToken] = useState('');
    const [adminId, setAdminId] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            setAdminToken(token);
            const { adminId, role } = parseAdminToken(token);
            setAdminId(adminId);
            setRole(role);
        }
    }, []);

    const login = (token) => {
        tokenStorage.save(token);
        setAdminToken(token);
        const { adminId, role } = parseAdminToken(token);
        setAdminId(adminId);
        setRole(role);
    };

    const logout = () => {
        tokenStorage.remove();
        setAdminToken('');
        setAdminId(null);
        setRole(null);
    };

    return (
        <AdminContext.Provider value={{ adminToken, adminId, role, login, logout }}>
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
        console.log('Token payload:', payload);
        const adminId = payload?.user?._id;
        const role = payload?.user?.role || 'admin';
        if (adminId && role) {
            console.log("Parsed Admin ID:", adminId);
            console.log("Parsed Role:", role);
            return { adminId, role };
        } else {
            console.error('Admin ID not found in token payload');
            return { adminId: null, role: null };
        }
    } catch (e) {
        console.error('Failed to parse adminId from token:', e);
        return { adminId: null, role: null };
    }
}
