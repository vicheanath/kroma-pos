import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getDB, employeesApi } from "./db";
import { verifyPassword } from "./auth-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Required for NextAuth v5
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      name: "Employee Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        employeeId: { label: "Employee ID", type: "text" },
        employeeRole: { label: "Employee Role", type: "text" },
        employeeName: { label: "Employee Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // If employee data is passed from client-side validation, use it
          // This avoids needing to access IndexedDB on the server
          if (
            credentials.employeeId &&
            credentials.employeeRole &&
            credentials.employeeName
          ) {
            return {
              id: credentials.employeeId as string,
              email: credentials.email as string,
              name: credentials.employeeName as string,
              role: credentials.employeeRole as string,
            };
          }

          // Fallback: Try to access IndexedDB (will fail on server, but might work in some edge cases)
          try {
            const db = getDB();
            const employees = await employeesApi.getAll();
            const employee = employees.find(
              (e) => e.email === credentials.email && e.isActive
            );

            if (!employee || !employee.password) {
              console.error(
                "Employee not found or no password:",
                credentials.email
              );
              return null;
            }

            const isValid = await verifyPassword(
              credentials.password as string,
              employee.password
            );

            if (!isValid) {
              console.error("Invalid password for:", credentials.email);
              return null;
            }

            return {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              role: employee.role,
            };
          } catch (dbError) {
            // IndexedDB not available (server-side)
            console.error("Cannot access IndexedDB:", dbError);
            return null;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        // Add role from employee authentication
        if ("role" in user) {
          token.role = user.role;
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;
      // Add employee role to session
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "development-secret-key-change-in-production-min-32-chars",
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
      role?: string;
    };
  }
}

// JWT type augmentation - NextAuth v5 handles this differently
// The token properties are available through the jwt callback
