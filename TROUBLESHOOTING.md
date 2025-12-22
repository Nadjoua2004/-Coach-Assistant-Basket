# 🔧 Dépannage - Network Request Failed

## Problème : "Network request failed" avec Expo Go

### Cause
Expo Go sur téléphone/émulateur ne peut pas accéder à `localhost` car cela fait référence à l'appareil lui-même, pas à votre ordinateur.

### Solution : Utiliser votre IP locale

#### 1. Trouver votre IP locale

**Windows :**
```bash
ipconfig
```
Cherchez "IPv4 Address" sous votre connexion WiFi/Ethernet
Exemple : `192.168.1.100`

**Mac/Linux :**
```bash
ifconfig
# ou
ip addr
```
Cherchez votre IP sous `wlan0` ou `eth0`

#### 2. Mettre à jour `frontend/config/api.js`

Remplacez l'IP dans la fonction `getLocalIP()` :

```javascript
const getLocalIP = () => {
  return '192.168.1.100'; // ⚠️ METTEZ VOTRE IP ICI
};
```

#### 3. Vérifier que le backend écoute sur toutes les interfaces

Dans `backend/server.js`, assurez-vous que le serveur écoute sur `0.0.0.0` :

```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

#### 4. Vérifier le firewall

**Windows :**
- Autorisez Node.js dans le Firewall Windows
- Ou désactivez temporairement le firewall pour tester

**Mac :**
- Système → Sécurité → Firewall
- Autorisez Node.js

#### 5. Vérifier que vous êtes sur le même réseau

- Votre téléphone et votre ordinateur doivent être sur le **même WiFi**

### Alternative : Utiliser ngrok (tunnel)

Si vous ne pouvez pas utiliser l'IP locale :

1. Installez ngrok : https://ngrok.com
2. Démarrez votre backend : `npm run dev`
3. Dans un autre terminal :
   ```bash
   ngrok http 3000
   ```
4. Copiez l'URL HTTPS fournie (ex: `https://abc123.ngrok.io`)
5. Mettez à jour `frontend/config/api.js` :
   ```javascript
   const API_URL = __DEV__ 
     ? 'https://abc123.ngrok.io'
     : 'https://coach-assistant-backend.onrender.com';
   ```

### Alternative : Déployer sur Render directement

La solution la plus simple : déployez le backend sur Render et utilisez directement l'URL Render dans `frontend/config/api.js`.

---

## Autres erreurs courantes

### CORS Error
- Vérifiez que `FRONTEND_URL` dans `.env` est correct
- Ou utilisez `FRONTEND_URL=*` temporairement

### Backend ne démarre pas
- Vérifiez que le port 3000 n'est pas utilisé
- Vérifiez les variables d'environnement dans `.env`

### Token non sauvegardé
- Vérifiez que `@react-native-async-storage/async-storage` est installé
- Relancez `npm install` dans le dossier frontend

