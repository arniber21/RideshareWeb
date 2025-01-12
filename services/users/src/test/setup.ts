import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

let testDataSource: DataSource;

beforeAll(async () => {
  // Create a test database connection
  testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'avec_users_test',
    entities: [User],
    synchronize: true,
    dropSchema: true // Drop and recreate schema for each test run
  });

  await testDataSource.initialize();
  
  // Make the test database connection available globally
  (global as any).testDataSource = testDataSource;
});

afterAll(async () => {
  // Close database connection after all tests
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  // Clear all tables before each test
  const entities = testDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.clear();
  }
}); 