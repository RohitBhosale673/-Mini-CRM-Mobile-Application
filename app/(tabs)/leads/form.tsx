import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  Button,
  TextInput,
  IconButton,
  Menu,
  SegmentedButtons
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLeads } from '@/contexts/LeadContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { Lead, Customer } from '@/types';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  value: yup.number().positive('Value must be positive').required('Value is required'),
  customer_id: yup.string().required('Please select a customer'),
  status: yup.string().oneOf(['New', 'Contacted', 'Converted', 'Lost']).required('Status is required'),
});

interface LeadForm {
  title: string;
  description: string;
  value: number;
  customer_id: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Lost';
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Lost', label: 'Lost' },
];

export default function LeadFormScreen() {
  const theme = useTheme();
  const { selectedLead, createLead, updateLead } = useLeads();
  const { customers, fetchCustomers, selectedCustomer } = useCustomers();
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const isEditing = !!selectedLead;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const { control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<LeadForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: selectedLead?.title || '',
      description: selectedLead?.description || '',
      value: selectedLead?.value || 0,
      customer_id: selectedLead?.customer_id || selectedCustomer?.id || '',
      status: selectedLead?.status || 'New',
    },
  });

  const selectedCustomerId = watch('customer_id');
  const selectedCustomerData = customers.find(c => c.id === selectedCustomerId);

  const onSubmit = async (data: LeadForm) => {
    try {
      if (isEditing && selectedLead) {
        await updateLead(selectedLead.id, data);
        Alert.alert('Success', 'Lead updated successfully');
      } else {
        await createLead(data);
        Alert.alert('Success', 'Lead created successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', isEditing ? 'Failed to update lead' : 'Failed to create lead');
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
    customerSelector: {
      marginBottom: 16,
    },
    customerButton: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 4,
      padding: 12,
      backgroundColor: 'transparent',
    },
    customerButtonError: {
      borderColor: theme.colors.error,
    },
    customerButtonText: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    customerButtonPlaceholder: {
      color: theme.colors.onSurfaceVariant,
    },
    statusContainer: {
      marginBottom: 24,
    },
    statusLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 8,
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
          {isEditing ? 'Edit Lead' : 'New Lead'}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Surface style={styles.formContainer}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Lead Title *"
                value={value}
                onChangeText={onChange}
                error={!!errors.title}
                left={<TextInput.Icon icon="target" />}
              />
            )}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Description *"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={!!errors.description}
                left={<TextInput.Icon icon="text" />}
              />
            )}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

          <Controller
            control={control}
            name="value"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                label="Lead Value ($) *"
                value={value.toString()}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                keyboardType="numeric"
                error={!!errors.value}
                left={<TextInput.Icon icon="currency-usd" />}
              />
            )}
          />
          {errors.value && <Text style={styles.errorText}>{errors.value.message}</Text>}

          <View style={styles.customerSelector}>
            <Menu
              visible={customerMenuVisible}
              onDismiss={() => setCustomerMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setCustomerMenuVisible(true)}
                  style={[
                    styles.customerButton,
                    errors.customer_id && styles.customerButtonError
                  ]}
                  contentStyle={{ justifyContent: 'flex-start' }}
                  labelStyle={[
                    styles.customerButtonText,
                    !selectedCustomerData && styles.customerButtonPlaceholder
                  ]}
                >
                  {selectedCustomerData ? 
                    `${selectedCustomerData.name} - ${selectedCustomerData.company}` : 
                    'Select Customer *'
                  }
                </Button>
              }
            >
              {customers.map((customer) => (
                <Menu.Item
                  key={customer.id}
                  onPress={() => {
                    setValue('customer_id', customer.id);
                    setCustomerMenuVisible(false);
                  }}
                  title={`${customer.name} - ${customer.company}`}
                />
              ))}
            </Menu>
          </View>
          {errors.customer_id && <Text style={styles.errorText}>{errors.customer_id.message}</Text>}

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status *</Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={statusOptions}
                />
              )}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? 'Update Lead' : 'Create Lead'}
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