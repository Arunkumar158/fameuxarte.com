"use client";

import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";

type NavigateOptions = { replace?: boolean; state?: unknown };
type To = string | { pathname?: string; search?: string; hash?: string };

function normalizeTo(to: To): string {
  if (typeof to === "string") return to;
  return `${to.pathname || ""}${to.search || ""}${to.hash || ""}` || "/";
}

export function Link({ to, href, replace: _replace, state: _state, ...props }: any) {
  return <NextLink href={href || normalizeTo(to || "/")} {...props} />;
}

export function NavLink({ to, end, className, children, ...props }: any) {
  const pathname = usePathname() || "/";
  const href = normalizeTo(to || "/");
  const isActive = end ? pathname === href : pathname === href || (href !== "/" && pathname.startsWith(href));
  const resolvedClassName = typeof className === "function" ? className({ isActive, isPending: false }) : className;
  return <NextLink href={href} className={resolvedClassName} {...props}>{children}</NextLink>;
}

export function useNavigate() {
  const router = useRouter();
  return (to: number | To, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }
    const href = normalizeTo(to);
    if (options?.replace) router.replace(href);
    else router.push(href);
  };
}

export function useLocation() {
  const pathname = usePathname() || "/";
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString();
  return useMemo(() => ({
    pathname,
    search: search ? `?${search}` : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state: null,
    key: pathname,
  }), [pathname, search]);
}

export function useParams<T extends Record<string, any> = Record<string, string>>() {
  const params = useNextParams() as Record<string, string | string[]>;
  const normalized: Record<string, string> = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    normalized[key] = Array.isArray(value) ? value.join("/") : value;
  });
  if (Array.isArray(params?.slug)) normalized["*"] = params.slug.join("/");
  return normalized as T;
}

export function useSearchParams(): [URLSearchParams, (nextInit: URLSearchParams | Record<string, string> | string) => void] {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const nextParams = useNextSearchParams();
  const params = useMemo(() => new URLSearchParams(nextParams?.toString()), [nextParams]);
  const setSearchParams = (nextInit: URLSearchParams | Record<string, string> | string) => {
    const updated = nextInit instanceof URLSearchParams ? nextInit : new URLSearchParams(nextInit as any);
    const query = updated.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };
  return [params, setSearchParams];
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    const href = normalizeTo(to);
    if (replace) router.replace(href);
    else router.push(href);
  }, [router, to, replace]);
  return null;
}

export function Outlet() { return null; }
export function BrowserRouter({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function Routes({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function Route(_props: any) { return null; }
