#!/usr/bin/env python3
"""
श्री प्रजापति संकलन — पुराण एवं दर्शन PDF कम्प्रेशन स्क्रिप्ट
Ghostscript (/opt/homebrew/bin/gs) का उपयोग करके सभी बड़ी PDFs को
उच्च गुणवत्ता (150 DPI /ebook) में संकुचित करता है।
"""

import os
import sys
import time
import subprocess

GS_PATH = "/opt/homebrew/bin/gs"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)

TARGET_DIRS = [
    os.path.join(REPO_ROOT, "ved_puraanam", "puranas"),
    os.path.join(REPO_ROOT, "vedant_darshanam", "darshanam")
]

def fmt_size(sz):
    if sz >= 1024**3:
        return f"{sz / (1024**3):.2f} GB"
    elif sz >= 1024**2:
        return f"{sz / (1024**2):.1f} MB"
    elif sz >= 1024:
        return f"{sz / 1024:.1f} KB"
    return f"{sz} B"

def compress_pdf(file_path):
    orig_size = os.path.getsize(file_path)
    filename = os.path.basename(file_path)
    temp_output = file_path + ".compressed.tmp"

    cmd = [
        GS_PATH,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={temp_output}",
        file_path
    ]

    t0 = time.time()
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        elapsed = time.time() - t0

        if res.returncode == 0 and os.path.exists(temp_output) and os.path.getsize(temp_output) > 0:
            new_size = os.path.getsize(temp_output)
            if new_size < orig_size:
                saved = orig_size - new_size
                pct = (saved / orig_size) * 100
                os.replace(temp_output, file_path)
                print(f"✅ {filename}: {fmt_size(orig_size)} ➔ {fmt_size(new_size)} (-{pct:.1f}%) [{elapsed:.1f}s]", flush=True)
                return orig_size, new_size
            else:
                os.remove(temp_output)
                print(f"ℹ️ {filename}: पहले से संकुचित है ({fmt_size(orig_size)}) [{elapsed:.1f}s]", flush=True)
                return orig_size, orig_size
        else:
            if os.path.exists(temp_output):
                os.remove(temp_output)
            err_msg = res.stderr.decode("utf-8", errors="ignore").strip()
            print(f"❌ {filename}: कम्प्रेशन में त्रुटि (Exit {res.returncode}): {err_msg}", flush=True)
            return orig_size, orig_size
    except Exception as e:
        if os.path.exists(temp_output):
            os.remove(temp_output)
        print(f"❌ {filename}: अपवाद {str(e)}", flush=True)
        return orig_size, orig_size

def main():
    if not os.path.exists(GS_PATH):
        print(f"Error: Ghostscript not found at {GS_PATH}", file=sys.stderr)
        sys.exit(1)

    # Collect files > 50 MB (excluding narad puran which is already done)
    files_to_compress = []
    for d in TARGET_DIRS:
        if not os.path.exists(d):
            continue
        for f in sorted(os.listdir(d)):
            if f.endswith(".pdf") and not f.startswith("."):
                # Skip already compressed narad puran
                if "008_shri_narad_mahapuran" in f:
                    continue
                p = os.path.join(d, f)
                sz = os.path.getsize(p)
                # Only compress files >= 50 MB
                if sz >= 50 * 1024 * 1024:
                    files_to_compress.append((sz, p, f))

    # Sort descending by size so largest are handled first
    files_to_compress.sort(key=lambda x: x[0], reverse=True)

    print(f"============================================================")
    print(f"📚 श्री प्रजापति संकलन — पुराण एवं दर्शन PDF कम्प्रेशन")
    print(f"कुल संकुचित होने वाली फाइलें (>= 50 MB): {len(files_to_compress)}")
    total_orig = sum(x[0] for x in files_to_compress)
    print(f"प्रारंभिक कुल आकार: {fmt_size(total_orig)}")
    print(f"============================================================", flush=True)

    total_new = 0
    start_all = time.time()

    for idx, (sz, p, f) in enumerate(files_to_compress, 1):
        print(f"\n[{idx}/{len(files_to_compress)}] संकुचन प्रगति: {f} ({fmt_size(sz)})...", flush=True)
        orig_s, new_s = compress_pdf(p)
        total_new += new_s

    total_elapsed = time.time() - start_all
    total_saved = total_orig - total_new
    total_pct = (total_saved / total_orig) * 100 if total_orig > 0 else 0

    print(f"\n============================================================")
    print(f"🎉 सम्पूर्ण कम्प्रेशन सम्पन्न!")
    print(f"कुल समय: {total_elapsed / 60:.1f} मिनट")
    print(f"प्रारंभिक आकार: {fmt_size(total_orig)}")
    print(f"नवीन आकार: {fmt_size(total_new)}")
    print(f"कुल बचत: {fmt_size(total_saved)} (-{total_pct:.1f}%)")
    print(f"============================================================", flush=True)

if __name__ == "__main__":
    main()
