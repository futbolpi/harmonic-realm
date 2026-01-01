import DiscoverClient from "./_components/discover-client";
import { getGuilds } from "./services";

export const metadata = {
  title: "Discover Guilds",
};

export default async function Page() {
  const guilds = await getGuilds();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Discover Guilds</h1>
      <DiscoverClient guilds={guilds} />
    </div>
  );
}
