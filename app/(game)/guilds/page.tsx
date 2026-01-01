import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGuildsPageData } from "./services";

export default async function GuildsPage() {
  const guilds = await getGuildsPageData();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Guilds</h1>
          <Button asChild>
            <Link href="/guilds/create">Create Guild</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guilds.length > 0 ? (
            guilds.map((g) => (
              <Card key={g.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{g.emblem}</div>
                      <div>
                        <CardTitle className="text-base">{g.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {g.tag} • {g.leaderUsername}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {g._count.members}/{g.maxMembers}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Vault</p>
                      <p className="font-semibold">
                        {g.vaultBalance.toLocaleString()} Points
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/guilds/${g.id}`}
                        className="text-sm text-primary"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Guilds yet</CardTitle>
                <CardDescription>
                  Be the first to create guilds to boost earnings
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link href="/guilds/create">Create Guild</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
