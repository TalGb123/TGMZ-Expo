import React, { createContext, useState } from 'react';
import axios from 'axios';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
    const port = process.env.EXPO_PUBLIC_SERVER_PORT || 5000;
    
    if (!process.env.EXPO_PUBLIC_SERVER_PORT) {
        console.warn("⚠️ EXPO_PUBLIC_SERVER_PORT not found in .env. Defaulting to 5000.");
    }

    const SERVER_URL = `http://10.0.2.2:${port}`;

    const server = axios.create({
        baseURL: SERVER_URL,
    });

    const [user, setUser] = useState(null);

    return (
        <ServerContext.Provider value={{ server, user, setUser }}>
            {children}
        </ServerContext.Provider>
    );
};