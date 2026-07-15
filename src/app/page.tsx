import { prisma } from "@/lib/prisma";

export default async function Home() {
  const doctors = await prisma.doctor.findMany();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Doctors</h1>
      {doctors.length === 0 ? (
        <p className="text-gray-500">No doctors found</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {doctors.map((doctor) => (
            <li
              key={doctor.id}
              className="rounded-lg border px-4 py-2 shadow-sm"
            >
              {doctor.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
