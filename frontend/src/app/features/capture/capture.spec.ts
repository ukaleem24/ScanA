import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Api, ApiError } from '../../core/api';
import { PageStore } from '../../core/page-store';
import { SAMPLE } from '../../core/testing-sample';
import { Capture } from './capture';

describe('Capture', () => {
  const analyze = vi.fn();

  async function setup() {
    analyze.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Api, useValue: { analyze } }],
    });
    const fixture = TestBed.createComponent(Capture);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, store: TestBed.inject(PageStore) };
  }

  function pick(el: HTMLElement, selector: string, files: File[]) {
    const input = el.querySelector(selector) as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  const photo = (name: string) => new File(['x'], name, { type: 'image/jpeg' });

  it('camera input uses the rear camera and the file input accepts PDFs', async () => {
    const { el } = await setup();
    const camera = el.querySelector('input[capture]') as HTMLInputElement;
    expect(camera.getAttribute('capture')).toBe('environment');
    expect(camera.accept).toBe('image/*');
    const upload = el.querySelector('input[multiple]') as HTMLInputElement;
    expect(upload.accept).toContain('application/pdf');
  });

  it('analyse button is disabled until a page is added', async () => {
    const { fixture, el } = await setup();
    expect(el.querySelector('.analyze')).toBeNull();
    pick(el, 'input[capture]', [photo('a.jpg')]);
    await fixture.whenStable();
    const analyse = el.querySelector('.analyze') as HTMLButtonElement;
    expect(analyse.disabled).toBe(false);
    expect(el.querySelector('mat-slide-toggle')).not.toBeNull(); // options appear with the first page
  });

  it('lists captured pages and supports reorder and delete via buttons', async () => {
    const { fixture, el, store } = await setup();
    pick(el, 'input[multiple]', [photo('a.jpg'), photo('b.jpg'), photo('c.jpg')]);
    await fixture.whenStable();
    expect(el.querySelectorAll('.page').length).toBe(3);

    (el.querySelector('[aria-label="Move page 3 up"]') as HTMLButtonElement).click();
    expect(store.pages().map((p) => p.name)).toEqual(['a.jpg', 'c.jpg', 'b.jpg']);

    (el.querySelector('[aria-label="Delete page 1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(store.pages().map((p) => p.name)).toEqual(['c.jpg', 'b.jpg']);
    expect(el.querySelectorAll('.page').length).toBe(2);
  });

  it('shows an error for an unsupported file and adds nothing', async () => {
    const { fixture, el, store } = await setup();
    pick(el, 'input[multiple]', [new File(['x'], 'a.gif', { type: 'image/gif' })]);
    await fixture.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('not supported');
    expect(store.count()).toBe(0);
  });

  it('navigates to the result after a successful analysis', async () => {
    const { fixture, el } = await setup();
    analyze.mockReturnValue(of(SAMPLE));
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    pick(el, 'input[capture]', [photo('a.jpg')]);
    await fixture.whenStable();
    (el.querySelector('.analyze') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(nav).toHaveBeenCalledWith('/result');
  });

  it('shows the backend error and stays on the page when analysis fails', async () => {
    const { fixture, el } = await setup();
    analyze.mockReturnValue(throwError(() => new ApiError('busy')));
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    pick(el, 'input[capture]', [photo('a.jpg')]);
    await fixture.whenStable();
    (el.querySelector('.analyze') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('busy');
    expect(nav).not.toHaveBeenCalled();
    expect(el.querySelectorAll('.page').length).toBe(1);
  });
});
