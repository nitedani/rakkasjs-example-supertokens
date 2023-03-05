import type { Response } from "express";
import type { SessionRequest } from "supertokens-node/framework/express";
declare module "rakkasjs" {
  interface ServerSideLocals {
    session: SessionRequest["session"];
  }
  interface RequestContext {
    platform: {
      request: SessionRequest;
      response: Response;
    };
  }
}
