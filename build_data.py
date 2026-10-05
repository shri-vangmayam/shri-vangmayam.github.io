#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build Data for Shri Sanatan Vangamayam Web-Book.
Parses Markdown files from 'stuti_ganga/' into structured JSON.
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

def get_deity(num, title):
    if 1 <= num <= 41 or num == 249: return 'श्री शिव'
    elif 42 <= num <= 77 or num == 262: return 'श्री विष्णु'
    elif 78 <= num <= 86 or num == 254: return 'श्री कृष्ण'
    elif 87 <= num <= 100 or num == 253: return 'श्री राम'
    elif num == 101 or 194 <= num <= 201 or num == 255: return 'श्री सूर्य'
    elif 102 <= num <= 112 or num == 247: return 'श्री हनुमान'
    elif 113 <= num <= 128 or num == 250: return 'श्री गणेश'
    elif 129 <= num <= 186 or num in (248, 251, 252, 256, 259, 260, 261, 263): return 'श्री देवी / शक्ति'
    elif 187 <= num <= 193: return 'श्री नृसिंह'
    elif 202 <= num <= 208: return 'श्री कार्तिकेय'
    elif 209 <= num <= 214: return 'श्री दत्तात्रेय'
    elif 215 <= num <= 219 or num == 258: return 'श्री भैरव'
    elif 220 <= num <= 230 or num == 257: return 'नवग्रह'
    elif 231 <= num <= 244: return 'वैदिक सूक्त'
    elif num in (245, 246): return 'श्री गुरु'
    elif num == 264: return 'कुबेर'
    return 'अन्य'

def parse_stotra_file(fpath):
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    base = os.path.basename(fpath)
    num_match = re.match(r"^(\d{3})_", base)
    num = int(num_match.group(1)) if num_match else 0
    num_str = f"{num:03d}"

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
    var_m = re.search(r"##\s+पाठान्तर\s*\n([\s\S]*?)(?=\n##|\Z)", content)
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
    if "038_shri_rudram" in base:
        shloka_info = "२ खण्ड (२२ अनुवाक)"
    else:
        shloka_info = str(len(verses)) if verses else "0"

    deity = get_deity(num, title)

    return {
        "id": num_str,
        "number": num,
        "devanagari_num": to_devanagari(num, 3 if num >= 100 else 2),
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
        "base_file": base
    }

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

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    stotra_dir = os.path.join(script_dir, "stuti_ganga")
    output_dir = os.path.join(script_dir, "data")
    os.makedirs(output_dir, exist_ok=True)

    stotra_files = sorted([
        f for f in glob.glob(os.path.join(stotra_dir, "*.md"))
        if re.match(r"^\d{3}_", os.path.basename(f)) and not os.path.basename(f).startswith("000_")
    ])

    print(f"Parsing all {len(stotra_files)} stotra, chalisa and stuti files from stuti_ganga/...")
    parsed_stotras = []
    for f in stotra_files:
        stotra = parse_stotra_file(f)
        parsed_stotras.append(stotra)

    # 1. Map each stotra to section number
    for s in parsed_stotras:
        s["section_num"] = SEC_MAP.get(s["deity"], 99)
        s["section_title"] = s["deity"]

    # 2. Sort by section_num, then within section: classical (orig_num < 245) first, then chalisas (orig_num >= 245)
    parsed_stotras.sort(key=lambda x: (x["section_num"], 1 if x["number"] >= 245 else 0, x["number"]))

    # 3. Assign 1.001 sectional numbering (खण्ड-वार दशमलव प्रणाली)
    sec_counts = {}
    for s in parsed_stotras:
        sec = s["section_num"]
        sec_counts[sec] = sec_counts.get(sec, 0) + 1
        sub = sec_counts[sec]
        s["sub_num"] = sub
        s["legacy_id"] = s["id"]
        s["id"] = f"{sec}.{sub:03d}"
        s["devanagari_num"] = f"{to_devanagari(sec, pad=1)}.{to_devanagari(sub, pad=3)}"

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
