import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

function stripLocalePrefix(pathname: string) {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0 && routing.locales.some((locale) => locale === segments[0])) {
    segments.shift();
  }

  const stripped = "/" + segments.join("/");
  return stripped === "//" || stripped === "/" ? "/" : stripped.replace(/\/+$/, "") || "/";
}

export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

export { stripLocalePrefix };