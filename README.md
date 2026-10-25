# Журнал тренировок iRacing — Артём

Статичный сайт (HTML/CSS/JS, без сборки). Chart.js и marked грузятся с CDN jsDelivr.

Запуск: `python3 -m http.server 8000` в этой папке → http://localhost:8000
(Через file:// не загрузится страница гайда — нужен http.)

## Файлы
- `data/data.js` — `window.JOURNAL`, все ручные данные (статистика, сессии, повороты, железо, гайды, цели).
- `data/telemetry.js` — `window.TELEMETRY`, генерируется из .ibt (не править руками).
- `guides/` — гайд тренера (markdown) и карта трассы.
- `tools/extract.py` — разбор .ibt (pyirsdk) → `tools/telemetry_extract.json`; `tools/build_telemetry.py` → `data/telemetry.js`.

## Структура data.js
- `stats` — iRating, SR, ttRating, дата, `career`.
- `bestLaps[]` — `{track, best:"м:сс.ммм"|null, note}`.
- `mugello.sessions[]` — `{date, drivingLine, best, avg, sigma, inc, note}` (null = нет данных).
- `incidents.byCorner[]` — `{corner, pct, pctLabel, why, fix}`.
- `corners[]` — `{turn, name, dir, gear, speed, braking, ref, mistake, advice, stability?, tele?, inc?}`; `tele` = имя зоны торможения в telemetry.js.
- `hardware`, `guides[] {name,url}`, `goals[] {text, status: now|next|later}`, `checklist[]`.

## Добавить сессию
1. Добавь строку в `mugello.sessions` в `data/data.js`, например
   `{ date: "26.10", drivingLine: false, best: "1:50.500", avg: "1:51.90", sigma: 0.5, inc: 1 }`.
2. (Опционально) положи .ibt в `/workspace/telemetry/`, добавь группу дат в `G` в `tools/build_telemetry.py`, затем:
   `pip install pyirsdk pyyaml && python3 tools/extract.py && python3 tools/build_telemetry.py`.
3. Обнови страницу.
