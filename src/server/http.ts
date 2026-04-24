import http from "node:http";

import next from "next";

import { registerSocketServer } from "@/server/socket";

export async function startServer(args: { port: number }) {
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  registerSocketServer(server);

  await new Promise<void>((resolve) => {
    server.listen(args.port, resolve);
  });

  return server;
}

