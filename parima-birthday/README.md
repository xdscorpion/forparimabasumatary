# A Little World Made for Parima ♡

An interactive birthday gift website: secret passcode, animated gift box, birthday cake with blow-out candles,
envelope letters, polaroid photo gallery, flip-through scrapbook, music player and a final surprise.

## Run it
    python3 -m http.server 8000
Then open http://localhost:8000 (in GitHub Codespaces: Ports tab -> click the globe next to port 8000).
Add `?dev` to the URL while testing: it skips the passcode and unlocks the final surprise.

## Customise (everything is in `js/config.js`)
- Recipient name, passcode (3-8 digits), intro text, wish message, final message
- The three letters, scrapbook texts, hidden messages and photo captions
- Use `{name}` in any text to insert the recipient's name

## Photos
- **Permanent:** copy JPG/PNG/WebP files into `assets/images/` and refresh. They are detected automatically.
  Add captions in `config.js` -> `photoCaptions` (e.g. `"photo1.jpg": "Our best day"`).
- **Quick upload:** use the "Add photos" button or drag and drop. These are stored in this browser (IndexedDB),
  on this device only. If you clear browser data or open the link on another device they will not be there.
  For a gift she opens on her own phone, put the photos in `assets/images/` before you publish the site.
- The first photos also appear inside the scrapbook polaroids.

## Music
Put your song at `assets/music/birthday.mp3`. Without it, a built-in music-box melody plays. Nothing autoplays.

## Deploy
It is a static site: push the folder to GitHub Pages, Netlify or Vercel.

## Please note
A front-end passcode is not real security (anyone can read `config.js`). It is a fun lock for a gift, not for secrets.
Fonts load from Google Fonts and fall back to system fonts offline.
