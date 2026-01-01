import prisma from "@/lib/prisma";
import CreateClient from "./_components/create-client";

export const metadata = {
  title: "Create Guild",
};

export default async function Page() {
  const guilds = await prisma.guild.findMany({ select: { name: true } });

  const existingNames = guilds.map((g) => g.name);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <CreateClient existingNames={existingNames} />
    </div>
  );
}
