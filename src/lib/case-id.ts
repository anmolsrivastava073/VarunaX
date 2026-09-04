import { prisma } from "./prisma";

/**
 * Generates a sequential case ID in the format CASE-YYYY-NNN.
 *
 * Queries the database for the highest existing case number in the
 * current year and increments it. Uses a string-based sort on ID
 * since all IDs share the same prefix format.
 */
export async function generateCaseId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CASE-${year}-`;

  // Find the latest case for this year
  const latestCase = await prisma.case.findFirst({
    where: {
      id: {
        startsWith: prefix,
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  let nextNumber = 1;

  if (latestCase) {
    // Extract the numeric suffix: CASE-2026-042 → 42
    const suffix = latestCase.id.replace(prefix, "");
    const parsed = parseInt(suffix, 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  // Pad to 3 digits: 1 → "001", 42 → "042"
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix}${paddedNumber}`;
}
