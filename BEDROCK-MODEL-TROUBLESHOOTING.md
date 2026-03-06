# Bedrock Model Troubleshooting Guide

## Issue: "The provided model identifier is invalid"

This error means the model ID you're trying to use isn't available in your AWS region or account.

## Solution: Use Available Models

### ✅ Recommended: Claude 3.5 Sonnet v2 (Most Widely Available)

This is the most stable and widely available model across all regions.

**Update your `backend/.env`:**

```env
BEDROCK_MODEL_ID_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MODEL_ID_HAIKU=anthropic.claude-3-5-haiku-20241022-v1:0
```

**Enable in AWS Console:**
1. Go to AWS Console → Amazon Bedrock
2. Click "Model access" → "Manage model access"
3. Enable: "Claude 3.5 Sonnet v2" and "Claude 3.5 Haiku"
4. Wait 2-5 minutes

## How to Find Available Models in Your Region

### Method 1: AWS Console (Easiest)

1. Go to AWS Console → Amazon Bedrock
2. Click "Model access" in the left sidebar
3. Click "Manage model access"
4. You'll see a list of ALL available models in your region
5. Look for Claude models and note their exact names

### Method 2: AWS CLI

```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude')].[modelId, modelName]" --output table
```

This will show you all Claude models available in us-east-1.

### Method 3: Check Model Availability by Region

Different regions have different model availability:

| Region | Claude 3.5 Sonnet v2 | Claude 3.7 Sonnet | Claude 4.6 Sonnet |
|--------|---------------------|-------------------|-------------------|
| us-east-1 | ✅ Yes | ⚠️ Maybe | ❓ Unknown |
| us-west-2 | ✅ Yes | ⚠️ Maybe | ❓ Unknown |
| eu-west-1 | ✅ Yes | ⚠️ Maybe | ❓ Unknown |
| ap-southeast-1 | ✅ Yes | ⚠️ Maybe | ❓ Unknown |

## Model ID Formats

### Standard Format (Most Common)
```
anthropic.claude-3-5-sonnet-20241022-v2:0
anthropic.claude-3-5-haiku-20241022-v1:0
```

### Cross-Region Format (Newer Models)
```
us.anthropic.claude-3-7-sonnet-20250219-v1:0
us.anthropic.claude-4-6-sonnet-20250514-v1:0
```

**Note**: The `us.` prefix indicates cross-region inference, which may not be available in all accounts.

## Step-by-Step Fix

### Step 1: Use Claude 3.5 Sonnet v2 (Guaranteed to Work)

Edit `backend/.env`:

```env
BEDROCK_MODEL_ID_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MODEL_ID_HAIKU=anthropic.claude-3-5-haiku-20241022-v1:0
```

### Step 2: Enable Models in AWS Console

1. AWS Console → Amazon Bedrock
2. Model access → Manage model access
3. Find and enable:
   - ✅ Claude 3.5 Sonnet v2
   - ✅ Claude 3.5 Haiku
4. Click "Save changes"
5. Wait 2-5 minutes

### Step 3: Verify

```bash
cd backend
node scripts/verify-aws-setup.js
```

Expected output:
```
✅ Bedrock connection successful
✅ Claude 3.5 Sonnet v2 accessible
```

## If You Want Newer Models

### Try Claude 3.7 Sonnet (If Available)

Check if it's available in AWS Console first, then:

```env
BEDROCK_MODEL_ID_SONNET=us.anthropic.claude-3-7-sonnet-20250219-v1:0
```

### Try Claude 4.6 Sonnet (If Available)

Check if it's available in AWS Console first, then:

```env
BEDROCK_MODEL_ID_SONNET=us.anthropic.claude-4-6-sonnet-20250514-v1:0
```

**Important**: Only use model IDs that appear in your AWS Console!

## Common Mistakes

### ❌ Wrong: Using Model IDs Not in Your Region
```env
BEDROCK_MODEL_ID_SONNET=us.anthropic.claude-4-6-sonnet-20260215-v1:0
```
Error: "The provided model identifier is invalid"

### ✅ Right: Using Available Model IDs
```env
BEDROCK_MODEL_ID_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0
```
Success: Model works!

## Model Comparison

### Claude 3.5 Sonnet v2 (Recommended for Now)
- ✅ Available in all regions
- ✅ Proven stable and reliable
- ✅ Excellent for healthcare applications
- ✅ Good performance/cost ratio
- ✅ Well-tested in production

### Claude 3.7 Sonnet (If Available)
- ⚠️ May not be available in all regions
- ✅ Better performance than 3.5
- ✅ More advanced reasoning
- ⚠️ Slightly higher cost

### Claude 4.6 Sonnet (If Available)
- ⚠️ Limited availability
- ✅ Best performance
- ✅ Latest features
- ⚠️ Higher cost
- ⚠️ May require special access

## Quick Fix Commands

```bash
# 1. Update .env to use Claude 3.5 Sonnet v2
cd backend
# Edit .env file and set:
# BEDROCK_MODEL_ID_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0

# 2. Verify it works
node scripts/verify-aws-setup.js

# 3. If still failing, check AWS Console for available models
# AWS Console → Bedrock → Model access
```

## Current Recommendation

**Use Claude 3.5 Sonnet v2** until you confirm newer models are available in your region:

```env
BEDROCK_MODEL_ID_SONNET=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_MODEL_ID_HAIKU=anthropic.claude-3-5-haiku-20241022-v1:0
```

This configuration:
- ✅ Works in all AWS regions
- ✅ Proven stable and reliable
- ✅ Excellent for healthcare AI
- ✅ No special access required
- ✅ Good performance

## Need Help?

1. Check AWS Console → Bedrock → Model access to see available models
2. Use the model IDs exactly as shown in AWS Console
3. Make sure models are enabled (green checkmark)
4. Wait 2-5 minutes after enabling
5. Run verification script again

## Summary

**Current Issue**: Claude 4.6 model ID not recognized
**Solution**: Use Claude 3.5 Sonnet v2 (widely available)
**Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
**Status**: Stable, production-ready, works everywhere

You can upgrade to newer models later when they become available in your region!
