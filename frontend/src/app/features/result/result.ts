import { Component, computed, effect, inject, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { formatDate, formatEur } from '../../core/format';
import { I18n, MessageKey } from '../../core/i18n';
import { UrgencyLevel } from '../../core/models';
import { PageStore } from '../../core/page-store';
import { Session } from '../../core/session';

const URGENCY: Record<UrgencyLevel, { key: MessageKey; icon: string }> = {
  high: { key: 'result.urgency.high', icon: 'priority_high' },
  medium: { key: 'result.urgency.medium', icon: 'schedule' },
  low: { key: 'result.urgency.low', icon: 'check_circle' },
};

@Component({
  selector: 'app-result',
  imports: [MatButtonModule, MatCardModule, MatExpansionModule, MatIconModule, MatProgressBarModule],
  templateUrl: './result.html',
  styleUrl: './result.scss',
})
export class Result {
  private readonly router = inject(Router);
  private readonly store = inject(PageStore);
  protected readonly session = inject(Session);
  protected readonly i18n = inject(I18n);

  /** Guarded by hasResultGuard, so a result is always present. */
  protected readonly r = computed(() => this.session.result()!);
  protected readonly urgency = computed(() => URGENCY[this.r().urgency.level]);
  protected readonly errorText = computed(() => this.i18n.error(this.session.errorCode()));

  constructor() {
    // Changing the language re-runs the analysis on the pages still held in memory.
    effect(() => {
      const language = this.i18n.language();
      untracked(() => {
        if (this.session.resultLanguage() !== language && this.store.count() > 0) {
          void this.session.analyze();
        }
      });
    });
  }

  protected date(iso: string | null): string {
    return formatDate(iso, this.i18n.language());
  }

  protected eur(value: number): string {
    return formatEur(value, this.i18n.language());
  }

  protected retry(): void {
    void this.session.analyze();
  }

  protected editPages(): void {
    void this.router.navigateByUrl('/capture');
  }

  protected startOver(): void {
    this.session.startOver();
    void this.router.navigateByUrl('/capture');
  }

  protected get pageCount(): number {
    return this.store.count();
  }
}
