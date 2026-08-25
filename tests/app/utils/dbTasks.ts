import { APIResponse, expect, test } from "@playwright/test";
import { prisma } from "@/lib/prisma";

export async function verifyUserExistsInDB(userName: string, userEmail: string) {
  await test.step("verify created user appeared in DB", async () => {
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    expect(dbUser, "find created user in DB").not.toBeNull();
    expect(dbUser?.name, "verify created user name").toBe(userName);
    expect(dbUser?.role, "verify created user role").toBe("USER");
  });
}

export async function deleteCreatedUserFromDB(userEmail: string) {
  await test.step("delete created user from the DB", async () => {
    await prisma.user.delete({
      where: { email: userEmail },
    });
    const dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    expect(dbUser, "verify user is not present in DB").toBeNull();
  });
}
