import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { LeadProvider } from '@/contexts/LeadContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useEffect } from 'react'; // Import useEffect

function AppContent() {
  useFrameworkReady();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  console.log('AppContent: isLoading', isLoading);
  console.log('AppContent: isAuthenticated', isAuthenticated);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <CustomerProvider>
      <LeadProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <StatusBar style="auto" />
        </Stack>
      </LeadProvider>
    </CustomerProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
