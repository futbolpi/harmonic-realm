import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LinkCardButton from "./link-card-button";

const links = [
  {
    title: "Lattice Map",
    description: "View your discovered Nodes and resonance patterns",
    href: "/dashboard",
  },
  {
    title: "Resonate",
    description: "Mine Shares from nearby Nodes and unlock Lore Fragments",
    href: "/map",
  },
  {
    title: "Extend Your Echo",
    description: "Invite fellow Pioneers to strengthen the Lattice network",
    href: "/referrals",
  },
  {
    title: "Contact the Council",
    description: "Connect with the Cosmic Council through our social channels.",
    href: "/contact",
  },
];

export function LinkCards() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {links.map((link) => {
        const isExternal = link.href.startsWith("http");
        return (
          <div key={link.href} className="group flex w-full flex-1">
            <Card className="flex w-full flex-col">
              <CardHeader className="flex-1">
                <CardTitle>{link.title}</CardTitle>

                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <LinkCardButton
                  isExternal={isExternal}
                  redirect={link.href}
                />
              </CardFooter>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
