import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tokenStorage } from "../utils/localStorage.js";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [adminToken, setAdminToken] = useState('');
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            setAdminToken(token);
            const fetchedAdminId = parseAdminToken(token);
            console.log("Parsed Admin ID on mount:", fetchedAdminId);
            setAdminId(fetchedAdminId);
        }
    }, []);

    const login = (token) => {
        tokenStorage.save(token);
        setAdminToken(token);
        const fetchedAdminId = parseAdminToken(token);
        console.log("Parsed Admin ID on login:", fetchedAdminId);
        setAdminId(fetchedAdminId);
    };

    const logout = () => {
        tokenStorage.remove();
        setAdminToken('');
        setAdminId(null);
    };

    return (
        <AdminContext.Provider value={{ adminToken, adminId, login, logout }}>
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
        const adminId = payload?.user?._id;
        if (adminId) {
            console.log("Parsed Admin ID:", adminId);
            return adminId;
        } else {
            console.error('Admin ID not found in token payload');
            return null;
        }
    } catch (e) {
        console.error('Failed to parse adminId from token:', e);
        return null;
    }
}
