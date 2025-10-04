# Security Documentation

## Overview
This document outlines the security practices and configurations for this project.

## Authentication & Authorization

### User Roles System
- **Roles are stored in a separate `user_roles` table** (NOT in profiles or user metadata)
- Available roles: `admin`, `moderator`, `user` (defined as enum `app_role`)
- Role checking uses a security definer function `has_role(user_id, role)` to prevent RLS recursion issues

### Admin Users
- Initial admin: `thitichot@dit.daikin.co.jp`
- To add additional admins, run:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM public.profiles 
WHERE email = 'new-admin@example.com';
```

### Password Security
- Passwords must meet strength requirements (defined in `src/lib/validation.ts`):
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **IMPORTANT**: Enable "Leaked Password Protection" in your backend authentication settings to check passwords against known breach databases

## Rate Limiting

### Client-Side Rate Limiting
- Login attempts: 5 per 15 minutes
- Signup attempts: 3 per hour
- Implemented in `src/lib/validation.ts`

### Server-Side Rate Limiting
- Infrastructure exists in `supabase/functions/_shared/rateLimiter.ts`
- Rate limits are stored in `rate_limits` table
- Only service role (edge functions) can manage rate limits
- Authenticated users can only view their own rate limit records

## Row Level Security (RLS) Policies

All tables have RLS enabled. Key policies:

### profiles
- Users can view their own profile or if they're an admin
- Users can update their own profile
- Anonymous access is denied

### user_roles
- Users can view their own roles
- Only admins can manage roles
- Anonymous access is denied

### audit_logs
- Only admins can read audit logs
- All profile changes are automatically logged

### rate_limits
- Service role has full access (for edge functions)
- Authenticated users can view their own rate limits

### Market Data Tables (public read access)
- `market_prices`: Public read, service role insert
- `historical_exchange_rates`: Public read, admin insert
- `historical_lme_prices`: Public read, admin insert
- `historical_shfe_prices`: Public read, admin insert
- `monthly_market_averages`: Public read, admin insert/update
- `yearly_market_averages`: Public read, admin insert/update

## Edge Functions

### JWT Verification Status

**Functions requiring JWT (authenticated users only):**
- `import-excel-data` - Admin only, handles sensitive data imports

**Functions without JWT (public access):**
- `record-market-prices` - Automated data collection, runs on schedule
- `fetch-twelve-data` - Public market data fetching
- `get-realtime-price` - Public price queries
- `fetch-historical-data` - Public historical data
- `backfill-market-data` - Public data backfill
- `scrape-lme-prices` - Automated scraping
- `send-reset-password-email` - Password reset flow (intentionally public)
- `translate-text` - UI translation service

### Rate Limiting on Edge Functions
Public edge functions should implement rate limiting to prevent abuse. Use the `checkRateLimit` function from `supabase/functions/_shared/rateLimiter.ts`.

Example usage:
```typescript
import { checkRateLimit } from '../_shared/rateLimiter.ts';

const rateLimitResult = await checkRateLimit(
  supabaseUrl,
  supabaseKey,
  identifier, // IP address or user ID
  'action-name',
  maxAttempts, // e.g., 100
  windowMs // e.g., 60000 for 1 minute
);

if (!rateLimitResult.allowed) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429, headers: corsHeaders }
  );
}
```

## Input Validation

### Client-Side
- All user inputs are validated using Zod schemas (see `src/lib/validation.ts`)
- Inputs are sanitized to prevent XSS attacks
- Email validation, password strength checks, name format validation

### Server-Side
- Edge functions validate request bodies using Zod schemas
- Example: `import-excel-data` validates all Excel data before insertion
- Maximum request sizes are enforced

## Security Headers

Content Security Policy (CSP) directives are defined in `src/lib/security.ts`:
- Restricts script sources
- Prevents framing (clickjacking protection)
- Limits connection origins to self and Supabase

## Audit Logging

- All profile changes are automatically logged to `audit_logs` table
- Logs include: user_id, action, table_name, record_id, old_data, new_data
- Only admins can view audit logs

## Security Utilities

Located in `src/lib/security.ts`:
- `preventTimingAttack()` - Adds consistent delay to prevent timing attacks
- `generateSecureToken()` - Generates cryptographically secure random strings
- `verifyCsrfToken()` - Constant-time CSRF token comparison
- `isSuspiciousUserAgent()` - Detects bot/scraper user agents
- `sanitizeRedirectUrl()` - Prevents open redirect attacks

## Security Checklist for New Features

When adding new features:

1. ✅ Is RLS enabled on all new tables?
2. ✅ Are roles checked server-side (never client-side)?
3. ✅ Is user input validated with Zod schemas?
4. ✅ Are edge functions rate-limited if public?
5. ✅ Is JWT verification configured correctly?
6. ✅ Are sensitive operations logged to audit_logs?
7. ✅ Is data sanitized before display?
8. ✅ Are database queries parameterized (use Supabase client, never raw SQL)?

## Known Security Warnings

### Extension in Public Schema (Low Priority)
- Extensions are installed in `public` schema instead of dedicated schema
- This is a common configuration and poses minimal risk
- Consider moving to `extensions` schema in future refactor

## Backend Access

Users can access their backend management interface using the "View Backend" button in the application, which provides access to:
- Database tables and data
- Edge function logs
- Authentication settings
- Storage management

## Security Contact

For security issues or concerns, contact the development team immediately.

## Regular Security Tasks

- [ ] Review audit logs monthly
- [ ] Update dependencies quarterly
- [ ] Review RLS policies when adding new features
- [ ] Test rate limiting effectiveness
- [ ] Monitor edge function logs for suspicious activity
- [ ] Review and rotate admin access quarterly
