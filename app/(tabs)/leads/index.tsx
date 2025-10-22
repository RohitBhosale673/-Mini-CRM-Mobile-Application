import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  FAB, 
  Chip,
  Card,
  IconButton,
  Menu,
  Divider,
  ActivityIndicator,
  SegmentedButtons
} from 'react-native-paper';
import { useLeads } from '@/contexts/LeadContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { Lead } from '@/types';

const statusOptions = [
  { value: 'All', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Lost', label: 'Lost' },
];

export default function LeadsScreen() {
  const theme = useTheme();
  const { 
    leads, 
    isLoading, 
    error, 
    statusFilter,
    fetchLeads, 
    deleteLead, 
    selectLead,
    setStatusFilter 
  } = useLeads();
  const { customers, fetchCustomers } = useCustomers();
  
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, []);

  const filteredLeads = useMemo(() => {
    if (statusFilter === 'All') return leads;
    return leads.filter(lead => lead.status === statusFilter);
  }, [leads, statusFilter]);

  const leadsWithCustomers = useMemo(() => {
    return filteredLeads.map(lead => {
      const customer = customers.find(c => c.id === lead.customer_id);
      return { ...lead, customer };
    });
  }, [filteredLeads, customers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  const handleDeleteLead = (lead: Lead) => {
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete "${lead.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLead(lead.id),
        },
      ]
    );
  };

  const handleEditLead = (lead: Lead) => {
    selectLead(lead);
    router.push('/(tabs)/leads/form');
  };

  const handleViewDetails = (lead: Lead) => {
    selectLead(lead);
    router.push('/(tabs)/leads/details' as any);
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

  const renderLead = ({ item }: { item: Lead & { customer?: any } }) => (
    <Card style={styles.leadCard}>
      <Card.Content>
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Text style={styles.leadTitle}>{item.title}</Text>
            {item.customer && (
              <Text style={styles.customerName}>{item.customer.name} • {item.customer.company}</Text>
            )}
            <Text style={styles.leadDescription}>{item.description}</Text>
            <View style={styles.leadFooter}>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
                style={{ 
                  borderColor: getStatusColor(item.status),
                  height: 28,
                }}
              >
                {item.status}
              </Chip>
              <Text style={styles.leadValue}>${item.value.toLocaleString()}</Text>
            </View>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleViewDetails(item);
              }}
              title="View Details" 
              leadingIcon="eye"
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleEditLead(item);
              }}
              title="Edit" 
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleDeleteLead(item);
              }}
              title="Delete" 
              leadingIcon="delete"
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
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
      marginBottom: 16,
    },
    filterContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    leadCard: {
      marginBottom: 12,
      elevation: 2,
      borderRadius: 12,
    },
    leadHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    leadInfo: {
      flex: 1,
    },
    leadTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    customerName: {
      fontSize: 14,
      color: theme.colors.primary,
      marginBottom: 6,
    },
    leadDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      lineHeight: 20,
    },
    leadFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leadValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
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
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    }
  });

  if (error) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
        <Text style={styles.subtitle}>Track your sales opportunities</Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as Lead['status'] | 'All')}
          buttons={statusOptions}
        />
      </View>

      <View style={styles.listContainer}>
        {isLoading && leads.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={leadsWithCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderLead}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {statusFilter === 'All' ? 'No leads yet' : `No leads`}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          selectLead(null);
          router.push('/(tabs)/leads/form' as any);
        }}
      />
    </View>
  );
}
