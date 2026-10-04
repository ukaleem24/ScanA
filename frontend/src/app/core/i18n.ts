import { Injectable, computed, signal } from '@angular/core';
import { en, MessageKey, Messages } from './i18n/en';
import { LANGUAGES, LanguageCode } from './models';

export type { MessageKey };

/** Non-English dictionaries are separate lazy chunks (precached by the service worker). */
const LOADERS: Record<Exclude<LanguageCode, 'en'>, () => Promise<Messages>> = {
  de: () => import('./i18n/de').then((m) => m.de),
  ar: () => import('./i18n/ar').then((m) => m.ar),
  tr: () => import('./i18n/tr').then((m) => m.tr),
  uk: () => import('./i18n/uk').then((m) => m.uk),
  ru: () => import('./i18n/ru').then((m) => m.ru),
  fa: () => import('./i18n/fa').then((m) => m.fa),
  es: () => import('./i18n/es').then((m) => m.es),
  fr: () => import('./i18n/fr').then((m) => m.fr),
};

const STORAGE_KEY = 'briefscanner.language';

/** UI language and analysis language are one setting. */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly messages = signal<Messages>(en);

  readonly language = signal<LanguageCode>('en');
  readonly dir = computed<'ltr' | 'rtl'>(() =>
    LANGUAGES.find((l) => l.code === this.language())?.rtl ? 'rtl' : 'ltr',
  );
  readonly languageName = computed(() => LANGUAGES.find((l) => l.code === this.language())!.label);

  /** Switches language. Returns false (and changes nothing) if the dictionary cannot be loaded. */
  async setLanguage(code: LanguageCode): Promise<boolean> {
    try {
      const messages = code === 'en' ? en : await LOADERS[code]();
      this.messages.set(messages);
    } catch {
      return false;
    }
    this.language.set(code);
    this.applyToDocument();
    this.save(code);
    return true;
  }

  /** Restores the remembered language (a harmless per-device preference, not letter data). */
  async restore(): Promise<void> {
    const saved = this.load();
    if (saved && saved !== 'en') await this.setLanguage(saved);
    else this.applyToDocument();
  }

  t(key: MessageKey, params?: Record<string, string | number>): string {
    let text = this.messages()[key] ?? en[key];
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  /** Message for a backend/local error code; unknown codes fall back to the generic message. */
  error(code: string | null): string | null {
    if (code === null) return null;
    const key = `error.${code}` as MessageKey;
    return this.t(key in en ? key : 'error.unknown');
  }

  private applyToDocument(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.dir();
  }

  private save(code: LanguageCode): void {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable (private mode etc.): the choice just won't be remembered */
    }
  }

  private load(): LanguageCode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES.some((l) => l.code === value) ? (value as LanguageCode) : null;
    } catch {
      return null;
    }
  }
}
