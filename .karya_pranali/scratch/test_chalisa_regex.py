import re

for fname in ['247_shri_hanuman_chalisa.md', '249_shri_shiv_chalisa.md']:
    content = open(f'shri_vangamayam/stotraavali/{fname}').read()
    pattern = r'\n(#{3,5})\s+((?:श्लोक|पद|अनुवाक|मन्त्र|पाठांश|चौपाई|दोहा|प्रारम्भिक\s+दोहा|समापन\s+दोहा)[^\n]*)'
    splits = re.split(pattern, content)
    verses = []
    if len(splits) > 1:
        for i in range(1, len(splits), 3):
            v_title = splits[i+1].strip()
            v_body = splits[i+2]
            next_h2 = re.search(r'\n##\s+', v_body)
            if next_h2: v_body = v_body[:next_h2.start()]
            code_m = re.search(r'```(?:\w*\n)?([\s\S]*?)```', v_body)
            sanskrit = code_m.group(1).strip() if code_m else ''
            meaning_m = re.search(r'\*\*(?:हिंदी\s+)?भावार्थ\s*:\*\*\s*([\s\S]*?)(?=\Z|\n###|\n####|\n#####)', v_body)
            meaning = meaning_m.group(1).strip() if meaning_m else ''
            verses.append({'label': v_title, 'sanskrit': sanskrit, 'meaning': meaning})

    print(f'{fname}: Parsed {len(verses)} units! First: {verses[0]["label"]}, Last: {verses[-1]["label"]}')
