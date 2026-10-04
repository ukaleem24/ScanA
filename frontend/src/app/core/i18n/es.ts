import { Messages } from './en';

export const es: Messages = {
  'nav.privacy': 'Información de privacidad',
  'nav.language': 'Idioma',

  'privacy.title': 'Tu carta se mantiene privada',
  'privacy.saved':
    'No se guarda nada. BriefScanner no tiene base de datos y no conserva ninguna copia de tu carta ni del resultado.',
  'privacy.memory': 'Tus fotos se procesan en la memoria y desaparecen al cerrar o recargar esta página.',
  'privacy.sent':
    'Para leer la carta, las páginas se envían de forma segura a un servicio de IA (Claude, de Anthropic). Los nombres y direcciones de la carta forman parte de lo que se envía.',
  'privacy.notLegal':
    'La explicación es una ayuda en lenguaje sencillo, no asesoramiento jurídico. Para decisiones importantes, consulta al remitente o a un asesor cualificado.',
  'privacy.dev':
    'Modo de desarrollo: este servidor usa {provider}. Los planes gratuitos pueden permitir que el proveedor use los datos para mejorar sus productos. Usa solo la carta de ejemplo, nunca una carta real.',
  'privacy.accept': 'Entendido, continuar',
  'privacy.continue': 'Continuar',

  'capture.title': 'Añade tu carta',
  'capture.hint':
    'Fotografía cada página en orden, o sube fotos o un único PDF (hasta {max} páginas).',
  'capture.takePhoto': 'Hacer foto',
  'capture.addAnother': 'Añadir otra página',
  'capture.upload': 'Subir',
  'capture.pages': 'Páginas ({n})',
  'capture.page': 'Página {n}',
  'capture.moveUp': 'Subir la página {n}',
  'capture.moveDown': 'Bajar la página {n}',
  'capture.delete': 'Eliminar la página {n}',
  'capture.language': 'Idioma de la explicación: {language}. Puedes cambiarlo con el botón de idioma de arriba.',
  'capture.fullTranslation': 'Incluir traducción completa',
  'capture.analyze': 'Analizar carta',
  'capture.reading': 'Leyendo tu carta. Puede tardar hasta un minuto.',
  'capture.analysing': 'Analizando tu carta',

  'result.urgency.high': 'Urgencia alta',
  'result.urgency.medium': 'Urgencia media',
  'result.urgency.low': 'Urgencia baja',
  'result.unclearTitle': 'No se puede leer por completo',
  'result.unclearIntro': 'Algunas partes no estaban claras. Compruébalas en la carta original:',
  'result.reference': 'Referencia:',
  'result.actions': 'Lo que tienes que hacer',
  'result.noActions': 'No se requiere nada de ti.',
  'result.deadlines': 'Plazos',
  'result.dateUnclear': 'Fecha poco clara',
  'result.noDeadlines': 'No se encontraron plazos.',
  'result.amounts': 'Importes',
  'result.noAmounts': 'No se encontraron importes.',
  'result.due': 'Vence el {date}',
  'result.terms': 'Términos clave',
  'result.noTerms': 'No hay términos especiales.',
  'result.translation': 'Traducción completa',
  'result.showTranslation': 'Mostrar el texto completo',
  'result.disclaimer':
    'Esta explicación la ha generado una IA y puede contener errores. No es asesoramiento jurídico. Comprueba las fechas y los importes en la carta original.',
  'result.backToPages': 'Volver a las páginas',
  'result.scanAnother': 'Escanear otra carta',
  'result.updating': 'Actualizando la explicación en tu idioma…',
  'result.retry': 'Reintentar',

  'error.too_many_pages': 'Una carta puede tener como máximo 10 páginas.',
  'error.file_too_large':
    'Los archivos son demasiado grandes (máximo 10 MB en total). Elimina una página o usa una foto más pequeña.',
  'error.unsupported_type': 'Este tipo de archivo no es compatible. Usa una foto JPEG, PNG o WebP, o un PDF.',
  'error.pdf_must_be_single_file': 'Sube un solo PDF o varias fotos, pero no ambos.',
  'error.no_files': 'Añade primero al menos una página.',
  'error.unsupported_language': 'Este idioma no está disponible.',
  'error.busy': 'El servicio de análisis está ocupado ahora mismo. Inténtalo de nuevo en un minuto.',
  'error.rate_limited': 'Demasiadas solicitudes. Espera un poco e inténtalo de nuevo.',
  'error.analysis_failed':
    'No se pudo analizar la carta. Prueba con fotos más nítidas o inténtalo de nuevo.',
  'error.not_configured': 'El servicio aún no está configurado (falta la clave de API en el servidor).',
  'error.network': 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
  'error.timeout': 'El análisis tardó demasiado. Inténtalo de nuevo.',
  'error.unknown': 'Algo ha salido mal. Inténtalo de nuevo.',
};
