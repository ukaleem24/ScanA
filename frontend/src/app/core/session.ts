import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api, ApiError } from './api';
import { I18n } from './i18n';
import { LanguageCode, LetterAnalysis } from './models';
import { PageStore } from './page-store';

/** State of the current visit. Memory only: a page reload discards everything. */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly api = inject(Api);
  private readonly store = inject(PageStore);
  private readonly i18n = inject(I18n);

  readonly privacyAccepted = signal(false);
  readonly fullTranslation = signal(false);
  readonly loading = signal(false);
  readonly errorCode = signal<string | null>(null);
  readonly result = signal<LetterAnalysis | null>(null);
  /** Language the current result was written in (may differ from the UI language until re-run). */
  readonly resultLanguage = signal<LanguageCode | null>(null);

  /** Sends the held pages for analysis in the current language. Resolves true on success. */
  async analyze(): Promise<boolean> {
    if (this.loading() || this.store.count() === 0) return false;
    const language = this.i18n.language();
    this.loading.set(true);
    this.errorCode.set(null);
    try {
      const result = await firstValueFrom(
        this.api.analyze(this.store.pages(), language, this.fullTranslation()),
      );
      this.result.set(result);
      this.resultLanguage.set(language);
      return true;
    } catch (err) {
      this.errorCode.set(err instanceof ApiError ? err.code : 'unknown');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  /** Forget the letter and its analysis. Keeps the language and privacy acknowledgement. */
  startOver(): void {
    this.store.clear();
    this.result.set(null);
    this.resultLanguage.set(null);
    this.errorCode.set(null);
  }
}
