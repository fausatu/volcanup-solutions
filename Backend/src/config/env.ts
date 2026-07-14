import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(24),
<<<<<<< Updated upstream
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(20)
=======
  DATABASE_URL: z.string().min(10)
  ,
  ADMIN_SEED_USERNAME: z.string().min(3).optional()
>>>>>>> Stashed changes
});

export const env = envSchema.parse(process.env);
