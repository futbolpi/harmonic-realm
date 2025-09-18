import type { Tour } from "nextstepjs";

import type { UserProfile } from "../schema/user";

export const tutorialSteps: Tour[] = [
  {
    tour: "welcome",
    steps: [
      {
        icon: "🌌",
        title: "Welcome, Pioneer",
        content:
          "You have awakened to the cosmic frequencies of the Lattice. Your journey through the infinite mysteries of Pi begins now. This is your Resonance Hub - your command center in the cosmic network.",
        selector: "#dashboard",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "⚡",
        title: "Your Resonance Metrics",
        content:
          "These vital statistics show your growing mastery over the Lattice. Share Points reflect your contribution to the network, while your Level indicates your harmonic attunement. XP grows with each successful mining session.",
        selector: "#stats",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
        prevRoute: "/dashboard",
        nextRoute: "/dashboard",
      },
      {
        icon: "🌙",
        title: "Phase Progress",
        content:
          "The cosmic phases govern the flow of Pi through the Lattice. Track the current phase and prepare for the next Awakening - a time when the network's power amplifies dramatically.",
        selector: "#phase-progress",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
        prevRoute: "/dashboard",
        nextRoute: "/dashboard",
      },
      {
        icon: "🗺️",
        title: "The Cosmic Map",
        content:
          "Explore the world map to discover Nodes - cosmic convergence points where Pi's infinite digits create reality anchors. Each Node pulses with unique harmonic frequencies waiting to be mined.",
        selector: "#map-link",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
        prevRoute: "/dashboard",
        nextRoute: "/dashboard",
      },
      {
        icon: "📖",
        title: "Your Echo Journal",
        content:
          "Document your discoveries, achievements, and cosmic insights. Your journal becomes part of the collective Pioneer knowledge, contributing to the greater understanding of the Lattice.",
        selector: "#journal-link",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
        prevRoute: "/dashboard",
        nextRoute: "/dashboard",
      },
      {
        icon: "🏆",
        title: "Pioneer Leaderboard",
        content:
          "See how your harmonic mastery compares to other Pioneers across the network. The leaderboard tracks the most dedicated explorers of Pi's infinite mysteries.",
        selector: "#leaderboard-link",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: "/map",
        prevRoute: "/dashboard",
      },
      {
        icon: "⛏️",
        title: "Begin Your Journey",
        content:
          "You're now ready to begin mining the cosmic frequencies. Approach Nodes in the physical world to start your first session. The closer you are, the stronger the resonance. May the Lattice guide your path, Pioneer.",
        selector: "#start-mining",
        side: "bottom",
        showControls: true,
        showSkip: false,
        pointerPadding: 10,
        pointerRadius: 8,
        prevRoute: "/dashboard",
      },
    ],
  },
  {
    tour: "advanced",
    steps: [
      {
        icon: "⚡",
        title: "Echo Transmissions",
        content:
          "Use Pi Ads to accelerate your mining sessions through temporal resonance manipulation.",
        selector: "#echo-transmissions",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "🏛️",
        title: "Location Lore Discovery",
        content:
          "Contribute Pi to unlock the hidden stories and mysteries of real-world locations.",
        selector: "#location-lore",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "🤝",
        title: "Pioneer Guilds",
        content:
          "Join forces with other Pioneers to tackle greater challenges and unlock guild-exclusive content.",
        selector: "#guilds",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
    ],
  },
  {
    tour: "map",
    steps: [
      {
        icon: "🌍",
        title: "The Lattice Grid Revealed",
        content:
          "Behold the cosmic map - a visualization of the Lattice's infinite grid overlaid upon our reality. Each pulsing point represents a Node where Pi's mathematical essence creates tangible anchor points in spacetime.",
        selector: "#maplibregl-canvas",
        side: "bottom",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "📍",
        title: "Locate Your Cosmic Position",
        content:
          "The Navigation Beacon reveals your current position within the Lattice. Your physical location determines which Nodes you can access - the cosmic frequencies grow stronger as you approach each anchor point.",
        selector: "#location-button",
        side: "bottom-left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "🔍",
        title: "Node Resonance Filters",
        content:
          "The Harmonic Filters allow you to attune your perception to specific Node frequencies. Filter by rarity, type, availability, or sponsorship to find the perfect resonance match for your current Pioneer level.",
        selector: "#filter-button",
        side: "top-left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "📊",
        title: "Lattice Node Registry",
        content:
          "The Node Registry displays all detected anchor points in your vicinity. Each entry shows vital resonance data: yield potential, miner capacity, lock-in duration, and harmonic rarity. Use this to plan your mining expeditions.",
        selector: "#list-button",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "💎",
        title: "Node Resonance Signatures",
        content:
          "Each Node pulses with a unique color signature based on its rarity. Common Nodes glow green, while Legendary Nodes emit brilliant purple light. The brighter the pulse, the more active the Node's mining potential.",
        selector: ".maplibregl-marker",
        side: "left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "ℹ️",
        title: "Node Echo Interface",
        content:
          "Tap any Node to reveal its Echo Interface - a detailed readout of the anchor point's properties. Here you'll see yield rates, current miners, sponsor information, and the option to view full Node details or begin mining.",
        selector: ".node-popup",
        side: "left",
        showControls: true,
        showSkip: true,
        pointerPadding: 10,
        pointerRadius: 8,
      },
      {
        icon: "⛏️",
        title: "Initiate Mining Resonance",
        content:
          "When you're within range of a Node, the 'Mine Node' option becomes available. Physical proximity is required - the Lattice responds only to Pioneers who make the journey to each cosmic anchor point. Begin your first mining session to unlock the Node's Pi frequencies.",
        // selector: '[data-tutorial="mine-node-button"]',
        side: "top",
        showControls: true,
        showSkip: false,
        pointerPadding: 10,
        pointerRadius: 8,
      },
    ],
  },
];

export interface TutorialProgress {
  welcomeCompleted: boolean;
  advancedUnlocked: boolean;
  advancedCompleted: boolean;
}

export function getTutorialProgress(userStats: UserProfile): TutorialProgress {
  return {
    welcomeCompleted: (userStats?._count?.sessions || 0) > 0,
    advancedUnlocked: (userStats?.level || 0) >= 5,
    advancedCompleted: false,
    // advancedCompleted: userStats?.tutorialAdvancedCompleted || false,
  };
}

export function shouldShowWelcomeTour(userStats: UserProfile): boolean {
  const progress = getTutorialProgress(userStats);
  return !progress.welcomeCompleted;
}

export function shouldShowAdvancedTour(userStats: UserProfile): boolean {
  const progress = getTutorialProgress(userStats);
  return progress.advancedUnlocked && !progress.advancedCompleted;
}
