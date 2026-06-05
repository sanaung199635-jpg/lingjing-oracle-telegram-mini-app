"use client";

import type { InitData, User } from "@telegram-apps/sdk";
import type { TelegramInitState, TelegramUserInfo, TelegramWebAppWindow, TelegramWindowUser } from "@/lib/telegram/types";

const emptyUser: TelegramUserInfo = {
  telegram_user_id: null,
  username: null,
  first_name: null,
  last_name: null,
  photo_url: null,
  language_code: null
};

export async function initTelegramClient(): Promise<TelegramInitState> {
  if (typeof window === "undefined") {
    return {
      isTelegram: false,
      initData: null,
      user: emptyUser,
      source: "browser",
      error: null
    };
  }

  try {
    const sdk = await import("@telegram-apps/sdk");
    sdk.init();

    const launchParams = sdk.retrieveLaunchParams(true);
    const rawInitData = sdk.retrieveRawInitData() || null;
    const initData = launchParams.tgWebAppData as InitData | undefined;
    const user = normalizeSdkUser(initData?.user);

    return {
      isTelegram: sdk.isTMA(),
      initData: rawInitData,
      user,
      source: "sdk",
      error: null
    };
  } catch (error) {
    return readTelegramFromWindow(error);
  }
}

function readTelegramFromWindow(error: unknown): TelegramInitState {
  const telegramWindow = window as TelegramWebAppWindow;
  const webApp = telegramWindow.Telegram?.WebApp;
  const initData = webApp?.initData || null;
  const user = normalizeWindowUser(webApp?.initDataUnsafe?.user);

  try {
    webApp?.ready?.();
    webApp?.expand?.();
  } catch {
    // Telegram clients may ignore unsupported methods in browser-like environments.
  }

  return {
    isTelegram: Boolean(webApp && initData),
    initData,
    user,
    source: webApp ? "window" : "browser",
    error: error instanceof Error ? error.message : null
  };
}

function normalizeSdkUser(user?: User): TelegramUserInfo {
  if (!user) return emptyUser;

  return {
    telegram_user_id: user.id ?? null,
    username: user.username ?? null,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    photo_url: user.photo_url ?? null,
    language_code: user.language_code ?? null
  };
}

function normalizeWindowUser(user?: TelegramWindowUser): TelegramUserInfo {
  if (!user) return emptyUser;

  return {
    telegram_user_id: user.id ?? null,
    username: user.username ?? null,
    first_name: user.first_name ?? null,
    last_name: user.last_name ?? null,
    photo_url: user.photo_url ?? null,
    language_code: user.language_code ?? null
  };
}
