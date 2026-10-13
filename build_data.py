#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build Data for Shri Sanatan Vangamayam Web-Book.
Parses Markdown files from 'stuti_ganga/*/*.md' into structured JSON.
Zero local audio files (audio redirects to user's YouTube channel).
"""

import os
import re
import glob
import json

DEVANAGARI_DIGITS = "०१२३४५६७८९"

def to_devanagari(n, pad=2):
    s = f"{n:0{pad}d}"
    return "".join(DEVANAGARI_DIGITS[int(d)] for d in s)

DEITY_SECTIONS = [
    ('श्री शिव', 1),
    ('श्री विष्णु', 2),
    ('श्री कृष्ण', 3),
    ('श्री राम', 4),
    ('श्री हनुमान', 5),
    ('श्री गणेश', 6),
    ('श्री देवी / शक्ति', 7),
    ('श्री सूर्य', 8),
    ('श्री नृसिंह', 9),
    ('श्री कार्तिकेय', 10),
    ('श्री दत्तात्रेय', 11),
    ('श्री भैरव', 12),
    ('नवग्रह', 13),
    ('वैदिक सूक्त', 14),
    ('श्री गुरु', 15),
    ('कुबेर', 16)
]
SEC_MAP = {name: num for name, num in DEITY_SECTIONS}
REV_SEC_MAP = {num: name for name, num in DEITY_SECTIONS}

def parse_stotra_file(fpath, legacy_map=None):
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    base = os.path.basename(fpath)
    rel_folder = os.path.basename(os.path.dirname(fpath))

    # Match decimal identifier like 1.001_...
    dec_m = re.match(r"^(\d+)\.(\d{3})_", base)
    if dec_m:
        sec_num = int(dec_m.group(1))
        sub_num = int(dec_m.group(2))
        s_id = f"{sec_num}.{sub_num:03d}"
        devanagari_num = f"{to_devanagari(sec_num, pad=1)}.{to_devanagari(sub_num, pad=3)}"
        deity = REV_SEC_MAP.get(sec_num, "अन्य")
    else:
        # Fallback to legacy 3-digit match
        num_m = re.match(r"^(\d{3})_", base)
        num = int(num_m.group(1)) if num_m else 0
        s_id = f"{num:03d}"
        sec_num = 99
        sub_num = num
        devanagari_num = to_devanagari(num, 3 if num >= 100 else 2)
        deity = "अन्य"

    # 1. Title
    t_m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = t_m.group(1).strip() if t_m else base

    # 2. Source / Meta line (<small>...</small>)
    meta_m = re.search(r"<small>(.*?)</small>", content, re.DOTALL)
    meta_html = meta_m.group(1).strip() if meta_m else ""
    src_url_m = re.search(r'href="([^"]+)"', meta_html)
    source_url = src_url_m.group(1) if src_url_m else ""

    # YouTube URL (if present in markdown or meta)
    yt_m = re.search(r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[^\s\)"\'>]+)', content)
    youtube_url = yt_m.group(1) if yt_m else ""

    # 3. Intro (परिचय एवं महत्त्व)
    intro = ""
    intro_m = re.search(r"##\s+परिचय एवं महत्त्व\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if intro_m:
        intro = intro_m.group(1).strip()

    # 4. Full Sanskrit (मूल स्तोत्र पाठ)
    full_sanskrit = ""
    sansk_m = re.search(r"##\s+मूल स्तोत्र पाठ\s*\n[\s\S]*?```(?:\w*\n)?([\s\S]*?)```", content)
    if sansk_m:
        full_sanskrit = sansk_m.group(1).strip()

    # 5. Verses breakdown under भावार्थ
    verses = []
    pattern = r"\n(#{3,5})\s+((?:श्लोक|पद|अनुवाक|मन्त्र|पाठांश|चौपाई|दोहा|प्रारम्भिक\s+दोहा|समापन\s+दोहा)[^\n]*)"
    splits = re.split(pattern, content)
    if len(splits) > 1:
        for i in range(1, len(splits), 3):
            v_title = splits[i+1].strip()
            v_body = splits[i+2]
            
            # stop if next main ## section begins
            next_h2 = re.search(r"\n##\s+", v_body)
            if next_h2:
                v_body = v_body[:next_h2.start()]
                
            code_m = re.search(r"```(?:\w*\n)?([\s\S]*?)```", v_body)
            sanskrit = code_m.group(1).strip() if code_m else ""
            
            meaning_m = re.search(r"\*\*(?:हिंदी\s+)?भावार्थ\s*:\*\*\s*([\s\S]*?)(?=\Z|\n###|\n####|\n#####)", v_body)
            meaning = meaning_m.group(1).strip() if meaning_m else ""
            
            verses.append({
                "label": v_title,
                "sanskrit": sanskrit,
                "meaning": meaning
            })

    # If full_sanskrit was missing but verses exist, assemble it
    if not full_sanskrit and verses:
        full_sanskrit = "\n\n".join(v["sanskrit"] for v in verses if v["sanskrit"])

    # 6. Notes / Variants
    variants = ""
    var_m = re.search(r"##\s+पाठानन्तर\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if var_m:
        variants = var_m.group(1).strip()

    # Category determination
    cat = "स्तोत्रम्"
    if "कवच" in title:
        cat = "कवचम्"
    elif "सहस्रनाम" in title:
        cat = "सहस्रनाम"
    elif "अष्टक" in title:
        cat = "अष्टकम्"
    elif "स्तुति" in title:
        cat = "स्तुतिः"
    elif "चालीसा" in title:
        cat = "चालीसा"
    elif "सूक्त" in title:
        cat = "सूक्तम्"
    elif "हृदय" in title:
        cat = "हृदयम्"
    elif "लहरी" in title:
        cat = "लहरी"
    elif "शतनाम" in title:
        cat = "नामावली"

    # Shloka count info
    if "shri_rudram" in base:
        shloka_info = "२ खण्ड (२२ अनुवाक)"
    else:
        shloka_info = str(len(verses)) if verses else "0"

    legacy_id = (legacy_map or {}).get(s_id, s_id)

    return {
        "id": s_id,
        "legacy_id": legacy_id,
        "number": sub_num,
        "sub_num": sub_num,
        "section_num": sec_num,
        "section_title": deity,
        "devanagari_num": devanagari_num,
        "title": title,
        "deity": deity,
        "category": cat,
        "meta_html": meta_html,
        "source_url": source_url,
        "youtube_url": youtube_url,
        "intro": intro,
        "full_sanskrit": full_sanskrit,
        "verses": verses,
        "variants": variants,
        "shloka_count": shloka_info,
        "base_file": base,
        "file_path": f"{rel_folder}/{base}"
    }

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    stotra_dir = os.path.join(script_dir, "stuti_ganga")
    output_dir = os.path.join(script_dir, "data")
    os.makedirs(output_dir, exist_ok=True)

    legacy_map = {}
    legacy_file = os.path.join(output_dir, "legacy_map.json")
    if os.path.exists(legacy_file):
        try:
            with open(legacy_file, "r", encoding="utf-8") as fp:
                legacy_map = json.load(fp)
        except Exception as e:
            print(f"Notice: Could not load legacy_map.json: {e}")

    # Discover stotra files inside section subfolders
    stotra_files = sorted([
        f for f in glob.glob(os.path.join(stotra_dir, "*", "*.md"))
        if re.match(r"^\d+\.\d{3}_", os.path.basename(f))
    ])

    # If subfolders not found, fallback to root stuti_ganga/*.md
    if not stotra_files:
        stotra_files = sorted([
            f for f in glob.glob(os.path.join(stotra_dir, "*.md"))
            if not os.path.basename(f).startswith("000_") and not os.path.basename(f).startswith("shri_")
        ])

    print(f"Parsing all {len(stotra_files)} stotra, chalisa and stuti files from stuti_ganga/...")
    parsed_stotras = []
    for f in stotra_files:
        stotra = parse_stotra_file(f, legacy_map=legacy_map)
        parsed_stotras.append(stotra)

    # Sort strictly by section_num, then sub_num
    parsed_stotras.sort(key=lambda x: (x["section_num"], x["sub_num"]))

    stotras = parsed_stotras

    output_file = os.path.join(output_dir, "stotras.json")
    with open(output_file, "w", encoding="utf-8") as fp:
        json.dump(stotras, fp, ensure_ascii=False, indent=2)

    output_js = os.path.join(output_dir, "stotras_data.js")
    with open(output_js, "w", encoding="utf-8") as fp:
        fp.write("window.STOTRAS_DATA = ")
        json.dump(stotras, fp, ensure_ascii=False)
        fp.write(";\n")

    # Deities & Categories metadata
    deities = {}
    categories = {}
    for s in stotras:
        d = s["deity"]
        deities[d] = deities.get(d, 0) + 1
        c = s["category"]
        categories[c] = categories.get(c, 0) + 1

    metadata = {
        "collection_title": "श्री सनातन वाङ्मयम् — स्तुति-गंगा",
        "sub_title": "सनातन धर्म के समस्त २६२ पावन स्तोत्र, स्तुति, अष्टक, कवच, सहस्रनाम एवं चालीसा संग्रह",
        "total_stotras": len(stotras),
        "deities": deities,
        "categories": categories
    }
    with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as fp:
        json.dump(metadata, fp, ensure_ascii=False, indent=2)

    print(f"Successfully generated {output_file} ({len(stotras)} stotras)")
    print(f"Deities: {deities}")
    print(f"Categories: {categories}")

if __name__ == "__main__":
    main()
