import json
from pathlib import Path
W=Path(__file__).resolve().parent
catalog=json.loads((W/'units.json').read_text())
alltext=json.loads((W/'meanings.json').read_text()) if (W/'meanings.json').exists() else {}
def add(seq,lines):
 vals=[x.strip() for x in lines.strip().split('\n') if x.strip()];e=next(x for x in catalog if x['file'].startswith(f'{seq:03d}_'));indices=[j for j,u in enumerate(e['units']) if u['kind']=='verse']
 assert len(vals)==len(indices),(seq,len(vals),len(indices))
 alltext[f'{seq:03d}']={str(j):v for j,v in zip(indices,vals)}
def save():
 (W/'meanings.json').write_text(json.dumps(alltext,ensure_ascii=False,indent=2))
if __name__=='__main__':pass
