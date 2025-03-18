import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding the database...');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.note.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      totalStudyHours: 42.5,
      longestStreak: 5,
      currentStreak: 3,
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create resources
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive guide to the basics of machine learning algorithms and their applications.',
        type: 'course',
        url: 'https://example.com/ml-course',
        coverColor: '#3E7C17',
        tags: ['machine learning', 'AI', 'data science'],
        category: 'Computer Science',
        progress: 75,
        rating: 5,
        userId: user.id,
      },
    }),
    prisma.resource.create({
      data: {
        title: 'The Great Gatsby',
        description: 'F. Scott Fitzgerald\'s classic novel about the American Dream.',
        type: 'book',
        coverColor: '#6D573D',
        tags: ['literature', 'fiction', 'american'],
        category: 'Literature',
        progress: 100,
        rating: 4,
        userId: user.id,
      },
    }),
    prisma.resource.create({
      data: {
        title: 'Quantum Physics Explained',
        description: 'An introduction to the principles of quantum mechanics.',
        type: 'video',
        url: 'https://example.com/quantum-video',
        coverColor: '#2B3AFF',
        tags: ['physics', 'quantum', 'science'],
        category: 'Physics',
        progress: 30,
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${resources.length} resources`);

  // Create notes
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        title: 'Machine Learning Algorithms',
        content: '# Machine Learning Algorithms\n\n## Supervised Learning\n- Linear regression\n- Logistic regression\n- Decision trees\n- Support vector machines\n\n## Unsupervised Learning\n- K-means clustering\n- Hierarchical clustering\n- Principal component analysis',
        tags: ['machine learning', 'algorithms'],
        userId: user.id,
        resourceId: resources[0].id,
      },
    }),
    prisma.note.create({
      data: {
        title: 'Great Gatsby Themes',
        content: '# Themes in The Great Gatsby\n\n- The American Dream\n- Social class and wealth\n- Love and relationships\n- Idealism vs reality\n- The roaring twenties',
        tags: ['literature', 'gatsby'],
        userId: user.id,
        resourceId: resources[1].id,
      },
    }),
  ]);

  console.log(`Created ${notes.length} notes`);

  // Create flashcards
  const flashcards = await Promise.all([
    prisma.flashcard.create({
      data: {
        question: 'What is supervised learning?',
        answer: 'A type of machine learning where the algorithm is trained on labeled data, learning to map input features to known output values.',
        tags: ['machine learning', 'AI'],
        difficulty: 'medium',
        userId: user.id,
        resourceId: resources[0].id,
      },
    }),
    prisma.flashcard.create({
      data: {
        question: 'What is the main theme of The Great Gatsby?',
        answer: 'The corruption of the American Dream through materialism and excess.',
        tags: ['literature', 'gatsby'],
        difficulty: 'easy',
        userId: user.id,
        resourceId: resources[1].id,
      },
    }),
    prisma.flashcard.create({
      data: {
        question: 'What is Heisenberg\'s Uncertainty Principle?',
        answer: 'The principle states that the more precisely the position of a particle is determined, the less precisely its momentum can be predicted, and vice versa.',
        tags: ['physics', 'quantum'],
        difficulty: 'hard',
        userId: user.id,
        resourceId: resources[2].id,
      },
    }),
  ]);

  console.log(`Created ${flashcards.length} flashcards`);

  // Create study sessions
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const studySessions = await Promise.all([
    prisma.studySession.create({
      data: {
        startTime: new Date(yesterday.setHours(10, 0, 0)),
        endTime: new Date(yesterday.setHours(12, 30, 0)),
        duration: 150, // 2.5 hours in minutes
        topic: 'Machine Learning',
        notes: 'Reviewed supervised learning algorithms and practiced with decision trees.',
        userId: user.id,
      },
    }),
    prisma.studySession.create({
      data: {
        startTime: new Date(now.setHours(14, 0, 0)),
        endTime: new Date(now.setHours(15, 30, 0)),
        duration: 90, // 1.5 hours in minutes
        topic: 'The Great Gatsby',
        notes: 'Analyzed themes and symbolism in chapters 4-6.',
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${studySessions.length} study sessions`);

  // Create chat sessions
  const chatSession = await prisma.chatSession.create({
    data: {
      title: 'Help with quantum physics',
      userId: user.id,
      messages: {
        create: [
          {
            content: 'Can you explain quantum entanglement in simple terms?',
            role: 'user',
          },
          {
            content: 'Quantum entanglement is a physical phenomenon that occurs when a pair or group of particles interact in such a way that the quantum state of each particle cannot be described independently of the others, even when the particles are separated by a large distance. It\'s often described as a "spooky action at a distance" because measuring one particle instantly affects its entangled partner.',
            role: 'assistant',
          },
          {
            content: 'How is this used in quantum computing?',
            role: 'user',
          },
          {
            content: 'In quantum computing, entanglement is a crucial resource that allows quantum computers to perform certain calculations much faster than classical computers. Quantum bits (qubits) that are entangled can exist in multiple states simultaneously through superposition, and when entangled, the state of one qubit is dependent on the state of another. This property enables quantum computers to process a vast number of possibilities simultaneously, leading to exponential speedups for specific problems like factoring large numbers or searching unsorted databases.',
            role: 'assistant',
          },
        ],
      },
    },
    include: {
      messages: true,
    },
  });

  console.log(`Created chat session with ${chatSession.messages.length} messages`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the database connection
    await prisma.$disconnect();
  }); 