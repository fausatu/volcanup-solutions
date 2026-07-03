import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  // Keep startup log explicit for deployment diagnostics.
  console.log(`Backend API running on http://localhost:${env.PORT}`);
});
