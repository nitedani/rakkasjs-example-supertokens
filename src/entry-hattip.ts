import createEmotionServer from "@emotion/server/create-instance";
import { defaultMantineEmotionCache } from "@mantine/core";
import { createRequestHandler, RequestContext } from "rakkasjs";
import { Readable } from "stream";
import { init } from "supertokens-node";
import Dashboard from "supertokens-node/recipe/dashboard";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session, { getSession } from "supertokens-node/recipe/session";
import UserRoles from "supertokens-node/recipe/userroles";
import { upsertDbUser } from "./lib/users";

const { renderStylesToNodeStream } = createEmotionServer(
  defaultMantineEmotionCache
);

init({
  appInfo: {
    appName: "SuperTokens Demo App",
    apiDomain: "http://localhost:3000",
    websiteDomain: "http://localhost:3000",
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  supertokens: {
    connectionURI: "https://try.supertokens.com",
  },
  recipeList: [
    EmailPassword.init({
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            async signUpPOST(input) {
              const response = await originalImplementation.signUpPOST!(input);
              if (response.status === "OK") {
                await upsertDbUser(response.user.id);
              }
              return response;
            },
          };
        },
      },
    }),
    Session.init(),
    UserRoles.init({
      skipAddingPermissionsToAccessToken: true,
      skipAddingRolesToAccessToken: true,
    }),
    Dashboard.init({
      apiKey: "supertokens_is_awesome",
    }),
  ],
});

const attachSession = async (ctx: RequestContext) => {
  try {
    const session = await getSession(
      ctx.platform.request,
      ctx.platform.response
    );
    ctx.locals.session = session;
  } catch (error) {}
};

export default createRequestHandler({
  middleware: {
    beforePages: [attachSession],
    beforeApiRoutes: [attachSession],
  },
  //@ts-ignore
  createPageHooks: () => ({
    wrapSsrStream: (stream) =>
      //@ts-ignore
      Readable.toWeb(Readable.fromWeb(stream).pipe(renderStylesToNodeStream())),
  }),
});
