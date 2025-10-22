import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { router } from 'expo-router';
import { 
  Text, 
  Surface, 
  useTheme, 
  FAB, 
  Searchbar, 
  Card,
  IconButton,
  Menu,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useCustomers } from '@/contexts/CustomerContext';
import { Customer } from '@/types';

const CustomerCard = React.memo(({ item, menuVisible, setMenuVisible, handleViewDetails, handleEditCustomer, handleDeleteCustomer, styles }: {
  item: Customer;
  menuVisible: string | null;
  setMenuVisible: (value: string | null) => void;
  handleViewDetails: (customer: Customer) => void;
  handleEditCustomer: (customer: Customer) => void;
  handleDeleteCustomer: (customer: Customer) => void;
  styles: any;
}) => (
    <Card style={styles.customerCard}>
      <Card.Content>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerCompany}>{item.company}</Text>
            <Text style={styles.customerEmail}>{item.email}</Text>
            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
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
                handleEditCustomer(item);
              }}
              title="Edit" 
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(null);
                handleDeleteCustomer(item);
              }}
              title="Delete" 
              leadingIcon="delete"
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  ));

export default function CustomersScreen() {
  const theme = useTheme();
  const { 
    customers, 
    isLoading, 
    error, 
    searchQuery, 
    hasMore,
    fetchCustomers, 
    deleteCustomer, 
    setSearchQuery,
    selectCustomer 
  } = useCustomers();
  
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      fetchCustomers(1, '');
    } else {
      fetchCustomers(1, query);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers(1, searchQuery);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchCustomers(Math.floor(customers.length / 10) + 1, searchQuery);
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomer(customer.id),
        },
      ]
    );
  };

  const handleEditCustomer = (customer: Customer) => {
    selectCustomer(customer);
    router.push('/customers/form');
  };

  const handleViewDetails = (customer: Customer) => {
    selectCustomer(customer);
    router.push('/customers/details');
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <CustomerCard
      item={item}
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      handleViewDetails={handleViewDetails}
      handleEditCustomer={handleEditCustomer}
      handleDeleteCustomer={handleDeleteCustomer}
      styles={styles}
    />
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
    searchContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    customerCard: {
      marginBottom: 12,
      elevation: 2,
      borderRadius: 12,
    },
    customerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    customerInfo: {
      flex: 1,
    },
    customerName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    customerCompany: {
      fontSize: 14,
      color: theme.colors.primary,
      marginBottom: 4,
    },
    customerEmail: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    customerPhone: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
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
    },
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
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>Manage your customer relationships</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={handleSearch}
          value={searchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        {isLoading && customers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                </Text>
              </View>
            }
            ListFooterComponent={
              isLoading && customers.length > 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          selectCustomer(null);
          router.push('/customers/form');
        }}
      />
    </View>
  );
}