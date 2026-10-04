export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface Urgency {
  level: UrgencyLevel;
  reason: string;
}

export interface Deadline {
  date: string | null;
  what_happens: string;
}

export interface Amount {
  value_eur: number;
  purpose: string;
  due_date: string | null;
}

export interface KeyTerm {
  term: string;
  explanation: string;
}

/** Mirrors backend/app/schemas.py LetterAnalysis. */
export interface LetterAnalysis {
  sender: string;
  letter_type: string;
  date_of_letter: string | null;
  reference_numbers: string[];
  summary: string;
  urgency: Urgency;
  deadlines: Deadline[];
  amounts: Amount[];
  actions_required: string[];
  key_terms: KeyTerm[];
  full_translation: string | null;
  confidence_notes: string[];
}

export type LanguageCode = 'en' | 'de' | 'ar' | 'tr' | 'uk' | 'ru' | 'fa' | 'es' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  /** Name in the language itself, so people can find theirs. */
  label: string;
  rtl: boolean;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'de', label: 'Deutsch', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'tr', label: 'Türkçe', rtl: false },
  { code: 'uk', label: 'Українська', rtl: false },
  { code: 'ru', label: 'Русский', rtl: false },
  { code: 'fa', label: 'فارسی', rtl: true },
  { code: 'es', label: 'Español', rtl: false },
  { code: 'fr', label: 'Français', rtl: false },
];

export const MAX_PAGES = 10;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
