import ky from "ky";
import { navigate, useQueryClient, useSSQ } from "rakkasjs";
import { useEffect } from "react";
import { prisma } from "src/prisma";
import {
  UserRoleClaim,
  PermissionClaim,
} from "supertokens-node/recipe/userroles";

let refreshing: Promise<boolean> | null = null;
export const refreshSession = async () => {
  if (refreshing) {
    return refreshing;
  }

  refreshing = ky
    .post("/api/auth/session/refresh")
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => (refreshing = null));

  return refreshing;
};
export type UseAuthSessionOptions = {
  disableRedirect?: boolean;
};

const defaultOptions = {
  disableRedirect: true,
};

export function useAuth(options: UseAuthSessionOptions = defaultOptions) {
  const queryClient = useQueryClient();
  const methods = useSSQ(
    async (ctx) => {
      const session = ctx.locals.session;
      if (!session) {
        return {
          valid: false,
        } as const;
      }

      const userId = session.getUserId();
      const roles = await UserRoleClaim.fetchValue(userId, {});
      const permissions = await PermissionClaim.fetchValue(userId, {});

      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });

      return {
        user,
        roles,
        permissions,
        valid: true,
      } as const;
    },
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );

  const signOut = async () => {
    const res = await ky
      .post("/api/auth/signout", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .json<{
        status: string;
      }>();

    queryClient.invalidateQueries();
    return res;
  };

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await ky
      .post("/api/auth/signin", {
        json: {
          formFields: [
            {
              id: "email",
              value: email,
            },
            {
              id: "password",
              value: password,
            },
          ],
        },
        headers: {
          "Content-Type": "application/json",
          "st-auth-mode": "cookie",
        },
      })
      .json<{
        status: string;
      }>();
    queryClient.invalidateQueries();
    return res;
  };

  const signUp = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await ky
      .post("/api/auth/signup", {
        json: {
          formFields: [
            {
              id: "email",
              value: email,
            },
            {
              id: "password",
              value: password,
            },
          ],
        },
        headers: {
          "Content-Type": "application/json",
          "st-auth-mode": "cookie",
        },
      })
      .json<{
        status: string;
      }>();
    queryClient.invalidateQueries();
    return res;
  };

  useEffect(() => {
    if (methods.data.valid) {
      return;
    }

    const doRefresh = async () => {
      if (await refreshSession()) {
        methods.refetch();
      } else if (!options.disableRedirect) {
        navigate("/auth/signin");
      }
    };

    doRefresh();
  }, [methods.data.valid, options]);

  return { ...methods, session: methods.data, signOut, signIn, signUp };
}
