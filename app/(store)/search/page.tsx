import type { Metadata } from "next";
import { SearchView } from "@/components/views/SearchView";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default function Page() {
  return <SearchView />;
}
