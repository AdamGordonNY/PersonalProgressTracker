import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ArrowUpCircle,
  ClipboardList,
  Cloud,
  LayoutDashboard,
  Music4Icon,
  Plus,
  RssIcon,
  Settings,
  WeightIcon,
} from "lucide-react";
import { IconBubbleX } from "@tabler/icons-react";
import { ClubType } from "@prisma/client";
import { ShotType } from "@prisma/client";
export const appRoutes = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/cloud",
    title: "Cloud Storage",
    icon: Cloud,
  },
  {
    href: "/golf",
    title: "Golf Tracker",
    icon: WeightIcon,
  },
  {
    href: "/posture",
    title: "Posture Guardian",
    icon: ArrowUpCircle,
  },
  {
    href: "/habits",
    title: "Habits",
    icon: Plus,
  },
  {
    href: "/feeds",
    title: "RSS Feeds",
    icon: RssIcon,
  },
  {
    href: "/settings",
    title: "Settings",
    icon: Settings,
  },
  {
    href: "/music-mastery",
    title: "Music Mastery",
    icon: Music4Icon,
  },
  {
    href: "/knowledge",
    title: "Knowledge Base",
    icon: IconBubbleX,
  },
  {
    href: "/questionnaires",
    title: "Questionnaires",
    icon: ClipboardList,
  },
];
export const shotTypeToString = (shot: ShotType): string => {
  const map: Record<ShotType, string> = {
    DRIVE: "Drive",
    FAIRWAY: "Fairway",
    APPROACH: "Approach",
    CHIP: "Chip",
    PITCH: "Pitch",
    BUNKER: "Bunker",
    PUTT: "Putt",
    RECOVERY: "Recovery",
  };

  return map[shot] || shot;
};

export const stringToShotType = (str: string): ShotType | null => {
  const reverseMap: Record<string, ShotType> = {
    Drive: ShotType.DRIVE,
    Fairway: ShotType.FAIRWAY,
    Approach: ShotType.APPROACH,
    Chip: ShotType.CHIP,
    Pitch: ShotType.PITCH,
    Bunker: ShotType.BUNKER,
    Putt: ShotType.PUTT,
    Recovery: ShotType.RECOVERY,
  };

  return reverseMap[str] || null;
};
export const clubTypeToString = (club: ClubType): string => {
  const map: Record<ClubType, string> = {
    DRIVER: "Driver",
    THREE_WOOD: "3 Wood",
    FOUR_HYBRID: "4 Hybrid",
    FIVE_HYBRID: "5 Hybrid",
    TWO_IRON: "2 Iron",
    THREE_IRON: "3 Iron",
    FOUR_IRON: "4 Iron",
    FIVE_IRON: "5 Iron",
    SIX_IRON: "6 Iron",
    SEVEN_IRON: "7 Iron",
    EIGHT_IRON: "8 Iron",
    NINE_IRON: "9 Iron",
    PITCHING_WEDGE: "Pitching Wedge",
    GAP_WEDGE: "Gap Wedge",
    SAND_WEDGE: "Sand Wedge",
    LOB_WEDGE: "Lob Wedge",
    PUTTER: "Putter",
  };

  return map[club] || club;
};

export const stringToClubType = (str: string): ClubType | null => {
  const reverseMap: Record<string, ClubType> = {
    Driver: ClubType.DRIVER,
    "3 Wood": ClubType.THREE_WOOD,
    "4 Hybrid": ClubType.FOUR_HYBRID,
    "5 Hybrid": ClubType.FIVE_HYBRID,
    "2 Iron": ClubType.TWO_IRON,
    "3 Iron": ClubType.THREE_IRON,
    "4 Iron": ClubType.FOUR_IRON,
    "5 Iron": ClubType.FIVE_IRON,
    "6 Iron": ClubType.SIX_IRON,
    "7 Iron": ClubType.SEVEN_IRON,
    "8 Iron": ClubType.EIGHT_IRON,
    "9 Iron": ClubType.NINE_IRON,
    "Pitching Wedge": ClubType.PITCHING_WEDGE,
    "Gap Wedge": ClubType.GAP_WEDGE,
    "Sand Wedge": ClubType.SAND_WEDGE,
    "Lob Wedge": ClubType.LOB_WEDGE,
    Putter: ClubType.PUTTER,
  };

  return reverseMap[str] || null;
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
