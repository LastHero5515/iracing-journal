import subprocess,time
from playwright.sync_api import sync_playwright
srv=subprocess.Popen(['python3','-m','http.server','8765'],cwd='/workspace/sites/iracing-journal',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page(viewport={'width':1600,'height':900})
  pg.on('console',lambda m: m.type in('error','warning') and errs.append(m.text));pg.on('pageerror',lambda e:errs.append(str(e)))
  for i,id in enumerate(['overview','progress','sectors','corners','incidents','hardware','guides','guide','goals']):
    pg.goto(f'http://localhost:8765/#{id}');pg.wait_for_timeout(1500)
    print(id,'canvases',pg.locator('canvas').count(),'chart',pg.evaluate('!!window.Chart'))
    pg.screenshot(path=f'/workspace/sites/iracing-journal/screenshots/{i+1:02d}-{id}.png',full_page=True)
  b.close()
srv.terminate();print('ERRORS',errs)
