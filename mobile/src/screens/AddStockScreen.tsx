import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {Text, TextInput, Button, HelperText} from 'react-native-paper';
import {useNavigation, RouteProp, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {usePortfolio} from '@shared/contexts/PortfolioContext';
import {useMultiPortfolio} from '@shared/contexts/MultiPortfolioContext';
import {StockFormData} from '@shared/types/portfolio';
import {colors, spacing, fontSize, fontWeight} from '../constants/theme';
import {RootStackParamList} from '../navigation/AppNavigator';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

type AddStockScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddStock'
>;

type AddStockScreenRouteProp = RouteProp<RootStackParamList, 'AddStock'>;

const AddStockScreen: React.FC = () => {
  const navigation = useNavigation<AddStockScreenNavigationProp>();
  const route = useRoute<AddStockScreenRouteProp>();
  const {portfolioId} = route.params;

  const {addStock} = usePortfolio();
  const {getActivePortfolio} = useMultiPortfolio();

  const [formData, setFormData] = useState<StockFormData>({
    ticker: '',
    buyPrice: '',
    currentPrice: '',
    quantity: '',
  });

  const [errors, setErrors] = useState<Partial<StockFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePortfolio = getActivePortfolio();

  const handleInputChange = (field: keyof StockFormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StockFormData> = {};

    // Ticker validation
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Stock ticker is required';
    } else if (formData.ticker.trim().length < 1 || formData.ticker.trim().length > 10) {
      newErrors.ticker = 'Ticker must be 1-10 characters';
    }

    // Buy price validation
    if (!formData.buyPrice.trim()) {
      newErrors.buyPrice = 'Buy price is required';
    } else {
      const buyPrice = parseFloat(formData.buyPrice);
      if (isNaN(buyPrice) || buyPrice <= 0) {
        newErrors.buyPrice = 'Buy price must be a positive number';
      }
    }

    // Current price validation
    if (!formData.currentPrice.trim()) {
      newErrors.currentPrice = 'Current price is required';
    } else {
      const currentPrice = parseFloat(formData.currentPrice);
      if (isNaN(currentPrice) || currentPrice <= 0) {
        newErrors.currentPrice = 'Current price must be a positive number';
      }
    }

    // Quantity validation
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = 'Quantity must be a positive integer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addStock(formData);
      
      Alert.alert(
        'Success',
        'Stock added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add stock. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const calculateTotalValue = () => {
    const currentPrice = parseFloat(formData.currentPrice) || 0;
    const quantity = parseInt(formData.quantity) || 0;
    return currentPrice * quantity;
  };

  const calculateGainLoss = () => {
    const buyPrice = parseFloat(formData.buyPrice) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || 0;
    const quantity = parseInt(formData.quantity) || 0;
    
    const totalCost = buyPrice * quantity;
    const totalValue = currentPrice * quantity;
    return totalValue - totalCost;
  };

  if (isSubmitting) {
    return (
      <LoadingSpinner
        message=\"Adding stock...\"
        overlay={false}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps=\"handled\"
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Info */}
        <Card style={styles.portfolioCard} variant=\"glass\">
          <View style={styles.portfolioHeader}>
            <Icon name=\"account-balance-wallet\" size={20} color={colors.primary} />
            <Text style={styles.portfolioTitle}>
              Adding to: {activePortfolio?.name || 'Portfolio'}
            </Text>
          </View>
        </Card>

        {/* Stock Form */}
        <Card style={styles.formCard} variant=\"elevated\">
          <View style={styles.formHeader}>
            <Icon name=\"add-box\" size={20} color={colors.secondary} />
            <Text style={styles.formTitle}>Stock Details</Text>
          </View>

          {/* Ticker Input */}
          <View style={styles.inputContainer}>
            <TextInput
              mode=\"outlined\"
              label=\"Stock Ticker\"
              placeholder=\"e.g., AAPL, GOOGL\"
              value={formData.ticker}
              onChangeText={(value) => handleInputChange('ticker', value.toUpperCase())}
              error={!!errors.ticker}
              style={styles.input}
              autoCapitalize=\"characters\"
              autoCorrect={false}
              maxLength={10}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.border,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
            <HelperText type=\"error\" visible={!!errors.ticker}>
              {errors.ticker}
            </HelperText>
          </View>

          {/* Buy Price Input */}
          <View style={styles.inputContainer}>
            <TextInput
              mode=\"outlined\"
              label=\"Buy Price\"
              placeholder=\"0.00\"
              value={formData.buyPrice}
              onChangeText={(value) => handleInputChange('buyPrice', value)}
              error={!!errors.buyPrice}
              style={styles.input}
              keyboardType=\"decimal-pad\"
              left={<TextInput.Affix text=\"$\" />}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.border,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
            <HelperText type=\"error\" visible={!!errors.buyPrice}>
              {errors.buyPrice}
            </HelperText>
          </View>

          {/* Current Price Input */}
          <View style={styles.inputContainer}>
            <TextInput
              mode=\"outlined\"
              label=\"Current Price\"
              placeholder=\"0.00\"
              value={formData.currentPrice}
              onChangeText={(value) => handleInputChange('currentPrice', value)}
              error={!!errors.currentPrice}
              style={styles.input}
              keyboardType=\"decimal-pad\"
              left={<TextInput.Affix text=\"$\" />}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.border,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
            <HelperText type=\"error\" visible={!!errors.currentPrice}>
              {errors.currentPrice}
            </HelperText>
          </View>

          {/* Quantity Input */}
          <View style={styles.inputContainer}>
            <TextInput
              mode=\"outlined\"
              label=\"Quantity\"
              placeholder=\"0\"
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
              error={!!errors.quantity}
              style={styles.input}
              keyboardType=\"number-pad\"
              right={<TextInput.Affix text=\"shares\" />}
              theme={{
                colors: {
                  primary: colors.primary,
                  outline: colors.border,
                  onSurfaceVariant: colors.textSecondary,
                },
              }}
            />
            <HelperText type=\"error\" visible={!!errors.quantity}>
              {errors.quantity}
            </HelperText>
          </View>
        </Card>

        {/* Calculation Preview */}
        {formData.currentPrice && formData.quantity && (
          <Card style={styles.previewCard} variant=\"glass\">
            <View style={styles.previewHeader}>
              <Icon name=\"calculate\" size={20} color={colors.accent} />
              <Text style={styles.previewTitle}>Investment Summary</Text>
            </View>

            <View style={styles.calculationGrid}>
              <View style={styles.calculationItem}>
                <Text style={styles.calculationLabel}>Total Value</Text>
                <Text style={styles.calculationValue}>
                  ${calculateTotalValue().toFixed(2)}
                </Text>
              </View>

              {formData.buyPrice && (
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationLabel}>Gain/Loss</Text>
                  <Text
                    style={[
                      styles.calculationValue,
                      {
                        color: calculateGainLoss() >= 0 ? colors.success : colors.error,
                      },
                    ]}
                  >
                    ${calculateGainLoss().toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode=\"outlined\"
            onPress={handleCancel}
            style={[styles.button, styles.cancelButton]}
            labelStyle={styles.cancelButtonText}
            contentStyle={styles.buttonContent}
          >
            Cancel
          </Button>
          
          <Button
            mode=\"contained\"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            labelStyle={styles.submitButtonText}
            contentStyle={styles.buttonContent}
            disabled={isSubmitting}
          >
            Add Stock
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  portfolioCard: {
    marginBottom: spacing.md,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  portfolioTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  formCard: {
    marginBottom: spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
  },
  previewCard: {
    marginBottom: spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  previewTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  calculationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  calculationItem: {
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  calculationValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.onPrimary,
  },
});

export default AddStockScreen;