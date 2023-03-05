import { prisma } from "src/prisma";

export const upsertDbUser = async (userId: string) => {
  await prisma.user.upsert({
    create: {
      id: userId,
      someField: "someValue",
    },
    update: {},
    where: {
      id: userId,
    },
  });
};
