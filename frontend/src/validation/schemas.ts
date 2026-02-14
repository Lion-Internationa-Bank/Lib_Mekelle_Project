// src/validation/schemas.ts
import { optional, z } from "zod";

const UPIN_REGEX = /^[A-Za-z0-9\-_]+$/;

export const ParcelFormSchema = z.object({
  upin: z
    .string()
    .min(1, { message: "UPIN is required" })
    .regex(UPIN_REGEX, {
      message:
        "UPIN can only contain letters, numbers, hyphens, and underscores",
    })
    .transform((val) => val.toUpperCase()),

  file_number: z.string().min(1, { message: "File number is required" }),
  tabia: z.string().min(1, { message: "Tabia/Woreda is required" }),
  ketena: z.string().min(1, { message: "Ketena is required" }),
  block: z.string().min(1, { message: "Block is required" }),

  total_area_m2: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return NaN;
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
    z
      .number()
      .positive({ message: "Total area must be greater than 0" })
  ),

  land_use: z.string().min(1, { message: "Please select a land use type" }),

  land_grade: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return NaN;
      const num = Number(val);
      return isNaN(num) ? val : num;
    },
    z
      .number()
      .positive({ message: "Land grade must be greater than 0" })
      .refine((val) => isFinite(val), {
        message: "Land grade must be a finite number",
      })
  ),

  tenure_type: z.string().min(1, { message: "Please select a tenure type" }),

  boundary_coords: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      try {
        JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid GeoJSON format – must be valid JSON",
        });
      }
    }),
    boundary_north: z.string().optional(),
    boundary_east: z.string().optional(),
    boundary_south: z.string().optional(),
    boundary_west: z.string().optional(),
});

export type ParcelFormData = z.infer<typeof ParcelFormSchema>;


// ========================
// OWNER FORM VALIDATION
// ========================

export const OwnerFormSchema = z.object({
  // For existing owners, we need to track if this is from search
  owner_id: z
    .string()
    .optional()
    .nullable(),

  // These fields are required for new owners, but can be present from existing owners
  full_name: z
    .string()
    .min(1, { message: "Full name is required" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name should only contain letters and spaces" }),

  national_id: z
    .string()
    .min(1, { message: "National ID is required" })
    .regex(/^[\d\s]+$/, { message: "National ID must contain only digits" }),

  phone_number: z
    .string()
    .min(1, { message: "Phone number is required" })
    .regex(/^\+251\d{9}$|^09\d{8}$/, {
      message: "Invalid Ethiopian phone format. Use +251911223344 or 0911223344",
    }),

  tin_number: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[\d\s]+$/.test(val), {
      message: "TIN must contain only digits",
    }),

  acquired_at: z
    .string()
    .min(1, { message: "Acquisition date is required" })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Acquisition date cannot be in the future",
    }),
}).refine(
  (data) => {
    // If there's an owner_id, we're using an existing owner
    // In this case, we don't need to validate the other fields as strictly
    // since they come from the database
    if (data.owner_id) {
      return true;
    }
    // For new owners, all fields must be present and valid
    // This is already handled by the individual field validations
    return true;
  },
  {
    message: "Invalid owner data",
  }
);

export type OwnerFormData = z.infer<typeof OwnerFormSchema>;

// ========================
// LEASE FORM VALIDATION
// ========================
export const LeaseFormSchema = z.object({
  price_per_m2: z.coerce
    .number()
    .positive({ message: "Price per m² must be greater than 0" }),

  total_lease_amount: z.coerce
    .number()
    .positive({ message: "Total lease amount must be greater than 0" }),

  down_payment_amount: z.coerce
    .number()
    .min(0, { message: "Down payment cannot be negative" }),


  lease_period_years: z.coerce
    .number()
    .int()
    .min(1, { message: "Lease period must be at least 1 year" }),

  payment_term_years: z.coerce
    .number()
    .int()
    .min(1, { message: "Payment term must be at least 1 year" }),

  contract_date: z
    .string()
    .min(1, { message: "Contract date is required" })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Contract date cannot be in the future",
    }),

  start_date: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (!val) return true;
        const contractDate = ctx.parent.contract_date;
        return new Date(val) >= new Date(contractDate);
      },
      { message: "Start date must be on or after contract date" }
    ),

  legal_framework: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Legal framework text is too long (max 500 characters)",
    }),
});

export type LeaseFormData = z.infer<typeof LeaseFormSchema>;


export const OwnerStepFormSchema = z.object({
  owner_id: z
    .string()
    .trim()
    .min(1, { message: "Full name is required and cannot be empty" }).optional,
  full_name: z
    .string()
    .trim()
    .min(1, { message: "Full name is required and cannot be empty" }).optional,

  national_id: z
    .string()
    .trim()
    .min(1, { message: "National ID is required and cannot be empty" }).optional,

  tin_number: z.string().trim().optional(),

phone_number: z
  .string()
  .trim()
  .min(1, { message: "Phone number is required" })
  .regex(
    /^(\+251|0)(9[1-9]|7[0-9])\d{7}$/,
    {
      message:
        "Invalid phone number. Use +251911223344 or 0911223344 format",
    }
  )
  .transform((val) => {
    // Normalize to international format: always return +251...
    if (val.startsWith("0")) {
      return "+251" + val.slice(1);
    }
    if (val.startsWith("+251")) {
      return val;
    }
    // Fallback (should not happen due to regex)
    return val;
  }).optional,

  // keep as string for date input, but validate similar to backend
  acquired_at: z
    .string()
    .min(1, { message: "Acquisition date is required" })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid acquisition date format",
    }),
}).optional;

export type OwnerStepFormData = z.infer<typeof OwnerStepFormSchema>;

/**
 * Wizard LeaseStep form schema (frontend)
 * Mirrors CreateLeaseSchema.body but keeps date fields as strings.
 */


export const LeaseStepFormSchema = z.object({
  price_per_m2: z.coerce
    .number()
    .positive({ message: "Price per m² must be greater than 0" }),
  total_lease_amount: z.coerce
    .number()
    .positive({ message: "Total lease amount must be greater than 0" }),
  down_payment_amount: z.coerce
    .number()
    .min(0, { message: "Down payment cannot be negative" }),
  other_payment: z.coerce
    .number()
    .min(0, { message: "Down payment cannot be negative" }),
  lease_period_years: z.coerce
    .number()
    .int()
    .positive({ message: "Lease period (years) must be a positive integer" }),
  payment_term_years: z.coerce
    .number()
    .int()
    .positive({ message: "Payment term (years) must be a positive integer" }),
  legal_framework: z
    .string()
    .trim()
    .min(1, { message: "Legal framework is required and cannot be empty" }),
  contract_date: z
    .string()
    .min(1, { message: "Contract date is required" })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid contract date format",
    }),
  start_date: z
    .string()
    .min(1, { message: "Start date is required" })
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    }),
  // expiry_date removed for create; backend will compute it
});

export type LeaseStepFormData = z.infer<typeof LeaseStepFormSchema>;









// 1) Edit parcel (UpdateParcelSchema.body)

// Example snippet for your schema
export const EditParcelFormSchema = z.object({
  file_number: z.string().optional(),
  sub_city_id: z.string().optional(),
  tabia: z.string().optional(),
  ketena: z.string().optional(),
  block: z.string().optional(),
  total_area_m2: z.number().positive().optional(),
  land_use: z.string().optional(),
  land_grade: z.number().int().positive().optional(),
  tenure_type: z.string().optional(),
  boundary_north: z.string().optional(),
  boundary_east: z.string().optional(),
  boundary_south: z.string().optional(),
  boundary_west: z.string().optional(),
   boundary_coords: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      try {
        JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid GeoJSON format – must be valid JSON",
        });
      }
    }),
});
export type EditParcelFormData = z.infer<typeof EditParcelFormSchema>;

// 2) Edit owner (UpdateOwnerSchema.body)
export const EditOwnerFormSchema = z
  .object({
    full_name: z.string().trim().min(1).optional(),
    national_id: z.string().trim().min(1).optional(),
    tin_number: z.string().trim().nullable().optional(),
    phone_number: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type EditOwnerFormData = z.infer<typeof EditOwnerFormSchema>;

// 3) Update owner share ratio (UpdateParcelOwnerShareSchema.body)
export const EditShareFormSchema = z.object({
  share_ratio: z.coerce
    .number()
    .gt(0, { message: "Share ratio must be greater than 0" })
    .lte(1, { message: "Share ratio cannot exceed 1.0 (100%)" }),
});

export type EditShareFormData = z.infer<typeof EditShareFormSchema>;

// 4) Transfer ownership (TransferOwnershipSchema.body)
export const TransferOwnershipFormSchema = z.object({
  from_owner_id: z.string().uuid().optional(),
  to_owner_id: z
    .string()
    .uuid({ message: "Invalid to_owner_id – must be a valid UUID" })
    .min(1, { message: "New owner (to_owner_id) is required" }),
  transfer_type: z.enum(["SALE", "GIFT", "HEREDITY", "CONVERSION"], {
    message: "Transfer type must be one of: SALE, GIFT, HEREDITY, or CONVERSION",
  }),
  transfer_price: z
    .string()
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : Number(v)))
    .refine((v) => v === undefined || (typeof v === "number" && v >= 0), {
      message: "Transfer price cannot be negative",
    }),
  reference_no: z.string().trim().optional(),
});

export type TransferOwnershipFormData = z.infer<
  typeof TransferOwnershipFormSchema
>;

// 5) Edit lease (UpdateLeaseSchema.body) – dates kept as strings for inputs
export const EditLeaseFormSchema = z
  .object({
    total_lease_amount: z
      .number()
      .positive({ message: "Total lease amount must be greater than 0" })
      .optional(),

    down_payment_amount: z
      .number()
      .nonnegative({ message: "Down payment cannot be negative" })
      .optional(),

  other_payment: z
      .number()
      .nonnegative({ message: "Other payment cannot be negative" })
      .optional(),

    price_per_m2: z
      .number()
      .positive({ message: "Price per m² must be greater than 0" })
      .optional(),

    lease_period_years: z
      .number()
      .int({ message: "Lease period (years) must be an integer" })
      .positive({ message: "Lease period (years) must be greater than 0" })
      .optional(),

    payment_term_years: z
      .number()
      .int({ message: "Payment term (years) must be an integer" })
      .positive({ message: "Payment term (years) must be greater than 0" })
      .optional(),

    legal_framework: z
      .string()
      .trim()
      .min(1, { message: "Legal framework cannot be empty if provided" })
      .optional(),

    contract_date: z
      .union([
        z.string()
          .refine(
            (val) => !val || !Number.isNaN(Date.parse(val)),
            { message: "Invalid contract date format" }
          ),
        z.date(),
        z.null(),
        z.undefined()
      ])
      .optional()
      .transform((val) => {
        // Convert Date to ISO string if it's a Date object
        if (val instanceof Date) {
          return val.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
        return val;
      }),

    start_date: z
      .union(
        [
        z.string()
          .refine(
            (val) => !val || !Number.isNaN(Date.parse(val)),
            { message: "Invalid start date format" }
          ),
        z.date(),
        z.null(),
        z.undefined()
      ])
      .optional()
      .transform((val) => {
        if (val instanceof Date) {
          return val.toISOString().split('T')[0];
        }
        return val;
      }),
  })
  .refine(
    (data) => {
      // Require at least one field for update
      return Object.values(data).some((val) => val !== undefined && val !== null && val !== '');
    },
    {
      message: "At least one field must be provided to update the lease agreement",
    }
  );

export type EditLeaseFormData = z.infer<typeof EditLeaseFormSchema>;


// 6) Encumbrance create/update
export const EncumbranceFormSchema = z.object({
  type: z.string().trim().min(1, { message: "IEncumbrance type is required and cannot be empty" }),
  issuing_entity: z
    .string()
    .trim()
    .min(1, { message: "Issuing entity is required and cannot be empty" }),
  reference_number: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "RELEASED"]).default("ACTIVE"),
  registration_date: z
    .string()
    .optional()
    .refine(
      (v) => v == null || v === "" || !Number.isNaN(Date.parse(v)),
      { message: "Invalid registration date format" }
    ),
});

export type EncumbranceFormData = z.infer<typeof EncumbranceFormSchema>;



// Base owner schema (you may already have something similar)
export const BaseOwnerSchema = z.object({
  full_name: z.string().trim().min(1, { message: "Full name is required" }),
  national_id: z
    .string()
    .trim()
    .min(1, { message: "National ID is required" }),
  tin_number: z.string().trim().optional(),
  phone_number: z
  .string()
  .trim()
  .min(1, { message: "Phone number is required" })
  .regex(
    /^(\+251|0)(9[1-9]|7[0-9])\d{7}$/,
    {
      message:
        "Invalid phone number. Use +251911223344 or 0911223344 format",
    }
  )
  .transform((val) => {
    // Normalize to international format: always return +251...
    if (val.startsWith("0")) {
      return "+251" + val.slice(1);
    }
    if (val.startsWith("+251")) {
      return val;
    }
    // Fallback (should not happen due to regex)
    return val;
  }).optional(),
});

// CREATE owner (createOwnerOnly) – all required like backend CreateOwnerSchema.body
export const CreateOwnerOnlySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, { message: "Full name is required and cannot be empty" }),
  national_id: z
    .string()
    .trim()
    .min(1, { message: "National ID is required and cannot be empty" }),
  tin_number: z.string().trim().optional(),
  phone_number: z
  .string()
  .trim()
  .min(1, { message: "Phone number is required" })
  .regex(
    /^(\+251|0)(9[1-9]|7[0-9])\d{7}$/,
    {
      message:
        "Invalid phone number. Use +251911223344 or 0911223344 format",
    }
  )
  .transform((val) => {
    // Normalize to international format: always return +251...
    if (val.startsWith("0")) {
      return "+251" + val.slice(1);
    }
    if (val.startsWith("+251")) {
      return val;
    }
    // Fallback (should not happen due to regex)
    return val;
  }).optional(),
});

export type CreateOwnerOnlyData = z.infer<typeof CreateOwnerOnlySchema>;

// UPDATE owner (edit on Ownership page) – mirrors UpdateOwnerSchema.body
export const UpdateOwnerFormSchema = z
  .object({
    full_name: z.string().trim().min(1).optional(),
    national_id: z.string().trim().min(1).optional(),
    tin_number: z.string().trim().nullable().optional(),
    phone_number: z
  .string()
  .trim()
  .min(1, { message: "Phone number is required" })
  .regex(
    /^(\+251|0)(9[1-9]|7[0-9])\d{7}$/,
    {
      message:
        "Invalid phone number. Use +251911223344 or 0911223344 format",
    }
  )
  .transform((val) => {
    // Normalize to international format: always return +251...
    if (val.startsWith("0")) {
      return "+251" + val.slice(1);
    }
    if (val.startsWith("+251")) {
      return val;
    }
    // Fallback (should not happen due to regex)
    return val;
  }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type UpdateOwnerFormData = z.infer<typeof UpdateOwnerFormSchema>;
