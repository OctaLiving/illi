// Promote (or demote) a user by email. Bootstraps the first operator.
//   node scripts/set-role.mjs <email> [role]      (role defaults to "operator")
import 'dotenv/config'
import pg from 'pg'

const [, , email, role = 'operator'] = process.argv
if (!email) {
  console.error('usage: node scripts/set-role.mjs <email> [role]')
  process.exit(1)
}

// Only touch `role` — leave Prisma-managed columns untouched.
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const res = await client.query('UPDATE "User" SET role = $1 WHERE email = $2', [role, email])
await client.end()

console.log(res.rowCount ? `✓ ${email} → ${role}` : `! no user found with email ${email}`)
