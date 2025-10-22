import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  Button,
  TextInput,
  IconButton
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCustomers } from '@/contexts/CustomerContext';
import { Customer } from '@/types';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  company: yup.string().required('Company is required'),
});

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function CustomerFormScreen() {
  const theme = useTheme();
  const { selectedCustomer, createCustomer, updateCustomer } = useCustomers();
  const isEditing = !!selectedCustomer;

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: selectedCustomer?.name || '',
      email: selectedCustomer?.email || '',
      phone: selectedCustomer?.phone || '',
      company: selectedCustomer?.company || '',
    },
  });

  const onSubmit = async (data: CustomerForm) => {
    try {
      if (isEditing && selectedCustomer) {
        await updateCustomer(selectedCustomer.id, data);
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await createCustomer(data);
        Alert.alert('Success', 'Customer created successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', isEditing ? 'Failed to update customer' : 'Failed to create customer');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingBottom: 8,
    },
    backButton: {
      marginLeft: -8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    scrollContainer: {
      flex: 1,
      padding: 16,
    },
    formContainer: {
      padding: 20,
      borderRadius: 16,
      elevation: 2,
    },
    input: {
      marginBottom: 16,
    },
    buttonContainer: {
      marginTop: 24,
      gap: 12,
    },
    button: {
      borderRadius: 8,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Customer' : 'New Customer'}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Surface style={styles.formContainer}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Full Name *"
                value={value}
                onChangeText={onChange}
                error={!!errors.name}
                left={<TextInput.Icon icon="account" />}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Email Address *"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Phone Number *"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={!!errors.phone}
                left={<TextInput.Icon icon="phone" />}
              />
            )}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

          <Controller
            control={control}
            name="company"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Company *"
                value={value}
                onChangeText={onChange}
                error={!!errors.company}
                left={<TextInput.Icon icon="office-building" />}
              />
            )}
          />
          {errors.company && <Text style={styles.errorText}>{errors.company.message}</Text>}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? 'Update Customer' : 'Create Customer'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.button}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}