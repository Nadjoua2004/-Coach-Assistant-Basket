import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNav = ({ activeTab, setActiveTab, role }) => {
  const getNavItems = () => {
    if (role === 'coach' || role === 'adjoint') {
      return [
        { id: 'home', icon: 'home', label: 'Accueil' },
        { id: 'athletes', icon: 'account-group', label: 'Athlètes' },
        { id: 'calendar', icon: 'calendar', label: 'Planning' },
        { id: 'sessions', icon: 'clipboard-list', label: 'Séances' },
        { id: 'profile', icon: 'account', label: 'Profil' }
      ];
    }
    
    if (role === 'admin') {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => setActiveTab(item.id)}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer
              ]}>
                <Icon 
                  name={item.icon}
                  size={24}
                  color={isActive ? 'white' : '#9ca3af'} 
                />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#f97316',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  activeLabel: {
    color: '#f97316',
    fontWeight: '500',
  },
});

export default BottomNav;