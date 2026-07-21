# AN Technologies - Monetization System

## Overview

The AN Technologies platform now includes a complete, production-ready monetization system that enforces tier-based access to features and manages subscriptions through LemonSqueezy.

## Tiers

### FREE Tier
- **Price**: $0/month
- **Features**:
  - Access to 20 utility tools (PDF, QR, JSON Formatter, etc.)
  - 3 uses per day per tool (enforced)
  - Community support via knowledge base
- **Restrictions**:
  - Cannot access any business apps
  - Daily usage limits enforced
  - Limited to utility tools only

### PRO Tier
- **Price**: $29/month
- **Features**:
  - All 36 business apps (CRM, Sales Pipeline, Invoicing, etc.)
  - Unlimited usage of all tools
  - Unlimited business app access
  - Priority email support
  - Custom branding options
- **Recommended For**: Freelancers, small teams, growing businesses

### BUSINESS Tier
- **Price**: $99/month
- **Features**:
  - Everything in PRO
  - Team seats (5 users)
  - Advanced analytics
  - API access
  - Dedicated 24/7 support
  - Priority feature requests
- **Recommended For**: Enterprises, large teams, advanced use cases

## Architecture

### Database Models
- **Subscription**: Tracks user's tier, status, and LemonSqueezy subscription ID
- **ToolUsage**: Tracks daily usage of free tier tools (enforced via ToolUsage.userId_tool_date unique constraint)
- **Entitlement**: Future model for marketplace-based features (already in schema)

### Key Files

#### API Routes
- `/api/billing/current` - Returns current subscription info
- `/api/billing/invoices` - Fetches invoices from LemonSqueezy
- `/api/lemonsqueezy/checkout` - Initiates checkout
- `/api/lemonsqueezy/webhook` - Handles subscription status changes

All business app routes:
- Check tier after authentication
- Reject FREE tier with 403 error
- Allow PRO and BUSINESS tiers

#### Pages
- `/billing` - Comprehensive billing dashboard
- `/pricing` - Pricing and feature comparison page
- Business app pages - Show UpgradePrompt to FREE tier users

#### Components
- `UpgradePrompt` - Shows when FREE tier user tries business app
- `TierBadge` - Displays current tier in navigation
- `FreeTierNotice` - Shows usage limits on tools
- `LimitReachedBanner` - Shows when daily limit exceeded

#### Hooks & Utilities
- `useTier()` - React hook to get current user's tier
- `checkAndRecordUsage()` - Enforces and records tool usage
- `requireBusinessTier()` - API middleware for tier checks
- `getUserTier()` - Server-side tier lookup

### Libraries
- **LemonSqueezy**: Payment processing via `/src/lib/lemonsqueezy.ts`
  - Requires: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_PRO`, `LEMONSQUEEZY_VARIANT_BUSINESS`
  - Webhook: `LEMONSQUEEZY_WEBHOOK_SECRET`

## User Flows

### Signup → Free Trial
1. User creates account
2. Subscription row created with tier=FREE, status=ACTIVE
3. User sees "Free Plan" badge in nav
4. Can use 20 utility tools with 3 uses/day limit
5. Cannot access business apps (sees UpgradePrompt)

### Upgrade Flow
1. User clicks upgrade button on pricing page or UpgradePrompt
2. Redirected to LemonSqueezy checkout
3. After payment, LemonSqueezy calls webhook
4. Webhook updates Subscription tier to PRO/BUSINESS
5. User immediately gains access to business apps
6. Tier badge updates in nav

### Subscription Status Changes
Via LemonSqueezy webhook:
- `subscription_created` - User purchases first time
- `subscription_updated` - Plan change or renewal
- `subscription_cancelled` - User cancels, tier reverts to FREE

## Enforcement

### API Level (Backend)
- Every business app route checks `requireBusinessTier()`
- Returns 403 Forbidden if tier is FREE
- Checked after authentication but before business logic

### UI Level (Frontend)
- 26 business app pages check tier before rendering
- FREE tier users see UpgradePrompt instead
- Links direct to `/billing` for upgrade
- Navbar shows tier badge so users know their status

### Tool Usage (Free Tier)
- Each tool call checks `canUseTool()`
- Tool usage tracked per user per day in ToolUsage table
- 3 uses/day limit enforced
- 402 Payment Required response when limit exceeded
- LimitReachedBanner shows UI feedback

## Configuration

### Environment Variables Required
```
LEMONSQUEEZY_API_KEY=sk_live_... or sk_test_...
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_VARIANT_PRO=var_xxx
LEMONSQUEEZY_VARIANT_BUSINESS=var_yyy
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Webhook Configuration
In LemonSqueezy dashboard:
1. Add webhook URL: `https://yourdomain.com/api/lemonsqueezy/webhook`
2. Select events: `subscription_created`, `subscription_updated`, `subscription_cancelled`
3. Copy webhook secret to `LEMONSQUEEZY_WEBHOOK_SECRET`

## Testing

### Test Checkout Flow
1. Use LemonSqueezy test keys (sk_test_...)
2. Variant IDs from test environment
3. Use test credit card: 4111 1111 1111 1111 (expiry: any future date, CVV: 123)
4. Webhook testing: Use LemonSqueezy's test webhook sender or curl

### Test Tier Enforcement
```bash
# Test FREE tier rejection
curl -X GET http://localhost:3000/api/crm \
  -H "Authorization: Bearer <test_token>"
# Should return 403: "This feature requires a Pro or Business plan"

# Test usage limits
curl -X POST http://localhost:3000/api/tools/usage \
  -H "Content-Type: application/json" \
  -d '{"tool":"base64"}'
# Fourth call should return 402: Payment Required
```

## Future Enhancements

1. **Advanced Analytics**: Per-user dashboards showing usage stats
2. **Custom Pricing**: Allow tiers with custom feature sets
3. **Trial Management**: Automatic FREE → trial → paid flow
4. **Dunning Management**: Auto-retry failed payments
5. **Usage-Based Billing**: Charge based on actual usage
6. **Team Management**: Multi-user seats for PRO/BUSINESS
7. **API Rate Limits**: Enforce per tier (e.g., 100 req/min for FREE)
8. **Data Retention**: Different retention policies per tier

## Deployment Checklist

- [ ] Set LemonSqueezy environment variables
- [ ] Configure webhook in LemonSqueezy
- [ ] Test checkout flow end-to-end
- [ ] Test tier rejection on business apps
- [ ] Test tool usage limits
- [ ] Verify email notifications work (LemonSqueezy sends)
- [ ] Set up monitoring for webhook failures
- [ ] Create support documentation
- [ ] Train support team on tier features
- [ ] Monitor first few days for issues

## Troubleshooting

### Tier Not Updating After Purchase
1. Check webhook is configured correctly
2. Check LEMONSQUEEZY_WEBHOOK_SECRET is correct
3. Check webhook logs in LemonSqueezy dashboard
4. Manually test webhook: POST to /api/lemonsqueezy/webhook with test payload

### User Still Sees FREE Tier After Upgrade
1. Clear browser cache
2. Session may be cached - sign out and back in
3. Check database subscription record was created/updated
4. Verify /api/tools/tier returns correct tier

### Tools Show Usage Limit Even for Paid Users
1. Check ToolUsage table for stale entries
2. Verify user has PRO or BUSINESS tier in Subscription table
3. Check canUseTool() returns correct tier

## Support

For issues with the monetization system:
1. Check environment variables are set
2. Verify LemonSqueezy configuration
3. Check webhook delivery in LemonSqueezy dashboard
4. Review database subscription records
5. Check browser console for client-side errors
