import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
WORK = SCRIPT_DIR
STOTRA_DIR = REPO_ROOT / 'stuti_ganga'

catalog = json.loads((WORK / 'units.json').read_text(encoding='utf-8'))
meanings = json.loads((WORK / 'meanings.json').read_text(encoding='utf-8')) if (WORK / 'meanings.json').exists() else {}

print(f"Initial keys in meanings.json: {sorted(meanings.keys())}")

for seq in range(20, 42):
    seq_str = f"{seq:03d}"
    # find in catalog
    cat_entries = [e for e in catalog if e['file'].startswith(f"{seq_str}_")]
    if not cat_entries:
        # Check if file has different sequence name in catalog e.g. 020_shri_shiv_namavalyashtakam
        print(f"Warning: No catalog entry found for sequence {seq_str}")
        continue
    
    for cat_entry in cat_entries:
        # find matching markdown file in STOTRA_DIR
        md_file = STOTRA_DIR / cat_entry['file']
        if not md_file.exists():
            # try fuzzy match
            matches = list(STOTRA_DIR.glob(f"{seq_str}_*.md"))
            if not matches:
                # maybe sequence is 021?
                matches = list(STOTRA_DIR.glob(f"{seq+1:03d}_*.md"))
            if matches:
                md_file = matches[0]
            else:
                print(f"File not found for {cat_entry['file']}")
                continue
        
        content = md_file.read_text(encoding='utf-8')
        
        # Parse verses and meanings
        pattern = r"\n(#{3,5})\s+(?:श्लोक|पद|अनुवाक|मन्त्र|पाठांश|खण्ड|चरण)\s+([^\n]+)"
        splits = re.split(pattern, content)
        
        verse_meanings = []
        if len(splits) > 1:
            for i in range(1, len(splits), 3):
                v_title = splits[i+1].strip()
                v_body = splits[i+2]
                next_h2 = re.search(r"\n##\s+", v_body)
                if next_h2:
                    v_body = v_body[:next_h2.start()]
                
                m = re.search(r"\*\*(?:हिंदी\s+)?भावार्थ\s*:\*\*\s*([\s\S]*?)(?=\Z|\n###|\n####|\n#####)", v_body)
                meaning = m.group(1).strip() if m else ""
                
                # Check if this split corresponds to a verse unit
                is_verse = "श्लोक" in splits[i] or "श्लोक" in v_title or "पद" in v_title or "अनुवाक" in v_title or "मन्त्र" in v_title
                verse_meanings.append((v_title, meaning, is_verse))
        
        # Match with catalog units
        verse_indices = [j for j, u in enumerate(cat_entry['units']) if u['kind'] == 'verse']
        
        # Extract meanings for verse units
        # If lengths match directly:
        m_texts = [m for t, m, is_v in verse_meanings if m and is_v]
        if not m_texts:
            m_texts = [m for t, m, is_v in verse_meanings if m]
            
        print(f"Seq {seq_str} ({cat_entry['file']}): catalog verses={len(verse_indices)}, found meanings={len(m_texts)}")
        
        file_key = cat_entry['file'][:3]
        if file_key not in meanings or len(meanings[file_key]) == 0:
            meanings[file_key] = {}
            for j, u_idx in enumerate(verse_indices):
                if j < len(m_texts):
                    meanings[file_key][str(u_idx)] = m_texts[j]

(WORK / 'meanings.json').write_text(json.dumps(meanings, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"Final keys in meanings.json: {sorted(meanings.keys())}")
