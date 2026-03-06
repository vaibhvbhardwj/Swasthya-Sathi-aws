require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { awsConfig, dynamoDBConfig } = require('../config/aws');

const client = new DynamoDBClient(awsConfig);

const tableDefinitions = [
  {
    TableName: dynamoDBConfig.tables.users,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: dynamoDBConfig.tables.doctors,
    KeySchema: [
      { AttributeName: 'doctorId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'doctorId', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: dynamoDBConfig.tables.consultations,
    KeySchema: [
      { AttributeName: 'consultationId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'consultationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: dynamoDBConfig.tables.notifications,
    KeySchema: [
      { AttributeName: 'notificationId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'notificationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: dynamoDBConfig.tables.medications,
    KeySchema: [
      { AttributeName: 'medicationId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'medicationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: dynamoDBConfig.tables.chatDrafts,
    KeySchema: [
      { AttributeName: 'draftId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'draftId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'LabReports',
    KeySchema: [
      { AttributeName: 'reportId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'reportId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

async function setupDynamoDB() {
  try {
    console.log('🔍 Checking existing tables...');
    const listCommand = new ListTablesCommand({});
    const { TableNames } = await client.send(listCommand);
    
    console.log('📋 Existing tables:', TableNames);
    
    for (const tableDef of tableDefinitions) {
      if (TableNames.includes(tableDef.TableName)) {
        console.log(`✅ Table ${tableDef.TableName} already exists`);
      } else {
        console.log(`🔨 Creating table ${tableDef.TableName}...`);
        const createCommand = new CreateTableCommand(tableDef);
        await client.send(createCommand);
        console.log(`✅ Table ${tableDef.TableName} created successfully`);
      }
    }
    
    console.log('\n✅ DynamoDB setup complete!');
  } catch (error) {
    console.error('❌ Error setting up DynamoDB:', error);
    throw error;
  }
}

setupDynamoDB();
