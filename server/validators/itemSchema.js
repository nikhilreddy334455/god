import { z } from 'zod';

export const createItemSchema = z.object({
  type: z.enum(['lost', 'found'], {
    errorMap: () => ({ message: "Type must be either 'lost' or 'found'" })
  }),
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  location: z.string().min(2, "Campus location is required"),
  incident_date: z.string().refine((val) => {
    const normalized = val.replace(/T(\d{2})[.:](\d{2})[.:](\d{2})/, 'T$1:$2:$3');
    return !isNaN(Date.parse(normalized)) || !isNaN(Date.parse(val));
  }, {
    message: "Valid ISO datetime required"
  }),
  image_url: z.string().optional().nullable(),
});

export const createClaimSchema = z.object({
  match_id: z.string().min(1, "Valid match ID required"),
  proof_description: z.string().min(15, "Please provide detailed proof of ownership (at least 15 characters)"),
});

export const updateItemStatusSchema = z.object({
  status: z.enum(['active', 'matched', 'pending_verification', 'resolved', 'archived'])
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(['pending_review', 'approved', 'rejected'])
});
