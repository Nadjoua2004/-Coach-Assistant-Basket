// // import React, { useState } from 'react';
// // import { Camera, Home, Calendar, Users, ClipboardList, BarChart3, User, LogOut, Bell, Search, TrendingUp, FileText } from 'lucide-react';

// // // Mock Auth Context
// // const AuthContext = React.createContext();

// // const useAuth = () => {
// //   const context = React.useContext(AuthContext);
// //   if (!context) throw new Error('useAuth must be used within AuthProvider');
// //   return context;
// // };

// // // Auth Provider
// // const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);

// //   const login = (email, password) => {
// //     // Mock login - in real app, call API
// //     const mockUsers = {
// //       'coach@club.dz': { id: 1, name: 'Mohamed Belaidi', role: 'coach', email: 'coach@club.dz' },
// //       'adjoint@club.dz': { id: 2, name: 'Karim Hamza', role: 'adjoint', email: 'adjoint@club.dz' },
// //       'admin@club.dz': { id: 3, name: 'Admin User', role: 'admin', email: 'admin@club.dz' },
// //       'joueur@club.dz': { id: 4, name: 'Yacine Touri', role: 'joueur', email: 'joueur@club.dz' },
// //       'parent@club.dz': { id: 5, name: 'Fatima Mansouri', role: 'parent', email: 'parent@club.dz' }
// //     };

// //     const foundUser = mockUsers[email];
// //     if (foundUser) {
// //       setUser(foundUser);
// //       return true;
// //     }
// //     return false;
// //   };

// //   const logout = () => setUser(null);

// //   return (
// //     <AuthContext.Provider value={{ user, login, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // // Login Screen
// // const LoginScreen = () => {
// //   const { login } = useAuth();
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');

// //   const handleLogin = () => {
// //     if (login(email, password)) {
// //       setError('');
// //     } else {
// //       setError('Email ou mot de passe incorrect');
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
// //       <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
// //         <div className="text-center mb-8">
// //           <div className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
// //             <Camera className="w-10 h-10 text-white" />
// //           </div>
// //           <h1 className="text-3xl font-bold text-gray-800">Coach Assistant</h1>
// //           <p className="text-gray-500 mt-2">Belouizdad Basket-Ball 2011</p>
// //         </div>

// //         {error && (
// //           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
// //             {error}
// //           </div>
// //         )}

// //         <div className="space-y-4">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
// //             <input
// //               type="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
// //               placeholder="votre-email@club.dz"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
// //             <input
// //               type="password"
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
// //               placeholder="••••••••"
// //             />
// //           </div>

// //           <button
// //             onClick={handleLogin}
// //             className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
// //           >
// //             Se connecter
// //           </button>
// //         </div>

// //         <div className="mt-6 text-center">
// //           <a href="#" className="text-sm text-orange-600 hover:text-orange-700">
// //             Mot de passe oublié ?
// //           </a>
// //         </div>

// //         <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
// //           <p className="font-semibold mb-2">Comptes de démonstration :</p>
// //           <p>Coach: coach@club.dz</p>
// //           <p>Adjoint: adjoint@club.dz</p>
// //           <p>Admin: admin@club.dz</p>
// //           <p>Joueur: joueur@club.dz</p>
// //           <p>Parent: parent@club.dz</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Coach Home Screen
// // const CoachHomeScreen = () => {
// //   const { user } = useAuth();

// //   const categories = [
// //     { id: 1, name: 'Graphic Design', color: 'from-blue-400 to-blue-500', icon: '🎨' },
// //     { id: 2, name: 'Programming', color: 'from-pink-400 to-pink-500', icon: '💻' },
// //     { id: 3, name: 'Finance', color: 'from-orange-400 to-orange-500', icon: '📊' },
// //     { id: 4, name: 'UI/UX design', color: 'from-purple-400 to-purple-500', icon: '📱' }
// //   ];

// //   return (
// //     <div className="h-full bg-gray-50 overflow-y-auto pb-20">
// //       {/* Header */}
// //       <div className="bg-white px-6 pt-6 pb-4 rounded-b-3xl shadow-sm">
// //         <div className="flex items-center justify-between mb-6">
// //           <div className="flex items-center space-x-2">
// //             <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
// //             <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
// //             <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
// //           </div>
// //           <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
// //             <Search className="w-5 h-5 text-gray-600" />
// //           </div>
// //         </div>

// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h1 className="text-2xl font-bold text-gray-800">
// //               Hi {user?.name?.split(' ')[0]} 👋
// //             </h1>
// //             <p className="text-gray-500 text-sm mt-1">Today is a good day</p>
// //           </div>
// //           <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
// //             <User className="w-8 h-8 text-white" />
// //           </div>
// //         </div>

// //         {/* Quick Action Tabs */}
// //         <div className="flex space-x-3 overflow-x-auto pb-2">
// //           <button className="px-6 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full text-sm font-medium whitespace-nowrap">
// //             Ideas
// //           </button>
// //           <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200">
// //             Design
// //           </button>
// //           <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200">
// //             Marketing
// //           </button>
// //         </div>
// //       </div>

// //       {/* Categories Section */}
// //       <div className="px-6 mt-6">
// //         <div className="flex items-center justify-between mb-4">
// //           <h2 className="text-lg font-bold text-gray-800">Categories</h2>
// //           <button className="text-orange-500 text-sm font-medium">See all</button>
// //         </div>

// //         <div className="grid grid-cols-2 gap-4">
// //           {categories.map((category) => (
// //             <div
// //               key={category.id}
// //               className={`bg-gradient-to-br ${category.color} rounded-3xl p-5 h-40 flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}
// //             >
// //               <div className="text-4xl">{category.icon}</div>
// //               <div>
// //                 <h3 className="text-white font-semibold">{category.name}</h3>
// //               </div>
// //               {category.id === 2 && (
// //                 <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
// //                   Hot
// //                 </div>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Admin Dashboard
// // const AdminDashboard = () => {
// //   return (
// //     <div className="h-full bg-gray-50 overflow-y-auto pb-20 p-6">
// //       <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord Admin</h1>

// //       <div className="grid grid-cols-2 gap-4 mb-6">
// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <Users className="w-8 h-8 text-blue-500 mb-2" />
// //           <p className="text-3xl font-bold text-gray-800">45</p>
// //           <p className="text-gray-500 text-sm">Total Joueurs</p>
// //         </div>
// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <Calendar className="w-8 h-8 text-green-500 mb-2" />
// //           <p className="text-3xl font-bold text-gray-800">12</p>
// //           <p className="text-gray-500 text-sm">Séances/Semaine</p>
// //         </div>
// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
// //           <p className="text-3xl font-bold text-gray-800">87%</p>
// //           <p className="text-gray-500 text-sm">Assiduité</p>
// //         </div>
// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <Bell className="w-8 h-8 text-red-500 mb-2" />
// //           <p className="text-3xl font-bold text-gray-800">3</p>
// //           <p className="text-gray-500 text-sm">Alertes</p>
// //         </div>
// //       </div>

// //       <div className="bg-white rounded-2xl p-5 shadow-sm">
// //         <h2 className="font-bold text-gray-800 mb-4">Actions rapides</h2>
// //         <div className="space-y-3">
// //           <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">
// //             Gérer les utilisateurs
// //           </button>
// //           <button className="w-full text-left px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100">
// //             Sauvegardes système
// //           </button>
// //           <button className="w-full text-left px-4 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100">
// //             Rapports d'activité
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Joueur/Parent Screen (Read-only)
// // const ReadOnlyScreen = () => {
// //   const { user } = useAuth();

// //   return (
// //     <div className="h-full bg-gray-50 overflow-y-auto pb-20 p-6">
// //       <h1 className="text-2xl font-bold text-gray-800 mb-2">
// //         Bonjour {user?.name?.split(' ')[0]}
// //       </h1>
// //       <p className="text-gray-500 mb-6">Votre planning de la semaine</p>

// //       <div className="space-y-4">
// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="flex items-center space-x-3">
// //               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
// //                 <Calendar className="w-6 h-6 text-blue-600" />
// //               </div>
// //               <div>
// //                 <p className="font-semibold text-gray-800">Entraînement U15</p>
// //                 <p className="text-sm text-gray-500">Lundi 25 Nov</p>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="flex items-center text-sm text-gray-600">
// //             <span>16:00 - 18:00 • Salle Principale</span>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="flex items-center space-x-3">
// //               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
// //                 <Calendar className="w-6 h-6 text-green-600" />
// //               </div>
// //               <div>
// //                 <p className="font-semibold text-gray-800">Match amical</p>
// //                 <p className="text-sm text-gray-500">Mercredi 27 Nov</p>
// //               </div>
// //             </div>
// //           </div>
// //           <div className="flex items-center text-sm text-gray-600">
// //             <span>18:00 - 20:00 • Terrain extérieur</span>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-2xl p-5 shadow-sm">
// //           <h3 className="font-semibold text-gray-800 mb-3">Mes statistiques</h3>
// //           <div className="grid grid-cols-2 gap-4">
// //             <div>
// //               <p className="text-2xl font-bold text-gray-800">92%</p>
// //               <p className="text-sm text-gray-500">Présence</p>
// //             </div>
// //             <div>
// //               <p className="text-2xl font-bold text-gray-800">24</p>
// //               <p className="text-sm text-gray-500">Séances</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Bottom Navigation
// // const BottomNav = ({ activeTab, setActiveTab, role }) => {
// //   const getNavItems = () => {
// //     if (role === 'coach' || role === 'adjoint') {
// //       return [
// //         { id: 'home', icon: Home, label: 'Accueil' },
// //         { id: 'athletes', icon: Users, label: 'Athlètes' },
// //         { id: 'calendar', icon: Calendar, label: 'Planning' },
// //         { id: 'sessions', icon: ClipboardList, label: 'Séances' },
// //         { id: 'profile', icon: User, label: 'Profil' }
// //       ];
// //     }

// //     if (role === 'admin') {
// //       return [
// //         { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
// //         { id: 'users', icon: Users, label: 'Utilisateurs' },
// //         { id: 'reports', icon: FileText, label: 'Rapports' },
// //         { id: 'profile', icon: User, label: 'Profil' }
// //       ];
// //     }

// //     // Joueur or Parent
// //     return [
// //       { id: 'calendar', icon: Calendar, label: 'Planning' },
// //       { id: 'stats', icon: BarChart3, label: 'Stats' },
// //       { id: 'profile', icon: User, label: 'Profil' }
// //     ];
// //   };

// //   const navItems = getNavItems();

// //   return (
// //     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
// //       <div className="flex justify-around items-center max-w-md mx-auto">
// //         {navItems.map((item) => {
// //           const Icon = item.icon;
// //           const isActive = activeTab === item.id;
// //           return (
// //             <button
// //               key={item.id}
// //               onClick={() => setActiveTab(item.id)}
// //               className="flex flex-col items-center space-y-1 min-w-0"
// //             >
// //               <div className={`p-2 rounded-xl transition-all ${
// //                 isActive 
// //                   ? 'bg-gradient-to-r from-orange-500 to-pink-500' 
// //                   : 'bg-transparent'
// //               }`}>
// //                 <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
// //               </div>
// //               <span className={`text-xs ${isActive ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
// //                 {item.label}
// //               </span>
// //             </button>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // };

// // // Main App Component
// // const App = () => {
// //   const { user, logout } = useAuth();
// //   const [activeTab, setActiveTab] = useState('home');

// //   if (!user) {
// //     return <LoginScreen />;
// //   }

// //   const renderContent = () => {
// //     if (user.role === 'coach' || user.role === 'adjoint') {
// //       if (activeTab === 'home') return <CoachHomeScreen />;
// //       return (
// //         <div className="h-full flex items-center justify-center bg-gray-50 pb-20">
// //           <div className="text-center">
// //             <p className="text-gray-500">Page {activeTab} en développement</p>
// //           </div>
// //         </div>
// //       );
// //     }

// //     if (user.role === 'admin') {
// //       if (activeTab === 'dashboard') return <AdminDashboard />;
// //       return (
// //         <div className="h-full flex items-center justify-center bg-gray-50 pb-20">
// //           <div className="text-center">
// //             <p className="text-gray-500">Page {activeTab} en développement</p>
// //           </div>
// //         </div>
// //       );
// //     }

// //     // Joueur or Parent
// //     return <ReadOnlyScreen />;
// //   };

// //   return (
// //     <div className="h-screen flex flex-col bg-gray-50">
// //       {/* Logout Button */}
// //       <div className="absolute top-4 right-4 z-10">
// //         <button
// //           onClick={logout}
// //           className="bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
// //           title="Déconnexion"
// //         >
// //           <LogOut className="w-5 h-5 text-gray-600" />
// //         </button>
// //       </div>

// //       {/* Main Content */}
// //       <div className="flex-1 overflow-hidden">
// //         {renderContent()}
// //       </div>

// //       {/* Bottom Navigation */}
// //       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />
// //     </div>
// //   );
// // };

// // // Root Component with Provider
// // export default function Root() {
// //   return (
// //     <AuthProvider>
// //       <App />
// //     </AuthProvider>
// //   );
// // }
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   StatusBar,
// } from 'react-native';
// import { AuthProvider, useAuth } from './components/Common/AuthProvider';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// // Import screens
// import LoginScreen from './components/Auth/LoginScreen';
// import CoachHomeScreen from './components/Coach/CoachHomeScreen';
// import AdminDashboard from './components/Admin/AdminDashboard';
// import ReadOnlyScreen from './components/Player/ReadOnlyScreen';
// import BottomNav from './components/Common/bottomNav';

// const AppContent = () => {
//   const { user, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState('home');

//   if (!user) {
//     return <LoginScreen />;
//   }

//   const renderContent = () => {
//     if (user.role === 'coach' || user.role === 'adjoint') {
//       if (activeTab === 'home') return <CoachHomeScreen />;
//       return (
//         <View style={styles.placeholder}>
//           <Text style={styles.placeholderText}>Page {activeTab} en développement</Text>
//         </View>
//       );
//     }

//     if (user.role === 'admin') {
//       if (activeTab === 'dashboard') return <AdminDashboard />;
//       return (
//         <View style={styles.placeholder}>
//           <Text style={styles.placeholderText}>Page {activeTab} en développement</Text>
//         </View>
//       );
//     }

//     return <ReadOnlyScreen />;
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton} onPress={logout}>
//         <Icon name="logout" size={20} color="#4b5563" />
//       </TouchableOpacity>

//       {/* Main Content */}
//       <View style={styles.content}>
//         {renderContent()}
//       </View>

//       {/* Bottom Navigation */}
//       <BottomNav 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//         role={user.role} 
//       />
//     </SafeAreaView>
//   );
// };

// const App = () => {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   content: {
//     flex: 1,
//   },
//   logoutButton: {
//     position: 'absolute',
//     top: 60,
//     right: 20,
//     zIndex: 1000,
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   placeholder: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 100,
//   },
//   placeholderText: {
//     color: '#6b7280',
//     fontSize: 16,
//   },
// });

// export default App;
// App.js - Add these imports
// App.js
// App.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { AuthProvider, useAuth } from './components/Common/AuthProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import LoginScreen from './components/Auth/LoginScreen';
import CoachHomeScreen from './components/Coach/CoachHomeScreen';
import SessionsListScreen from './components/Coach/SessionsListScreen';
import SessionCreationScreen from './components/Coach/SessionCreationScreen';
import AthleteListScreen from './components/Coach/AthleteListScreen';
import AthleteFormScreen from './components/Coach/AthleteFormScreen';
import MedicalRecordScreen from './components/Coach/MedicalRecordScreen';
import CalendarScreen from './components/Coach/CalendarScreen';
import AttendanceScreen from './components/Coach/AttendanceScreen';
import AdminDashboard from './components/Admin/AdminDashboard';
import ReadOnlyScreen from './components/Player/ReadOnlyScreen';
import BottomNav from './components/Common/bottomNav';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showAthleteForm, setShowAthleteForm] = useState(false);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  if (!user) {
    return <LoginScreen />;
  }

  const handleTabPress = (tabId) => {
    if (tabId === 'sessions') {
      setShowCreateSession(false);
    }
    if (tabId === 'athletes') {
      setShowAthleteForm(false);
      setShowMedicalRecord(false);
      setEditingAthlete(null);
    }
    if (tabId === 'calendar') {
      setShowAttendance(false);
      setCurrentSession(null);
    }
    setActiveTab(tabId);
  };

  const handleCreateSession = () => {
    setShowCreateSession(true);
  };

  const handleBackFromCreation = () => {
    setShowCreateSession(false);
  };

  const handleAddAthlete = () => {
    setEditingAthlete(null);
    setShowAthleteForm(true);
  };

  const handleEditAthlete = (athlete) => {
    setEditingAthlete(athlete);
    setShowAthleteForm(true);
  };

  const handleViewMedical = (athlete) => {
    setEditingAthlete(athlete);
    setShowMedicalRecord(true);
  };

  const handleTakeAttendance = (session) => {
    setCurrentSession(session);
    setShowAttendance(true);
  };

  const handleBackFromAthleteForm = () => {
    setShowAthleteForm(false);
    setEditingAthlete(null);
  };

  const handleBackFromMedical = () => {
    setShowMedicalRecord(false);
    setEditingAthlete(null);
  };

  const handleBackFromAttendance = () => {
    setShowAttendance(false);
    setCurrentSession(null);
  };

  const renderContent = () => {
    // Show Session Creation Screen
    if (showCreateSession) {
      return (
        <SessionCreationScreen
          onBack={handleBackFromCreation}
          onSaveSession={() => {
            handleBackFromCreation();
          }}
        />
      );
    }

    // Show Athlete Form Screen
    if (showAthleteForm) {
      return (
        <AthleteFormScreen
          athlete={editingAthlete}
          onBack={handleBackFromAthleteForm}
          onSave={() => {
            handleBackFromAthleteForm();
          }}
        />
      );
    }

    // Show Medical Record Screen
    if (showMedicalRecord) {
      return (
        <MedicalRecordScreen
          athlete={editingAthlete}
          onBack={handleBackFromMedical}
        />
      );
    }

    // Show Attendance Screen
    if (showAttendance) {
      return (
        <AttendanceScreen
          session={currentSession}
          onBack={handleBackFromAttendance}
        />
      );
    }

    // Regular content based on role and tab
    if (user.role === 'coach' || user.role === 'adjoint') {
      if (activeTab === 'home') {
        return <CoachHomeScreen onCreateSession={handleCreateSession} />;
      } else if (activeTab === 'sessions') {
        return <SessionsListScreen onCreateSession={handleCreateSession} />;
      } else if (activeTab === 'calendar') {
        return <CalendarScreen onTakeAttendance={handleTakeAttendance} />;
      } else if (activeTab === 'athletes') {
        return (
          <AthleteListScreen
            onAddAthlete={handleAddAthlete}
            onEditAthlete={handleEditAthlete}
            onViewMedical={handleViewMedical}
          />
        );
      }
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Page {activeTab} en développement</Text>
        </View>
      );
    }

    if (user.role === 'admin') {
      if (activeTab === 'dashboard') return <AdminDashboard />;
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Page {activeTab} en développement</Text>
        </View>
      );
    }

    // Player or Parent
    return <ReadOnlyScreen />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Logout Button - Only show when not in session creation, athlete form, medical record or attendance */}
      {!showCreateSession && !showAthleteForm && !showMedicalRecord && !showAttendance && (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="logout" size={20} color="#4b5563" />
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation - Hide when creating/viewing specific forms */}
      {!showCreateSession && !showAthleteForm && !showMedicalRecord && !showAttendance && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={handleTabPress}
          role={user.role}
        />
      )}
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  placeholderText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default App;