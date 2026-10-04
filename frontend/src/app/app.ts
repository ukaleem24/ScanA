import { Dir } from '@angular/cdk/bidi';
import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, skip } from 'rxjs';
import { I18n } from './core/i18n';
import { LANGUAGES, LanguageCode } from './core/models';

@Component({
  imports: [Dir, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly i18n = inject(I18n);
  protected readonly languages = LANGUAGES;

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');

    // After each route change, move focus to the new page heading for keyboard and screen-reader users.
    const sub = inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1),
      )
      .subscribe(() => setTimeout(() => document.querySelector<HTMLElement>('main h1')?.focus(), 50));
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  protected select(code: LanguageCode): void {
    void this.i18n.setLanguage(code);
  }
}
