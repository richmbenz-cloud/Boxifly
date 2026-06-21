import { z } from "zod";

// Validation schemas for the checkout forms
export const guestInfoSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(9, "Teléfono inválido").max(15),
});

export const shippingSchema = z.object({
  address: z.string().min(10, "La dirección debe ser más específica").max(200),
  city: z.string().min(3, "Ciudad requerida").max(100),
});
