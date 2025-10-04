import { createClient } from '@supabase/supabase-js';

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
}

export async function checkRateLimit(
  supabaseUrl: string,
  supabaseKey: string,
  identifier: string,
  action: string,
  maxAttempts: number = 100,
  windowMs: number = 60000 // 1 minute default
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const windowStart = new Date(Date.now() - windowMs);

  try {
    // Get existing rate limit record
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open for availability
    }

    if (!data) {
      // First attempt - create record
      await supabase.from('rate_limits').insert({
        identifier,
        action,
        attempts: 1,
        window_start: new Date(),
      });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    const recordWindowStart = new Date(data.window_start);
    
    // Check if window has expired
    if (recordWindowStart < windowStart) {
      // Reset window
      await supabase
        .from('rate_limits')
        .update({
          attempts: 1,
          window_start: new Date(),
          blocked_until: null,
        })
        .eq('identifier', identifier)
        .eq('action', action);
      
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    // Check if currently blocked
    if (data.blocked_until && new Date(data.blocked_until) > new Date()) {
      const retryAfter = Math.ceil((new Date(data.blocked_until).getTime() - Date.now()) / 1000);
      return { allowed: false, retryAfter };
    }

    // Check if limit exceeded
    if (data.attempts >= maxAttempts) {
      const blockedUntil = new Date(Date.now() + windowMs);
      await supabase
        .from('rate_limits')
        .update({ blocked_until: blockedUntil })
        .eq('identifier', identifier)
        .eq('action', action);
      
      return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };
    }

    // Increment attempts
    await supabase
      .from('rate_limits')
      .update({ attempts: data.attempts + 1 })
      .eq('identifier', identifier)
      .eq('action', action);

    return { allowed: true, remaining: maxAttempts - data.attempts - 1 };
  } catch (error) {
    console.error('Rate limiter error:', error);
    return { allowed: true }; // Fail open for availability
  }
}
