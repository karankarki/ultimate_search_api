const dotenv = require('dotenv');
dotenv.config();

const db = require('./src/models/db');
const bcrypt = require('bcryptjs');

const ITEMS_COUNT = 20000;

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
  'Update Dependencies',
  'Implement Caching',
  'Add Logging',
  'Create Backup',
  'CI/CD Pipeline',
  'API Documentation',
  'Mobile App',
  'Database Migration',
  'User Dashboard',
  'Analytics Setup',
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
  'Upgrade framework version',
  'Implement Redis caching layer',
  'Add error logging system',
  'Create disaster recovery plan',
  'Set up GitHub Actions workflow',
];

async function seedUserItems() {
  try {
    console.log('🌱 Starting to seed 20,000 items for karan@gmail.com...');

    // Create or get user
    let userId;
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      ['karan@gmail.com']
    );

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log('✓ Found existing user: karan@gmail.com');
      
      // Clear existing items for this user
      const result = await db.query(
        'DELETE FROM items WHERE user_id = $1',
        [userId]
      );
      console.log(`✓ Cleared ${result.rowCount} existing items`);
    } else {
      const passwordHash = await bcrypt.hash('password123', 10);
      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        ['karan@gmail.com', passwordHash]
      );
      userId = result.rows[0].id;
      console.log('✓ Created new user: karan@gmail.com');
    }

    console.log(`\nInserting ${ITEMS_COUNT} items for user ${userId}...`);

    // Batch insert items
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < ITEMS_COUNT; i += batchSize) {
      const batch = [];
      const values = [];
      let paramIndex = 1;

      for (let j = 0; j < batchSize && i + j < ITEMS_COUNT; j++) {
        const title = `${titles[Math.floor(Math.random() * titles.length)]} #${i + j + 1}`;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        batch.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
        values.push(userId, title, description);
        paramIndex += 3;
      }

      if (batch.length > 0) {
        const query = `INSERT INTO items (user_id, title, description) VALUES ${batch.join(', ')}`;
        await db.query(query, values);
        insertedCount += batch.length;
        console.log(`✓ Inserted ${insertedCount}/${ITEMS_COUNT} items`);
      }
    }

    console.log(`\n✅ Done!`);
    console.log(`   - Items created: ${ITEMS_COUNT}`);
    console.log(`   - User: karan@gmail.com`);
    console.log(`   - Password: password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedUserItems();
