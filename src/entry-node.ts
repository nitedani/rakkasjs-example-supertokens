import express from "express";
import { createMiddleware } from "rakkasjs/node-adapter";
import { middleware } from "supertokens-node/framework/express";
import hattipHandler from "./entry-hattip";

const app = express();
app.use("/api/auth", middleware());
app.use(createMiddleware(hattipHandler));
export default app;
