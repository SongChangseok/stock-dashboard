export interface Goal {
  id: number;
  title: string;
  description: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  monthlyContribution: number;
  category: string;
}

export enum GoalType {
  RETIREMENT = 'retirement',
  HOUSE = 'house',
  EDUCATION = 'education',
  EMERGENCY = 'emergency',
  VACATION = 'vacation',
  INVESTMENT = 'investment',
  OTHER = 'other'
}

export interface GoalFormData {
  title: string;
  description: string;
  type: GoalType;
  targetAmount: string;
  targetDate: string;
  monthlyContribution: string;
  category: string;
}

export interface GoalProgress {
  goalId: number;
  progress: number; // 0-100
  estimatedCompletion: string;
  monthsRemaining: number;
  onTrack: boolean;
  monthlyRequired: number;
}

export interface GoalMetrics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
  onTrackGoals: number;
}

export interface GoalContribution {
  id: number;
  goalId: number;
  amount: number;
  date: string;
  description?: string;
  source: 'manual' | 'automatic' | 'portfolio';
}

export interface GoalState {
  goals: Goal[];
  contributions: GoalContribution[];
  metrics: GoalMetrics;
  loading: boolean;
  error: string | null;
}

export interface GoalContextType {
  state: GoalState;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: number, updates: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  addContribution: (contribution: Omit<GoalContribution, 'id'>) => void;
  calculateProgress: (goalId: number) => GoalProgress;
  getGoalsByType: (type: GoalType) => Goal[];
  setError: (error: string | null) => void;
  clearError: () => void;
}