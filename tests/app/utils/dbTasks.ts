import { expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";

export async function verifyUserExistsInDB(userName: string, userEmail: string) {
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  expect(dbUser, "find created user in DB").not.toBeNull();
  expect(dbUser?.name, "verify created user name").toBe(userName);
  expect(dbUser?.role, "verify created user role").toBe("USER");
}

export async function deleteUserFromDB(userEmail: string) {
  await prisma.user.delete({
    where: { email: userEmail },
  });
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  expect(dbUser, "verify user is not present in DB").toBeNull();
}

export async function deleteOAuthClientFromDb(oAuthClientId: string) {
  await prisma.oAuthClient.delete({
    where: { clientId: oAuthClientId },
  });
  const dbClient = await prisma.oAuthClient.findUnique({
    where: { clientId: oAuthClientId },
  });
  expect(dbClient, "verify client is not present in DB").toBeNull();
}
