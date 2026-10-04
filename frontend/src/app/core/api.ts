import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { LanguageCode, LetterAnalysis } from './models';
import { CapturedPage } from './page-store';

export class ApiError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export interface Health {
  status: string;
  provider?: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  analyze(
    pages: readonly CapturedPage[],
    language: LanguageCode,
    fullTranslation: boolean,
  ): Observable<LetterAnalysis> {
    const body = new FormData();
    pages.forEach((page, i) => {
      const name = page.kind === 'pdf' ? 'letter.pdf' : `page-${String(i + 1).padStart(2, '0')}.jpg`;
      body.append('files', page.blob, name);
    });
    body.append('language', language);
    body.append('full_translation', String(fullTranslation));

    return this.http.post<LetterAnalysis>('/api/analyze', body).pipe(
      timeout(180_000),
      catchError((err) => throwError(() => toApiError(err))),
    );
  }

  health(): Observable<Health> {
    return this.http.get<Health>('/api/health');
  }
}

function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return new ApiError('network');
    const detail = (err.error as { detail?: unknown } | null)?.detail;
    return new ApiError(typeof detail === 'string' ? detail : 'unknown');
  }
  if (err instanceof Error && err.name === 'TimeoutError') return new ApiError('timeout');
  return new ApiError('unknown');
}
