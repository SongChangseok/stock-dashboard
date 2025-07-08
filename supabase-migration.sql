-- Supabase Database Schema for Stock Dashboard
-- This file contains the database schema needed to replace Firebase Firestore

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_value DECIMAL(15,2) DEFAULT 0,
    daily_change DECIMAL(15,2) DEFAULT 0,
    daily_change_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on portfolios table
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON public.portfolios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios" ON public.portfolios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON public.portfolios
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON public.portfolios
    FOR DELETE USING (auth.uid() = user_id);

-- Stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
    id SERIAL PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    avg_price DECIMAL(15,2) NOT NULL,
    current_price DECIMAL(15,2) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    gain DECIMAL(15,2) NOT NULL,
    gain_percent DECIMAL(5,2) NOT NULL,
    sector TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stocks table
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Stocks policies
CREATE POLICY "Users can view own stocks" ON public.stocks
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.portfolios WHERE id = portfolio_id
        )
    );

CREATE POLICY "Users can create stocks in own portfolios" ON public.stocks
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.portfolios WHERE id = portfolio_id
        )
    );

CREATE POLICY "Users can update own stocks" ON public.stocks
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.portfolios WHERE id = portfolio_id
        )
    );

CREATE POLICY "Users can delete own stocks" ON public.stocks
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.portfolios WHERE id = portfolio_id
        )
    );

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Portfolio shares table (for sharing functionality)
CREATE TABLE IF NOT EXISTS public.portfolio_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    share_id TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on portfolio_shares table
ALTER TABLE public.portfolio_shares ENABLE ROW LEVEL SECURITY;

-- Portfolio shares policies
CREATE POLICY "Users can view own shares" ON public.portfolio_shares
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares" ON public.portfolio_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares" ON public.portfolio_shares
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares" ON public.portfolio_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Public portfolios table (for public sharing)
CREATE TABLE IF NOT EXISTS public.public_portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    total_value DECIMAL(15,2) DEFAULT 0,
    daily_change DECIMAL(15,2) DEFAULT 0,
    daily_change_percent DECIMAL(5,2) DEFAULT 0,
    stocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_public BOOLEAN DEFAULT TRUE,
    share_url TEXT,
    share_id TEXT UNIQUE NOT NULL,
    view_count INTEGER DEFAULT 0,
    shared_by JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on public_portfolios table
ALTER TABLE public.public_portfolios ENABLE ROW LEVEL SECURITY;

-- Public portfolios policies (readable by all, manageable by owner)
CREATE POLICY "Anyone can view public portfolios" ON public.public_portfolios
    FOR SELECT USING (is_public = TRUE);

-- Portfolio history table (for tracking performance over time)
CREATE TABLE IF NOT EXISTS public.portfolio_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    snapshot_date TIMESTAMPTZ DEFAULT NOW(),
    total_value DECIMAL(15,2) NOT NULL,
    daily_change DECIMAL(15,2) NOT NULL,
    daily_change_percent DECIMAL(5,2) NOT NULL,
    stocks_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on portfolio_history table
ALTER TABLE public.portfolio_history ENABLE ROW LEVEL SECURITY;

-- Portfolio history policies
CREATE POLICY "Users can view own portfolio history" ON public.portfolio_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolio history" ON public.portfolio_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio history" ON public.portfolio_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio history" ON public.portfolio_history
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_portfolio_id ON public.stocks(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_user_id ON public.portfolio_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_share_id ON public.portfolio_shares(share_id);
CREATE INDEX IF NOT EXISTS idx_public_portfolios_share_id ON public.public_portfolios(share_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_portfolio_id ON public.portfolio_history(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_user_id ON public.portfolio_history(user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_portfolios_updated_at
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_stocks_updated_at
    BEFORE UPDATE ON public.stocks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_portfolio_shares_updated_at
    BEFORE UPDATE ON public.portfolio_shares
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_public_portfolios_updated_at
    BEFORE UPDATE ON public.public_portfolios
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.email_confirmed_at IS NOT NULL,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();