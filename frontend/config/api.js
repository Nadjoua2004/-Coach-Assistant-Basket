// Remplacez cette IP par celle de votre serveur (ex: 192.168.0.105)
const SERVER_IP = process.env.EXPO_PUBLIC_API_IP || '192.168.0.104';
// -------------------------

const USE_RENDER = process.env.EXPO_PUBLIC_USE_RENDER === 'true';

console.log('Environment __DEV__:', __DEV__);
console.log('SERVER_IP:', SERVER_IP);
console.log('USE_RENDER:', USE_RENDER);

const API_URL = (USE_RENDER || !(__DEV__ || SERVER_IP))
    ? 'https://coach-assistant-basket.onrender.com'
    : `http://${SERVER_IP}:3000`;

console.log('🚀 API_URL being used:', API_URL);

export default API_URL;

