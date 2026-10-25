# Converts tools/telemetry_extract.json -> data/telemetry.js (window.TELEMETRY)
import json
d=json.load(open('tools/telemetry_extract.json'))
G=[("19.10 — с Driving Line (baseline)",True,["2026-10-19 20-50","2026-10-19 21-42"]),
   ("19.10 — без линии",False,["2026-10-19 23-05","2026-10-19 23-26"]),
   ("20.10 — без линии",False,["2026-10-20"]),("23.10 — без линии",False,["2026-10-23"]),("24.10 — без линии",False,["2026-10-24"]),("25.10 — без линии (вероятно)",False,["2026-10-25"])]
out=[]
for name,line,keys in G:
  fs=[s for s in d if any(k in s['file'] for k in keys) and s['laps']]
  laps=[dict(l,file=s['file'].split('gp ')[1].replace('.ibt','')) for s in fs for l in s['laps']]
  best=min(laps,key=lambda l:l['time'])
  bs=[min(l['sectors'][k] for l in laps) for k in range(3)]
  br={}
  for s in fs:
    for z,v in s['braking'].items():
      if v['n']<=len(s['laps']): br.setdefault(z,[]).append(dict(v,file=s['file'].split('gp ')[1].replace('.ibt','')))
  out.append(dict(name=name,drivingLine=line,laps=laps,bestLap=best,bestSectors=bs,ideal=round(sum(bs),3),braking=br))
open('data/telemetry.js','w').write('// АВТОГЕНЕРАЦИЯ: python3 tools/extract.py && python3 tools/build_telemetry.py\nwindow.TELEMETRY = '+json.dumps(dict(sectorStarts=d[0]['sectorStarts'],trackLen_m=d[0]['trackLen'],sessions=out),ensure_ascii=False,indent=1)+';\n')
for s in out: print(s['name'],s['bestLap']['time'],s['bestLap']['sectors'],s['bestSectors'],s['ideal'],list(s['braking']))
