import { PrismaClient, CaseStatus } from '@prisma/client';
import { seedCases } from '../scripts/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  for (const seedCase of seedCases) {
    await prisma.case.upsert({
      where: { id: seedCase.id },
      update: {
        status: seedCase.status as CaseStatus,
        system1: seedCase.system1 ?? undefined,
        system2: seedCase.system2 ?? undefined,
        system3: seedCase.system3 ?? undefined,
        sourceRefs: seedCase.sourceRefs ?? undefined,
      },
      create: {
        id: seedCase.id,
        status: seedCase.status as CaseStatus,
        system1: seedCase.system1 ?? undefined,
        system2: seedCase.system2 ?? undefined,
        system3: seedCase.system3 ?? undefined,
        sourceRefs: seedCase.sourceRefs ?? undefined,
      },
    });
    console.log(`  ✓ ${seedCase.id} (${seedCase.status})`);
  }

  console.log(`\n✅ Seeded ${seedCases.length} cases.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
