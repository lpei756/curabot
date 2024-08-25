import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [role, setRole] = useState(null);
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        if (authToken) {
            const userRole = parseRoleFromToken(authToken);
            setRole(userRole);
        }
    }, [authToken]);

    return (
        <AdminContext.Provider value={{ role }}>
            {children}
        </AdminContext.Provider>
    );
};

AdminProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

function parseRoleFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Parsed User Role:", payload.user.role);
        return payload.user.role;
    } catch (e) {
        console.error('Failed to parse role from token:', e);
        return null;
    }
}
