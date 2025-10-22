import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput, Text, Surface, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const theme = useTheme();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data.email, data.password, data.name);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again');
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
  });

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our CRM platform</Text>
        
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              label="Full Name"
              value={value}
              onChangeText={onChange}
              error={!!errors.name}
              left={<TextInput.Icon icon="account" />}
            />
          )}
        />
        {errors.name && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.name.message}</Text>}

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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              label="Confirm Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              error={!!errors.confirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
            />
          )}
        />
        {errors.confirmPassword && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{errors.confirmPassword.message}</Text>}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/login')}
          style={styles.linkButton}
        >
          Already have an account? Sign In
        </Button>
      </Surface>
    </View>
  );
}