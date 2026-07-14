import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { signAccessToken } from "../services/token.service";

const authRouter = Router();

const loginSchema = z.object({
  identifier: z.string().min(1), // email or username
  password: z.string().min(8)
});

authRouter.post("/auth/login", async (req, res) => {
  // Accept `email`, `identifier` or `username` from clients for compatibility
  const payload = {
    identifier: req.body?.email || req.body?.identifier || req.body?.username || "",
    password: req.body?.password
  };

  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    res.status(400).json({ message: "Payload de connexion invalide" });
    return;
  }

<<<<<<< Updated upstream
  const { email, password } = parsed.data;
=======
  const { identifier, password } = parsed.data;
  const idLower = identifier.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: idLower, mode: "insensitive" } },
        { username: { equals: idLower, mode: "insensitive" } }
      ]
    }
  });
>>>>>>> Stashed changes

  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    res.status(401).json({ message: "Identifiants invalides" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);

  if (!isValidPassword) {
    res.status(401).json({ message: "Identifiants invalides" });
    return;
  }

  const accessToken = signAccessToken({ sub: env.ADMIN_EMAIL, role: "admin" });

  res.status(200).json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: 900
  });
});

export { authRouter };
