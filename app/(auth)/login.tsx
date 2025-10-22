import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput, Text, Surface, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const theme = useTheme();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: 'demo@example.com',
      password: 'password',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    surface: {
      padding: 24,
      borderRadius: 16,
      elevation: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: theme.colors.primary,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 32,
      color: theme.colors.onSurfaceVariant,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 16,
      borderRadius: 8,
    },
    linkButton: {
      marginTop: 16,
    },
    demoInfo: {
      marginTop: 24,
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryContainer,
    },
    demoText: {
      fontSize: 14,
      color: theme.colors.onPrimaryContainer,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your CRM account</Text>
        
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              label="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
            />
          )}
        />
        {errors.email && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              error={!!errors.password}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />}
            />
          )}
        />
        {errors.password && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.password.message}</Text>}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/register')}
          style={styles.linkButton}
        >
          Don't have an account? Sign Up
        </Button>

        <Surface style={styles.demoInfo}>
          <Text style={styles.demoText}>
            Demo credentials:{'\n'}
            Email: demo@example.com{'\n'}
            Password: password
          </Text>
        </Surface>
      </Surface>
    </View>
  );
}
