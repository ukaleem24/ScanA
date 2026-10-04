import { Injectable, computed, signal } from '@angular/core';
import { compressImage } from './image-compress';
import { MAX_PAGES, MAX_TOTAL_BYTES } from './models';

export type PageError =
  | 'too_many_pages'
  | 'file_too_large'
  | 'unsupported_type'
  | 'pdf_must_be_single_file';

export interface CapturedPage {
  id: number;
  kind: 'image' | 'pdf';
  blob: Blob;
  name: string;
  size: number;
  /** Object URL for the thumbnail; null for PDFs. */
  previewUrl: string | null;
}

const RAW_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CONVERTIBLE_TYPES = ['image/heic', 'image/heif'];

/** Pages being assembled for one letter. Held in memory only; never persisted. */
@Injectable({ providedIn: 'root' })
export class PageStore {
  private nextId = 1;
  private readonly _pages = signal<CapturedPage[]>([]);

  readonly pages = this._pages.asReadonly();
  readonly count = computed(() => this._pages().length);
  readonly totalBytes = computed(() => this._pages().reduce((sum, p) => sum + p.size, 0));
  readonly hasPdf = computed(() => this._pages().some((p) => p.kind === 'pdf'));

  /** Adds files in order. Returns an error code, or null on success (all-or-nothing). */
  async addFiles(files: File[]): Promise<PageError | null> {
    if (files.length === 0) return null;

    const pdfs = files.filter((f) => f.type === 'application/pdf');
    if (pdfs.length > 0) {
      if (files.length > 1 || this.count() > 0) return 'pdf_must_be_single_file';
    } else if (this.hasPdf()) {
      return 'pdf_must_be_single_file';
    }
    if (pdfs.length === 0 && this.count() + files.length > MAX_PAGES) return 'too_many_pages';

    const added: CapturedPage[] = [];
    for (const file of files) {
      if (file.type === 'application/pdf') {
        added.push(this.makePage('pdf', file, file.name));
        continue;
      }
      if (![...RAW_IMAGE_TYPES, ...CONVERTIBLE_TYPES].includes(file.type)) {
        this.release(added);
        return 'unsupported_type';
      }
      const blob = await compressImage(file);
      if (!RAW_IMAGE_TYPES.includes(blob.type)) {
        this.release(added); // e.g. HEIC the browser could not convert
        return 'unsupported_type';
      }
      added.push(this.makePage('image', blob, file.name));
    }

    const total = this.totalBytes() + added.reduce((sum, p) => sum + p.size, 0);
    if (total > MAX_TOTAL_BYTES) {
      this.release(added);
      return 'file_too_large';
    }
    this._pages.update((pages) => [...pages, ...added]);
    return null;
  }

  remove(id: number): void {
    const page = this._pages().find((p) => p.id === id);
    if (!page) return;
    this.release([page]);
    this._pages.update((pages) => pages.filter((p) => p.id !== id));
  }

  move(from: number, to: number): void {
    const pages = [...this._pages()];
    if (from === to || from < 0 || to < 0 || from >= pages.length || to >= pages.length) return;
    const [page] = pages.splice(from, 1);
    pages.splice(to, 0, page);
    this._pages.set(pages);
  }

  clear(): void {
    this.release(this._pages());
    this._pages.set([]);
  }

  private makePage(kind: 'image' | 'pdf', blob: Blob, name: string): CapturedPage {
    const canPreview = kind === 'image' && typeof URL.createObjectURL === 'function';
    return {
      id: this.nextId++, // not crypto.randomUUID: unavailable over plain http on a phone
      kind,
      blob,
      name,
      size: blob.size,
      previewUrl: canPreview ? URL.createObjectURL(blob) : null,
    };
  }

  private release(pages: CapturedPage[]): void {
    for (const page of pages) {
      if (page.previewUrl) URL.revokeObjectURL(page.previewUrl);
    }
  }
}
