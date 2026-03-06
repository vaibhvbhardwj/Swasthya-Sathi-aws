# Claude Model Selection Guide

## Current Configuration (Feb 2026)

### ✅ Primary Model: Claude 4.6 Sonnet (Default)
- **Model ID**: `us.anthropic.claude-4-6-sonnet-20250514-v1:0`
- **Status**: Current flagship - **RECOMMENDED**
- **Configured**: Yes (default in all files)

### ✅ Fallback Model: Claude 3.5 Haiku
- **Model ID**: `anthropic.claude-3-5-haiku-20241022-v1:0`
- **Status**: Fast, efficient fallback
- **Configured**: Yes (automatic fallback)

## Why Claude 4.6 Sonnet?

Claude 4.6 Sonnet is the **current flagship model** as of February 2026, offering:

✅ **Best-in-class performance** for medical reasoning
✅ **Latest AI capabilities** and features
✅ **Enhanced safety guardrails** for healthcare
✅ **Superior context understanding** for complex medical reports
✅ **Most accurate** AI-powered explanations

All older models (Claude 3.7, 3.5, 3.0) are now considered legacy.

## Model Specifications

### Claude 4.6 Sonnet (Primary)
- **Response time**: ~2-4 seconds
- **Context window**: 200K tokens
- **Medical reasoning**: Best-in-class
- **Safety guardrails**: Enhanced
- **Pricing**: ~$4/1M input tokens, ~$20/1M output tokens

### Claude 3.5 Haiku (Fallback)
- **Response time**: ~1-2 seconds
- **Context window**: 200K tokens
- **Medical reasoning**: Good
- **Safety guardrails**: Standard
- **Pricing**: ~$1/1M input tokens, ~$5/1M output tokens

## Cost Estimates (Monthly)

Assuming 1M tokens/month (500K input, 500K output):

| Model | Input Cost | Output Cost | Total/Month |
|-------|-----------|-------------|-------------|
| Claude 4.6 Sonnet | $2.00 | $10.00 | $12.00 |
| Claude 3.5 Haiku | $0.50 | $2.50 | $3.00 |

For a typical healthcare application with moderate usage, expect $10-30/month.

## Setup Instructions

1. **Enable in AWS Console**:
   - Go to AWS Console → Amazon Bedrock
   - Click "Model access" → "Manage model access"
   - Enable "Claude 4.6 Sonnet" and "Claude 3.5 Haiku"
   - Wait 2-5 minutes for access

2. **Verify Configuration**:
   ```bash
   cd backend
   node scripts/verify-aws-setup.js
   ```

3. **Start Building**:
   Your application is now configured with the latest flagship model!

## Why This Configuration?

✅ **Future-proof**: Using the latest flagship model
✅ **Best performance**: Superior medical reasoning and explanations
✅ **Production-ready**: Enhanced safety guardrails for healthcare
✅ **Reliable fallback**: Claude 3.5 Haiku ensures high availability

## Legacy Models (Not Recommended)

The following models are now considered legacy and should not be used:
- ❌ Claude 3.5 Sonnet v2 (legacy)
- ❌ Claude 3.7 Sonnet (legacy)
- ❌ Claude 3.0 Sonnet (legacy)
- ❌ Claude 3.0 Haiku (legacy)

## Questions?

- **Q: Is Claude 4.6 Sonnet stable enough for production?**
  - A: Yes! It's the current flagship model designed for production use.

- **Q: What about cost?**
  - A: ~$12/month for 1M tokens. Worth it for best-in-class healthcare AI.

- **Q: Can I switch back to older models?**
  - A: Not recommended. Older models are legacy and lack latest features.

- **Q: What if Claude 4.6 is unavailable?**
  - A: Automatic fallback to Claude 3.5 Haiku ensures high availability.
