"use server";

import { cookies } from "next/headers";

export const getFromCookies = async (name: string): Promise<string | null> => {
  const cookie = await cookies();
  const token = cookie.get(name);
  return token ? token.value : null;
};

export const setInCookies = async (
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  } = {}
): Promise<void> => {
  const cookie = await cookies();
  const opts = {
    path: options.path || "/",
    maxAge: options.maxAge || 60 * 60 * 24 * 45, // 45 days
    httpOnly: options.httpOnly !== undefined ? options.httpOnly : true,
    secure:
      options.secure !== undefined
        ? options.secure
        : process.env.NODE_ENV === "production",
    sameSite: options.sameSite || "lax",
  };
  cookie.set(name, value, opts);
};

export const deleteFromCookies = async (name: string): Promise<void> => {
  const cookie = await cookies();
  cookie.delete(name);
};

export const clearAllCookies = async (): Promise<void> => {
  const cookie = await cookies();
  const allCookies = cookie.getAll();
  allCookies.forEach((c) => {
    cookie.delete(c.name);
  });
};

export const getUserFromCookie = async () => {
  const cookie = await cookies();
  const user = cookie.get("user");
  const data = user ? JSON.parse(user.value) : null;
  return data;
};
