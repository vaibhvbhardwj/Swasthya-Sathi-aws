require('dotenv').config();
const { seedDoctors } = require('../services/consultationService');

async function seedSampleData() {
  console.log('🌱 Seeding sample data for Swasthya Sathi...\n');

  try {
    // Seed doctors
    console.log('📋 Seeding doctors...');
    const result = await seedDoctors();
    console.log(`✅ ${result.message}`);

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\nYou can now:');
    console.log('1. View doctors: GET /api/doctors');
    console.log('2. Book consultations: POST /api/consultations');
    console.log('3. Start using the platform!');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedSampleData();
