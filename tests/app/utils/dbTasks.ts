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

export async function deleteTagFromDb(tagId: string) {
  try {
    await prisma.tag.delete({
      where: { id: tagId },
    });
  } catch (error) {
    // Ignore error if tag is already deleted
  }
}

export async function deleteLearningPathFromDb(id: string) {
  try {
    const lp = await prisma.learningPath.findUnique({
      where: { id },
      select: { instructorId: true, videoId: true },
    });
    if (lp) {
      await prisma.learningPath.delete({
        where: { id },
      });
      if (lp.instructorId) {
        await prisma.instructor.delete({ where: { id: lp.instructorId } }).catch(() => {});
      }
      if (lp.videoId) {
        await prisma.youTubeVideo.delete({ where: { id: lp.videoId } }).catch(() => {});
      }
    }
  } catch (error) {
    // Ignore error if learning path is already deleted
  }
}
