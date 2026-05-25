const dotenv = require('dotenv');
dotenv.config();

const db = require('./src/models/db');
const bcrypt = require('bcryptjs');

const DUMMY_ITEMS_COUNT = 10000;
const DUMMY_USERS_COUNT = 10;

const titles = [
  'Learn React',
  'Build API',
  'Database Design',
  'Authentication',
  'Deployment',
  'Testing',
  'Documentation',
  'Bug Fix',
  'Feature Request',
  'Performance Optimization',
  'Code Refactor',
  'Security Audit',
  'Team Meeting',
  'Client Feedback',
  'Project Planning',
];

const descriptions = [
  'Complete the tutorial and build a small project',
  'Implement REST endpoints for the application',
  'Design database schema for scalability',
  'Add JWT-based authentication',
  'Deploy to production server',
  'Write unit and integration tests',
  'Create comprehensive API documentation',
  'Fix critical bug in payment processing',
  'Add dark mode feature',
  'Optimize database queries',
  'Clean up legacy code',
  'Perform security penetration test',
  'Discuss project roadmap',
  'Incorporate user feedback',
  'Plan sprint for next quarter',
  'Update dependencies',
  'Implement caching layer',
  'Add logging and monitoring',
  'Create backup strategy',
  'Set up CI/CD pipeline',
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log(`Creating ${DUMMY_USERS_COUNT} dummy users...`);

    // Clear existing data
    await db.query('DELETE FROM items');
    await db.query('DELETE FROM users');

    // Create dummy users
    const userIds = [];
    for (let i = 1; i <= DUMMY_USERS_COUNT; i++) {
      const email = `user${i}@example.com`;
      const passwordHash = await bcrypt.hash('password123', 10);

      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [email, passwordHash]
      );
      userIds.push(result.rows[0].id);
      console.log(`✓ Created user: ${email}`);
    }

    console.log(`\nCreating ${DUMMY_ITEMS_COUNT} dummy items...`);

    // Batch insert items for performance
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < DUMMY_ITEMS_COUNT; i += batchSize) {
      const batch = [];
      const values = [];
      let paramIndex = 1;

      for (let j = 0; j < batchSize && i + j < DUMMY_ITEMS_COUNT; j++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const title = `${titles[Math.floor(Math.random() * titles.length)]} #${i + j + 1}`;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        batch.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`
        );
        values.push(userId, title, description);
        paramIndex += 3;
      }

      if (batch.length > 0) {
        const query = `INSERT INTO items (user_id, title, description) VALUES ${batch.join(', ')}`;
        await db.query(query, values);
        insertedCount += batch.length;
        console.log(`✓ Inserted ${insertedCount}/${DUMMY_ITEMS_COUNT} items`);
      }
    }

    console.log(`\n✅ Database seeding complete!`);
    console.log(`   - Users created: ${DUMMY_USERS_COUNT}`);
    console.log(`   - Items created: ${DUMMY_ITEMS_COUNT}`);
    console.log(`\nTest account credentials:`);
    console.log(`   Email: user1@example.com`);
    console.log(`   Password: password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
