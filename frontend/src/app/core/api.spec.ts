import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Api, ApiError } from './api';
import { CapturedPage } from './page-store';

function page(id: number, kind: 'image' | 'pdf' = 'image'): CapturedPage {
  return { id, kind, blob: new Blob(['x'], { type: kind === 'pdf' ? 'application/pdf' : 'image/jpeg' }), name: 'n', size: 1, previewUrl: null };
}

describe('Api', () => {
  let api: Api;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts pages in order with language and translation flag', () => {
    api.analyze([page(1), page(2)], 'tr', true).subscribe();
    const req = http.expectOne('/api/analyze');
    const body = req.request.body as FormData;
    expect(req.request.method).toBe('POST');
    expect(body.getAll('files').map((f) => (f as File).name)).toEqual(['page-01.jpg', 'page-02.jpg']);
    expect(body.get('language')).toBe('tr');
    expect(body.get('full_translation')).toBe('true');
    req.flush({});
  });

  it('names a pdf upload letter.pdf', () => {
    api.analyze([page(1, 'pdf')], 'en', false).subscribe();
    const req = http.expectOne('/api/analyze');
    expect(((req.request.body as FormData).get('files') as File).name).toBe('letter.pdf');
    req.flush({});
  });

  it('maps backend error details to codes', async () => {
    const result = firstValueFrom(api.analyze([page(1)], 'en', false));
    http.expectOne('/api/analyze').flush({ detail: 'busy' }, { status: 503, statusText: 'x' });
    await expect(result).rejects.toEqual(expect.objectContaining({ code: 'busy' }));
  });

  it('maps network failure to network', async () => {
    const result = firstValueFrom(api.analyze([page(1)], 'en', false));
    http.expectOne('/api/analyze').error(new ProgressEvent('error'));
    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toEqual(expect.objectContaining({ code: 'network' }));
  });

  it('falls back to unknown for unexpected error bodies', async () => {
    const result = firstValueFrom(api.analyze([page(1)], 'en', false));
    http.expectOne('/api/analyze').flush('oops', { status: 500, statusText: 'x' });
    await expect(result).rejects.toEqual(expect.objectContaining({ code: 'unknown' }));
  });
});
