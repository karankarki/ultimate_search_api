const dotenv = require('dotenv');
dotenv.config();

const db = require('./src/models/db');

const ITEMS_COUNT = 10000000;
const USER_ID = 22;

const titles =  [
  // Frontend
  'Learn React',
  'Learn Next.js',
  'Build Portfolio',
  'Responsive Navbar',
  'React Hooks',
  'Redux Setup',
  'Tailwind CSS',
  'State Management',
  'Frontend Optimization',
  'UI Components',

  // Backend
  'Build API',
  'Node.js Authentication',
  'JWT Login',
  'Role Based Auth',
  'Express Middleware',
  'Rate Limiting',
  'Redis Cache',
  'Session Management',
  'Backend Architecture',
  'REST API Design',

  // Database
  'Database Design',
  'PostgreSQL Queries',
  'MongoDB Aggregation',
  'Database Migration',
  'SQL Optimization',
  'Index Optimization',
  'Schema Design',
  'Database Scaling',
  'Partition Tables',
  'Connection Pooling',

  // DevOps
  'Docker Setup',
  'CI/CD Pipeline',
  'Kubernetes Basics',
  'Nginx Reverse Proxy',
  'AWS Deployment',
  'Cloud Monitoring',
  'Load Balancer Setup',
  'Infrastructure Scaling',
  'GitHub Actions',
  'Server Configuration',

  // Security
  'Security Audit',
  'OAuth Integration',
  'CSRF Protection',
  'XSS Prevention',
  'Password Encryption',
  'API Security',
  'Input Validation',
  'SQL Injection Prevention',
  'HTTPS Setup',
  'Access Control',

  // Testing
  'Unit Testing',
  'Integration Testing',
  'API Testing',
  'Performance Testing',
  'Load Testing',
  'Stress Testing',
  'Bug Fix',
  'Regression Testing',
  'Jest Setup',
  'E2E Testing',

  // Mobile
  'Flutter Basics',
  'Flutter State Management',
  'Mobile App UI',
  'Push Notifications',
  'App Performance',
  'Android Optimization',
  'iOS Deployment',
  'Flutter Firebase',
  'Mobile Authentication',
  'Offline Sync',

  // AI/ML
  'AI Chatbot',
  'TensorFlow Setup',
  'Machine Learning Model',
  'Recommendation Engine',
  'OpenAI API',
  'NLP Processing',
  'Image Recognition',
  'AI Search',
  'Voice Assistant',
  'Data Analysis',

  // Product/Business
  'Feature Request',
  'Client Feedback',
  'User Dashboard',
  'Analytics Setup',
  'Project Planning',
  'Sprint Planning',
  'Product Roadmap',
  'Customer Research',
  'Business Metrics',
  'Team Meeting',

  // Productivity
  'Documentation',
  'Code Refactor',
  'Update Dependencies',
  'Create Backup',
  'Add Logging',
  'Task Management',
  'Team Collaboration',
  'Performance Optimization',
  'Email Integration',
  'Search Feature',

  // E-commerce
  'Payment Gateway',
  'Shopping Cart',
  'Order Tracking',
  'Inventory Management',
  'Product Recommendation',
  'Coupon System',
  'Checkout Flow',
  'Wishlist Feature',
  'Cart Optimization',
  'User Reviews',

  // Social/Chat
  'Chat Application',
  'Socket.IO Setup',
  'Group Messaging',
  'Video Calling',
  'Real Time Updates',
  'Notification System',
  'Friend Request',
  'Social Feed',
  'Live Chat',
  'Online Presence',

  // Search System
  'Search Optimization',
  'Full Text Search',
  'Elasticsearch Setup',
  'Search Ranking',
  'Autocomplete Feature',
  'Search API',
  'Query Optimization',
  'Search Analytics',
  'Fuzzy Search',
  'Advanced Filtering'
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
];

async function seedMillionItems() {
  try {
    console.log(`🌱 Starting to seed ${ITEMS_COUNT.toLocaleString()} items for user_id ${USER_ID}...`);

    // Verify user exists
    const userCheck = await db.query('SELECT id, email FROM users WHERE id = $1', [USER_ID]);
    if (userCheck.rows.length === 0) {
      console.error(`❌ User with ID ${USER_ID} does not exist`);
      process.exit(1);
    }

    const userEmail = userCheck.rows[0].email;
    console.log(`✓ User found: ${userEmail}`);

    // Clear existing items for this user
    const deleteResult = await db.query('DELETE FROM items WHERE user_id = $1', [USER_ID]);
    console.log(`✓ Cleared ${deleteResult.rowCount.toLocaleString()} existing items`);

    console.log(`\nInserting ${ITEMS_COUNT.toLocaleString()} items...`);

    const batchSize = 5000;
    let insertedCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < ITEMS_COUNT; i += batchSize) {
      const batch = [];
      const values = [];
      let paramIndex = 1;

      for (let j = 0; j < batchSize && i + j < ITEMS_COUNT; j++) {
        const title = `${titles[Math.floor(Math.random() * titles.length)]} #${i + j + 1}`;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        batch.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
        values.push(USER_ID, title, description);
        paramIndex += 3;
      }

      if (batch.length > 0) {
        const query = `INSERT INTO items (user_id, title, description) VALUES ${batch.join(', ')}`;
        await db.query(query, values);
        insertedCount += batch.length;

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (insertedCount / elapsed).toFixed(0);
        console.log(`✓ Inserted ${insertedCount.toLocaleString()}/${ITEMS_COUNT.toLocaleString()} items (${rate} items/sec)`);
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${totalTime}s!`);
    console.log(`   - Items created: ${ITEMS_COUNT.toLocaleString()}`);
    console.log(`   - User ID: ${USER_ID}`);
    console.log(`   - User email: ${userEmail}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedMillionItems();
