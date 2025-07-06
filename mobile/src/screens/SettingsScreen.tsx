import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Share,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  Button,
  Divider,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useSettings} from '@shared/contexts/SettingsContext';
import {colors, spacing, fontSize, fontWeight} from '../constants/theme';
import Card from '../components/common/Card';

const SettingsScreen: React.FC = () => {
  const {settings, updateSettings} = useSettings();
  
  const [refreshIntervalDialog, setRefreshIntervalDialog] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(
    settings.refreshInterval?.toString() || '30000'
  );

  const refreshIntervalOptions = [
    {label: '10 seconds', value: '10000'},
    {label: '30 seconds', value: '30000'},
    {label: '1 minute', value: '60000'},
    {label: '5 minutes', value: '300000'},
    {label: 'Manual only', value: '0'},
  ];

  const handleToggleSetting = (key: string, value: boolean) => {
    updateSettings({[key]: value});
  };

  const handleRefreshIntervalChange = () => {
    updateSettings({refreshInterval: parseInt(selectedInterval)});
    setRefreshIntervalDialog(false);
  };

  const handleExportData = async () => {
    try {
      const allData = await AsyncStorage.getAllKeys();
      const portfolioKeys = allData.filter(key => 
        key.startsWith('portfolio') || key.startsWith('stocks') || key.startsWith('goals')
      );
      
      const exportData: Record<string, any> = {};
      for (const key of portfolioKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          exportData[key] = JSON.parse(value);
        }
      }

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: dataString,
        title: 'Portfolio Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your portfolios, stocks, and settings. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    // In a real app, this would link to the app store
    Alert.alert('Rate App', 'Thank you for your interest in rating our app!');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@stockdashboard.com?subject=Mobile App Support');
  };

  const handleViewPrivacy = () => {
    Linking.openURL('https://stockdashboard.com/privacy');
  };

  const handleViewTerms = () => {
    Linking.openURL('https://stockdashboard.com/terms');
  };

  const getRefreshIntervalLabel = () => {
    const option = refreshIntervalOptions.find(opt => 
      opt.value === settings.refreshInterval?.toString()
    );
    return option?.label || '30 seconds';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name=\"settings\" size={24} color={colors.primary} />
            <Text style={styles.title}>Settings</Text>
          </View>
          <Text style={styles.subtitle}>
            Customize your app experience
          </Text>
        </View>

        {/* General Settings */}
        <Card style={styles.sectionCard} variant=\"elevated\">
          <Text style={styles.sectionTitle}>General</Text>
          
          <List.Item
            title=\"Auto Refresh\"
            description=\"Automatically update stock prices\"
            left={props => <List.Icon {...props} icon=\"refresh\" color={colors.primary} />}
            right={() => (
              <Switch
                value={settings.autoRefresh}
                onValueChange={(value) => handleToggleSetting('autoRefresh', value)}
                color={colors.primary}
              />
            )}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Refresh Interval\"
            description={`Update every ${getRefreshIntervalLabel()}`}
            left={props => <List.Icon {...props} icon=\"timer\" color={colors.secondary} />}
            right={props => <List.Icon {...props} icon=\"chevron-right\" />}
            onPress={() => setRefreshIntervalDialog(true)}
            disabled={!settings.autoRefresh}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Notifications\"
            description=\"Price alerts and portfolio updates\"
            left={props => <List.Icon {...props} icon=\"notifications\" color={colors.accent} />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleToggleSetting('notifications', value)}
                color={colors.primary}
              />
            )}
          />
        </Card>

        {/* Display Settings */}
        <Card style={styles.sectionCard} variant=\"elevated\">
          <Text style={styles.sectionTitle}>Display</Text>
          
          <List.Item
            title=\"Show Animations\"
            description=\"Enable smooth transitions and effects\"
            left={props => <List.Icon {...props} icon=\"animation\" color={colors.warning} />}
            right={() => (
              <Switch
                value={settings.animations ?? true}
                onValueChange={(value) => handleToggleSetting('animations', value)}
                color={colors.primary}
              />
            )}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Compact Mode\"
            description=\"Show more content in less space\"
            left={props => <List.Icon {...props} icon=\"view-compact\" color={colors.info} />}
            right={() => (
              <Switch
                value={settings.compactMode ?? false}
                onValueChange={(value) => handleToggleSetting('compactMode', value)}
                color={colors.primary}
              />
            )}
          />
        </Card>

        {/* Data Management */}
        <Card style={styles.sectionCard} variant=\"elevated\">
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <List.Item
            title=\"Export Data\"
            description=\"Backup your portfolios and settings\"
            left={props => <List.Icon {...props} icon=\"download\" color={colors.success} />}
            right={props => <List.Icon {...props} icon=\"chevron-right\" />}
            onPress={handleExportData}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Clear All Data\"
            description=\"Reset app to initial state\"
            left={props => <List.Icon {...props} icon=\"delete-forever\" color={colors.error} />}
            right={props => <List.Icon {...props} icon=\"chevron-right\" />}
            onPress={handleClearData}
          />
        </Card>

        {/* Support & Info */}
        <Card style={styles.sectionCard} variant=\"elevated\">
          <Text style={styles.sectionTitle}>Support & Information</Text>
          
          <List.Item
            title=\"Rate App\"
            description=\"Help us improve with your feedback\"
            left={props => <List.Icon {...props} icon=\"star\" color={colors.warning} />}
            right={props => <List.Icon {...props} icon=\"chevron-right\" />}
            onPress={handleRateApp}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Contact Support\"
            description=\"Get help with any issues\"
            left={props => <List.Icon {...props} icon=\"support\" color={colors.info} />}
            right={props => <List.Icon {...props} icon=\"chevron-right\" />}
            onPress={handleContactSupport}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Privacy Policy\"
            description=\"How we protect your data\"
            left={props => <List.Icon {...props} icon=\"privacy-tip\" color={colors.secondary} />}
            right={props => <List.Icon {...props} icon=\"open-in-new\" />}
            onPress={handleViewPrivacy}
          />

          <Divider style={styles.divider} />

          <List.Item
            title=\"Terms of Service\"
            description=\"App usage terms and conditions\"
            left={props => <List.Icon {...props} icon=\"description\" color={colors.accent} />}
            right={props => <List.Icon {...props} icon=\"open-in-new\" />}
            onPress={handleViewTerms}
          />
        </Card>

        {/* App Info */}
        <Card style={styles.sectionCard} variant=\"glass\">
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Stock Dashboard</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              A comprehensive portfolio management app for tracking your investments
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Refresh Interval Dialog */}
      <Portal>
        <Dialog 
          visible={refreshIntervalDialog} 
          onDismiss={() => setRefreshIntervalDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Refresh Interval</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDescription}>
              Choose how often the app should update stock prices automatically
            </Text>
            <RadioButton.Group
              onValueChange={setSelectedInterval}
              value={selectedInterval}
            >
              {refreshIntervalOptions.map(option => (
                <View key={option.value} style={styles.radioOption}>
                  <RadioButton.Item
                    label={option.label}
                    value={option.value}
                    labelStyle={styles.radioLabel}
                    color={colors.primary}
                  />
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRefreshIntervalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onPress={handleRefreshIntervalChange}
              mode=\"contained\"
              style={styles.dialogButton}
            >
              Apply
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  sectionCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  appInfo: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  appVersion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  appDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dialog: {
    backgroundColor: colors.surface,
  },
  dialogTitle: {
    color: colors.textPrimary,
  },
  dialogDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  radioOption: {
    marginVertical: spacing.xs,
  },
  radioLabel: {
    color: colors.textPrimary,
  },
  dialogButton: {
    backgroundColor: colors.primary,
  },
});

export default SettingsScreen;