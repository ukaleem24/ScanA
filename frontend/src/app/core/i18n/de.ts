import { Messages } from './en';

export const de: Messages = {
  'nav.privacy': 'Datenschutzhinweise',
  'nav.language': 'Sprache',

  'privacy.title': 'Ihr Brief bleibt privat',
  'privacy.saved':
    'Es wird nichts gespeichert. BriefScanner hat keine Datenbank und behält keine Kopie Ihres Briefs oder des Ergebnisses.',
  'privacy.memory':
    'Ihre Fotos werden im Arbeitsspeicher verarbeitet und sind weg, sobald Sie diese Seite schließen oder neu laden.',
  'privacy.sent':
    'Zum Lesen des Briefs werden die Seiten verschlüsselt an einen KI-Dienst (Claude von Anthropic) gesendet. Namen und Adressen im Brief sind Teil davon.',
  'privacy.notLegal':
    'Die Erklärung ist eine Verständnishilfe in einfacher Sprache und keine Rechtsberatung. Bei wichtigen Entscheidungen fragen Sie den Absender oder eine qualifizierte Beratungsstelle.',
  'privacy.dev':
    'Entwicklungsmodus: Dieser Server nutzt {provider}. Kostenlose Tarife erlauben dem Anbieter eventuell, Eingaben zur Produktverbesserung zu verwenden. Verwenden Sie nur den Beispielbrief, niemals einen echten Brief.',
  'privacy.accept': 'Verstanden, weiter',
  'privacy.continue': 'Weiter',

  'capture.title': 'Brief hinzufügen',
  'capture.hint':
    'Fotografieren Sie jede Seite der Reihe nach oder laden Sie Fotos oder eine einzelne PDF-Datei hoch (bis zu {max} Seiten).',
  'capture.takePhoto': 'Foto aufnehmen',
  'capture.addAnother': 'Weitere Seite hinzufügen',
  'capture.upload': 'Hochladen',
  'capture.pages': 'Seiten ({n})',
  'capture.page': 'Seite {n}',
  'capture.moveUp': 'Seite {n} nach oben',
  'capture.moveDown': 'Seite {n} nach unten',
  'capture.delete': 'Seite {n} löschen',
  'capture.language': 'Sprache der Erklärung: {language}. Sie können sie oben mit der Sprachtaste ändern.',
  'capture.fullTranslation': 'Vollständige Übersetzung einbeziehen',
  'capture.analyze': 'Brief analysieren',
  'capture.reading': 'Ihr Brief wird gelesen. Das kann bis zu einer Minute dauern.',
  'capture.analysing': 'Brief wird analysiert',

  'result.urgency.high': 'Hohe Dringlichkeit',
  'result.urgency.medium': 'Mittlere Dringlichkeit',
  'result.urgency.low': 'Geringe Dringlichkeit',
  'result.unclearTitle': 'Nicht vollständig lesbar',
  'result.unclearIntro': 'Einige Stellen waren unklar. Bitte prüfen Sie diese im Originalbrief:',
  'result.reference': 'Referenz:',
  'result.actions': 'Das müssen Sie tun',
  'result.noActions': 'Von Ihnen ist nichts zu tun.',
  'result.deadlines': 'Fristen',
  'result.dateUnclear': 'Datum unklar',
  'result.noDeadlines': 'Keine Fristen gefunden.',
  'result.amounts': 'Beträge',
  'result.noAmounts': 'Keine Beträge gefunden.',
  'result.due': 'Fällig am {date}',
  'result.terms': 'Wichtige Begriffe',
  'result.noTerms': 'Keine besonderen Begriffe.',
  'result.translation': 'Vollständige Übersetzung',
  'result.showTranslation': 'Volltext anzeigen',
  'result.disclaimer':
    'Diese Erklärung wurde von einer KI erstellt und kann Fehler enthalten. Sie ist keine Rechtsberatung. Prüfen Sie Fristen und Beträge im Originalbrief.',
  'result.backToPages': 'Zurück zu den Seiten',
  'result.scanAnother': 'Weiteren Brief scannen',
  'result.updating': 'Erklärung wird in Ihrer Sprache aktualisiert …',
  'result.retry': 'Erneut versuchen',

  'error.too_many_pages': 'Ein Brief darf höchstens 10 Seiten haben.',
  'error.file_too_large':
    'Die Dateien sind zu groß (insgesamt höchstens 10 MB). Entfernen Sie eine Seite oder nutzen Sie ein kleineres Foto.',
  'error.unsupported_type':
    'Dieser Dateityp wird nicht unterstützt. Nutzen Sie ein JPEG-, PNG- oder WebP-Foto oder eine PDF-Datei.',
  'error.pdf_must_be_single_file': 'Laden Sie entweder eine PDF-Datei oder mehrere Fotos hoch, nicht beides.',
  'error.no_files': 'Fügen Sie zuerst mindestens eine Seite hinzu.',
  'error.unsupported_language': 'Diese Sprache ist nicht verfügbar.',
  'error.busy': 'Der Analysedienst ist gerade ausgelastet. Bitte versuchen Sie es in einer Minute erneut.',
  'error.rate_limited': 'Zu viele Anfragen. Bitte warten Sie eine Weile und versuchen Sie es dann erneut.',
  'error.analysis_failed':
    'Der Brief konnte nicht analysiert werden. Versuchen Sie klarere Fotos oder probieren Sie es erneut.',
  'error.not_configured': 'Der Dienst ist noch nicht eingerichtet (API-Schlüssel auf dem Server fehlt).',
  'error.network': 'Der Server ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
  'error.timeout': 'Die Analyse hat zu lange gedauert. Bitte versuchen Sie es erneut.',
  'error.unknown': 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
};
