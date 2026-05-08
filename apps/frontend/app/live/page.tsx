import { redirect } from "next/navigation";

/**
 * `/live` (index) used to render a separate browse-matches page; that page
 * has been merged into the Discover experience at `/browse`. We keep the
 * route as a redirect so deep links from the Header, Footer, landing CTAs,
 * and dashboard tiles continue to resolve.
 *
 * `/live/[...id]` (the actual stream watcher) is unaffected.
 */
export default function LiveIndexPage() {
  redirect("/browse");
}
