const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');
const { invokeBedrockWithFallback, HEALTHCARE_GUARDRAILS } = require('./aiEngineService');
const { createNotification } = require('./notificationService');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const CHAT_DRAFTS_TABLE = dynamoDBConfig.tables.chatDrafts;

/**
 * Submit a health question and generate AI draft
 */
async function submitQuestion(userId, question) {
  // Generate AI draft response with guardrails
  const prompt = `A patient asks: "${question}"\n\nProvide a helpful, patient-friendly response.`;
  
  const aiResponse = await invokeBedrockWithFallback(prompt, HEALTHCARE_GUARDRAILS);

  // Store draft in DynamoDB with status "pending_review"
  const draftId = uuidv4();
  const draft = {
    draftId,
    userId,
    question,
    aiResponse: aiResponse.text,
    model: aiResponse.model,
    status: 'pending_review',
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: CHAT_DRAFTS_TABLE,
    Item: draft
  });

  await docClient.send(command);

  // Create notification for clinician review
  await createNotification({
    userId: 'CLINICIAN_POOL', // Special ID for clinician notifications
    type: 'system_update',
    message: `New chat draft pending review from patient ${userId}`
  });

  return {
    draftId,
    status: 'pending_review',
    message: 'Your question has been submitted. A clinician will review the AI response shortly.'
  };
}

/**
 * Get draft response status
 */
async function getDraftResponse(draftId, userId) {
  const command = new GetCommand({
    TableName: CHAT_DRAFTS_TABLE,
    Key: { draftId }
  });

  const response = await docClient.send(command);
  
  if (!response.Item) {
    throw new Error('Draft not found');
  }

  const draft = response.Item;

  // Verify user owns this draft
  if (draft.userId !== userId) {
    throw new Error('Unauthorized access to draft');
  }

  if (draft.status === 'approved') {
    return {
      status: 'approved',
      question: draft.question,
      response: draft.aiResponse,
      editedResponse: draft.editedResponse || null,
      clinicianNotes: draft.clinicianNotes || null,
      reviewedAt: draft.reviewedAt,
      reviewedBy: draft.reviewedBy
    };
  }

  if (draft.status === 'rejected') {
    return {
      status: 'rejected',
      message: 'The response was rejected by the clinician. A new draft is being generated.'
    };
  }

  return {
    status: 'pending_review',
    message: 'Your response is awaiting clinician review.'
  };
}

/**
 * Review and approve/reject draft (clinician only)
 */
async function reviewDraft(draftId, clinicianId, action, editedResponse = null, clinicianNotes = null) {
  if (action !== 'approve' && action !== 'reject') {
    throw new Error('Action must be "approve" or "reject"');
  }

  const getCommand = new GetCommand({
    TableName: CHAT_DRAFTS_TABLE,
    Key: { draftId }
  });

  const response = await docClient.send(getCommand);
  
  if (!response.Item) {
    throw new Error('Draft not found');
  }

  const draft = response.Item;

  if (action === 'approve') {
    // Prepare update expression
    let updateExpression = 'SET #status = :status, reviewedBy = :reviewedBy, reviewedAt = :reviewedAt';
    const expressionAttributeNames = { '#status': 'status' };
    const expressionAttributeValues = {
      ':status': 'approved',
      ':reviewedBy': clinicianId,
      ':reviewedAt': new Date().toISOString()
    };

    // Add edited response if provided
    if (editedResponse) {
      updateExpression += ', editedResponse = :editedResponse';
      expressionAttributeValues[':editedResponse'] = editedResponse;
    }

    // Add clinician notes if provided
    if (clinicianNotes) {
      updateExpression += ', clinicianNotes = :clinicianNotes';
      expressionAttributeValues[':clinicianNotes'] = clinicianNotes;
    }

    const updateCommand = new UpdateCommand({
      TableName: CHAT_DRAFTS_TABLE,
      Key: { draftId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    });

    await docClient.send(updateCommand);

    // Notify patient
    await createNotification({
      userId: draft.userId,
      type: 'system_update',
      message: 'Your health question has been answered. Check your chat for the response.'
    });

    return { message: 'Draft approved and delivered to patient' };
  } else {
    // Reject and trigger new generation
    const updateCommand = new UpdateCommand({
      TableName: CHAT_DRAFTS_TABLE,
      Key: { draftId },
      UpdateExpression: 'SET #status = :status, reviewedBy = :reviewedBy, reviewedAt = :reviewedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'rejected',
        ':reviewedBy': clinicianId,
        ':reviewedAt': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);

    // Generate new draft
    await submitQuestion(draft.userId, draft.question);

    return { message: 'Draft rejected. New draft generated for review.' };
  }
}

module.exports = {
  submitQuestion,
  getDraftResponse,
  reviewDraft
};
