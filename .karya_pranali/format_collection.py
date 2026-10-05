from pathlib import Path
import json,re,zipfile,hashlib
from separate_variants import separate
ROOT=Path(__file__).resolve().parent.parent
V=ROOT/'ShriBhajanam/000_stotra_sangrah';W=ROOT/'.bhajanam_work'
# Work from the immutable backup so repeated runs never duplicate a section.
z=zipfile.ZipFile(W/'before_uniform_format.zip')
numchars='०१२३४५६७८९';dev=lambda n:str(n).translate(str.maketrans('0123456789',numchars))
end=re.compile(r'॥\s*([०-९0-9]+(?:[./][०-९0-9]+)*)\s*(?:॥|(?=\s*$))')
def twolines(text):
 lines=[x.strip() for x in text.splitlines() if x.strip()]
 if len(lines)==2:return '\n'.join(lines)
 if len(lines)>2:
  # Use existing pada boundaries; never break a Sanskrit word.
  sizes=[len(x) for x in lines];k=min(range(1,len(lines)),key=lambda k:abs(sum(sizes[:k])-sum(sizes[k:])))
  return ' '.join(lines[:k])+'\n'+' '.join(lines[k:])
 line=lines[0] if lines else ''
 choices=[m.end() for m in re.finditer(r'।(?!।)',line) if m.end()<len(line)-5]
 if not choices:choices=[m.start() for m in re.finditer(' ',line) if 10<m.start()<len(line)-10]
 if not choices:return line
 k=min(choices,key=lambda k:abs(k-len(line)/2));return line[:k].strip()+'\n'+line[k:].strip()
def units(body):
 result=[];buf=[];anchors=[]
 def flush():
  nonlocal buf,anchors
  if not buf:return
  t='\n'.join(buf).strip();buf=[]
  numbers=end.findall(t)
  verse=bool(numbers) and not t.startswith(('इति ','॥ इति ','॥ स्वस्ति','समस्ता ','तत्राद्य','अत्रोच्यते'))
  if not numbers and not t.startswith(('इति ','॥ इति ','॥ स्वस्ति','समस्ता ')) and len(t.splitlines())>=2 and '।'in t and not any(w in t for w in ['विनियोग','ऋषिः','न्यासः','अङ्गुष्ठ','तर्जनी','मध्यमाभ्यां','source']):verse=True
  result.append({'kind':'verse' if verse else 'passage','text':twolines(t) if verse else t,'number':numbers[-1] if numbers else None,'anchors':anchors});anchors=[]
 for raw in body.splitlines():
  l=raw.strip()
  if l.startswith('^'):
   flush()
   if result:result[-1].setdefault('anchors',[]).append(l)
   continue
  if l.startswith('#'):
   flush();result.append({'kind':'heading','text':l});continue
  if l.startswith('![['):
   flush();result.append({'kind':'embed','text':l});continue
  if not l:flush();continue
  buf.append(l)
  if end.search(l):flush()
 flush();return result
catalog=[]
for filename in sorted(z.namelist()):
 if not filename.endswith('.md') or filename.startswith(('000_','001_','039_')):continue
 s=z.read(filename).decode();m=re.search(r'^## मूल पाठ\s*$',s,re.M)
 if not m:continue
 stop=re.search(r'^## स्रोत.*$',s[m.end():],re.M);pos=m.end()+stop.start() if stop else len(s)
 body=s[m.end():pos].strip();src=s[pos:].strip();pre=s[:m.start()].strip()
 title=re.search(r'^# (.+)',s,re.M)[1];meta=s.split('---',2)[1]
 pre=re.sub(r'^---.*?---\s*','',pre,flags=re.S);pre=re.sub(r'^# .*\n','',pre);pre=re.sub(r'\[\[000_master_list[^\]]*\]\]','',pre).strip()
 # Existing source/editorial note is kept, rather than inventing an origin story.
 entry={'file':filename,'title':title,'meta':meta,'intro':pre,'source':src,'units':units(body)}
 catalog.append(entry)
(W/'units.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
# Hindi explanations are authored separately and keyed by file sequence / unit position.
translations=json.loads((W/'meanings.json').read_text()) if (W/'meanings.json').exists() else {}
report=[]
for e in catalog:
 seq=e['file'][:3];us=e['units'];translated=translations.get(seq,{})
 display=[];variants=[]
 for j,u in enumerate(us):
  v=dict(u)
  if u['kind'] not in ['heading','embed']:
   text,found=separate(seq,j,u['text'])
   v['text']=twolines(text) if text and u['kind']=='verse' else text
   for kind,alt in found:variants.append((j,('श्लोक '+u['number']) if u.get('number') else 'पाठांश '+dev(j+1),kind,alt))
  display.append(v)
 intro=e['intro'] or 'नीचे शीर्षक में उल्लिखित स्तोत्र का प्रकाशित संस्कृत पाठ संकलित है।'
 out='---'+e['meta']+'---\n\n# '+e['title']+'\n\n[[000_master_list|← मुख्य सूची]]\n\n## परिचय एवं महत्त्व\n\n'+intro+'\n\n'
 out+='> **पाठ-विन्यास:** प्रत्येक श्लोक दो पंक्तियों में है। गद्य, न्यास, नामावली तथा अन्य पाठांश अपनी पाठ-इकाइयों में हैं। चुने हुए संस्कृत पाठ और स्वरचिह्न सुरक्षित रखे गए हैं; स्रोत के विकल्प नीचे पाठान्तर में हैं।\n\n'
 full=[]
 for u in display:
  if u['kind']=='heading':full.append(u['text'].lstrip('# '))
  elif u['kind']=='embed':
   # Resolve embeds to the original backed-up canonical block for the copyable full text.
   target,block=u['text'][3:-2].split('#^');original=z.read(target+'.md').decode();before=original.split('^'+block,1)[0].rstrip();paragraph=re.split(r'\n\s*\n',before)[-1];full.append(twolines(paragraph))
  elif u['text']:full.append(u['text'])
 out+='## मूल स्तोत्र पाठ\n\n```\n'+'\n\n'.join(full)+'\n```\n\n'
 count=sum(u['kind']=='verse' for u in us);done=sum(str(j)in translated for j,u in enumerate(us) if u['kind']=='verse')
 out+='## संस्कृत श्लोक एवं उनके हिंदी भावार्थ\n\n'
 if done<count:out+='> **संपादन-स्थिति:** कॉपी योग्य पाठ और दो-पंक्ति विन्यास तैयार हैं। इस फाइल के श्लोकवार हिंदी भावार्थ अभी '+('आंशिक हैं' if done else 'जोड़े जाने शेष हैं')+'।\n\n'
 k=0
 for j,u in enumerate(display):
  if not u['text']:continue
  if u['kind']=='heading':out+=u['text']+'\n\n';continue
  if u['kind']=='embed':out+=u['text']+'\n\n';continue
  k+=1
  heading=('श्लोक '+u['number'] if u.get('number') else 'श्लोक '+dev(k)) if u['kind']=='verse' else 'पाठांश '+dev(k)
  out+='#### '+heading+'\n\n```\n'+u['text']+'\n```\n'
  if u.get('anchors'):out+='\n'+'\n\n'.join(u['anchors'])+'\n'
  if str(j)in translated:out+='\n**भावार्थ:** '+translated[str(j)]+'\n'
  out+='\n'
 if variants:
  out+='## पाठान्तर\n\nमुख्य पाठ में चुना हुआ रूप दिया गया है। नीचे स्रोत के वैकल्पिक पाठ, अतिरिक्त पद और कोष्ठकीय टिप्पणियाँ अलग रखी गई हैं; ये मुख्य पाठ के बीच पढ़ने के लिए नहीं हैं।\n\n'
  for j,label,kind,alt in variants:
   out+='- **'+label+' — '+kind+':** '+alt.replace('\n',' ')+'\n'
  out+='\n'
 out+=e['source']+'\n'
 if done:out+='\nहिंदी भावार्थ: इस संकलन के लिए तैयार सरल व्याख्या; शब्दशः अनुवाद नहीं।\n'
 targets=list((ROOT/'ShriBhajanam').rglob(e['file']))
 assert len(targets)==1, (e['file'],targets)
 targets[0].write_text(out)
 report.append({'file':e['file'],'verse_units':count,'meanings_written':done,'complete':done==count})
(W/'progress.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('Formatted',len(report),'files; verses',sum(x['verse_units'] for x in report),'meanings',sum(x['meanings_written'] for x in report))
