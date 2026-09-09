import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const announcementSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(100),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(2000),
  category: z.enum(["MOVEIS", "ROUPAS", "ELETRONICOS", "LIVROS", "BRINQUEDOS", "ESPORTES", "CASA", "OUTROS"]),
  condition: z.enum(["NOVO", "OTIMO", "BOM", "REGULAR"]),
  availability: z.enum(["RETIRADA", "ENTREGA", "AMBAS"]),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const manifestationSchema = z.object({
  message: z.string().max(500).optional(),
  announcementId: z.string(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  reviewedId: z.string(),
  donationId: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(3),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
});

export const moderationSchema = z.object({
  status: z.enum(["ATIVO", "REJEITADO"]),
  reason: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type ManifestationInput = z.infer<typeof manifestationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ModerationInput = z.infer<typeof moderationSchema>;
