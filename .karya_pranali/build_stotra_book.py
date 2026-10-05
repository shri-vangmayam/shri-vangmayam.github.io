#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to compile multiple Stotra markdown files into a single consolidated
Markdown E-Book with clickable TOC, back-to-top anchors, and outline hierarchy.
"""

import os
import re
import glob

DEVANAGARI_DIGITS = "०१२३४५६७८९"

def to_devanagari(n, pad=2):
    s = f"{n:0{pad}d}"
    return "".join(DEVANAGARI_DIGITS[int(d)] for d in s)

def extract_metadata(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    title = ""
    source_tag = ""
    body_start_idx = 0

    for idx, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("# ") and not title:
            title = stripped[2:].strip()
        elif stripped.startswith("<small>") and not source_tag:
            source_tag = stripped
        elif "_anukramanika.md" in stripped:
            body_start_idx = idx + 1
            break

    body_lines = lines[body_start_idx:]

    # Determine shloka count
    base = os.path.basename(file_path)
    if "038_shri_namakam" in base:
        shloka_info = "27 (11 अनुवाक)"
    elif "039_shri_chamakam" in base:
        shloka_info = "11 (11 अनुवाक)"
    elif "040_shri_rudram" in base:
        shloka_info = "मार्गदर्शक (नमकम् व चमकम्)"
    else:
        shlokas = re.findall(r"###\s+(?:श्लोक|पद|अनुवाक|मन्त्र|पाठांश)\s+([०-९]+|\d+)", content)
        if shlokas:
            shloka_info = str(len(shlokas))
        else:
            verses = re.findall(r"॥\s*([०-९]+|\d+)\s*॥", content)
            if verses:
                shloka_info = str(len(verses))
            else:
                shloka_info = "उपलब्ध नहीं"

    return title, source_tag, body_lines, shloka_info


def process_body_lines(lines, internal_file_map):
    in_code = False
    processed = []

    for line in lines:
        if line.strip().startswith("```"):
            in_code = not in_code
            processed.append(line)
            continue

        if in_code:
            processed.append(line)
            continue

        # Outside code blocks:
        # 1. Shift heading levels: ## -> ###, ### -> ####, etc.
        m = re.match(r"^(#{1,5})\s+(.*)", line)
        if m:
            hashes, rest = m.groups()
            line = "#" + hashes + " " + rest

        # 2. Rewrite internal markdown links
        # Match [text](target.md)
        def link_repl(match):
            text = match.group(1)
            target = match.group(2)
            if "000_stotra_sangrah_anukramanika.md" in target:
                return f"[{text}](#anukramanika)"
            # check if target matches any 0XX file in our compiled set
            target_base = os.path.basename(target.split("#")[0])
            if target_base in internal_file_map:
                anchor = internal_file_map[target_base]
                return f"[{text}](#{anchor})"
            return match.group(0)

        line = re.sub(r"\[([^\]]+)\]\(([^)]+\.md[^)]*)\)", link_repl, line)
        processed.append(line)

    return "\n".join(processed).strip()

def build_book(stotra_dir, start_num=1, end_num=41, output_file=None):
    # Find all matching files
    all_files = sorted(glob.glob(os.path.join(stotra_dir, "*.md")))
    selected_files = []

    for f in all_files:
        base = os.path.basename(f)
        m = re.match(r"^(\d{3})_", base)
        if m:
            num = int(m.group(1))
            if start_num <= num <= end_num:
                selected_files.append((num, f))

    selected_files.sort(key=lambda x: x[0])
    total_stotras = len(selected_files)
    print(f"Found {total_stotras} stotra files between {start_num:03d} and {end_num:03d}.")

    # Build internal file map: "001_shri_shiv_namami_stotram.md" -> "stotra-001"
    internal_file_map = {}
    stotra_meta = []

    for num, fpath in selected_files:
        base = os.path.basename(fpath)
        anchor = f"stotra-{num:03d}"
        internal_file_map[base] = anchor
        title, source_tag, body_lines, shloka_info = extract_metadata(fpath)
        stotra_meta.append({
            "num": num,
            "anchor": anchor,
            "title": title,
            "source_tag": source_tag,
            "body_lines": body_lines,
            "shloka_info": shloka_info,
            "base": base
        })

    # Generate Book Markdown Content
    doc = []

    # Title & Frontmatter
    doc.append("# श्री सनातन वाङ्मय संग्रह — श्री शिव स्तोत्र संग्रह (सम्पूर्ण)")
    doc.append("")
    doc.append("> **ग्रन्थ-स्वरूप:** एकल ई-बुक संस्करण (Single Consolidated Markdown Edition)  ")
    doc.append(f"> **विषय:** देवाधिदेव महादेव शिव की समस्त {to_devanagari(total_stotras)} स्तुतियाँ, स्तोत्र, अष्टक, कवच एवं तैत्तिरीय श्रीरुद्रम् (क्रमांक ००१ से ०४१)  ")
    doc.append("> **विशेषताएँ:** शुद्ध Markdown प्रारूप · इंटरैक्टिव अनुक्रमणिका (TOC) · त्वरित नेविगेशन लिंक · मूल संस्कृत पाठ एवं प्रामाणिक हिंदी भावार्थ  ")
    doc.append("")
    doc.append("---")
    doc.append("")

    # Table of Contents
    doc.append('<div id="anukramanika"></div>')
    doc.append("")
    doc.append("## अनुक्रमणिका")
    doc.append("")
    doc.append("> *निर्देश: किसी भी स्तोत्र पर जाने के लिए उसके शीर्षक पर क्लिक करें। प्रत्येक स्तोत्र के प्रारंभ एवं अंत में दिए गए लिंक से पुनः यहाँ लौटा जा सकता है।*")
    doc.append("")

    for idx, item in enumerate(stotra_meta, 1):
        num_dev = to_devanagari(item["num"], 2)
        doc.append(f"{idx}. [{item['title']}](#{item['anchor']}) — Shlok:- {item['shloka_info']}")

    doc.append("")
    doc.append("---")
    doc.append('<div style="page-break-after: always;"></div>')
    doc.append("")

    # Stotras content
    for idx, item in enumerate(stotra_meta):
        num = item["num"]
        num_dev = to_devanagari(num, 2)
        anchor = item["anchor"]
        title = item["title"]
        source_tag = item["source_tag"]
        body_lines = item["body_lines"]
        shloka_info = item["shloka_info"]

        # Navigation Bar
        nav_parts = []
        if idx > 0:
            prev_item = stotra_meta[idx - 1]
            prev_num_dev = to_devanagari(prev_item["num"], 2)
            nav_parts.append(f"[← {prev_num_dev}. {prev_item['title']}](#{prev_item['anchor']})")
        
        nav_parts.append("[↑ अनुक्रमणिका](#anukramanika)")

        if idx < total_stotras - 1:
            next_item = stotra_meta[idx + 1]
            next_num_dev = to_devanagari(next_item["num"], 2)
            nav_parts.append(f"[{next_num_dev}. {next_item['title']} →](#{next_item['anchor']})")

        nav_parts.append(f"**Shlok:- {shloka_info}**")
        nav_bar = " · ".join(nav_parts)


        processed_body = process_body_lines(body_lines, internal_file_map)

        doc.append(f'<div id="{anchor}"></div>')
        doc.append("")
        doc.append(f"## {num_dev}. {title}")
        doc.append("")
        if source_tag:
            doc.append(source_tag)
            doc.append("")
        doc.append(f"> 🧭 {nav_bar}")
        doc.append("")
        doc.append(processed_body)
        doc.append("")
        doc.append("<br>")
        doc.append("")
        doc.append("[↑ अनुक्रमणिका पर जाएं](#anukramanika)")
        doc.append("")
        doc.append("---")
        doc.append('<div style="page-break-after: always;"></div>')
        doc.append("")

    final_content = "\n".join(doc)

    if output_file:
        with open(output_file, "w", encoding="utf-8") as out_fp:
            out_fp.write(final_content)
        print(f"Successfully compiled {total_stotras} stotras into: {output_file}")
        print(f"File size: {len(final_content.encode('utf-8')) / 1024:.1f} KB")

    return final_content

if __name__ == "__main__":
    import argparse
    
    default_stotra_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "stuti_ganga")
    )
    
    parser = argparse.ArgumentParser(description="Compile multiple Stotra markdown files into a single Master E-Book.")
    parser.add_argument("--start", type=int, default=1, help="Starting stotra number (e.g. 1)")
    parser.add_argument("--end", type=int, default=41, help="Ending stotra number (e.g. 41)")
    parser.add_argument("--output", type=str, default=None, help="Output markdown file path")
    parser.add_argument("--dir", type=str, default=default_stotra_dir, help="Directory containing stotra files")

    args = parser.parse_args()

    if args.output is None:
        if args.start == 1 and args.end == 41:
            out_filename = "shri_shiv_stotra_sangrah_sampoorna.md"
        elif args.start == 1 and args.end >= 244:
            out_filename = "stotra_sangrah_sampoorna.md"
        else:
            out_filename = f"stotra_sangrah_{args.start:03d}_to_{args.end:03d}.md"
        out_path = os.path.join(args.dir, out_filename)
    else:
        out_path = args.output

    build_book(args.dir, args.start, args.end, out_path)

