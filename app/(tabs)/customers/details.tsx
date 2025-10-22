import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  IconButton,
  Card,
  Chip,
  FAB,
  Divider
} from 'react-native-paper';
import { useCustomers } from '@/contexts/CustomerContext';
import { useLeads } from '@/contexts/LeadContext';
import { Mail, Phone, Building, Calendar } from 'lucide-react-native';

export default function CustomerDetailsScreen() {
  const theme = useTheme();
  const { selectedCustomer, deleteCustomer, selectCustomer } = useCustomers();
  const { leads, fetchLeads } = useLeads();

  useEffect(() => {
    if (selectedCustomer) {
      fetchLeads(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  if (!selectedCustomer) {
    router.back();
    return null;
  }

  const customerLeads = leads.filter(lead => lead.customer_id === selectedCustomer.id);

  const handleDeleteCustomer = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${selectedCustomer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomer(selectedCustomer.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEditCustomer = () => {
    router.push('/customers/form');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return theme.colors.primary;
      case 'Contacted': return theme.colors.secondary;
      case 'Converted': return '#4caf50';
      case 'Lost': return '#f44336';
      default: return theme.colors.onSurfaceVariant;
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
      justifyContent: 'space-between',
      padding: 16,
      paddingBottom: 8,
    },
    backButton: {
      marginLeft: -8,
    },
    headerActions: {
      flexDirection: 'row',
    },
    scrollContainer: {
      flex: 1,
      padding: 16,
    },
    customerCard: {
      padding: 20,
      borderRadius: 16,
      elevation: 4,
      marginBottom: 24,
    },
    customerName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    customerCompany: {
      fontSize: 18,
      color: theme.colors.primary,
      marginBottom: 16,
    },
    contactInfo: {
      gap: 12,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contactText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    leadsContainer: {
      marginBottom: 24,
    },
    leadCard: {
      marginBottom: 12,
      borderRadius: 12,
      elevation: 2,
    },
    leadHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    leadTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    leadValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    leadDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    leadFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leadDate: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    emptyLeads: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
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
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            size={24}
            onPress={handleEditCustomer}
          />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDeleteCustomer}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Surface style={styles.customerCard}>
          <Text style={styles.customerName}>{selectedCustomer.name}</Text>
          <Text style={styles.customerCompany}>{selectedCustomer.company}</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Mail size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.contactText}>{selectedCustomer.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Phone size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.contactText}>{selectedCustomer.phone}</Text>
            </View>
          </View>

          <View style={styles.dateInfo}>
            <Calendar size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.dateText}>
              Created {new Date(selectedCustomer.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Surface>

        <View style={styles.leadsContainer}>
          <Text style={styles.sectionTitle}>Leads ({customerLeads.length})</Text>
          
          {customerLeads.length > 0 ? (
            customerLeads.map((lead) => (
              <Card key={lead.id} style={styles.leadCard}>
                <Card.Content>
                  <View style={styles.leadHeader}>
                    <Text style={styles.leadTitle}>{lead.title}</Text>
                    <Text style={styles.leadValue}>${lead.value.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.leadDescription}>{lead.description}</Text>
                  <View style={styles.leadFooter}>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: getStatusColor(lead.status) }}
                      style={{ borderColor: getStatusColor(lead.status) }}
                    >
                      {lead.status}
                    </Chip>
                    <Text style={styles.leadDate}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.leadCard}>
              <View style={styles.emptyLeads}>
                <Text style={styles.emptyText}>No leads for this customer yet</Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Lead"
        onPress={() => {
          // Navigate to add lead form with pre-selected customer
          router.push('/leads/form');
        }}
      />
    </View>
  );
}