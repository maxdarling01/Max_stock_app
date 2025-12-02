import { supabase } from '../lib/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'none' | 'basic' | 'pro' | 'elite' | 'legendary';
  downloads_remaining: number;
  downloads_used_this_month: number;
  subscription_status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

const PLAN_DOWNLOADS: Record<string, number> = {
  basic: 7,
  pro: 15,
  elite: 30,
  legendary: 999999,
};

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as Subscription;
}

export async function checkAndResetDownloads(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.plan_type === 'none') {
    return;
  }

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);

  if (now > periodEnd) {
    const planDownloads = PLAN_DOWNLOADS[subscription.plan_type];
    const maxRollover = subscription.plan_type === 'pro' ? 30 : subscription.plan_type === 'elite' ? 60 : 0;

    let newDownloadsRemaining = planDownloads;

    if (subscription.plan_type === 'pro' || subscription.plan_type === 'elite') {
      newDownloadsRemaining = Math.min(
        subscription.downloads_remaining + planDownloads,
        maxRollover
      );
    }

    const newPeriodStart = now;
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        downloads_remaining: newDownloadsRemaining,
        downloads_used_this_month: 0,
        current_period_start: newPeriodStart.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting downloads:', error);
    }
  }
}

export async function decrementDownloads(userId: string): Promise<boolean> {
  try {
    await checkAndResetDownloads(userId);

    const subscription = await getUserSubscription(userId);

    if (!subscription || subscription.plan_type === 'none') {
      return false;
    }

    if (subscription.plan_type === 'legendary') {
      return true;
    }

    if (subscription.downloads_remaining <= 0) {
      return false;
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        downloads_remaining: subscription.downloads_remaining - 1,
        downloads_used_this_month: subscription.downloads_used_this_month + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error decrementing downloads:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in decrementDownloads:', error);
    return false;
  }
}

export async function createDefaultSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_type: 'none',
      downloads_remaining: 0,
      downloads_used_this_month: 0,
      subscription_status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating default subscription:', error);
    return null;
  }

  return data as Subscription;
}
