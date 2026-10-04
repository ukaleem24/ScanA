import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { I18n } from '../../core/i18n';
import { MAX_PAGES } from '../../core/models';
import { PageStore } from '../../core/page-store';
import { Session } from '../../core/session';

@Component({
  selector: 'app-capture',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './capture.html',
  styleUrl: './capture.scss',
})
export class Capture {
  private readonly router = inject(Router);
  protected readonly store = inject(PageStore);
  protected readonly session = inject(Session);
  protected readonly i18n = inject(I18n);

  protected readonly maxPages = MAX_PAGES;
  private readonly pickError = signal<string | null>(null);

  protected readonly message = computed(
    () => this.i18n.error(this.pickError()) ?? this.i18n.error(this.session.errorCode()),
  );
  protected readonly canAnalyze = computed(
    () => this.store.count() > 0 && !this.session.loading(),
  );

  protected async onPick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // lets the same file/photo be chosen again
    this.session.errorCode.set(null);
    this.pickError.set(await this.store.addFiles(files));
  }

  protected onDrop(event: CdkDragDrop<unknown>): void {
    this.store.move(event.previousIndex, event.currentIndex);
  }

  protected remove(id: number): void {
    this.pickError.set(null);
    this.store.remove(id);
  }

  protected async analyze(): Promise<void> {
    this.pickError.set(null);
    if (await this.session.analyze()) {
      await this.router.navigateByUrl('/result');
    }
  }
}
