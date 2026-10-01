import { z } from "zod";

const username = z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/);
const strongPassword = z.string().min(8).max(100).regex(/[A-Za-z]/, "A senha precisa ter letras.").regex(/[0-9]/, "A senha precisa ter números.");

export const registerSchema = z.object({
  email: z.string().trim().email(),
  username,
  displayName: z.string().trim().min(2).max(50),
  password: strongPassword,
  confirmPassword: z.string().min(1),
  acceptTerms: z.literal(true)
}).refine(v => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "As senhas não coincidem." });

export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(100) });

export const usernameChangeSchema = z.object({
  username,
  currentPassword: z.string().min(1),
  confirmPassword: z.string().min(1)
}).refine(v => v.currentPassword === v.confirmPassword, { path: ["confirmPassword"], message: "A confirmação precisa ser igual à senha atual." });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
  confirmPassword: z.string().min(1)
}).refine(v => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "As novas senhas não coincidem." });

export const profileSchema = z.object({
  username: username,
  displayName: z.string().trim().min(2).max(50),
  bio: z.string().max(280).optional(),
  location: z.string().max(80).optional(),
  avatarUrl: z.string().url().max(1000).optional().or(z.literal("")),
  socialLinks: z.array(z.object({ platform: z.string().min(1).max(30), label: z.string().min(1).max(30), url: z.string().url().max(500) })).max(3).default([])
});

export const logSchema = z.object({
  albumId: z.string().min(1), rating: z.number().min(0.5).max(5), format: z.enum(["DIGITAL","VINYL","TAPE","LIVE"]),
  review: z.string().max(5000).optional(), hotTake: z.boolean().default(false), isRelisten: z.boolean().default(false),
  dualWithUsername: z.string().trim().regex(/^@[a-zA-Z0-9_]+$/).optional().or(z.literal(""))
});
