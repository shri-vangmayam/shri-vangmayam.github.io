#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build Complete Data Engine for Shri Sanatan Vangmayam.
Parses all 7 markdown corpora:
  1. stuti_ganga (२६२ स्तोत्र, कवच, सहस्रनाम व चालीसाएं)
  2. kavya (२०१ कालजयी राष्ट्रकाव्य व संत-पद)
  3. vrat_pujanam (३६ पावन व्रत, नवरात्र व पूजन विधियां)
  4. itihas (२४ ऐतिहासिक शौर्य गाथाएं)
  5. bachpan (२८ बाल संस्कार व साहित्य रचनाएं)
  6. hasya (१४ सुरुचिपूर्ण व्यंग्य व प्रहसन)
  7. aarogyam (२५ अमृत आयुर्वेद व स्वास्थ्य सूत्र)
Generates:
  - data/stotras.json & data/stotras_data.js (for backward compatibility)
  - data/corpus_all_data.js (unified global dataset for all pillars)
  - data/<corpus>.json (individual JSON datasets)
"""

import os
import re
import glob
import json

DEVANAGARI_DIGITS = "०१२३४५६७८९"

def to_devanagari(n, pad=1):
    s = f"{n:0{pad}d}"
    return "".join(DEVANAGARI_DIGITS[int(d)] for d in s)

CORPUS_SECTIONS = {
    'stuti_ganga': {
        1: 'श्री शिव', 2: 'श्री विष्णु', 3: 'श्री कृष्ण', 4: 'श्री राम',
        5: 'श्री हनुमान', 6: 'श्री गणेश', 7: 'श्री देवी / शक्ति', 8: 'श्री सूर्य',
        9: 'श्री नृसिंह', 10: 'श्री कार्तिकेय', 11: 'श्री दत्तात्रेय', 12: 'श्री भैरव',
        13: 'नवग्रह', 14: 'वैदिक सूक्त', 15: 'श्री गुरु', 16: 'कुबेर'
    },
    'kavya': {
        1: "रामधारी सिंह 'दिनकर'",
        2: "मैथिलीशरण गुप्त",
        3: "माखनलाल चतुर्वेदी",
        4: "सुभद्राकुमारी चौहान",
        5: "महाकवि भूषण",
        6: "जयशंकर प्रसाद",
        7: "सूर्यकान्त त्रिपाठी 'निराला'",
        8: "श्यामनारायण पाण्डेय",
        9: "बंकिम व प्रयाण गीत",
        10: "संत कवि (तुलसी, कबीर, रसखान, मीरा)",
        11: "चारण व रीतिकाल",
        12: "क्रांति व परमवीर",
        13: "वैदिक ऋषि काव्य",
        14: "राष्ट्रीय चेतना"
    },
    'vrat_pujanam': {
        1: "नवरात्र पूजन एवं अनुष्ठान",
        2: "पावन एकादशी महात्म्य",
        3: "शिव-शक्ति व्रत एवं कथा",
        4: "पर्व एवं पूजा विधान"
    },
    'itihas': {
        1: "प्राचीन भारत एवं चक्रवर्ती",
        2: "मध्यकालीन शौर्य एवं प्रतिरोध",
        3: "स्वातंत्र्य क्रांति एवं अमर बलिदानी",
        4: "राष्ट्र-गाथा एवं धरोहर"
    },
    'bachpan': {
        1: "पंचतन्त्र नीति कथाएं",
        2: "दैनिक संस्कार एवं श्लोक",
        3: "बाल-कविताएं",
        4: "बाल-चरित्र एवं आदर्श",
        5: "तरंग वाटिका"
    },
    'hasya': {
        1: "कालजयी व्यंग्य",
        2: "सामाजिक कटाक्ष",
        3: "प्रहसन व एकांकी",
        4: "व्यंग्य दोहे व पद"
    },
    'aarogyam': {
        1: "त्रिदोष विज्ञान",
        2: "दिनचर्या विधान",
        3: "ऋतुचर्या",
        4: "दिव्य औषधियां व जड़ी-बूटी",
        5: "योग एवं प्राणायाम"
    }
}

REV_SEC_MAP = CORPUS_SECTIONS['stuti_ganga']

def parse_markdown_item(fpath, corpus_name, default_sec_num=1, legacy_map=None):
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    base = os.path.basename(fpath)
    rel_folder = os.path.basename(os.path.dirname(fpath))

    dec_m = re.match(r"^(\d+)\.(\d{3})_", base)
    if dec_m:
        sec_num = int(dec_m.group(1))
        sub_num = int(dec_m.group(2))
    else:
        num_m = re.match(r"^(\d+)_", base)
        sec_num = default_sec_num
        sub_num = int(num_m.group(1)) if num_m else 1

    item_id = f"{sec_num}.{sub_num:03d}"
    devanagari_num = f"{to_devanagari(sec_num, pad=1)}.{to_devanagari(sub_num, pad=3)}"

    # Title
    t_m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = t_m.group(1).strip() if t_m else base

    # Author / Poet / Deity
    author_m = re.search(r"\*\*रचनाकार:\*\*\s*([^\n\r\|]+)", content)
    author = author_m.group(1).strip() if author_m else ""

    source_m = re.search(r"\*\*(?:स्रोत ग्रंथ|स्रोत / परंपरा|स्रोत):\*\*\s*([^\n\r\|]+)", content)
    source = source_m.group(1).strip() if source_m else ""

    dept_m = re.search(r"\*\*विभाग:\*\*\s*([^\n\r\|]+)", content)
    department = dept_m.group(1).strip() if dept_m else ""

    # YouTube URL
    yt_m = re.search(r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[^\s\)"\'>]+)', content)
    youtube_url = yt_m.group(1) if yt_m else ""

    # Intro
    intro = ""
    intro_m = re.search(r"##\s+(?:📜\s+)?परिचय एवं (?:शास्त्रीय\s+)?महत्त्व\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if intro_m:
        intro = intro_m.group(1).strip()

    # Full text
    full_text = ""
    text_m = re.search(r"##\s+(?:📜\s+)?मूल (?:स्तोत्र\s+)?पाठ\s*\n[\s\S]*?```(?:\w*\n)?([\s\S]*?)```", content)
    if not text_m:
        text_m = re.search(r"##\s+(?:📜\s+)?मूल पाठ\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if text_m:
        full_text = text_m.group(1).strip()

    # Verses
    verses = []
    pattern = r"\n(#{3,5})\s+((?:श्लोक|पद|अनुवाक|मन्त्र|पाठांश|चौपाई|दोहा|प्रारम्भिक\s+दोहा|समापन\s+दोहा)[^\n]*)"
    splits = re.split(pattern, content)
    if len(splits) > 1:
        for i in range(1, len(splits), 3):
            v_title = splits[i+1].strip()
            v_body = splits[i+2]
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

    if not full_text and verses:
        full_text = "\n\n".join(v["sanskrit"] for v in verses if v["sanskrit"])

    bhavartha = ""
    bhav_m = re.search(r"##\s+(?:🪔\s+)?(?:सरल हिंदी\s+)?भावार्थ\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if bhav_m:
        bhavartha = bhav_m.group(1).strip()

    variants = ""
    var_m = re.search(r"##\s+पाठानन्तर\s*\n([\s\S]*?)(?=\n##|\Z)", content)
    if var_m:
        variants = var_m.group(1).strip()

    # Sections
    sections = []
    sec_matches = re.finditer(r"^##\s+(.+)$", content, re.MULTILINE)
    headers = [m.group(1).strip() for m in sec_matches]
    for h in headers:
        if any(skip in h for skip in ['परिचय', 'मूल पाठ', 'मूल स्तोत्र पाठ', 'भावार्थ', 'सरल हिंदी भावार्थ', 'पाठानन्तर']): continue
        body_m = re.search(rf"##\s+{re.escape(h)}\s*\n([\s\S]*?)(?=\n##|\Z)", content)
        if body_m:
            sections.append({
                "heading": h,
                "body": body_m.group(1).strip()
            })

    # Section and category determination
    sec_name = CORPUS_SECTIONS.get(corpus_name, {}).get(sec_num, rel_folder)
    deity = sec_name if corpus_name == 'stuti_ganga' else (author or sec_name)
    cat = "स्तोत्रम्"
    if corpus_name == 'stuti_ganga':
        if "कवच" in title: cat = "कवचम्"
        elif "सहस्रनाम" in title: cat = "सहस्रनाम"
        elif "अष्टक" in title: cat = "अष्टकम्"
        elif "स्तुति" in title: cat = "स्तुतिः"
        elif "चालीसा" in title: cat = "चालीसा"
        elif "सूक्त" in title: cat = "सूक्तम्"
        elif "हृदय" in title: cat = "हृदयम्"
        elif "लहरी" in title: cat = "लहरी"
        elif "शतनाम" in title: cat = "नामावली"
    elif corpus_name == 'kavya':
        cat = sec_name
        if not author: author = sec_name
    elif corpus_name == 'vrat_pujanam':
        cat = sec_name
    elif corpus_name == 'itihas':
        cat = sec_name
    elif corpus_name == 'bachpan':
        cat = sec_name
    elif corpus_name == 'hasya':
        cat = sec_name
    elif corpus_name == 'aarogyam':
        cat = sec_name

    legacy_id = (legacy_map or {}).get(item_id, item_id)
    if "shri_rudram" in base:
        shloka_info = "२ खण्ड (२२ अनुवाक)"
    elif verses:
        shloka_info = str(len(verses))
    else:
        shloka_info = "सम्पूर्ण पाठ"

    desc = ""
    if intro:
        clean_intro = re.sub(r'<[^>]+>', '', intro)
        desc = clean_intro.split('\n')[0].strip()[:200]
    elif full_text:
        desc = full_text.split('\n')[0].strip()[:180]

    return {
        "id": item_id,
        "legacy_id": legacy_id,
        "number": sub_num,
        "section_num": sec_num,
        "section_name": sec_name,
        "sub_num": sub_num,
        "devanagari_num": devanagari_num,
        "deity": deity,
        "category": cat,
        "title": title,
        "author": author,
        "source": source,
        "department": department,
        "youtube_url": youtube_url,
        "shloka_count": shloka_info,
        "intro": intro,
        "full_sanskrit": full_text,
        "full_text": full_text,
        "verses": verses,
        "bhavartha": bhavartha,
        "variants": variants,
        "sections": sections,
        "desc": desc,
        "corpus": corpus_name,
        "folder": rel_folder,
        "file_path": fpath
    }

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(root_dir, 'data')
    os.makedirs(output_dir, exist_ok=True)

    legacy_map = {}
    legacy_file = os.path.join(output_dir, "legacy_map.json")
    if os.path.exists(legacy_file):
        try:
            with open(legacy_file, "r", encoding="utf-8") as fp:
                legacy_map = json.load(fp)
        except Exception:
            pass

    corpora_dirs = [
        ('stuti_ganga', 'श्री स्तुति-गंगा', 'stuti_ganga'),
        ('kavya', 'श्री काव्य-मंजूषा', 'kavya'),
        ('vrat_pujanam', 'श्री व्रत-पूजनम्', 'vrat_pujanam'),
        ('itihas', 'श्री इतिहास एवं गौरव', 'itihas'),
        ('bachpan', 'बचपन (बाल साहित्य व संस्कार)', 'bachpan'),
        ('hasya', 'श्री विदूषक (हास्य-विनोद)', 'hasya'),
        ('aarogyam', 'श्री आरोग्य (आयुर्वेद व स्वास्थ्य)', 'aarogyam')
    ]

    all_data = {}

    for c_id, c_title, dir_name in corpora_dirs:
        target_path = os.path.join(root_dir, dir_name)
        if not os.path.exists(target_path):
            continue

        files = sorted([
            f for f in glob.glob(os.path.join(target_path, "*", "*.md"))
            if not os.path.basename(f).startswith("000_")
        ])

        parsed_items = []
        for f in files:
            try:
                item = parse_markdown_item(f, c_id, legacy_map=legacy_map if c_id == 'stuti_ganga' else None)
                parsed_items.append(item)
            except Exception as e:
                print(f"Error parsing {f}: {e}")

        parsed_items.sort(key=lambda x: (x["section_num"], x["sub_num"]))
        all_data[c_id] = parsed_items
        print(f"Parsed {len(parsed_items)} items for {c_id} ({c_title})")

        # Save individual JSON
        json_file = os.path.join(output_dir, f"{c_id}.json")
        with open(json_file, "w", encoding="utf-8") as fp:
            json.dump(parsed_items, fp, ensure_ascii=False, indent=2)

    # 1. Write stotras.json & stotras_data.js for backward compatibility
    stotras = all_data.get('stuti_ganga', [])
    with open(os.path.join(output_dir, "stotras.json"), "w", encoding="utf-8") as fp:
        json.dump(stotras, fp, ensure_ascii=False, indent=2)

    with open(os.path.join(output_dir, "stotras_data.js"), "w", encoding="utf-8") as fp:
        fp.write("window.STOTRAS_DATA = ")
        json.dump(stotras, fp, ensure_ascii=False)
        fp.write(";\n")

    # 2. Write unified corpus_all_data.js
    with open(os.path.join(output_dir, "corpus_all_data.js"), "w", encoding="utf-8") as fp:
        fp.write("window.CORPUS_ALL_DATA = ")
        json.dump(all_data, fp, ensure_ascii=False)
        fp.write(";\n")
        fp.write("if (typeof window !== 'undefined' && (!window.STOTRAS_DATA || !window.STOTRAS_DATA.length) && window.CORPUS_ALL_DATA && window.CORPUS_ALL_DATA.stuti_ganga) {\n")
        fp.write("  window.STOTRAS_DATA = window.CORPUS_ALL_DATA.stuti_ganga;\n")
        fp.write("}\n")

    # 3. Metadata
    deities = {}
    categories = {}
    for s in stotras:
        d = s["deity"]
        deities[d] = deities.get(d, 0) + 1
        c = s["category"]
        categories[c] = categories.get(c, 0) + 1

    metadata = {
        "collection_title": "श्री सनातन वाङ्मयम् — समग्र पावन ग्रन्थालय",
        "corpora": {c_id: len(items) for c_id, items in all_data.items()},
        "total_works": sum(len(items) for items in all_data.values()),
        "deities": deities,
        "categories": categories
    }
    with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as fp:
        json.dump(metadata, fp, ensure_ascii=False, indent=2)

    print(f"All data built successfully! Total works: {metadata['total_works']}")

if __name__ == "__main__":
    main()
