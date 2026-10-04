import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';
import { en } from './i18n/en';
import { LANGUAGES } from './models';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    localStorage.clear();
    i18n = TestBed.inject(I18n);
  });

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('defaults to English, left to right', () => {
    expect(i18n.language()).toBe('en');
    expect(i18n.t('capture.title')).toBe('Add your letter');
    expect(i18n.dir()).toBe('ltr');
  });

  it('interpolates parameters', () => {
    expect(i18n.t('capture.moveUp', { n: 3 })).toBe('Move page 3 up');
  });

  it.each(LANGUAGES.map((l) => l.code))('loads %s with every key and matching placeholders', async (code) => {
    expect(await i18n.setLanguage(code)).toBe(true);
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      const text = i18n.t(key);
      expect(text, `${code}:${key}`).toBeTruthy();
      expect(placeholders(text), `${code}:${key}`).toEqual(placeholders(en[key]));
    }
  });

  it('sets lang and dir on the document, RTL for Arabic and Persian only', async () => {
    for (const { code, rtl } of LANGUAGES) {
      await i18n.setLanguage(code);
      expect(document.documentElement.lang).toBe(code);
      expect(document.documentElement.dir).toBe(rtl ? 'rtl' : 'ltr');
      expect(i18n.dir()).toBe(rtl ? 'rtl' : 'ltr');
    }
    expect(LANGUAGES.filter((l) => l.rtl).map((l) => l.code)).toEqual(['ar', 'fa']);
  });

  it('translates after switching', async () => {
    await i18n.setLanguage('tr');
    expect(i18n.t('capture.takePhoto')).toBe('Fotoğraf çek');
  });

  it('remembers the language and restores it', async () => {
    await i18n.setLanguage('fr');
    expect(localStorage.getItem('briefscanner.language')).toBe('fr');
    TestBed.resetTestingModule();
    const fresh = TestBed.inject(I18n);
    await fresh.restore();
    expect(fresh.language()).toBe('fr');
  });

  it('ignores an invalid remembered language', async () => {
    localStorage.setItem('briefscanner.language', 'xx');
    await i18n.restore();
    expect(i18n.language()).toBe('en');
  });

  it('maps error codes, with a generic fallback', () => {
    expect(i18n.error('busy')).toContain('busy');
    expect(i18n.error('rate_limited')).toContain('Too many');
    expect(i18n.error('totally_new_code')).toBe(en['error.unknown']);
    expect(i18n.error(null)).toBeNull();
  });
});
