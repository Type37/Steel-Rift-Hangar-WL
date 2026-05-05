// ============================================================
// CALLSIGN POOLS
// ============================================================
// Mech callsigns. Pick a pool in Options. The "Custom" pool
// reads from whatever the user types into the Options textarea
// (one name per line). The Add HE-V modal pulls a random name
// from the active pool.
// ============================================================

export const POOLS = {
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


  '🎌': [
    'Amne', 'Are', 'Ari', 'Bakuretsu', 'Bankai', 'Batouyue', 'Bengé', 'Bierce', 'Bijima', 'Borgoff', 'Braujou', 'Bullow', 'Byakuya', 'Cusuico', 'Defnete', 'Defneti', 'Dolreack', 'Dyalhis', 'Dynus', 'Eckiray', 'Fubuki', 'Fugai', 'Fugare', 'Fujin', 'Garou', 'Gaskell', 'Gekkou', 'Giacago', 'Gii', 'Gillis', 'Gilzen', 'Goseau', 'Gourai', 'Greylancer', 'Groveck', 'Hagane', 'Hiziri', 'Homura', 'Iriya', 'Izanami', 'Jessup-the-Beheader', 'Jinrai', 'Jiu', 'Kagami', 'Kagerou', 'Kagura', 'Kamikaze', 'Karasu', 'Kenbu', 'Kinoue', 'Kipsch', 'Krolock', 'Kuentz', 'Kurenai', 'Kururu', 'Lagan', 'Lancan', 'Laurencin', 'Lorets', 'Malloid', 'Manago', 'Mashira', 'Mayerling', 'Minaye', 'Mosui', 'Muramasa', 'Murasame', 'Murtock', 'Naginata', 'Nolt', 'Nucago', 'Nushi', 'Odama', 'Pluto-VIII', 'Raijin', 'Raikiri', 'Rei-Ginsei', 'Rocambole', 'Ryuusei', 'Sakuya', 'Sengoku', 'Shiga', 'Shinigami', 'Shinkansen', 'Shizam', 'Shuma', 'Shusha', 'Speeny', 'Stanza', 'Su-In', 'Sunhawk', 'Suzumiya', 'Taion', 'Taki', 'Tamahagane', 'Tenka', 'Tenrou', 'Tsurugi', 'Valcua', 'Wu-Lin', 'Xenon', 'Zangetsu', 'Zankoku',
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
