import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      roles?: string[];
      permissions?: string[];
    };
  }

  interface User {
    id?: string;
    roles?: string[];
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    roles?: string[];
    permissions?: string[];
  }
}