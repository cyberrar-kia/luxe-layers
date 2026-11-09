// Regenerates ADMIN_PASSWORD_HASH for a new admin password.
// Usage: npx tsx scripts/hash-password.ts "new password"
import { hashSync } from "bcryptjs";

const password = process.argv[2];
if (!password) throw new Error("Usage: npx tsx scripts/hash-password.ts <password>");
console.log(hashSync(password, 10));
