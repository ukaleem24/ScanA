import { Messages } from './en';

export const tr: Messages = {
  'nav.privacy': 'Gizlilik bilgisi',
  'nav.language': 'Dil',

  'privacy.title': 'Mektubunuz gizli kalır',
  'privacy.saved':
    'Hiçbir şey kaydedilmez. BriefScanner’ın veritabanı yoktur; mektubunuzun veya sonucun kopyasını tutmaz.',
  'privacy.memory': 'Fotoğraflarınız bellekte işlenir ve bu sayfayı kapattığınızda ya da yenilediğinizde silinir.',
  'privacy.sent':
    'Mektubu okumak için sayfalar güvenli şekilde bir yapay zekâ hizmetine (Anthropic’in Claude’u) gönderilir. Mektuptaki ad ve adresler de gönderilenlere dahildir.',
  'privacy.notLegal':
    'Açıklama sade dille hazırlanmış bir yardımdır, hukuki danışmanlık değildir. Önemli kararlar için gönderene veya yetkili bir danışmana başvurun.',
  'privacy.dev':
    'Geliştirme modu: Bu sunucu {provider} kullanıyor. Ücretsiz planlarda sağlayıcı girdileri ürünlerini geliştirmek için kullanabilir. Yalnızca örnek mektubu kullanın, asla gerçek bir mektup kullanmayın.',
  'privacy.accept': 'Anladım, devam et',
  'privacy.continue': 'Devam',

  'capture.title': 'Mektubunuzu ekleyin',
  'capture.hint':
    'Her sayfayı sırayla fotoğraflayın veya fotoğraf ya da tek bir PDF yükleyin (en fazla {max} sayfa).',
  'capture.takePhoto': 'Fotoğraf çek',
  'capture.addAnother': 'Başka sayfa ekle',
  'capture.upload': 'Yükle',
  'capture.pages': 'Sayfalar ({n})',
  'capture.page': 'Sayfa {n}',
  'capture.moveUp': '{n}. sayfayı yukarı taşı',
  'capture.moveDown': '{n}. sayfayı aşağı taşı',
  'capture.delete': '{n}. sayfayı sil',
  'capture.language': 'Açıklama dili: {language}. Üstteki dil düğmesinden değiştirebilirsiniz.',
  'capture.fullTranslation': 'Tam çeviriyi ekle',
  'capture.analyze': 'Mektubu analiz et',
  'capture.reading': 'Mektubunuz okunuyor. Bu bir dakikaya kadar sürebilir.',
  'capture.analysing': 'Mektubunuz analiz ediliyor',

  'result.urgency.high': 'Yüksek aciliyet',
  'result.urgency.medium': 'Orta aciliyet',
  'result.urgency.low': 'Düşük aciliyet',
  'result.unclearTitle': 'Tam okunamadı',
  'result.unclearIntro': 'Bazı yerler belirsizdi. Lütfen şunlar için asıl mektuba bakın:',
  'result.reference': 'Referans:',
  'result.actions': 'Yapmanız gerekenler',
  'result.noActions': 'Sizden bir şey beklenmiyor.',
  'result.deadlines': 'Son tarihler',
  'result.dateUnclear': 'Tarih belirsiz',
  'result.noDeadlines': 'Son tarih bulunamadı.',
  'result.amounts': 'Tutarlar',
  'result.noAmounts': 'Tutar bulunamadı.',
  'result.due': 'Son ödeme: {date}',
  'result.terms': 'Önemli terimler',
  'result.noTerms': 'Özel terim yok.',
  'result.translation': 'Tam çeviri',
  'result.showTranslation': 'Tam metni göster',
  'result.disclaimer':
    'Bu açıklama yapay zekâ tarafından üretilmiştir ve hatalar içerebilir. Hukuki danışmanlık değildir. Tarihleri ve tutarları asıl mektuptan kontrol edin.',
  'result.backToPages': 'Sayfalara dön',
  'result.scanAnother': 'Başka bir mektup tara',
  'result.updating': 'Açıklama dilinizde güncelleniyor…',
  'result.retry': 'Tekrar dene',

  'error.too_many_pages': 'Bir mektup en fazla 10 sayfa olabilir.',
  'error.file_too_large':
    'Dosyalar çok büyük (toplam en fazla 10 MB). Bir sayfayı kaldırın veya daha küçük bir fotoğraf kullanın.',
  'error.unsupported_type': 'Bu dosya türü desteklenmiyor. JPEG, PNG veya WebP fotoğraf ya da PDF kullanın.',
  'error.pdf_must_be_single_file': 'Ya tek bir PDF ya da fotoğraflar yükleyin; ikisini birden değil.',
  'error.no_files': 'Önce en az bir sayfa ekleyin.',
  'error.unsupported_language': 'Bu dil kullanılamıyor.',
  'error.busy': 'Analiz hizmeti şu anda yoğun. Lütfen bir dakika sonra tekrar deneyin.',
  'error.rate_limited': 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.',
  'error.analysis_failed': 'Mektup analiz edilemedi. Daha net fotoğraflar deneyin veya tekrar deneyin.',
  'error.not_configured': 'Hizmet henüz kurulmadı (sunucuda API anahtarı eksik).',
  'error.network': 'Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
  'error.timeout': 'Analiz çok uzun sürdü. Lütfen tekrar deneyin.',
  'error.unknown': 'Bir şeyler ters gitti. Lütfen tekrar deneyin.',
};
