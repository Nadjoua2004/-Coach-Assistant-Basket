import { Platform } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../../config/theme';

const BottomNav = ({ activeTab, setActiveTab, role }) => {
  const getNavItems = () => {
    const userRole = role?.toLowerCase();
    if (userRole === 'coach' || userRole === 'adjoint') {
      return [
        { id: 'home', icon: 'home-variant', label: 'Accueil' },
        { id: 'calendar', icon: 'calendar-month', label: 'Planning' },
        { id: 'sessions', icon: 'clipboard-list', label: 'Séances' },
        { id: 'athletes', icon: 'account-group', label: 'Athlètes' },
        { id: 'exercises', icon: 'dumbbell', label: 'Library' },
        { id: 'attendance', icon: 'check-decagram', label: 'Appel' },
        { id: 'profile', icon: 'account-circle', label: 'Profil' }
      ];
    } else if (userRole === 'admin') {
      return [
        { id: 'dashboard', icon: 'view-dashboard', label: 'Dashboard' },
        { id: 'users', icon: 'account-group', label: 'Utilisateurs' },
        { id: 'reports', icon: 'chart-bar', label: 'Rapports' },
        { id: 'profile', icon: 'account-circle', label: 'Profil' }
      ];
    } else if (userRole === 'parent') {
      return [
        { id: 'profile', icon: 'account-child', label: 'Accueil' },
        { id: 'calendar', icon: 'calendar-clock', label: 'Planning' }
      ];
    }

    return [
      { id: 'calendar', icon: 'calendar', label: 'Planning' },
      { id: 'profile', icon: 'account-circle', label: 'Profil' }
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
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.gray[400]}
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
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[50],
    ...SHADOWS.lg,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 8,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    marginBottom: 4,
    height: 28,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...TYPOGRAPHY.label,
    fontSize: 9,
    color: COLORS.gray[400],
    fontWeight: '600',
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: -8,
  },
});

export default BottomNav;