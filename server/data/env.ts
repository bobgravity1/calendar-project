import "dotenv/config";
import z from "zod";

export const envSchema = z.object({
    url: z.url(),
    authToken: z.string().min(30).optional()
})

// safe parse will parse the environment variables and return a result object, but it WILL NOT throw an error
const parsed = envSchema.safeParse(process.env);

// validates the environment variables and throws an error if they are invalid
if (!parsed.success) {
    throw new Error(`db env credentials not correct: ${parsed.error.message}`)
}

export const env = parsed.data;
