import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LetterAnalysis } from '../../core/models';
import { Api } from '../../core/api';
import { I18n } from '../../core/i18n';
import { PageStore } from '../../core/page-store';
import { Session } from '../../core/session';
import { of } from 'rxjs';
import { SAMPLE } from '../../core/testing-sample';
import { Result } from './result';

async function render(analysis: LetterAnalysis): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(Session).result.set(analysis);
  const fixture = TestBed.createComponent(Result);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Result', () => {
  it('shows urgency, sender, summary, deadlines, amounts, actions and terms', async () => {
    const el = await render(SAMPLE);
    const text = el.textContent ?? '';
    expect(el.querySelector('.urgency-high')).not.toBeNull();
    expect(text).toContain('High urgency');
    expect(text).toContain('Deadline within two weeks.');
    expect(text).toContain('Stadtwerke Beispielstadt GmbH');
    expect(text).toContain('KD-12345 · RE-2026-0042');
    expect(text).toContain('Electricity may be cut off.');
    expect(text).toMatch(/128[.,]45/);
    expect(text).toContain('Pay 128.45 EUR by 15 March.');
    expect(el.querySelector('[lang="de"]')?.textContent).toContain('Mahnung');
  });

  it('formats dates for the selected language', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).setLanguage('de');
    TestBed.inject(Session).result.set(SAMPLE);
    const fixture = TestBed.createComponent(Result);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('15. März 2026');
  });

  it('shows confidence notes only when present', async () => {
    const clear = await render(SAMPLE);
    expect(clear.querySelector('.notes')).toBeNull();
    TestBed.resetTestingModule();
    const unclear = await render({ ...SAMPLE, confidence_notes: ['The bottom of page 2 is cut off.'] });
    expect(unclear.querySelector('.notes')?.textContent).toContain('The bottom of page 2 is cut off.');
  });

  it('shows empty states and flags an unclear deadline date', async () => {
    const el = await render({
      ...SAMPLE,
      deadlines: [{ date: null, what_happens: 'Respond soon.' }],
      amounts: [],
      actions_required: [],
      key_terms: [],
    });
    const text = el.textContent ?? '';
    expect(text).toContain('Date unclear');
    expect(text).toContain('No amounts found.');
    expect(text).toContain('Nothing is required from you.');
    expect(text).toContain('No special terms.');
  });

  it('shows the full translation only when provided', async () => {
    const without = await render(SAMPLE);
    expect(without.textContent).not.toContain('Full translation');
    TestBed.resetTestingModule();
    const withT = await render({ ...SAMPLE, full_translation: 'Dear Mr Mustermann, ...' });
    expect(withT.textContent).toContain('Dear Mr Mustermann');
  });

  it('start over clears the session', async () => {
    const el = await render(SAMPLE);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const buttons = Array.from(el.querySelectorAll('button'));
    buttons.find((b) => b.textContent?.includes('Scan another'))!.click();
    expect(TestBed.inject(Session).result()).toBeNull();
    expect(nav).toHaveBeenCalledWith('/capture');
  });

  it('translates headings and urgency into the selected language', async () => {
    await TestBed.inject(I18n).setLanguage('de');
    TestBed.inject(Session).result.set(SAMPLE);
    const fixture = TestBed.createComponent(Result);
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Hohe Dringlichkeit');
    expect(text).toContain('Fristen');
    expect(text).toContain('Das müssen Sie tun');
  });

  it('re-runs the analysis on the held pages when the language changes', async () => {
    const analyze = vi.fn((_pages: unknown, _lang: string, _full: boolean) => of({ ...SAMPLE, summary: 'Eine Zahlungserinnerung.' }));
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Api, useValue: { analyze } }] });
    await TestBed.inject(PageStore).addFiles([new File(['x'], 'a.jpg', { type: 'image/jpeg' })]);
    const session = TestBed.inject(Session);
    session.result.set(SAMPLE);
    session.resultLanguage.set('en');
    const fixture = TestBed.createComponent(Result);
    await fixture.whenStable();
    expect(analyze).not.toHaveBeenCalled(); // same language: nothing to redo

    await TestBed.inject(I18n).setLanguage('de');
    await fixture.whenStable();
    expect(analyze).toHaveBeenCalledTimes(1);
    expect(analyze.mock.calls[0][1]).toBe('de');
    await fixture.whenStable();
    expect(session.resultLanguage()).toBe('de');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Eine Zahlungserinnerung.');
  });
});
