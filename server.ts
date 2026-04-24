import "dotenv/config";

import { startServer } from "@/server/http";

const port = Number(process.env.PORT || 3000);

startServer({ port })
  .then(() => {
    console.log(`Server listening on http://localhost:${port}`);
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

