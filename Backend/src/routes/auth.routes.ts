import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAccessToken } from "../services/token.service";

const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Payload de connexion invalide" });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email.toLowerCase(),
        mode: "insensitive"
      }
    }
  });

  if (!user) {
    res.status(401).json({ message: "Identifiants invalides" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    res.status(401).json({ message: "Identifiants invalides" });
    return;
  }

  const accessToken = signAccessToken({ sub: user.id, role: "admin" });

  res.status(200).json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: 900
  });
});

export { authRouter };
