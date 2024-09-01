import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {tokenStorage} from "../utils/localStorage.js";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [adminToken, setAdminToken] = useState('');
    const [role, setRole] = useState(null);
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        const token = tokenStorage.get();
        if (token) {
            setAdminToken(token);
            const { role, _id } = parseAdminToken(token);
            console.log("Fetched Admin Role:", role);
            console.log("Fetched Admin ID:", _id);
            setRole(role);
            setAdminId(_id);
        }
    }, []);

    const login = (token) => {
        tokenStorage.save(token);
        setAdminToken(token);
        const { role, _id } = parseAdminToken(token);
        console.log("Parsed Admin Role on login:", role);
        console.log("Parsed Admin ID on login:", _id);
        setRole(role);
        setAdminId(_id);
    };

    const logout = () => {
        tokenStorage.remove();
        setAdminToken('');
        setRole(null);
        setAdminId(null);
        console.log("Admin logged out successfully");
    };

    return (
        <AdminContext.Provider value={{ adminToken, role, adminId, login, logout }}>
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
