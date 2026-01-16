// --- CONFIGURATION IP ---
// Remplacez cette IP par celle de votre serveur (ex: 192.168.0.105)
const SERVER_IP = '192.168.43.76';
// -------------------------

const API_URL = __DEV__
    ? `http://${SERVER_IP}:3000`
    : 'https://coach-assistant-backend.onrender.com';

export default API_URL;

