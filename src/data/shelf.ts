// Shelf data — migrated verbatim from portfolio-v13 (src/lib/data.ts).
// Local image paths are rewritten to hotlink the old repo's public/ assets.
export type MediaKind = "book" | "anime" | "movie" | "show";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  creator: string;
  note: string;
  image: string;
}

const RAW_BASE =
  "https://raw.githubusercontent.com/paramcodes/portfolio-v13/main/public";

const fixImg = (url: string) =>
  url.startsWith("/") ? RAW_BASE + url : url;

const _SHELF: MediaItem[] = [
  {
    id: "ddia",
    kind: "book",
    title: "Designing Data-Intensive Applications",
    creator: "Martin Kleppmann",
    note: "Systems thinking for storage, streams, and distributed truth.",
    image: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
  },
  {
    id: "clean-code",
    kind: "book",
    title: "Clean Code",
    creator: "Robert C. Martin",
    note: "Naming, small functions, and caring about the next reader.",
    image: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
  },
  {
    id: "sapiens",
    kind: "book",
    title: "Sapiens",
    creator: "Yuval Noah Harari",
    note: "A sweeping history of the stories that let humans cooperate at scale.",
    image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
  },
  {
    id: "atomic-habits",
    kind: "book",
    title: "Atomic Habits",
    creator: "James Clear",
    note: "Small systems and repeated choices compound into real change.",
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
  },
  {
    id: "thinking-fast-and-slow",
    kind: "book",
    title: "Thinking, Fast and Slow",
    creator: "Daniel Kahneman",
    note: "The fast intuitions and slow deliberation behind our decisions.",
    image: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
  },
  {
    id: "mind-gut-connection",
    kind: "book",
    title: "The Mind-Gut Connection",
    creator: "Emeran Mayer",
    note: "A look at the conversation between the brain, body, and microbiome.",
    image: "/media/book-mind-gut.svg",
  },
  {
    id: "steins-gate",
    kind: "anime",
    title: "Steins;Gate",
    creator: "White Fox",
    note: "Time travel, labs, and the cost of changing one variable.",
    image:
      "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg",
  },
  {
    id: "attack-on-titan",
    kind: "anime",
    title: "Attack on Titan",
    creator: "Wit Studio · MAPPA",
    note: "Walls, freedom, and a conflict that keeps widening its frame.",
    image: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
  },
  {
    id: "vinland-saga",
    kind: "anime",
    title: "Vinland Saga",
    creator: "Wit Studio · MAPPA",
    note: "Vengeance gives way to a harder question: what makes a true warrior?",
    image: "https://cdn.myanimelist.net/images/anime/1500/103005l.jpg",
  },
  {
    id: "dr-stone",
    kind: "anime",
    title: "Dr. Stone",
    creator: "TMS Entertainment",
    note: "A civilization rebuilt one experiment at a time.",
    image: "https://cdn.myanimelist.net/images/anime/1613/102576l.jpg",
  },
  {
    id: "another",
    kind: "anime",
    title: "Another",
    creator: "P.A. Works",
    note: "A cursed classroom mystery with an uneasy, patient atmosphere.",
    image: "https://upload.wikimedia.org/wikipedia/en/c/cc/Another_%28novel%29_Cover.JPG",
  },
  {
    id: "your-name",
    kind: "anime",
    title: "Your Name",
    creator: "Makoto Shinkai",
    note: "Two lives, a comet, and a connection that crosses time.",
    image: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
  },
  {
    id: "monster",
    kind: "anime",
    title: "Monster",
    creator: "Madhouse",
    note: "A moral thriller that follows one decision across Europe.",
    image: "https://cdn.myanimelist.net/images/anime/10/18793l.jpg",
  },
  {
    id: "link-click",
    kind: "anime",
    title: "Link Click",
    creator: "LAN Studio",
    note: "Photographs become a doorway into lives that cannot be changed lightly.",
    image: "https://upload.wikimedia.org/wikipedia/en/7/7c/Link_Click_Poster.jpg",
  },
  {
    id: "inception",
    kind: "movie",
    title: "Inception",
    creator: "Christopher Nolan",
    note: "Nested layers, rules, and a spinning top of doubt.",
    image:
      "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  },
  {
    id: "interstellar",
    kind: "movie",
    title: "Interstellar",
    creator: "Christopher Nolan",
    note: "Love as a dimension — and clocks that refuse to wait.",
    image:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: "identity-2003",
    kind: "movie",
    title: "Identity",
    creator: "James Mangold · 2003",
    note: "Ten strangers, a motel, and a storm that keeps closing in.",
    image: "https://upload.wikimedia.org/wikipedia/en/4/44/Identity_poster.jpg",
  },
  {
    id: "stree-2",
    kind: "movie",
    title: "Stree 2",
    creator: "Amar Kaushik",
    note: "Horror-comedy returns to Chanderi with a new threat.",
    image: "https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg",
  },
  {
    id: "mission-impossible",
    kind: "movie",
    title: "Mission: Impossible",
    creator: "Brian De Palma",
    note: "An impossible assignment, a team under pressure, and the wire scene.",
    image: "https://image.tmdb.org/t/p/w500/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg",
  },
  {
    id: "fast-and-furious",
    kind: "movie",
    title: "Fast & Furious",
    creator: "Justin Lin",
    note: "Street racing energy, heists, and a crew built around loyalty.",
    image: "https://upload.wikimedia.org/wikipedia/en/8/8f/Fast_and_Furious_Poster.jpg",
  },
  {
    id: "fight-club",
    kind: "movie",
    title: "Fight Club",
    creator: "David Fincher",
    note: "A sharp, restless examination of identity and consumer culture.",
    image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  },
  {
    id: "12-angry-men",
    kind: "movie",
    title: "12 Angry Men",
    creator: "Sidney Lumet",
    note: "One room, twelve jurors, and the discipline of reasonable doubt.",
    image: "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
  },
  {
    id: "good-bad-ugly",
    kind: "movie",
    title: "The Good, the Bad and the Ugly",
    creator: "Sergio Leone",
    note: "A desert epic of uneasy alliances, greed, and an unforgettable score.",
    image: "https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg",
  },
  {
    id: "parasite",
    kind: "movie",
    title: "Parasite",
    creator: "Bong Joon Ho",
    note: "Class tension turns into a precise and unpredictable thriller.",
    image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    id: "the-prestige",
    kind: "movie",
    title: "The Prestige",
    creator: "Christopher Nolan",
    note: "Obsession turns rivalry into a dangerous performance.",
    image: "https://upload.wikimedia.org/wikipedia/en/d/d2/Prestige_poster.jpg",
  },
  {
    id: "wolf-of-wall-street",
    kind: "movie",
    title: "The Wolf of Wall Street",
    creator: "Martin Scorsese",
    note: "Ambition, excess, and the speed at which both become a trap.",
    image: "https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg",
  },
  {
    id: "dark",
    kind: "show",
    title: "Dark",
    creator: "Netflix",
    note: "Knots of time in a small town — spoilers are a closed loop.",
    image:
      "https://static.tvmaze.com/uploads/images/original_untouched/504/1262352.jpg",
  },
  {
    id: "stranger-things",
    kind: "show",
    title: "Stranger Things",
    creator: "Netflix",
    note: "Small-town friendship meets a dimension hiding behind the wall.",
    image: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
  },
  {
    id: "alice-in-borderland",
    kind: "show",
    title: "Alice in Borderland",
    creator: "Netflix",
    note: "A deserted Tokyo becomes a game of survival and choice.",
    image: "https://images.metahub.space/poster/small/tt10795658/img",
  },
  {
    id: "when-life-gives-you-tangerines",
    kind: "show",
    title: "When Life Gives You Tangerines",
    creator: "Netflix",
    note: "A decades-spanning Jeju story about love, work, and endurance.",
    image: "https://upload.wikimedia.org/wikipedia/en/e/e8/When_Life_Gives_You_Tangerines_poster.png",
  },
  {
    id: "start-up",
    kind: "show",
    title: "Start-Up",
    creator: "tvN · 2020",
    note: "A K-drama about founders, ambition, and building something real.",
    image: "https://upload.wikimedia.org/wikipedia/en/1/12/Start-Up_2020.jpg",
  },
  {
    id: "breaking-bad",
    kind: "show",
    title: "Breaking Bad",
    creator: "AMC",
    note: "A chemistry teacher makes one irreversible choice after another.",
    image: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
  },
];

export const SHELF_CATEGORIES: { id: MediaKind; label: string }[] = [
  { id: "book", label: "Books" },
  { id: "anime", label: "Anime" },
  { id: "movie", label: "Movies" },
  { id: "show", label: "Shows" },
];

export const SHELF_ITEMS: MediaItem[] = _SHELF.map((item) => ({
  ...item,
  image: fixImg(item.image),
}));

export const SHELF_INTRO =
  "A small shelf of books, anime, movies, and shows that stick with me.";
