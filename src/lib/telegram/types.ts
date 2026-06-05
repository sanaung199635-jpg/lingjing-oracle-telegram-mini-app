export type TelegramUserInfo = {
  telegram_user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  language_code: string | null;
};

export type TelegramInitState = {
  isTelegram: boolean;
  initData: string | null;
  user: TelegramUserInfo;
  source: "sdk" | "window" | "browser";
  error: string | null;
};

export type TelegramWindowUser = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
};

export type TelegramWebAppWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
      initDataUnsafe?: {
        user?: TelegramWindowUser;
      };
      ready?: () => void;
      expand?: () => void;
      platform?: string;
      version?: string;
    };
  };
};
