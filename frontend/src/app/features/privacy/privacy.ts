import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../core/api';
import { I18n } from '../../core/i18n';
import { Session } from '../../core/session';

@Component({
  selector: 'app-privacy',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  private readonly router = inject(Router);
  protected readonly session = inject(Session);
  protected readonly i18n = inject(I18n);
  /** Shown when the backend runs on a free development provider. */
  protected readonly devProvider = signal<string | null>(null);

  constructor() {
    inject(Api)
      .health()
      .subscribe({
        next: (h) => this.devProvider.set(h.provider === 'gemini' ? 'Gemini (free tier)' : null),
        error: () => undefined, // purely informational
      });
  }

  protected accept(): void {
    this.session.privacyAccepted.set(true);
    void this.router.navigateByUrl('/capture');
  }
}
