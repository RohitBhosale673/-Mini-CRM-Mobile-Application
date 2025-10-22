import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, useTheme, Card, Title, Paragraph } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useCustomers } from '@/contexts/CustomerContext';
import { useLeads } from '@/contexts/LeadContext';
import { DashboardStats } from '@/types';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react-native';

export default function DashboardScreen() {
  const theme = useTheme();
  const { customers, fetchCustomers } = useCustomers();
  const { leads, fetchLeads } = useLeads();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalValue: 0,
    leadsByStatus: { New: 0, Contacted: 0, Converted: 0, Lost: 0 },
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchCustomers();
    fetchLeads();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [customers, leads]);

  const calculateStats = () => {
    let leadsByStatus = { New: 0, Contacted: 0, Converted: 0, Lost: 0 };
    let totalValue = 0;

    for (const lead of leads) {
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
      totalValue += lead.value;
    }

    setStats({
      totalLeads: leads.length,
      totalValue,
      leadsByStatus,
      totalCustomers: customers.length,
    });
  };

  const screenWidth = Dimensions.get('window').width;
  
  const pieData = [
    {
      name: 'New',
      population: stats.leadsByStatus.New,
      color: theme.colors.primary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Contacted',
      population: stats.leadsByStatus.Contacted,
      color: theme.colors.secondary,
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Converted',
      population: stats.leadsByStatus.Converted,
      color: '#4caf50',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Lost',
      population: stats.leadsByStatus.Lost,
      color: '#f44336',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
  ];

  const barData = {
    labels: ['New', 'Contacted', 'Converted', 'Lost'],
    datasets: [{
      data: [
        stats.leadsByStatus.New,
        stats.leadsByStatus.Contacted,
        stats.leadsByStatus.Converted,
        stats.leadsByStatus.Lost,
      ]
    }]
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      padding: 16,
      borderRadius: 12,
      elevation: 2,
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    chartContainer: {
      marginBottom: 24,
    },
    chartCard: {
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of your CRM performance</Text>
        </View>

        <View style={styles.statsGrid}>
          <Surface style={styles.statCard}>
            <TrendingUp size={24} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.totalLeads}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Users size={24} color={theme.colors.secondary} style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <Target size={24} color="#4caf50" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.leadsByStatus.Converted}</Text>
            <Text style={styles.statLabel}>Converted</Text>
          </Surface>

          <Surface style={styles.statCard}>
            <DollarSign size={24} color="#ff9800" style={styles.statIcon} />
            <Text style={styles.statValue}>${stats.totalValue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </Surface>
        </View>

        {stats.totalLeads > 0 && (
          <View style={styles.chartContainer}>
            <Surface style={styles.chartCard}>
              <Text style={styles.chartTitle}>Leads by Status</Text>
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 50]}
                absolute
              />
            </Surface>

            <Surface style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lead Distribution</Text>
              <BarChart
                data={barData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                yAxisLabel=""
                yAxisSuffix=""
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </Surface>
          </View>
        )}
      </ScrollView>
    </View>
  );
}