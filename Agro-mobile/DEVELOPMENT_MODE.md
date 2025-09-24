# Development Mode Guide

## Overview

This app includes a development mode that automatically bypasses RevenueCat payments when running in development, allowing you to test subscription features without requiring actual payments.

## How It Works

### Automatic Detection

- **Development Mode**: Automatically enabled when running with `npx expo start` (development build)
- **Production Mode**: Automatically enabled when running production builds

### What Gets Bypassed in Development

✅ **RevenueCat API calls** - No actual API requests to RevenueCat  
✅ **Payment processing** - No real payment flows  
✅ **Subscription validation** - Mock subscription data provided  
✅ **Purchase listeners** - No real-time subscription updates

### What Still Works in Development

✅ **All app features** - Full functionality available  
✅ **Subscription UI** - All subscription-related components work  
✅ **Pro features** - Access to premium features  
✅ **Mock data** - Realistic subscription data for testing

## Console Logs

When in development mode, you'll see these logs:

```
🚀 DEVELOPMENT MODE: Bypassing RevenueCat payments
🎯 Mock subscription data enabled
Development Mode: ON - Payments Bypassed
```

## Testing Subscription Features

### 1. Start Development Server

```bash
cd Agro-mobile
npx expo start
```

### 2. Test Pro Features

- All premium features will be available
- Subscription status will show as active
- No payment prompts will appear

### 3. Switch to Production Mode

- Build a production version with `eas build`
- Or use `npx expo start --no-dev` for production-like testing

## Configuration

The development mode is controlled by the `__DEV__` global variable in React Native, which is:

- `true` when running development builds
- `false` when running production builds

## Customization

You can modify the development behavior in:

- `config/development.js` - Development settings
- `hooks/useRevenueCat.tsx` - Mock data structure

## Troubleshooting

### Development Mode Not Working

1. Ensure you're running `npx expo start` (not production build)
2. Check console logs for development mode messages
3. Verify the `config/development.js` file exists

### Mock Data Issues

1. Check the mock subscription structure in `useRevenueCat.tsx`
2. Ensure all required CustomerInfo properties are included
3. Verify TypeScript types are correct
