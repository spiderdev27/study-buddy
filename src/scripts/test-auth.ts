import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing authentication flow...');

  // 1. Check if test user exists
  const email = 'test@example.com';
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('👤 Creating test user...');
    // Create a test user if it doesn't exist
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: hashedPassword,
      },
    });
    console.log('✅ Test user created successfully');
  } else {
    console.log('✅ Test user already exists');
  }

  // 2. Verify password hashing is working
  const testPassword = 'password123';
  const isPasswordValid = await bcrypt.compare(testPassword, user.password!);
  
  if (isPasswordValid) {
    console.log('✅ Password verification working correctly');
  } else {
    console.log('❌ Password verification failed');
  }

  // 3. Print login credentials for testing
  console.log('\n📝 Use these credentials to test the login flow:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${testPassword}`);
  console.log('\nAuthentication flow test complete!');
}

main()
  .catch((e) => {
    console.error('Error testing authentication flow:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 