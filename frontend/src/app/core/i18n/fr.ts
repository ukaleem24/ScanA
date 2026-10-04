import { Messages } from './en';

export const fr: Messages = {
  'nav.privacy': 'Informations de confidentialité',
  'nav.language': 'Langue',

  'privacy.title': 'Votre courrier reste privé',
  'privacy.saved':
    'Rien n’est enregistré. BriefScanner n’a pas de base de données et ne conserve aucune copie de votre courrier ni du résultat.',
  'privacy.memory':
    'Vos photos sont traitées en mémoire et disparaissent dès que vous fermez ou rechargez cette page.',
  'privacy.sent':
    'Pour lire le courrier, les pages sont envoyées de façon sécurisée à un service d’IA (Claude, d’Anthropic). Les noms et adresses figurant dans le courrier en font partie.',
  'privacy.notLegal':
    'L’explication est une aide en langage simple, pas un conseil juridique. Pour les décisions importantes, adressez-vous à l’expéditeur ou à un conseiller qualifié.',
  'privacy.dev':
    'Mode développement : ce serveur utilise {provider}. Les offres gratuites peuvent permettre au fournisseur d’utiliser les données pour améliorer ses produits. N’utilisez que le courrier d’exemple, jamais un vrai courrier.',
  'privacy.accept': 'J’ai compris, continuer',
  'privacy.continue': 'Continuer',

  'capture.title': 'Ajoutez votre courrier',
  'capture.hint':
    'Photographiez chaque page dans l’ordre, ou importez des photos ou un seul PDF (jusqu’à {max} pages).',
  'capture.takePhoto': 'Prendre une photo',
  'capture.addAnother': 'Ajouter une page',
  'capture.upload': 'Importer',
  'capture.pages': 'Pages ({n})',
  'capture.page': 'Page {n}',
  'capture.moveUp': 'Monter la page {n}',
  'capture.moveDown': 'Descendre la page {n}',
  'capture.delete': 'Supprimer la page {n}',
  'capture.language': 'Langue de l’explication : {language}. Vous pouvez la changer avec le bouton de langue en haut.',
  'capture.fullTranslation': 'Inclure la traduction complète',
  'capture.analyze': 'Analyser le courrier',
  'capture.reading': 'Lecture de votre courrier en cours. Cela peut prendre jusqu’à une minute.',
  'capture.analysing': 'Analyse de votre courrier',

  'result.urgency.high': 'Urgence élevée',
  'result.urgency.medium': 'Urgence moyenne',
  'result.urgency.low': 'Urgence faible',
  'result.unclearTitle': 'Pas entièrement lisible',
  'result.unclearIntro': 'Certains passages n’étaient pas clairs. Vérifiez-les dans le courrier original :',
  'result.reference': 'Référence :',
  'result.actions': 'Ce que vous devez faire',
  'result.noActions': 'Rien n’est demandé de votre part.',
  'result.deadlines': 'Échéances',
  'result.dateUnclear': 'Date peu claire',
  'result.noDeadlines': 'Aucune échéance trouvée.',
  'result.amounts': 'Montants',
  'result.noAmounts': 'Aucun montant trouvé.',
  'result.due': 'À payer avant le {date}',
  'result.terms': 'Termes clés',
  'result.noTerms': 'Aucun terme particulier.',
  'result.translation': 'Traduction complète',
  'result.showTranslation': 'Afficher le texte complet',
  'result.disclaimer':
    'Cette explication a été générée par une IA et peut contenir des erreurs. Elle ne constitue pas un conseil juridique. Vérifiez les dates et les montants dans le courrier original.',
  'result.backToPages': 'Retour aux pages',
  'result.scanAnother': 'Scanner un autre courrier',
  'result.updating': 'Mise à jour de l’explication dans votre langue…',
  'result.retry': 'Réessayer',

  'error.too_many_pages': 'Un courrier peut comporter 10 pages au maximum.',
  'error.file_too_large':
    'Les fichiers sont trop volumineux (10 Mo au total maximum). Supprimez une page ou utilisez une photo plus petite.',
  'error.unsupported_type':
    'Ce type de fichier n’est pas pris en charge. Utilisez une photo JPEG, PNG ou WebP, ou un PDF.',
  'error.pdf_must_be_single_file': 'Importez soit un seul PDF, soit des photos, mais pas les deux.',
  'error.no_files': 'Ajoutez d’abord au moins une page.',
  'error.unsupported_language': 'Cette langue n’est pas disponible.',
  'error.busy': 'Le service d’analyse est très sollicité en ce moment. Réessayez dans une minute.',
  'error.rate_limited': 'Trop de requêtes. Patientez un moment puis réessayez.',
  'error.analysis_failed':
    'Le courrier n’a pas pu être analysé. Essayez avec des photos plus nettes ou réessayez.',
  'error.not_configured': 'Le service n’est pas encore configuré (clé d’API manquante sur le serveur).',
  'error.network': 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
  'error.timeout': 'L’analyse a pris trop de temps. Veuillez réessayer.',
  'error.unknown': 'Un problème est survenu. Veuillez réessayer.',
};
