export type StrayBirdsQuote = {
  id: number;
  text: string;
  source: 'Stray Birds';
  author: 'Rabindranath Tagore';
};

const quoteMeta = {
  source: 'Stray Birds',
  author: 'Rabindranath Tagore',
} as const;

// Curated from the public-domain English Project Gutenberg text of Stray Birds.
// Expand later by appending more numbered entries from the same source.
export const strayBirdsQuotes: StrayBirdsQuote[] = [
  {
    id: 1,
    text: 'STRAY birds of summer come to my window to sing and fly away. And yellow leaves of autumn, which have no songs, flutter and fall there with a sigh.',
    ...quoteMeta,
  },
  { id: 2, text: 'O TROUPE of little vagrants of the world, leave your footprints in my words.', ...quoteMeta },
  {
    id: 3,
    text: 'THE world puts off its mask of vastness to its lover. It becomes small as one song, as one kiss of the eternal.',
    ...quoteMeta,
  },
  { id: 4, text: 'IT is the tears of the earth that keep her smiles in bloom.', ...quoteMeta },
  {
    id: 5,
    text: 'THE mighty desert is burning for the love of a blade of grass who shakes her head and laughs and flies away.',
    ...quoteMeta,
  },
  { id: 6, text: 'IF you shed tears when you miss the sun, you also miss the stars.', ...quoteMeta },
  {
    id: 7,
    text: 'THE sands in your way beg for your song and your movement, dancing water. Will you carry the burden of their lameness?',
    ...quoteMeta,
  },
  { id: 8, text: 'HER wistful face haunts my dreams like the rain at night.', ...quoteMeta },
  {
    id: 9,
    text: 'ONCE we dreamt that we were strangers. We wake up to find that we were dear to each other.',
    ...quoteMeta,
  },
  { id: 10, text: 'SORROW is hushed into peace in my heart like the evening among the silent trees.', ...quoteMeta },
  {
    id: 11,
    text: 'SOME unseen fingers, like idle breeze, are playing upon my heart the music of the ripples.',
    ...quoteMeta,
  },
  {
    id: 12,
    text: '"WHAT language is thine, O sea?" "The language of eternal question." "What language is thy answer, O sky?" "The language of eternal silence."',
    ...quoteMeta,
  },
  {
    id: 13,
    text: 'LISTEN, my heart, to the whispers of the world with which it makes love to you.',
    ...quoteMeta,
  },
  {
    id: 14,
    text: 'THE mystery of creation is like the darkness of night--it is great. Delusions of knowledge are like the fog of the morning.',
    ...quoteMeta,
  },
  { id: 15, text: 'DO not seat your love upon a precipice because it is high.', ...quoteMeta },
  {
    id: 16,
    text: 'I SIT at my window this morning where the world like a passer-by stops for a moment, nods to me and goes.',
    ...quoteMeta,
  },
  {
    id: 17,
    text: 'THESE little thoughts are the rustle of leaves; they have their whisper of joy in my mind.',
    ...quoteMeta,
  },
  { id: 18, text: 'WHAT you are you do not see, what you see is your shadow.', ...quoteMeta },
  {
    id: 19,
    text: 'MY wishes are fools, they shout across thy songs, my Master. Let me but listen.',
    ...quoteMeta,
  },
  { id: 20, text: 'I CANNOT choose the best. The best chooses me.', ...quoteMeta },
  { id: 21, text: 'THEY throw their shadows before them who carry their lantern on their back.', ...quoteMeta },
  { id: 22, text: 'THAT I exist is a perpetual surprise which is life.', ...quoteMeta },
  {
    id: 23,
    text: '"WE, the rustling leaves, have a voice that answers the storms, but who are you so silent?" "I am a mere flower."',
    ...quoteMeta,
  },
  { id: 24, text: 'REST belongs to the work as the eyelids to the eyes.', ...quoteMeta },
  { id: 25, text: 'MAN is a born child, his power is the power of growth.', ...quoteMeta },
  {
    id: 26,
    text: 'GOD expects answers for the flowers he sends us, not for the sun and the earth.',
    ...quoteMeta,
  },
  {
    id: 27,
    text: 'THE light that plays, like a naked child, among the green leaves happily knows not that man can lie.',
    ...quoteMeta,
  },
  { id: 28, text: 'O BEAUTY, find thyself in love, not in the flattery of thy mirror.', ...quoteMeta },
  {
    id: 29,
    text: 'MY heart beats her waves at the shore of the world and writes upon it her signature in tears with the words, "I love thee."',
    ...quoteMeta,
  },
  { id: 30, text: '"MOON, for what do you wait?" "To salute the sun for whom I must make way."', ...quoteMeta },
  { id: 31, text: 'THE trees come up to my window like the yearning voice of the dumb earth.', ...quoteMeta },
  { id: 32, text: 'HIS own mornings are new surprises to God.', ...quoteMeta },
  {
    id: 33,
    text: 'LIFE finds its wealth by the claims of the world, and its worth by the claims of love.',
    ...quoteMeta,
  },
  { id: 34, text: 'THE dry river-bed finds no thanks for its past.', ...quoteMeta },
  { id: 35, text: 'THE bird wishes it were a cloud. The cloud wishes it were a bird.', ...quoteMeta },
  { id: 36, text: 'THE waterfall sings, "I find my song, when I find my freedom."', ...quoteMeta },
  {
    id: 37,
    text: 'I CANNOT tell why this heart languishes in silence. It is for small needs it never asks, or knows or remembers.',
    ...quoteMeta,
  },
  {
    id: 38,
    text: 'WOMAN, when you move about in your household service your limbs sing like a hill stream among its pebbles.',
    ...quoteMeta,
  },
  {
    id: 39,
    text: 'THE sun goes to cross the Western sea, leaving its last salutation to the East.',
    ...quoteMeta,
  },
  { id: 40, text: 'DO not blame your food because you have no appetite.', ...quoteMeta },
  {
    id: 41,
    text: 'THE trees, like the longings of the earth, stand a-tiptoe to peep at the heaven.',
    ...quoteMeta,
  },
  {
    id: 42,
    text: 'YOU smiled and talked to me of nothing and I felt that for this I had been waiting long.',
    ...quoteMeta,
  },
  {
    id: 43,
    text: 'THE fish in the water is silent, the animal on the earth is noisy, the bird in the air is singing, But Man has in him the silence of the sea, the noise of the earth and the music of the air.',
    ...quoteMeta,
  },
  {
    id: 44,
    text: 'THE world rushes on over the strings of the lingering heart making the music of sadness.',
    ...quoteMeta,
  },
  {
    id: 45,
    text: 'HE has made his weapons his gods. When his weapons win he is defeated himself.',
    ...quoteMeta,
  },
  { id: 46, text: 'GOD finds himself by creating.', ...quoteMeta },
  {
    id: 47,
    text: 'SHADOW, with her veil drawn, follows Light in secret meekness, with her silent steps of love.',
    ...quoteMeta,
  },
  { id: 48, text: 'THE stars are not afraid to appear like fireflies.', ...quoteMeta },
  {
    id: 49,
    text: 'I THANK thee that I am none of the wheels of power but I am one with the living creatures that are crushed by it.',
    ...quoteMeta,
  },
  {
    id: 50,
    text: 'THE mind, sharp but not broad, sticks at every point but does not move.',
    ...quoteMeta,
  },
  {
    id: 51,
    text: "YOUR idol is shattered in the dust to prove that God's dust is greater than your idol.",
    ...quoteMeta,
  },
  { id: 52, text: 'MAN does not reveal himself in his history, he struggles up through it.', ...quoteMeta },
  {
    id: 53,
    text: 'WHILE the glass lamp rebukes the earthen for calling it cousin, the moon rises, and the glass lamp, with a bland smile, calls her, "My dear, dear sister."',
    ...quoteMeta,
  },
  {
    id: 54,
    text: 'LIKE the meeting of the seagulls and the waves we meet and come near. The seagulls fly off, the waves roll away and we depart.',
    ...quoteMeta,
  },
  {
    id: 55,
    text: 'MY day is done, and I am like a boat drawn on the beach, listening to the dance-music of the tide in the evening.',
    ...quoteMeta,
  },
  { id: 56, text: 'LIFE is given to us, we earn it by giving it.', ...quoteMeta },
  { id: 57, text: 'WE come nearest to the great when we are great in humility.', ...quoteMeta },
  { id: 58, text: 'THE sparrow is sorry for the peacock at the burden of its tail.', ...quoteMeta },
  {
    id: 59,
    text: 'NEVER be afraid of the moments--thus sings the voice of the everlasting.',
    ...quoteMeta,
  },
  {
    id: 60,
    text: 'THE hurricane seeks the shortest road by the no-road, and suddenly ends its search in the Nowhere.',
    ...quoteMeta,
  },
];

export function getDailyQuote(dateKey: string, quotes: StrayBirdsQuote[] = strayBirdsQuotes) {
  if (!quotes.length) {
    throw new Error('At least one Stray Birds quote is required.');
  }

  const seed = Array.from(dateKey).reduce((total, character) => total + character.charCodeAt(0), 0);
  return quotes[seed % quotes.length];
}
