export interface ThemeConfig {
  name: string;
  seasonKey: "halloween" | "summer" | "festive" | "autumn" | "winter" | "spring";
  bgGlow: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  pumpkinsTopLeft?: boolean;
  pumpkinsBottomRight?: boolean;
  flyingBats?: boolean;
  primaryEmoji: string;
  secondaryEmoji: string;
  subtitle: string;
}

export function getCurrentSeasonTheme(): ThemeConfig {
  const now = new Date();
  const month = now.getMonth() + 1; // 1 - 12
  const day = now.getDate();

  // HALLOWEEN (Oct 15 - Oct 31)
  if (month === 10 && day >= 15) {
    return {
      name: "Halloween Spooktacular",
      seasonKey: "halloween",
      bgGlow: "from-orange-500/20 via-purple-900/30 to-black",
      accentColor: "#f97316",
      badgeBg: "bg-orange-500/20",
      badgeText: "text-orange-400 border-orange-500/30",
      pumpkinsTopLeft: true,
      pumpkinsBottomRight: true,
      flyingBats: true,
      primaryEmoji: "🎃",
      secondaryEmoji: "🦇",
      subtitle: "Secunda's Spooktacular Local Service Directory 🎃",
    };
  }

  // FESTIVE / CHRISTMAS (Dec 15 - Dec 31)
  if (month === 12 && day >= 15) {
    return {
      name: "Festive Season",
      seasonKey: "festive",
      bgGlow: "from-red-900/30 via-emerald-950/30 to-black",
      accentColor: "#ef4444",
      badgeBg: "bg-red-500/20",
      badgeText: "text-red-400 border-red-500/30",
      primaryEmoji: "🎄",
      secondaryEmoji: "✨",
      subtitle: "Secunda's Festive Local Service Directory 🎄",
    };
  }

  // SA SPRING & SUMMER (Nov 1 - Dec 14 & Jan 1 - Feb 28)
  if ((month === 11) || (month === 12 && day < 15) || month === 1 || month === 2) {
    return {
      name: "Sunny South African Summer",
      seasonKey: "summer",
      bgGlow: "from-amber-500/10 via-emerald-950/20 to-black",
      accentColor: "#10b981",
      badgeBg: "bg-emerald-500/20",
      badgeText: "text-emerald-400 border-emerald-500/30",
      primaryEmoji: "☀️",
      secondaryEmoji: "🌴",
      subtitle: "Secunda's Summer Local Service Directory ☀️",
    };
  }

  // AUTUMN (March - May)
  if (month >= 3 && month <= 5) {
    return {
      name: "Golden Autumn",
      seasonKey: "autumn",
      bgGlow: "from-amber-700/20 via-orange-950/20 to-black",
      accentColor: "#d97706",
      badgeBg: "bg-amber-500/20",
      badgeText: "text-amber-400 border-amber-500/30",
      primaryEmoji: "🍂",
      secondaryEmoji: "🍁",
      subtitle: "Secunda's Autumn Local Service Directory 🍂",
    };
  }

  // WINTER (June - August)
  if (month >= 6 && month <= 8) {
    return {
      name: "Cozy Winter",
      seasonKey: "winter",
      bgGlow: "from-blue-900/20 via-cyan-950/20 to-black",
      accentColor: "#38bdf8",
      badgeBg: "bg-sky-500/20",
      badgeText: "text-sky-400 border-sky-500/30",
      primaryEmoji: "❄️",
      secondaryEmoji: "☕",
      subtitle: "Secunda's Winter Local Service Directory ❄️",
    };
  }

  // EARLY SPRING (Sep 1 - Oct 14)
  return {
    name: "Spring Bloom",
    seasonKey: "spring",
    bgGlow: "from-fuchsia-900/20 via-cyan-950/20 to-black",
    accentColor: "#f43f5e",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-400 border-rose-500/30",
    primaryEmoji: "🌸",
    secondaryEmoji: "🦋",
    subtitle: "Secunda's Spring Local Service Directory 🌸",
  };
}