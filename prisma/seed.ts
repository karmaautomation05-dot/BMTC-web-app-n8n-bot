import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.feedback.createMany({
    data: [
      {
        doctorName: "Dr. Priyanka Bhargava",
        date: new Date(),
        patientName: "Test",
        phone: "9876549876",
        feedback: "Test",
      },
      {
        doctorName: "Dr. R R Bhargava",
        date: new Date(),
        patientName: "doctor to bahut acche Hai staff miss behaviour karta hai",
        phone: "9838747314",
        feedback: "doctor to bahut acche Hai staff miss behaviour karta hai",
      },
      {
        doctorName: "Dr. Gaurav Bhargava",
        date: new Date(),
        patientName: "बिना गुप्ता",
        phone: "",
        feedback: "Abhi araam nhi mila aur sujan bdi hai phle se jyayda",
      },
    ],
  });

  console.log("Seeded feedback data successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
