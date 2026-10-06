import { z } from "zod";

// Variable khawya ("") = ma kaynach
const blankToUndefined = (value) => (value === "" ? undefined : value);

const optionalBool = z.preprocess(
  blankToUndefined,
  z.enum(["true", "false"]).transform((value) => value === "true").optional()
);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  COOKIE_SECURE: optionalBool,
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  // Liste mfr9a b virgules (ex: "http://localhost:5173"). Khawya = nefs l-origin bo7do
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  TAX_RATE: z.coerce.number().min(0).max(100).default(5.25),
  RAZORPAY_KEY_ID: z.preprocess(blankToUndefined, z.string().optional()),
  RAZORPAY_KEY_SECRET: z.preprocess(blankToUndefined, z.string().optional()),
});

const parsed = schema.safeParse(process.env);

// Fail fast: ila config ghalta, l-app ma katbdach (7sen mn crash f wst l-khedma)
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;
env.COOKIE_SECURE ??= env.NODE_ENV === "production";
env.RAZORPAY_ENABLED = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

export default env;
