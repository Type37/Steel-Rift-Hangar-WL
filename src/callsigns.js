// ============================================================
// CALLSIGN POOLS
// ============================================================
// Mech callsigns. Pick a pool in Options. The "Custom" pool
// reads from whatever the user types into the Options textarea
// (one name per line). The Add HE-V modal pulls a random name
// from the active pool.
// ============================================================

export const POOLS = {
  Mixed: [
    'Atlas', 'Blackvein', 'Cascade', 'Dover', 'Ember', 'Foxglove',
    'Gravewright', 'Hangfire', 'Ironwake', 'Jasper', 'Kestrel', 'Longshore',
    'Marrow', 'Northstar', 'Outrider', 'Pall', 'Quickstrike', 'Reverie',
    'Silt-7', 'Tower', 'Undertow', 'Verdict', 'Whitlow', 'Xerxes',
    'Yardarm', 'Zenith', 'Coalbite', 'Mockingbird', 'Slate', 'Vagrant',
    'Brindle', 'Cinder', 'Dustwell', 'Furrow', 'Glasswort', 'Hush',
  ],

  Mythic: [
    'Hephaestus', 'Tyr', 'Thanatos', 'Briareos', 'Garuda', 'Ymir',
    'Anansi', 'Arawn', 'Surt', 'Susanoo', 'Pele', 'Skadi',
    'Morrigan', 'Vrikodara', 'Hannya', 'Marduk', 'Sekhmet', 'Vayu',
    'Bellona', 'Erlik', 'Andraste', 'Lugh', 'Ratatosk', 'Nemain',
  ],

  Industrial: [
    'Hydraulic', 'Forge-3', 'Driveshaft', 'Press', 'Slag', 'Capstan',
    'Anvil', 'Foundry', 'Bessemer', 'Kiln', 'Spindle', 'Gantry',
    'Reactor-Nine', 'Lathe', 'Bullhead', 'Grommet', 'Punchcard', 'Snipper',
    'Trip-Hammer', 'Worm-Gear', 'Crucible', 'Bellows', 'Caisson', 'Stanchion',
  ],

  Beasts: [
    'Glutton', 'Caracara', 'Skua', 'Wolverine', 'Wolfshrike', 'Murre',
    'Heron', 'Margay', 'Maned-Wolf', 'Krait', 'Cassowary', 'Lammergeier',
    'Wolverine-2', 'Boar', 'Capybara', 'Tarpan', 'Saiga', 'Pangolin',
    'Coywolf', 'Jackal', 'Honey-Badger', 'Marten', 'Stoat', 'Quoll',
  ],


  'Gravity Rush': [
    'Are', 'Ari', 'Jiu', 'Fugare', 'Fugai', 'Lancan', 'Defnete', 'Defneti', 'Mosui', 'Malloid', 'Giacago', 'Eckiray', 'Kinoue', 'Lorets', 'Shiga', 'Manago', 'Batouyue', 'Minaye', 'Taion', 'Cusuico', 'Lagan', 'Nucago', 'Nushi',
  ],

  'Vampire Hunter D': [
    'Larmica', 'Garou', 'Rei-Ginsei', 'Mayerling', 'Borgoff', 'Nolt', 'Groveck', 'Bengé', 'Mashira', 'Pluto-VIII', 'Bullow', 'Wu-Lin', 'Su-In', 'Krolock', 'Samon', 'Kipsch', 'Taki', 'Gii', 'Shusha', 'Rocambole', 'Kuentz', 'Gaskell', 'Laurencin', 'Shuma', 'Xenon', 'Gillis', 'Braujou', 'Valcua', 'Dyalhis', 'Speeny', 'Jessup-the-Beheader', 'Goseau', 'Bierce', 'Kururu', 'Stanza', 'Dolreack', 'Odama', 'Gilzen', 'Iriya', 'Bijima', 'Amne', 'Murtock', 'Dynus', 'Greylancer', 'Shizam', 'Sunhawk',
  ],

  'Anime 🎌': [
    'Zankoku', 'Byakuya', 'Shinkansen', 'Murasame', 'Kamikaze', 'Gekkou', 'Raijin', 'Fujin', 'Izanami', 'Tamahagane', 'Hagane', 'Kenbu', 'Ryuusei', 'Zangetsu', 'Bankai', 'Sengoku', 'Muramasa', 'Kagerou', 'Tsurugi', 'Karasu', 'Jinrai', 'Bakuretsu', 'Naginata', 'Gourai', 'Hiziri', 'Tenrou', 'Fubuki', 'Suzumiya', 'Kagami', 'Kagura', 'Shinigami', 'Kurenai', 'Homura', 'Sakuya', 'Tenka', 'Raikiri',
  ],

  // Two-word combinations, drawn from these halves
  Compound: {
    a: ['Cold', 'Black', 'Iron', 'Saturn', 'Ember', 'Long', 'Slow', 'Last', 'First', 'Salt', 'River', 'Coffin', 'Bright', 'Dust', 'Pale', 'Dry', 'Old', 'Wet'],
    b: ['Hammer', 'Cantor', 'Saint', 'Forge', 'Watch', 'Mile', 'Hour', 'Word', 'Light', 'Tide', 'Mouth', 'Nail', 'Vein', 'Mark', 'Wake', 'Drum', 'Verse', 'Hand'],
  },
};

export const POOL_NAMES = Object.keys(POOLS);

export function rollCallsign(poolName, customList = []) {
  if (poolName === 'Custom') {
    const names = customList.filter(Boolean);
    if (!names.length) return '';
    return names[Math.floor(Math.random() * names.length)];
  }

  const pool = POOLS[poolName];
  if (!pool) return '';

  // Compound pool combines an A word and a B word
  if (poolName === 'Compound') {
    const a = pool.a[Math.floor(Math.random() * pool.a.length)];
    const b = pool.b[Math.floor(Math.random() * pool.b.length)];
    return `${a} ${b}`;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
