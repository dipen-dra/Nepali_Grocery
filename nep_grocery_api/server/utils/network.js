import os from 'os';

/**
 * Returns the local network IP address (IPv4, not internal).
 * Useful for generating callback URLs when running on a local network.
 */
export const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback to localhost
};

export const getServerBaseUrl = () => {
    const ip = getLocalIpAddress();
    const port = process.env.PORT || 8081;
    return `http://${ip}:${port}`;
};
