# PHI Lab website

A static site built with plain HTML, CSS and JavaScript. There is no build step. Open `index.html` in a browser, or upload the folder to any static host (GitHub Pages, Netlify, a university server).

The styling follows `../Design-Guide/PHI_Lab_Dissemination_Master.pptx`:
- Oxford navy, with PHI orange, cyan, purple and rose accents
- Roboto throughout (loaded from Google Fonts; falls back to the system sans if offline)
- a navy header with an orange line under it
- the mandatory copyright footer

## Pages

| File | What it is |
|---|---|
| `index.html` | Landing page: intro with visual, about the lab and its four strands, the project catalogue grouped by theme, reading levels and contact |
| `research.html` | All projects with a theme filter (`research.html?theme=malaria`), the in-progress catalogue, and publications |
| `projects/malaria-project/index.html` | The full interactive story for the NeurIPS 2023 / Lancet Planetary Health malaria study |

## Shared files

- `assets/css/site.css`: design tokens and every component
- `assets/js/site.js`: the social links config, mobile menu, reading-lens switch, year player, compare sliders, tabs, lightbox, citation copy, share links and theme filter
- `projects/malaria-project/charts.js`: the results charts (Chart.js, loaded from a CDN). The numbers come from Tables 1 and 2 of the paper.

## Social links (header and footer)

All five channels are wired in the `SOCIAL` block at the top of `assets/js/site.js`. To change a handle, edit it there once and every header and footer follows:

```js
const SOCIAL = { github: "…", linkedin: "…", bluesky: "…", x: "…", website: "…" };
```

An icon whose URL is left empty still shows, but doesn't link anywhere.

## Video on the home page

The PHI Lens section embeds the lab's YouTube video, set to autoplay muted, loop and hide its controls.

**YouTube blocks embeds on pages opened straight from disk** (`file:///…`), showing "Video player configuration error / Error 153". That is not a fault in the page: it happens because a local file has no web address for YouTube to check. On any real host the video plays normally. When the page is opened from disk it now shows the video's poster with a play button that opens YouTube instead.

To preview it locally exactly as visitors will see it, serve the folder over HTTP:

```bash
cd Website-Code
python -m http.server 8777      # then open http://localhost:8777/index.html
```

## Hero slideshow (home page)

The intro box rotates through five slides every 6.5 seconds, pausing on hover, on keyboard focus and when the tab is hidden; the dots below jump to a slide. Readers who ask for reduced motion see the first slide only. Slides live in `index.html` inside `.slideshow`, and the photographs are in `assets/img/hero/` (sourced from the lab's own NDORMS pages). To change the order, edit the `<figure class="slide">` elements and keep one dot button per slide. A slide whose image should not be cropped gets `class="slide contain"`.

## PHI Lens

The perspective switch on each project page. Any element with `data-lens="everyone"`, `data-lens="policy"` or `data-lens="research"` (or a space-separated combination) only shows for that reader. Links can preselect a lens, for example `…/malaria-project/index.html?lens=policy`.

## Adding a project

1. Copy `projects/malaria-project/` to `projects/<new-id>/`.
2. Replace the text, `media/` files, the chart data in `charts.js`, the `citation_*` meta tags, the JSON-LD block, and the `#cite-data` block.
3. Link it from the catalogue on `index.html` (turn its `.row` into an `<a>` like the malaria entry) and add a card in `research.html`.

## Before going live: citation indexing

- Google Scholar reads the `citation_*` meta tags on each project page. Once the domain is known, change `og:image` and `citation_abstract_html_url` to absolute URLs.

## No downloads

The site presents the research; it does not hand out files. There are no PDF, poster, dataset or code downloads, and the source files (`maralia-paper.pdf`, `paper.pdf`, `poster.jpg`) live outside the site in `../Source-Materials/`, so they are never published. Readers are sent to the publisher's own pages instead (Climate Change AI, the DOI, the recorded talk). The poster is shown as an image only.

Keep it that way when adding a project: no `download` attributes, no links to files inside the site other than the images the pages display.

## Responsive behaviour

Layouts are fluid rather than fixed to a few breakpoints: gutters, section spacing, headings and chart heights scale with the viewport (`clamp()`), and every card grid reflows with `auto-fit`, so the pages work from a 320px phone up to a 2560px display. Above 1600px the content column and body text grow instead of leaving wide empty margins. On short landscape screens the sticky header and section nav become static so they don't eat the view. Checked at 17 widths from 320 to 2560 with no horizontal overflow.

## Theme folders (home page)

Each theme on the home page is a folder. Hovering anywhere over the group opens all four lists at once; on touch screens each header is a button that opens its own list. Collapsed state is driven by CSS (`.folder-body` grid-rows transition); the `.open` class added on tap is the only JavaScript involved.

## Corners

The site uses square corners. One block at the end of `assets/css/site.css` sets `--radius: 0`, zeroes every `border-radius`, and gives imagery (photos, maps, charts, the video) a 6px radius so pictures don't look clipped. Delete that block to return to the rounded look.

## Colours

Two sets of tokens in `:root` (`assets/css/site.css`):

- `--orange`, `--cyan`, `--purple`, `--rose`: the brand hues, used for accents, dots, icons and tints.
- `--orange-solid`, `--cyan-solid`, `--purple-solid`, `--rose-solid`: the same hues as **fills that carry white text** (theme headers, strand cards, number badges, avatars, buttons). Orange and cyan are deepened there because white text on the lighter originals falls below the readable contrast threshold; purple and rose are unchanged.

Buttons use `--btn`, which points at `--cyan-solid`.
