// Remplacez cette IP par celle de votre serveur (ex: 192.168.0.105)
const SERVER_IP = process.env.EXPO_PUBLIC_API_IP || '192.168.0.104';
// -------------------------

console.log('Environment __DEV__:', __DEV__);
console.log('SERVER_IP:', SERVER_IP);

const API_URL = (__DEV__ || SERVER_IP)
    ? `http://${SERVER_IP}:3000`
    : 'https://coach-assistant-backend.onrender.com';

console.log('🚀 API_URL being used:', API_URL);

export default API_URL;

