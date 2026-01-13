import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNav = ({ activeTab, setActiveTab, role }) => {
  const getNavItems = () => {
    if (role === 'coach' || role === 'adjoint') {
      return [
        { id: 'home', icon: 'home-outline', label: 'Accueil' },
        { id: 'calendar', icon: 'calendar-outline', label: 'Planning' },
        { id: 'sessions', icon: 'clipboard-text-outline', label: 'Séances' },
        { id: 'athletes', icon: 'account-group-outline', label: 'Athlètes' },
        { id: 'exercises', icon: 'dumbbell', label: 'Exercices' },
        { id: 'profile', icon: 'account-outline', label: 'Compte' }
      ];
    } else if (role === 'admin') {
      return [
        { id: 'dashboard', icon: 'view-dashboard', label: 'Dashboard' },
        { id: 'users', icon: 'account-group', label: 'Utilisateurs' },
        { id: 'reports', icon: 'file-document', label: 'Rapports' },
        { id: 'profile', icon: 'account', label: 'Profil' }
      ];
    } else if (role === 'parent') {
      return [
        { id: 'dashboard', icon: 'view-dashboard', label: 'Dashboard' },
        { id: 'users', icon: 'account-group', label: 'Utilisateurs' },
        { id: 'reports', icon: 'file-document', label: 'Rapports' },
        { id: 'profile', icon: 'account', label: 'Profil' }
      ];
    }

    return [
      { id: 'calendar', icon: 'calendar', label: 'Planning' },
      { id: 'stats', icon: 'chart-bar', label: 'Stats' },
      { id: 'profile', icon: 'account', label: 'Profil' }
    ];
  };

  const navItems = getNavItems();

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => setActiveTab(item.id)}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={item.icon}
                  size={26} // Slightly larger for active
                  color={isActive ? '#f97316' : '#94a3b8'}
                />
                {isActive && <View style={styles.activeDot} />}
              </View>
              <Text style={[
                styles.label,
                isActive && styles.activeLabel
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingBottom: 25,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 70,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
    height: 24,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  activeLabel: {
    color: '#f97316',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f97316',
    position: 'absolute',
    bottom: -8,
  },
});

export default BottomNav;