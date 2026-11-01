# Motion Designer Portfolio

A cinematic, bilingual (English / فارسی) portfolio for a motion designer. Built with Vite + React + TypeScript, real-time 3D (Three.js via React Three Fiber), GSAP + ScrollTrigger, Lenis smooth scrolling and Tailwind CSS. Fully static and deploys to GitHub Pages on every push.

[فارسی ↓](#راهنمای-فارسی)

---

## Features

- **3D hero**: a morphing shader blob and particle field that react to the mouse and to scrolling. Weaker devices get a simplified scene, and frame-rate drops are handled automatically.
- **Showreel** that grows from a card to full-bleed as you scroll, and opens a lightbox player on click.
- **Selected works** grid. Hovering a card plays a muted preview (on phones, previews play while the card is visible). Category filter.
- **Project pages** with a large player (local mp4, YouTube or Vimeo), client / year / tools, and a stills gallery.
- About, Services, Clients (marquee) and Contact sections.
- Custom cursor (shows **Play / پخش** over videos and **View / مشاهده** over projects), magnetic buttons, word-by-word text reveals, page-transition curtains and film grain.
- Full **RTL** support for Persian. Layout, arrows, wipes and marquees mirror automatically.
- Loading screen with real progress. Videos load lazily, and so does the 3D scene: on phones it starts on the first touch or scroll.
- Respects `prefers-reduced-motion` (no smooth scroll, no reveals, a static 3D frame).
- Lighthouse (local production build): Performance 92 mobile / 94 desktop, Best Practices 100, SEO 100.

---

## 1. Run locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

---

## 2. Add a project

Adding a project takes one JSON entry and one folder. No code changes.

1. Create a folder named after the project id: `public/projects/my-new-project/`
2. Put the files in it, for example:
   ```
   public/projects/my-new-project/
   ├── thumb.jpg        (card image, 4:3 works best, ~1200px wide)
   ├── preview.mp4      (short muted loop for hover, 5–8s, 960px, < 2 MB)
   ├── full.mp4         (optional: the full film, if not on YouTube/Vimeo)
   ├── still-1.jpg
   └── still-2.jpg
   ```
3. Add an entry to **`src/data/projects.json`**:
   ```json
   {
     "id": "my-new-project",
     "title": { "en": "My New Project", "fa": "پروژه‌ی جدید من" },
     "description": { "en": "What it is and what you did.", "fa": "توضیح پروژه." },
     "client": "Client Name",
     "year": 2026,
     "category": "3D",
     "tools": ["Cinema 4D", "Redshift", "After Effects"],
     "orientation": "vertical",
     "duration": 43,
     "thumbnail": "thumb.jpg",
     "previewVideo": "preview.mp4",
     "fullVideo": "https://vimeo.com/123456789",
     "gallery": ["still-1.jpg", "still-2.jpg"]
   }
   ```

Notes:
- File names are relative to `public/projects/<id>/`. Full `https://` URLs work too.
- `fullVideo` can be a local file (`"full.mp4"`), a **YouTube** link or a **Vimeo** link. The type is detected automatically.
- **Categories** are collected from your projects automatically. To translate a new category name, add it under `works.categories` in `src/i18n/content.json` for both languages, e.g. `"Character": "کاراکتر"`.
- `orientation`: `"vertical"` for 9:16 work (Reels, Stories); leave it out for 16:9 films, which then span two columns.
- `duration`: length in seconds, shown as a timecode (`00:43`) on the card and project page.
- The order in the file is the order on the site.
- Tip for preview videos: `ffmpeg -i in.mp4 -t 6 -vf scale=960:-2 -an -c:v libx264 -crf 28 -movflags +faststart preview.mp4`

---

## 3. Change texts, links and colours

| What | Where |
| --- | --- |
| All UI text (name, titles, bio, services, buttons…), in `en` and `fa` | `src/i18n/content.json` |
| Email, social links, showreel video, portrait, tools list, client names | `src/data/site.json` |
| Projects | `src/data/projects.json` |
| Colours (background, text, **accent**) | `src/index.css` → `:root` variables |
| Fonts | `src/index.css` (`--font-display`, `--font-body`) and imports in `src/main.tsx` |
| Static `<title>`, description, social preview | `index.html` and `public/og-image.png` (1200×630) |
| Favicon | `public/favicon.svg` |

Colours are space-separated RGB values so Tailwind opacity modifiers still work:

```css
:root {
  --color-accent: 77 124 255; /* #4d7cff (playhead blue) — e.g. 255 90 31 for #ff5a1f */
}
```

The 3D scene reads the accent colour from the same variable.

**Showreel:** put your files in `public/showreel/` and update `showreel` in `src/data/site.json`. `preview` is the muted loop shown on the page. `full` is what plays in the lightbox and can be an mp4, YouTube or Vimeo link.

**Language:** visitors toggle FA / EN in the header and the choice is remembered. The site opens in English by default. To change the default, edit `readStoredLang()` in `src/i18n/LanguageContext.tsx`.

---

## 4. Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. It sets the base path (`/<repo-name>/`) and the Open Graph URL automatically.

1. Create a repository on GitHub, e.g. `motion-portfolio`, and push this project to its `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/motion-portfolio.git
   git push -u origin main
   ```
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Wait for the **Deploy to GitHub Pages** action to finish (Actions tab). Your site will be at
   `https://<your-username>.github.io/motion-portfolio/`

Notes:
- To build by hand with the right base path, set `REPO_NAME` in `vite.config.ts` or run `BASE_PATH=/your-repo/ npm run build`.
- If the repository is named `<your-username>.github.io` (a user site), the base must be `/`. In that case change `BASE_PATH` in the workflow to `/`.
- Routing uses `HashRouter` (`/#/work/<id>`), so deep links work on GitHub Pages without any 404 tricks.

---

## 5. Films made in code (`remotion/`)

The showreel, the **Anar** logo animation and the **Tact 75** keyboard teaser are built with [Remotion](https://www.remotion.dev) in the `remotion/` folder: picture in React and three.js, sound synthesised in Python, delivery encoded with ffmpeg. See [`remotion/README.md`](remotion/README.md) for how to preview, change and re-render them. That folder is not part of the website build.

---

## Project structure

```
src/
├── i18n/content.json        ← all UI text (en + fa)
├── data/projects.json       ← projects
├── data/site.json           ← links, showreel, tools, clients
├── index.css                ← theme colours / fonts
├── three/                   ← 3D hero scene + shaders (lazy-loaded)
├── sections/                ← Hero, Showreel, Works, About, Services, Clients, Contact
├── pages/                   ← Home, ProjectPage, NotFound
└── components/              ← Cursor, Magnetic, RevealText, Loader, Header, Video, transitions…
public/
├── projects/<id>/           ← per-project media
├── showreel/  about/        ← showreel + portrait
└── og-image.png  favicon.svg
```

The media shipped with the project are generated placeholders. Replace them with your own work.

---
---

<div dir="rtl">

## راهنمای فارسی

سایت نمونه‌کار سینمایی و دوزبانه (فارسی / انگلیسی) برای طراح موشن، ساخته‌شده با Vite و React و TypeScript، سه‌بعدی واقعی (Three.js)، GSAP، اسکرول نرم Lenis و Tailwind. سایت کاملاً استاتیک است و با هر push روی GitHub Pages منتشر می‌شود.

### ۱. اجرا روی کامپیوتر خودتان

به **Node.js نسخه‌ی ۱۸ یا بالاتر** نیاز دارید.

<div dir="ltr">

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # ساخت نسخه‌ی نهایی در پوشه‌ی dist
npm run preview    # نمایش نسخه‌ی نهایی
```

</div>

### ۲. افزودن پروژه‌ی جدید

برای افزودن پروژه فقط یک ورودی JSON و یک پوشه لازم است و نیازی به تغییر کد نیست.

۱. پوشه‌ای هم‌نام با شناسه‌ی پروژه بسازید: `public/projects/my-new-project/`

۲. فایل‌ها را داخل آن بگذارید:
- `thumb.jpg`: تصویر کارت (نسبت ۴:۳)
- `preview.mp4`: ویدیوی کوتاه بی‌صدا برای هاور (۵ تا ۸ ثانیه، کمتر از ۲ مگابایت)
- `full.mp4`: اختیاری، اگر ویدیوی کامل روی یوتیوب یا ویمئو نیست
- `still-1.jpg`, `still-2.jpg`, …: فریم‌های گالری

۳. یک ورودی به فایل **`src/data/projects.json`** اضافه کنید:

<div dir="ltr">

```json
{
  "id": "my-new-project",
  "title": { "en": "My New Project", "fa": "پروژه‌ی جدید من" },
  "description": { "en": "Description…", "fa": "توضیح پروژه…" },
  "client": "Client Name",
  "year": 2026,
  "category": "3D",
  "tools": ["Cinema 4D", "After Effects"],
  "orientation": "vertical",
  "duration": 43,
  "thumbnail": "thumb.jpg",
  "previewVideo": "preview.mp4",
  "fullVideo": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "gallery": ["still-1.jpg", "still-2.jpg"]
}
```

</div>

- نام فایل‌ها نسبت به پوشه‌ی `public/projects/<id>/` است.
- `fullVideo` می‌تواند فایل محلی (`full.mp4`)، لینک **یوتیوب** یا لینک **ویمئو** باشد. نوع آن خودکار تشخیص داده می‌شود.
- دسته‌بندی‌ها خودکار از روی پروژه‌ها ساخته می‌شوند. برای ترجمه‌ی دسته‌ی جدید، آن را در `works.categories` فایل `src/i18n/content.json` برای هر دو زبان اضافه کنید.
- `orientation`: برای کارهای عمودی ۹:۱۶ (ریلز و استوری) مقدار `"vertical"` بگذارید؛ برای فیلم‌های افقی ۱۶:۹ آن را ننویسید.
- `duration`: مدت ویدیو به ثانیه که به شکل تایم‌کد (`00:43`) نمایش داده می‌شود.
- ترتیب پروژه‌ها در فایل همان ترتیب نمایش در سایت است.

### ۳. تغییر متن‌ها، لینک‌ها و رنگ‌ها

- **همه‌ی متن‌ها** (نام، عنوان‌ها، بیوگرافی، خدمات، دکمه‌ها) به دو زبان: `src/i18n/content.json`
- **ایمیل، شبکه‌های اجتماعی** (اینستاگرام، بیهنس، تلگرام، واتس‌اپ)، **شوریل**، عکس پرتره، فهرست ابزارها و نام مشتریان: `src/data/site.json`
- **رنگ‌ها** (پس‌زمینه، متن، رنگ اصلی): متغیرهای `:root` در `src/index.css`. مقدارها به شکل RGB با فاصله نوشته می‌شوند، مثلاً `--color-accent: 255 77 46;`. صحنه‌ی سه‌بعدی هم رنگش را از همین متغیر می‌گیرد.
- **فونت‌ها**: فونت فارسی Vazirmatn و فونت انگلیسی Archivo است. تنظیم آن‌ها در `src/index.css` و `src/main.tsx` است.
- **عنوان و پیش‌نمایش شبکه‌های اجتماعی**: `index.html` و تصویر `public/og-image.png` با ابعاد ۱۲۰۰×۶۳۰.

انتخاب زبان بازدیدکننده در مرورگر ذخیره می‌شود. در حالت فارسی، کل صفحه راست‌به‌چپ (RTL) می‌شود و جهت انیمیشن‌ها و آیکون‌ها هم برعکس می‌شود.

### ۴. انتشار روی GitHub Pages

۱. یک مخزن (repository) در گیت‌هاب بسازید، مثلاً `motion-portfolio`، و پروژه را روی شاخه‌ی `main` آن push کنید. دستورها در بخش انگلیسی بالا آمده است.

۲. در گیت‌هاب به **Settings ← Pages** بروید و **Source** را روی **GitHub Actions** بگذارید.

۳. صبر کنید تا اکشن **Deploy to GitHub Pages** در تب Actions تمام شود. سایت در این آدرس در دسترس خواهد بود:
`https://<نام-کاربری>.github.io/motion-portfolio/`

از آن به بعد، هر push روی `main` سایت را به‌صورت خودکار به‌روز می‌کند. مسیر پایه (`base`) هم خودکار از نام مخزن ساخته می‌شود.

> اگر نام مخزن `<نام-کاربری>.github.io` است، مقدار `BASE_PATH` را در فایل workflow برابر `/` قرار دهید.

### ۵. فیلم‌های ساخته‌شده با کد (پوشه‌ی `remotion`)

شوریل، انیمیشن لوگوی **انار** و تیزر کیبورد **تکت ۷۵** با [Remotion](https://www.remotion.dev) در پوشه‌ی `remotion/` ساخته شده‌اند: تصویر با React و three.js، صدا و موسیقی با Python و خروجی نهایی با ffmpeg. روش پیش‌نمایش، تغییر و رندر دوباره در فایل [`remotion/README.md`](remotion/README.md) آمده است. این پوشه بخشی از build سایت نیست.

رسانه‌های فعلی پروژه نمونه و موقت هستند. آن‌ها را با کارهای خودتان جایگزین کنید.

</div>
