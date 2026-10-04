import { TestBed } from '@angular/core/testing';
import { PageStore } from './page-store';

function img(name: string, type = 'image/jpeg', size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}
function pdf(name = 'letter.pdf', size = 100): File {
  return new File([new Uint8Array(size)], name, { type: 'application/pdf' });
}

describe('PageStore', () => {
  let store: PageStore;
  let revoke: ReturnType<typeof vi.fn>;
  let n: number;

  beforeEach(() => {
    n = 0;
    revoke = vi.fn();
    URL.createObjectURL = vi.fn(() => `blob:test/${++n}`);
    URL.revokeObjectURL = revoke as unknown as typeof URL.revokeObjectURL;
    store = TestBed.inject(PageStore);
  });

  it('adds pages in order', async () => {
    expect(await store.addFiles([img('a.jpg'), img('b.jpg')])).toBeNull();
    expect(await store.addFiles([img('c.jpg')])).toBeNull();
    expect(store.pages().map((p) => p.name)).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
    expect(store.count()).toBe(3);
  });

  it('reorders pages', async () => {
    await store.addFiles([img('a.jpg'), img('b.jpg'), img('c.jpg')]);
    store.move(0, 2);
    expect(store.pages().map((p) => p.name)).toEqual(['b.jpg', 'c.jpg', 'a.jpg']);
    store.move(2, 1);
    expect(store.pages().map((p) => p.name)).toEqual(['b.jpg', 'a.jpg', 'c.jpg']);
  });

  it('ignores out-of-range moves', async () => {
    await store.addFiles([img('a.jpg'), img('b.jpg')]);
    store.move(0, 5);
    store.move(-1, 0);
    expect(store.pages().map((p) => p.name)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('deletes a page and revokes its preview URL', async () => {
    await store.addFiles([img('a.jpg'), img('b.jpg')]);
    const [first] = store.pages();
    store.remove(first.id);
    expect(store.pages().map((p) => p.name)).toEqual(['b.jpg']);
    expect(revoke).toHaveBeenCalledWith(first.previewUrl);
  });

  it('clear drops everything and revokes all URLs', async () => {
    await store.addFiles([img('a.jpg'), img('b.jpg')]);
    store.clear();
    expect(store.count()).toBe(0);
    expect(revoke).toHaveBeenCalledTimes(2);
  });

  it('allows 10 pages but rejects an 11th, keeping existing pages', async () => {
    const ten = Array.from({ length: 10 }, (_, i) => img(`p${i}.jpg`));
    expect(await store.addFiles(ten)).toBeNull();
    expect(await store.addFiles([img('extra.jpg')])).toBe('too_many_pages');
    expect(store.count()).toBe(10);
  });

  it('rejects unsupported types without adding anything', async () => {
    expect(await store.addFiles([img('a.jpg'), img('x.gif', 'image/gif')])).toBe('unsupported_type');
    expect(store.count()).toBe(0);
    expect(revoke).toHaveBeenCalledTimes(1); // the preview created for a.jpg was released
  });

  it('rejects HEIC when the browser cannot convert it', async () => {
    expect(await store.addFiles([img('a.heic', 'image/heic')])).toBe('unsupported_type');
  });

  it('rejects when total size exceeds 10 MB', async () => {
    expect(await store.addFiles([img('big.jpg', 'image/jpeg', 6 * 1024 * 1024)])).toBeNull();
    expect(await store.addFiles([img('big2.jpg', 'image/jpeg', 5 * 1024 * 1024)])).toBe('file_too_large');
    expect(store.count()).toBe(1);
  });

  it('accepts a single PDF with no thumbnail', async () => {
    expect(await store.addFiles([pdf()])).toBeNull();
    expect(store.hasPdf()).toBe(true);
    expect(store.pages()[0].previewUrl).toBeNull();
  });

  it('does not mix PDF and images in either order', async () => {
    await store.addFiles([img('a.jpg')]);
    expect(await store.addFiles([pdf()])).toBe('pdf_must_be_single_file');
    store.clear();
    await store.addFiles([pdf()]);
    expect(await store.addFiles([img('a.jpg')])).toBe('pdf_must_be_single_file');
    store.clear();
    expect(await store.addFiles([pdf('a.pdf'), pdf('b.pdf')])).toBe('pdf_must_be_single_file');
  });
});
