import { FirestoreService } from './firestoreService';
import { Portfolio } from '../types/portfolio';
import { Goal } from '../types/goals';

export class MigrationService {
  // Migrate localStorage data to Firestore for authenticated user
  static async migrateUserData(userId: string): Promise<void> {
    try {
      console.log('Starting data migration for user:', userId);

      // Check if user data already exists in Firestore
      const existingPortfolios = await FirestoreService.getUserPortfolios(userId);
      const existingGoals = await FirestoreService.getUserGoals(userId);

      // Only migrate if no existing data found
      if (existingPortfolios.length === 0 && existingGoals.length === 0) {
        await this.migratePortfoliosFromLocalStorage(userId);
        await this.migrateGoalsFromLocalStorage(userId);
        console.log('Data migration completed successfully');
      } else {
        console.log('User already has data in Firestore, skipping migration');
      }
    } catch (error) {
      console.error('Error during data migration:', error);
      // Don't throw error to prevent blocking user authentication
    }
  }

  // Migrate portfolios from localStorage to Firestore
  private static async migratePortfoliosFromLocalStorage(userId: string): Promise<void> {
    try {
      // Get portfolios from localStorage
      const localPortfolios = this.getLocalStoragePortfolios();
      
      if (localPortfolios.length > 0) {
        console.log('Migrating', localPortfolios.length, 'portfolios from localStorage');
        
        for (const portfolio of localPortfolios) {
          // Create portfolio in Firestore
          const portfolioData = {
            name: portfolio.name,
            totalValue: portfolio.totalValue,
            dailyChange: portfolio.dailyChange,
            dailyChangePercent: portfolio.dailyChangePercent,
            stocks: portfolio.stocks || [],
          };

          const portfolioId = await FirestoreService.createPortfolio(userId, portfolioData);
          
          // Add stocks to the portfolio
          if (portfolio.stocks && portfolio.stocks.length > 0) {
            for (const stock of portfolio.stocks) {
              await FirestoreService.addStock(portfolioId, {
                symbol: stock.symbol,
                name: stock.name,
                quantity: stock.quantity,
                avgPrice: stock.avgPrice,
                currentPrice: stock.currentPrice,
                value: stock.value,
                gain: stock.gain,
                gainPercent: stock.gainPercent,
                sector: stock.sector,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error migrating portfolios:', error);
    }
  }

  // Migrate goals from localStorage to Firestore
  private static async migrateGoalsFromLocalStorage(userId: string): Promise<void> {
    try {
      // Get goals from localStorage
      const localGoals = this.getLocalStorageGoals();
      
      if (localGoals.length > 0) {
        console.log('Migrating', localGoals.length, 'goals from localStorage');
        
        for (const goal of localGoals) {
          const goalData = {
            type: goal.type,
            title: goal.title,
            description: goal.description,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: goal.targetDate,
            category: goal.category,
            priority: goal.priority,
            isCompleted: goal.isCompleted,
          };

          await FirestoreService.createGoal(userId, goalData);
        }
      }
    } catch (error) {
      console.error('Error migrating goals:', error);
    }
  }

  // Get portfolios from localStorage
  private static getLocalStoragePortfolios(): Portfolio[] {
    try {
      const stored = localStorage.getItem('portfolios');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading portfolios from localStorage:', error);
      return [];
    }
  }

  // Get goals from localStorage
  private static getLocalStorageGoals(): Goal[] {
    try {
      const stored = localStorage.getItem('goals');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading goals from localStorage:', error);
      return [];
    }
  }

  // Clear localStorage data after successful migration
  static clearLocalStorageData(): void {
    try {
      localStorage.removeItem('portfolios');
      localStorage.removeItem('goals');
      localStorage.removeItem('portfolioHistory');
      console.log('LocalStorage data cleared after migration');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Export user data for backup purposes
  static async exportUserDataForBackup(userId: string): Promise<string> {
    try {
      const userData = await FirestoreService.exportUserData(userId);
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}