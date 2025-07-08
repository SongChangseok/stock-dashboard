import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Portfolio, Stock } from '../types/portfolio';
import { Goal } from '../types/goals';
import { UserPreferences } from '../types/auth';

// Table names
const TABLES = {
  USERS: 'users',
  PORTFOLIOS: 'portfolios',
  STOCKS: 'stocks',
  GOALS: 'goals',
  PORTFOLIO_HISTORY: 'portfolio_history',
  USER_SETTINGS: 'user_settings',
} as const;

// Generic Supabase service class
export class SupabaseService {
  // User data operations
  static async getUserData(userId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async updateUserData(userId: string, data: any) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Portfolio operations
  static async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PORTFOLIOS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(portfolio => ({
        id: portfolio.id,
        userId: portfolio.user_id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: portfolio.total_value,
        dailyChange: portfolio.daily_change,
        dailyChangePercent: portfolio.daily_change_percent,
        createdAt: new Date(portfolio.created_at),
        updatedAt: new Date(portfolio.updated_at),
        stocks: [], // Will be populated separately
      })) as Portfolio[];
    } catch (error) {
      console.error('Error getting user portfolios:', error);
      throw error;
    }
  }

  static async createPortfolio(userId: string, portfolioData: Omit<Portfolio, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PORTFOLIOS)
        .insert({
          user_id: userId,
          name: portfolioData.name,
          description: portfolioData.description,
          total_value: portfolioData.totalValue || 0,
          daily_change: portfolioData.dailyChange || 0,
          daily_change_percent: portfolioData.dailyChangePercent || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  static async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue;
      if (updates.dailyChange !== undefined) updateData.daily_change = updates.dailyChange;
      if (updates.dailyChangePercent !== undefined) updateData.daily_change_percent = updates.dailyChangePercent;
      
      const { error } = await supabase
        .from(TABLES.PORTFOLIOS)
        .update(updateData)
        .eq('id', portfolioId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  static async deletePortfolio(portfolioId: string) {
    try {
      // Delete all stocks in the portfolio first
      const { error: stocksError } = await supabase
        .from(TABLES.STOCKS)
        .delete()
        .eq('portfolio_id', portfolioId);
      
      if (stocksError) throw stocksError;
      
      // Delete portfolio
      const { error: portfolioError } = await supabase
        .from(TABLES.PORTFOLIOS)
        .delete()
        .eq('id', portfolioId);
      
      if (portfolioError) throw portfolioError;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // Stock operations
  static async getPortfolioStocks(portfolioId: string): Promise<Stock[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.STOCKS)
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(stock => ({
        id: stock.id,
        portfolioId: stock.portfolio_id,
        symbol: stock.symbol,
        name: stock.name,
        quantity: stock.quantity,
        avgPrice: stock.avg_price,
        currentPrice: stock.current_price,
        value: stock.value,
        gain: stock.gain,
        gainPercent: stock.gain_percent,
        sector: stock.sector,
        createdAt: new Date(stock.created_at),
        updatedAt: new Date(stock.updated_at),
      })) as Stock[];
    } catch (error) {
      console.error('Error getting portfolio stocks:', error);
      throw error;
    }
  }

  static async addStock(portfolioId: string, stockData: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(TABLES.STOCKS)
        .insert({
          portfolio_id: portfolioId,
          symbol: stockData.symbol,
          name: stockData.name,
          quantity: stockData.quantity,
          avg_price: stockData.avgPrice,
          current_price: stockData.currentPrice,
          value: stockData.value,
          gain: stockData.gain,
          gain_percent: stockData.gainPercent,
          sector: stockData.sector,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id.toString();
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  }

  static async updateStock(stockId: string, updates: Partial<Stock>) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.symbol) updateData.symbol = updates.symbol;
      if (updates.name) updateData.name = updates.name;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.avgPrice !== undefined) updateData.avg_price = updates.avgPrice;
      if (updates.currentPrice !== undefined) updateData.current_price = updates.currentPrice;
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.gain !== undefined) updateData.gain = updates.gain;
      if (updates.gainPercent !== undefined) updateData.gain_percent = updates.gainPercent;
      if (updates.sector) updateData.sector = updates.sector;
      
      const { error } = await supabase
        .from(TABLES.STOCKS)
        .update(updateData)
        .eq('id', parseInt(stockId));
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  static async deleteStock(stockId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.STOCKS)
        .delete()
        .eq('id', parseInt(stockId));
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  }

  // Goals operations
  static async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(goal => ({
        id: goal.id,
        userId: goal.user_id,
        title: goal.title,
        description: goal.description,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: new Date(goal.target_date),
        category: goal.category,
        createdAt: new Date(goal.created_at),
        updatedAt: new Date(goal.updated_at),
      })) as Goal[];
    } catch (error) {
      console.error('Error getting user goals:', error);
      throw error;
    }
  }

  static async createGoal(userId: string, goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .insert({
          user_id: userId,
          title: goalData.title,
          description: goalData.description,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount || 0,
          target_date: goalData.targetDate.toISOString(),
          category: goalData.category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.targetDate) updateData.target_date = updates.targetDate.toISOString();
      if (updates.category) updateData.category = updates.category;
      
      const { error } = await supabase
        .from(TABLES.GOALS)
        .update(updateData)
        .eq('id', goalId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  static async deleteGoal(goalId: string) {
    try {
      const { error } = await supabase
        .from(TABLES.GOALS)
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // User preferences operations
  static async updateUserPreferences(userId: string, preferences: UserPreferences) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('preferences')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.preferences || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToUserPortfolios(userId: string, callback: (portfolios: Portfolio[]) => void): RealtimeChannel {
    const channel = supabase
      .channel('user-portfolios')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PORTFOLIOS,
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Refresh portfolios data
          const portfolios = await this.getUserPortfolios(userId);
          callback(portfolios);
        }
      )
      .subscribe();

    // Initial load
    this.getUserPortfolios(userId).then(callback).catch(console.error);

    return channel;
  }

  static subscribeToPortfolioStocks(portfolioId: string, callback: (stocks: Stock[]) => void): RealtimeChannel {
    const channel = supabase
      .channel('portfolio-stocks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.STOCKS,
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        async () => {
          // Refresh stocks data
          const stocks = await this.getPortfolioStocks(portfolioId);
          callback(stocks);
        }
      )
      .subscribe();

    // Initial load
    this.getPortfolioStocks(portfolioId).then(callback).catch(console.error);

    return channel;
  }

  static subscribeToUserGoals(userId: string, callback: (goals: Goal[]) => void): RealtimeChannel {
    const channel = supabase
      .channel('user-goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.GOALS,
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Refresh goals data
          const goals = await this.getUserGoals(userId);
          callback(goals);
        }
      )
      .subscribe();

    // Initial load
    this.getUserGoals(userId).then(callback).catch(console.error);

    return channel;
  }

  // Batch operations
  static async batchUpdateStocks(updates: Array<{ id: string; data: Partial<Stock> }>) {
    try {
      const promises = updates.map(({ id, data }) => this.updateStock(id, data));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error batch updating stocks:', error);
      throw error;
    }
  }

  // Network status (Supabase handles offline automatically)
  static async getNetworkStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
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