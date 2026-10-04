"""Generates samples/sample-mahnung.png: a fictitious German payment reminder (no real data).

Run: backend/.venv/Scripts/python samples/make_sample.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

LINES = [
    ("Stadtwerke Beispielstadt GmbH", 34),
    ("Musterweg 1 · 12345 Beispielstadt", 22),
    ("", 22),
    ("Herrn", 24),
    ("Max Mustermann", 24),
    ("Testgasse 7", 24),
    ("12345 Beispielstadt", 24),
    ("", 22),
    ("Beispielstadt, 01.03.2026", 22),
    ("", 22),
    ("Zahlungserinnerung / 1. Mahnung", 30),
    ("Kundennummer: KD-12345   Rechnungsnummer: RE-2026-0042", 22),
    ("", 22),
    ("Sehr geehrter Herr Mustermann,", 24),
    ("", 22),
    ("zu unserer Rechnung vom 02.02.2026 über 123,45 EUR (Strom, Abrechnungszeitraum", 22),
    ("Januar 2026) konnten wir bis heute keinen Zahlungseingang feststellen.", 22),
    ("", 22),
    ("Bitte überweisen Sie den offenen Betrag von 123,45 EUR zzgl. Mahngebühren", 22),
    ("von 5,00 EUR, insgesamt 128,45 EUR, bis spätestens 15.03.2026 auf unser Konto", 22),
    ("IBAN DE00 0000 0000 0000 0000 00.", 22),
    ("", 22),
    ("Zahlen Sie nicht fristgerecht, behalten wir uns vor, die Stromlieferung", 22),
    ("einzustellen und das Verfahren an ein Inkassounternehmen zu übergeben.", 22),
    ("", 22),
    ("Sollten Sie bereits gezahlt haben, betrachten Sie dieses Schreiben bitte", 22),
    ("als gegenstandslos.", 22),
    ("", 22),
    ("Mit freundlichen Grüßen", 24),
    ("Ihre Stadtwerke Beispielstadt", 24),
]


def font(size: int) -> ImageFont.FreeTypeFont:
    for name in ("arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def main() -> None:
    img = Image.new("RGB", (1240, 1754), "white")
    draw = ImageDraw.Draw(img)
    y = 100
    for text, size in LINES:
        draw.text((100, y), text, fill="black", font=font(size))
        y += int(size * 1.6)
    out = Path(__file__).parent / "sample-mahnung.png"
    img.save(out)
    print(out)


if __name__ == "__main__":
    main()
