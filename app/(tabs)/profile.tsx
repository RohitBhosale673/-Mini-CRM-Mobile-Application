import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  List,
  Switch,
  Divider,
  Button,
  Avatar,
  Card
} from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { User, Moon, Sun, Shield, LogOut, Mail, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    profileCard: {
      padding: 24,
      borderRadius: 16,
      elevation: 4,
      marginBottom: 24,
      alignItems: 'center',
    },
    avatar: {
      backgroundColor: theme.colors.primary,
      marginBottom: 16,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    userRole: {
      fontSize: 14,
      color: theme.colors.primary,
      textTransform: 'capitalize',
      marginBottom: 16,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    userInfoText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    settingsCard: {
      borderRadius: 16,
      elevation: 2,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      padding: 16,
      paddingBottom: 8,
    },
    listItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    logoutButton: {
      borderRadius: 8,
      marginTop: 16,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <Surface style={styles.profileCard}>
          <Avatar.Text 
            size={80} 
            label={user.name.charAt(0).toUpperCase()} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          
          <View style={styles.userInfo}>
            <Mail size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.userInfoText}>{user.email}</Text>
          </View>
          
          <View style={styles.userInfo}>
            <Calendar size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.userInfoText}>
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Surface>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <List.Item
            title="Dark Mode"
            description={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            left={props => (
              <List.Icon 
                {...props} 
                icon={() => isDark ? <Moon size={24} color={theme.colors.onSurface} /> : <Sun size={24} color={theme.colors.onSurface} />} 
              />
            )}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
              />
            )}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Account Type"
            description={`${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} Access`}
            left={props => (
              <List.Icon 
                {...props} 
                icon={() => <Shield size={24} color={theme.colors.onSurface} />} 
              />
            )}
            style={styles.listItem}
          />
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <List.Item
            title="User ID"
            description={user.id}
            left={props => (
              <List.Icon 
                {...props} 
                icon={() => <User size={24} color={theme.colors.onSurface} />} 
              />
            )}
            style={styles.listItem}
          />
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon={() => <LogOut size={20} color={theme.colors.onPrimary} />}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
        >
          Sign Out
        </Button>
      </ScrollView>
    </View>
  );
}