/* ===================================================================
   EDIT THIS FILE to personalise everything.
   Use {name} anywhere in a message and it becomes the recipient's name.
   NOTE: a front-end passcode is just for fun, it is NOT real security.
   =================================================================== */
window.CONFIG = {
  recipient: "Parima",
  passcode: "2009",                 // any 3-8 digits; the boxes adapt automatically
  passcodeHint: "",                 // optional hint shown under the boxes, e.g. "a very special year"
  title: "A Little World Made for {name} ♡",
  from: "Someone who adores you",   // shown under every letter signature

  intro: "Today is all about you, {name}. I made this little world just for you, with a few surprises hidden in every corner. Take your time, tap everything, and smile a lot.",
  introSign: "With love, Sumyo",

  wishMessage: "May every little wish in your heart come true, {name}.",
  finalMessage: "{name}, you deserve all the happiness in the world. Never stop smiling. Happy Birthday! ♡",

  micSensitivity: 0.16,             // lower = easier to trigger when blowing into the microphone

  memoryCaptions: [
    "One of my favourite memories ♡",
    "Moments worth keeping forever.",
    "Every picture tells a story."
  ],
  // Optional captions for photos you put in assets/images/ (key = file name)
  photoCaptions: {
    // "photo1.jpg": "Our best day ♡"
  },
  // Optional: if your server cannot list folders, list file names here.
  photos: [
    // { file: "photo1.jpg", caption: "Our best day ♡" }
  ],

  letters: [
    {
      label: "A birthday wish",
      kicker: "for your special day",
      title: "Happy Birthday, {name}!",
      paragraphs: [
        "My dearest {name},",
        "Happy Birthday! I hope today wraps you up in laughter, your favourite things, and all the people who adore you.",
        "I wish you a year full of soft mornings, big adventures, and tiny moments that make your heart feel quiet and happy.",
        "May everything you hope for find its way to you."
      ],
      sign: "Always cheering for you,"
    },
    {
      label: "Something I appreciate",
      kicker: "a few honest words",
      title: "Thank you, {name}",
      paragraphs: [
        "Dear {name},",
        "Thank you for being exactly who you are. The way you care, the way you smile, the way you make ordinary days feel lighter, it all matters more than you know.",
        "I am so grateful for you, for every kind word and every laugh we have shared.",
        "On the hard days, please remember how many people are lucky to know you."
      ],
      sign: "Gratefully yours,"
    },
    {
      label: "A secret message",
      kicker: "psst... just between us",
      secret: true,
      title: "You found the secret, {name}",
      paragraphs: [
        "Psst... {name},",
        "You found the secret letter, so here is a secret: you are far more wonderful than you think you are.",
        "If nobody tells you today, I will. You are loved, you are enough, and you make the world softer just by being in it.",
        "Keep this one in your heart."
      ],
      sign: "Your secret admirer of your smile,"
    }
  ],

  scrapbook: {
    kicker: "a tiny memory book",
    captions: ["me, secretly smiling", "the good kind of chaos", "a day to replay forever"],
    note1: "Some days are simply better because of you.",
    flapLabel: "psst... lift me ♡",
    secret: "You are somebody's favourite person, {name}. Yes, really.",
    note2: "Little things that make you, you:",
    tabs: ["Your smile could light up any room.", "You make people feel at home.", "You are braver than you think."],
    lastTitle: "to be continued...",
    lastNote: "every page of this book is a little love note"
  },

  hiddenMessages: {
    hearts:   "Every heart you popped is one I'm sending you, {name} ♡",
    stars:    "A wish upon a star: may this be your brightest year yet.",
    balloons: "Let every worry float away today, {name}.",
    flowers:  "You make everything around you bloom."
  }
};

window.T = function (s) { return String(s == null ? "" : s).replace(/\{name\}/g, CONFIG.recipient); };
window.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
