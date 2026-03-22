import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Cuid из Prisma после синхронизации в jwt-колбэке */
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
