import type { Metadata } from "next";
import { GearBrowser } from "@/components/gear/gear-browser";

export const metadata: Metadata = {
  title: "Browse Gear",
  description: "Browse sports and outdoor equipment available for rent on GearUp.",
};

export default function GearPage() {
  return <GearBrowser />;
}
