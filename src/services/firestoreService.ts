import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Portfolio, Stock } from '../types/portfolio';
import { Goal } from '../types/goals';
import { UserPreferences } from '../types/auth';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  PORTFOLIOS: 'portfolios',
  STOCKS: 'stocks',
  GOALS: 'goals',
  PORTFOLIO_HISTORY: 'portfolioHistory',
  USER_SETTINGS: 'userSettings',
} as const;

// Generic Firestore service class
export class FirestoreService {
  // User data operations
  static async getUserData(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async updateUserData(userId: string, data: any) {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Portfolio operations
  static async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const portfoliosQuery = query(
        collection(db, COLLECTIONS.PORTFOLIOS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(portfoliosQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Portfolio[];
    } catch (error) {
      console.error('Error getting user portfolios:', error);
      throw error;
    }
  }

  static async createPortfolio(userId: string, portfolioData: Omit<Portfolio, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PORTFOLIOS), {
        ...portfolioData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  static async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>) {
    try {
      await updateDoc(doc(db, COLLECTIONS.PORTFOLIOS, portfolioId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  static async deletePortfolio(portfolioId: string) {
    try {
      const batch = writeBatch(db);
      
      // Delete portfolio document
      batch.delete(doc(db, COLLECTIONS.PORTFOLIOS, portfolioId));
      
      // Delete all stocks in the portfolio
      const stocksQuery = query(
        collection(db, COLLECTIONS.STOCKS),
        where('portfolioId', '==', portfolioId)
      );
      const stocksSnapshot = await getDocs(stocksQuery);
      stocksSnapshot.docs.forEach(stockDoc => {
        batch.delete(stockDoc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // Stock operations
  static async getPortfolioStocks(portfolioId: string): Promise<Stock[]> {
    try {
      const stocksQuery = query(
        collection(db, COLLECTIONS.STOCKS),
        where('portfolioId', '==', portfolioId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(stocksQuery);
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Stock[];
    } catch (error) {
      console.error('Error getting portfolio stocks:', error);
      throw error;
    }
  }

  static async addStock(portfolioId: string, stockData: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.STOCKS), {
        ...stockData,
        portfolioId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  }

  static async updateStock(stockId: string, updates: Partial<Stock>) {
    try {
      await updateDoc(doc(db, COLLECTIONS.STOCKS, stockId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  static async deleteStock(stockId: string) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.STOCKS, stockId));
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  }

  // Goals operations
  static async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        collection(db, COLLECTIONS.GOALS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(goalsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        targetDate: doc.data().targetDate?.toDate() || new Date(),
      })) as Goal[];
    } catch (error) {
      console.error('Error getting user goals:', error);
      throw error;
    }
  }

  static async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), {
        ...goalData,
        userId,
        targetDate: Timestamp.fromDate(goalData.targetDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const updateData = { ...updates };
      if (updates.targetDate) {
        updateData.targetDate = Timestamp.fromDate(updates.targetDate);
      }
      
      await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  static async deleteGoal(goalId: string) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // User preferences operations
  static async updateUserPreferences(userId: string, preferences: UserPreferences) {
    try {
      await setDoc(doc(db, COLLECTIONS.USER_SETTINGS, userId), {
        preferences,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const settingsDoc = await getDoc(doc(db, COLLECTIONS.USER_SETTINGS, userId));
      return settingsDoc.exists() ? settingsDoc.data().preferences : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToUserPortfolios(userId: string, callback: (portfolios: Portfolio[]) => void) {
    const portfoliosQuery = query(
      collection(db, COLLECTIONS.PORTFOLIOS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(portfoliosQuery, (snapshot) => {
      const portfolios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Portfolio[];
      
      callback(portfolios);
    }, (error) => {
      console.error('Error in portfolios subscription:', error);
    });
  }

  static subscribeToPortfolioStocks(portfolioId: string, callback: (stocks: Stock[]) => void) {
    const stocksQuery = query(
      collection(db, COLLECTIONS.STOCKS),
      where('portfolioId', '==', portfolioId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(stocksQuery, (snapshot) => {
      const stocks = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Stock[];
      
      callback(stocks);
    }, (error) => {
      console.error('Error in stocks subscription:', error);
    });
  }

  static subscribeToUserGoals(userId: string, callback: (goals: Goal[]) => void) {
    const goalsQuery = query(
      collection(db, COLLECTIONS.GOALS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(goalsQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        targetDate: doc.data().targetDate?.toDate() || new Date(),
      })) as Goal[];
      
      callback(goals);
    }, (error) => {
      console.error('Error in goals subscription:', error);
    });
  }

  // Batch operations
  static async batchUpdateStocks(updates: Array<{ id: string; data: Partial<Stock> }>) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const stockRef = doc(db, COLLECTIONS.STOCKS, id);
        batch.update(stockRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating stocks:', error);
      throw error;
    }
  }

  // Offline support
  static async enableOfflineSupport() {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.error('Error enabling offline support:', error);
    }
  }

  static async disableOfflineSupport() {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('Error disabling offline support:', error);
    }
  }

  // Data migration and backup
  static async exportUserData(userId: string) {
    try {
      const [portfolios, goals, preferences] = await Promise.all([
        this.getUserPortfolios(userId),
        this.getUserGoals(userId),
        this.getUserPreferences(userId),
      ]);

      // Get all stocks for all portfolios
      const allStocks = await Promise.all(
        portfolios.map(portfolio => this.getPortfolioStocks(portfolio.id))
      );

      return {
        portfolios,
        stocks: allStocks.flat(),
        goals,
        preferences,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Analytics and insights
  static async getUserAnalytics(userId: string) {
    try {
      const portfolios = await this.getUserPortfolios(userId);
      const totalPortfolios = portfolios.length;
      
      const allStocks = await Promise.all(
        portfolios.map(portfolio => this.getPortfolioStocks(portfolio.id))
      );
      const totalStocks = allStocks.flat().length;
      
      const goals = await this.getUserGoals(userId);
      const totalGoals = goals.length;
      const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

      return {
        totalPortfolios,
        totalStocks,
        totalGoals,
        completedGoals,
        portfolios,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }
}