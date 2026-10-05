"""Conservative display-layer extraction; original units and translations stay keyed."""
import re
EXPLICIT={
('003',1):['मकारमहिताय'],('014',17):['ततः'],('017',6):['ब्रह्ममार्गे सुसारे'],('017',16):['स्मितं च'],
('025',7):['वीर्यैकमत्यात्]'],('025',12):['रोत्कर्षोद्यत्प्रसादाः प्रमथपरिवृढाः पान्तु'],('025',14):['हृद्यं हृद्यस्तु नित्यं'],('025',16):['तरेणास्तृतो'],('025',22):['स्निग्धमुग्धः'],('025',25):['तानिन्दुमौले-'],('025',26):['भिया सर्वलोकोपतापा'],('025',27):['माणिक्यजाल'],('025',32):['धुतिनिचय'],('025',35):['निजयावस्थयैव'],('025',37):['सखीनां मदतरल'],('025',40):['पाणिद्वन्द्वाग्रजाग्रत्सुललितरणितस्वर्ण'],('025',41):['पशुपतज्जाति'],('025',42):['ध्यन्नित्थं']}
# In these places a parenthesis introduces an entire supplementary passage.
SUPPLEMENT={'145':set(range(102,107)), '188':set(range(32,41)), '154':{16}}
END=re.compile(r'॥\s*[०-९0-9]+(?:[./][०-९0-9]+)*\s*॥')
def separate(seq,j,text):
 notes=[];s=text
 if j in SUPPLEMENT.get(seq,set()):
  s=s.strip().strip('()').strip()
  if s:notes.append(('अतिरिक्त स्रोत-पाठ',s))
  return '',notes
 if seq=='116' and j in [10,14]:s=s.strip('()')
 if seq=='242' and j in [12,13,15,16]:
  return '',[('स्रोत की ऋषि-छन्द-सूचना',s.strip('()'))]
 # Isolate unbracketed variants whose boundaries were identified in the source.
 for variant in EXPLICIT.get((seq,j),[]):
  pattern=r'पाठान्तर:\s*'+re.escape(variant)
  assert re.search(pattern,s),(seq,j,variant)
  s=re.sub(pattern,'',s,count=1);notes.append(('वैकल्पिक पाठ',variant.rstrip(']')))
 # Full balanced parenthetical fragments, including nested editorial parentheses.
 while '(' in s and ')' in s:
  begin=s.find('(');depth=0;finish=None
  for k in range(begin,len(s)):
   if s[k]=='(':depth+=1
   elif s[k]==')':
    depth-=1
    if depth==0:finish=k;break
  if finish is None:break
  val=s[begin+1:finish].strip()
  if val:notes.append(('कोष्ठकीय पाठ / टिप्पणी',val))
  s=s[:begin]+s[finish+1:]
 # Stray source punctuation is not spoken Sanskrit.
 s=s.replace('(','').replace(')','')
 # These trailing Sanskrit tokens were unbracketed source alternatives, not the next verse.
 matches=list(END.finditer(s))
 if matches:
  last=matches[-1];tail=s[last.end():].strip()
  if tail and re.search('[\u0900-\u0963]',tail):
   notes.append(('श्लोक के बाद दिया विकल्प',tail));s=s[:last.end()]
 if seq=='145' and j==104:
  alt='जनयामास मदनो, जनयन्तः समतुलां, जनयन्ता सुवदने'
  if alt in s:s=s.replace(alt,'');notes.append(('वैकल्पिक पाठ',alt))
 assert 'पाठान्तर:' not in s,(seq,j,s)
 s='\n'.join(re.sub(r'[ \t]+',' ',line).strip() for line in s.splitlines())
 return s.strip(),notes
