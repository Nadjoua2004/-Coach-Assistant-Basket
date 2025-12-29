// Configuration API pour Expo
// Changez l'URL de production par votre URL Render déployée

// Pour Expo Go, utilisez l'IP locale de votre ordinateur au lieu de localhost
// Trouvez votre IP avec: ipconfig (Windows) ou ifconfig (Mac/Linux)
// Exemple: http://192.168.1.100:3000

const getLocalIP = () => {
  // Remplacez par votre IP locale si nécessaire
  // Windows: ipconfig → cherchez "IPv4 Address"
  // Mac/Linux: ifconfig ou ip addr
  return '192.168.43.76'; // ⚠️ CHANGEZ CETTE IP PAR LA VOTRE
};

const API_URL = __DEV__
  ? 'http://192.168.43.76:3000'  // Local en développement (votre IP machine)
  : 'https://coach-assistant-backend.onrender.com';  // Production - REMPLACEZ PAR VOTRE URL RENDER

export default API_URL;

