import { MapPin, Trophy, TrendingUp, Settings } from "lucide-react";

type ActionParams = {
  totalSessions: number;
  rank?: number;
  nodesAvailable?: number;
  userId: string;
};

export const getActions = ({
  nodesAvailable,
  rank,
  totalSessions,
  userId,
}: ActionParams) => [
  {
    title: "Explore Map",
    description: "Discover nearby mining nodes and start earning Pi!",
    icon: MapPin,
    href: "/map",
    color: "text-primary",
    bgColor: "bg-primary/20",
    borderColor: "border-primary/50",
    badge: `${nodesAvailable ?? 10000} available`,
  },
  {
    title: "View Leaderboard",
    description: "See how you rank against other miners globally",
    icon: Trophy,
    href: "/leaderboard",
    color: "text-neon-orange",
    bgColor: "bg-neon-orange/20",
    borderColor: "border-neon-orange/50",
    badge: rank ? `#${rank}` : "Unranked",
  },
  {
    title: "Mining Sessions",
    description: "Track your progress and optimize your mining strategy",
    icon: TrendingUp,
    href: `/${userId}/sessions`,
    color: "text-neon-green",
    bgColor: "bg-neon-green/20",
    borderColor: "border-neon-green/50",
    badge: `${totalSessions} sessions`,
  },
  {
    title: "Profile & Settings",
    description: "Manage your account, upgrades, and preferences",
    icon: Settings,
    href: "/profile",
    color: "text-neon-purple",
    bgColor: "bg-neon-purple/20",
    borderColor: "border-neon-purple/50",
    badge: "Customize",
  },
];
