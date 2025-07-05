import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Goal, GoalState, GoalContextType, GoalContribution, GoalProgress, GoalMetrics, GoalType } from '../types/goals';

const initialState: GoalState = {
  goals: [],
  contributions: [],
  metrics: {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    overallProgress: 0,
    onTrackGoals: 0
  },
  loading: false,
  error: null
};

type GoalAction =
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: number; updates: Partial<Goal> } }
  | { type: 'DELETE_GOAL'; payload: number }
  | { type: 'ADD_CONTRIBUTION'; payload: GoalContribution }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_METRICS'; payload: GoalMetrics };

const goalReducer = (state: GoalState, action: GoalAction): GoalState => {
  switch (action.type) {
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
        error: null
      };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id
            ? { ...goal, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : goal
        ),
        error: null
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        contributions: state.contributions.filter(contrib => contrib.goalId !== action.payload),
        error: null
      };
    case 'ADD_CONTRIBUTION':
      return {
        ...state,
        contributions: [...state.contributions, action.payload],
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: action.payload
      };
    default:
      return state;
  }
};

const GoalsContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

interface GoalsProviderProps {
  children: ReactNode;
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(goalReducer, initialState);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
  };

  const updateGoal = (id: number, updates: Partial<Goal>) => {
    dispatch({ type: 'UPDATE_GOAL', payload: { id, updates } });
  };

  const deleteGoal = (id: number) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  };

  const addContribution = (contributionData: Omit<GoalContribution, 'id'>) => {
    const newContribution: GoalContribution = {
      ...contributionData,
      id: Date.now()
    };
    dispatch({ type: 'ADD_CONTRIBUTION', payload: newContribution });
    
    // Update goal's current amount
    const goal = state.goals.find(g => g.id === contributionData.goalId);
    if (goal) {
      updateGoal(goal.id, { currentAmount: goal.currentAmount + contributionData.amount });
    }
  };

  const calculateProgress = (goalId: number): GoalProgress => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const monthsRemaining = Math.max(0, 
      (targetDate.getFullYear() - now.getFullYear()) * 12 + 
      (targetDate.getMonth() - now.getMonth())
    );

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthlyRequired = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;
    const onTrack = monthlyRequired <= goal.monthlyContribution || progress >= 100;

    const estimatedCompletion = monthlyRequired > 0 && goal.monthlyContribution > 0
      ? new Date(now.getTime() + (remainingAmount / goal.monthlyContribution) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : goal.targetDate;

    return {
      goalId,
      progress,
      estimatedCompletion,
      monthsRemaining,
      onTrack,
      monthlyRequired
    };
  };

  const getGoalsByType = (type: GoalType): Goal[] => {
    return state.goals.filter(goal => goal.type === type);
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateMetrics = () => {
    const activeGoals = state.goals.filter(goal => goal.isActive);
    const completedGoals = state.goals.filter(goal => goal.currentAmount >= goal.targetAmount);
    
    const totalTargetAmount = state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = state.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    const onTrackGoals = state.goals.filter(goal => {
      const progress = calculateProgress(goal.id);
      return progress.onTrack;
    }).length;

    const metrics: GoalMetrics = {
      totalGoals: state.goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
      onTrackGoals
    };

    dispatch({ type: 'UPDATE_METRICS', payload: metrics });
  };

  useEffect(() => {
    updateMetrics();
  }, [state.goals, state.contributions]);

  const value: GoalContextType = {
    state,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    calculateProgress,
    getGoalsByType,
    setError,
    clearError
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};