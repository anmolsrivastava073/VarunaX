import { prisma } from "./prisma";

/**
 * Generates a sequential incident ID in the format INCIDENT_YYYY_NNN.
 *
 * Queries the database for the highest existing incident number in the
 * current year and increments it.
 */
export async function generateIncidentId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INCIDENT_${year}_`;

  const latestIncident = await prisma.incident.findFirst({
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

  if (latestIncident) {
    const suffix = latestIncident.id.replace(prefix, "");
    const parsed = parseInt(suffix, 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix}${paddedNumber}`;
}
