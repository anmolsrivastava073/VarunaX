import { PrismaClient } from "@prisma/client";
import { MOCK_INCIDENTS } from "../scripts/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with SIH 2026 data...");

  for (const incident of MOCK_INCIDENTS) {
    await prisma.incident.upsert({
      where: { id: incident.id },
      update: {},
      create: {
        id: incident.id,
        status: incident.status,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
        observation: incident.observation as any,
        system1: incident.system1 as any,
        system2: incident.system2 as any,
        system3: incident.system3 as any,
      },
    });
    console.log(`  ✓ ${incident.id} (${incident.status})`);
  }

  console.log(`\n✅ Seeded ${MOCK_INCIDENTS.length} incidents.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
