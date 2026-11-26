"""
Builds lib/rag/corpus.json: the documents the portfolio chat retrieves from.

Each PDF in public/ is converted to text (pdftotext), cleaned, cut at the
references section, and split into overlapping passages of about 140 words.
Personal identifiers that should not be quoted (matriculation number) are removed.
Run:  python3 scripts/build_rag_corpus.py   (needs poppler's pdftotext)
"""
import json, re, subprocess, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = [
    ("RFC_RAG_Backdoor_Detection_Report.pdf", "RFC: Backdoor detection in RAG (report)"),
    ("ML_Challenge_Report.pdf", "Machine Learning Challenge (report)"),
    ("ECG_Anaesthesia_Monitoring_Report.pdf", "ECG anaesthesia monitoring (report)"),
    ("ALIA_Delivery_MQTT_Report.pdf", "ALIA Delivery robots, MQTT and UI (report)"),
    ("Sarath_Adukkadukkam_Resume.pdf", "CV (Lebenslauf, German)"),
]
WORDS, OVERLAP = 140, 35
REDACT = [r"Matriculation Number:?\s*\d+", r"Matrikel\w*:?\s*\d+"]


def clean(text: str) -> str:
    for pat in REDACT:
        text = re.sub(pat, "", text, flags=re.I)
    # stop at the bibliography
    m = re.search(r"\n\s*(References|Bibliography|Literatur(verzeichnis)?)\s*\n", text)
    if m and m.start() > len(text) * 0.4:
        text = text[: m.start()]
    text = text.replace("\f", "\n")
    text = re.sub(r"-\n(\w)", r"\1", text)            # re-join hyphenated words
    lines = [l.strip() for l in text.split("\n")]
    lines = [l for l in lines if l and not re.fullmatch(r"\d{1,3}", l)]  # page numbers
    # table-of-contents lines ("3.3 Why the Design Is Sound . . . . 7") and dot leaders
    lines = [l for l in lines if not re.search(r"(\.\s?){4,}", l)]
    lines = [l for l in lines if not re.fullmatch(r"(Contents|Inhaltsverzeichnis|Table of Contents)", l, flags=re.I)]
    out = re.sub(r"\s+", " ", " ".join(lines)).strip()
    # the reports' own bibliography markers ("[4]", "[2, 5]") would clash with chat citations
    return re.sub(r"\s?\[\d+(?:\s*[,–-]\s*\d+)*\]", "", out)


def chunks(text: str):
    w = text.split()
    i = 0
    while i < len(w):
        part = w[i : i + WORDS]
        if len(part) < 40 and i > 0:
            break
        yield " ".join(part)
        i += WORDS - OVERLAP


out = []
for fname, title in DOCS:
    raw = subprocess.run(["pdftotext", str(ROOT / "public" / fname), "-"], capture_output=True, text=True, check=True).stdout
    for k, c in enumerate(chunks(clean(raw))):
        out.append({"id": f"{pathlib.Path(fname).stem}#{k + 1}", "title": title, "href": f"/{fname}", "text": c})

dest = ROOT / "lib" / "rag" / "corpus.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(f"{len(out)} passages -> {dest.relative_to(ROOT)}")
