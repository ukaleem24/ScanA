import { LetterAnalysis } from './models';

export const SAMPLE: LetterAnalysis = {
  sender: 'Stadtwerke Beispielstadt GmbH',
  letter_type: 'Mahnung',
  date_of_letter: '2026-03-01',
  reference_numbers: ['KD-12345', 'RE-2026-0042'],
  summary: 'A payment reminder for an electricity bill.',
  urgency: { level: 'high', reason: 'Deadline within two weeks.' },
  deadlines: [{ date: '2026-03-15', what_happens: 'Electricity may be cut off.' }],
  amounts: [{ value_eur: 128.45, purpose: 'Total due', due_date: '2026-03-15' }],
  actions_required: ['Pay 128.45 EUR by 15 March.'],
  key_terms: [{ term: 'Mahnung', explanation: 'A reminder to pay.' }],
  full_translation: null,
  confidence_notes: [],
};
