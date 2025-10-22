import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Surface, ActivityIndicator } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/types';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const theme = useTheme();
  const { leads, fetchLeads, isLoading, error } = useLeads();

  useEffect(() => {
    fetchLeads();
  }, []);

  const leadsByStatusData = useMemo(() => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<Lead['status'], number>);

    const data = Object.keys(statusCounts).map((status, index) => ({
      name: status,
      population: statusCounts[status as Lead['status']],
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4], // Example colors
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 15,
    }));

    return data;
  }, [leads, theme.colors.onSurface]);

  const totalValueOfLeadsData = useMemo(() => {
    const statusValues = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + lead.value;
      return acc;
    }, {} as Record<Lead['status'], number>);

    const labels = Object.keys(statusValues);
    const data = Object.values(statusValues);

    return {
      labels: labels,
      datasets: [
        {
          data: data,
        },
      ],
    };
  }, [leads]);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Default to black for labels
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0, // For integer values on y-axis
  };

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
    chartCard: {
      marginHorizontal: 16,
      marginBottom: 24,
      padding: 16,
      borderRadius: 16,
      elevation: 4,
    },
    chartTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your CRM data</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {leadsByStatusData.length > 0 && (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Leads by Status</Text>
            <PieChart
              data={leadsByStatusData}
              width={screenWidth - 64} // Adjust for padding
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White for pie chart labels
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Surface>
        )}

        {totalValueOfLeadsData.datasets[0].data.length > 0 && (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Total Value of Leads by Status</Text>
            <BarChart
              data={totalValueOfLeadsData}
              width={screenWidth - 64} // Adjust for padding
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          </Surface>
        )}

        {leads.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lead data available for the dashboard.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
