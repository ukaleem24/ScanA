import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Api, ApiError } from './api';
import { I18n } from './i18n';
import { SAMPLE } from './testing-sample';
import { PageStore } from './page-store';
import { Session } from './session';

describe('Session', () => {
  let session: Session;
  let store: PageStore;
  const analyze = vi.fn();

  beforeEach(async () => {
    analyze.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: Api, useValue: { analyze } }] });
    session = TestBed.inject(Session);
    store = TestBed.inject(PageStore);
    await store.addFiles([new File(['x'], 'a.jpg', { type: 'image/jpeg' })]);
  });

  it('stores the result and passes language and translation flag', async () => {
    analyze.mockReturnValue(of(SAMPLE));
    await TestBed.inject(I18n).setLanguage('uk');
    session.fullTranslation.set(true);
    expect(await session.analyze()).toBe(true);
    expect(session.result()).toEqual(SAMPLE);
    expect(session.resultLanguage()).toBe('uk');
    expect(analyze).toHaveBeenCalledWith(store.pages(), 'uk', true);
    expect(session.loading()).toBe(false);
  });

  it('exposes the error code on failure and clears loading', async () => {
    analyze.mockReturnValue(throwError(() => new ApiError('busy')));
    expect(await session.analyze()).toBe(false);
    expect(session.errorCode()).toBe('busy');
    expect(session.result()).toBeNull();
    expect(session.loading()).toBe(false);
  });

  it('does nothing without pages', async () => {
    store.clear();
    expect(await session.analyze()).toBe(false);
    expect(analyze).not.toHaveBeenCalled();
  });

  it('startOver forgets pages and result but keeps language', async () => {
    analyze.mockReturnValue(of(SAMPLE));
    await TestBed.inject(I18n).setLanguage('fa');
    await session.analyze();
    session.startOver();
    expect(store.count()).toBe(0);
    expect(session.result()).toBeNull();
    expect(session.resultLanguage()).toBeNull();
    expect(TestBed.inject(I18n).language()).toBe('fa');
  });
});
