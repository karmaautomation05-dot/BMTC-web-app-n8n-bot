import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.createMany({
    data: [
      {
        username: "gaurav.bhargava",
        password: "Gaurav@748",
        role: "doctor",
      },
      {
        username: "priyanka.bhargava",
        password: "Priyanka@392",
        role: "doctor",
      },
      {
        username: "r.r.bhargava",
        password: "Rr@5961",
        role: "doctor",
      },
      {
        username: "karma",
        password: "Karma@847",
        role: "admin",
      },
      {
        username: "receptionist",
        password: "Reception@263",
        role: "reception",
      },
    ],
  });

  console.log("Seeded users successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
