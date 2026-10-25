import irsdk,re,glob,json,statistics as st
from collections import defaultdict
Z=[("San Donato",0.09,0.125),("Luco",0.155,0.19),("Poggio Secco",0.19,0.25),("Materassi/Borgo San Lorenzo",0.255,0.31),("Вход в S2 (Casanova-Savelli)",0.34,0.39),("Casanova",0.54,0.60),("Arrabbiata 2 / Scarperia",0.645,0.70),("Correntaio",0.80,0.85),("Bucine",0.88,0.95)]
out=[]
for f in sorted(glob.glob('/workspace/telemetry/*.ibt')):
  i=irsdk.IBT();i.open(f);h=i._header
  raw=i._shared_mem[h.session_info_offset:h.session_info_offset+h.session_info_len].rstrip(b'\x00').decode('cp1252','replace')
  K=["SessionTime","Lap","LapDistPct","Brake","OnPitRoad","PlayerCarMyIncidentCount","Speed"]
  D={k:i.get_all(k) for k in K};i.close()
  tl=float(re.search(r'TrackLength:\s*([\d.]+)',raw).group(1))*1000
  secs=[float(x) for x in re.findall(r'SectorStartPct:\s*([\d.]+)',raw)]+[1.0]
  st_type=re.findall(r'SessionType:\s*(.*)',raw)
  laps=defaultdict(list)
  for j,l in enumerate(D["Lap"]): laps[int(l)].append(j)
  T,P,B,I=D["SessionTime"],D["LapDistPct"],D["Brake"],D["PlayerCarMyIncidentCount"]
  L=[];br=defaultdict(list)
  for lap in sorted(laps):
    idx=laps[lap]
    if lap+1 not in laps: continue
    t=T[laps[lap+1][0]]-T[idx[0]]
    if not(max(P[j] for j in idx)>0.99 and min(P[j] for j in idx[:5])<0.01 and not any(D["OnPitRoad"][j] for j in idx) and t<200): continue
    pts=[(P[j],T[j]) for j in idx];pv=T[idx[0]];s=[]
    for th in secs[1:]:
      ct=next((tt for p,tt in pts if p>=th),T[laps[lap+1][0]]);s.append(round(ct-pv,3));pv=ct
    inc=I[laps[lap+1][0]]-I[idx[0]]
    L.append(dict(lap=lap,time=round(t,3),sectors=s,inc=int(inc),valid=inc==0))
    on=False
    for j in idx:
      if not on and B[j]>0.1: on=True;p0=P[j];t0=T[j]
      elif on and B[j]<0.05:
        on=False
        if T[j]-t0>0.25:
          for nm,lo,hi in Z:
            if lo<=p0<hi: br[nm].append(p0*tl);break
  out.append(dict(file=f.split('/')[-1],sessionType=st_type[-1].strip() if st_type else None,trackLen=tl,sectorStarts=secs[:-1],laps=L,
    braking={k:dict(n=len(v),median_m=round(st.median(v)),sd_m=round(st.pstdev(v),1)) for k,v in br.items() if len(v)>1}))
  print(f[-23:],len(L),[x['time'] for x in L][:12])
json.dump(out,open('/workspace/sites/iracing-journal/tools/telemetry_extract.json','w'),ensure_ascii=False,indent=1)
