import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const BottomNav = ({ activeTab, setActiveTab, role }) => {
  const getNavItems = () => {
    if (role === 'coach' || role === 'adjoint') {
      return [
        { id: 'home', icon: 'home-outline', label: 'Accueil' },
        { id: 'calendar', icon: 'calendar-outline', label: 'Planning' },
        { id: 'sessions', icon: 'clipboard-text-outline', label: 'Séances' },
        { id: 'athletes', icon: 'account-group-outline', label: 'Athlètes' },
        { id: 'exercises', icon: 'dumbbell', label: 'Exercices' },
        { id: 'attendance', icon: 'account-check-outline', label: 'Appel' },
        { id: 'profile', icon: 'account-outline', label: 'Profil' }
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
        { id: 'profile', icon: 'account-child', label: 'Accueil' },
        { id: 'calendar', icon: 'calendar-multiselect', label: 'Planning' }
      ];
    }

    return [
      { id: 'calendar', icon: 'calendar', label: 'Planning' },
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
                  size={19}
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
    paddingBottom: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 52,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    marginBottom: 2,
    height: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '400',
  },
  activeLabel: {
    color: '#f97316',
    fontWeight: '700',
  },
  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#f97316',
    position: 'absolute',
    bottom: -6,
  },
});

export default BottomNav;