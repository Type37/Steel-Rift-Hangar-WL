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

  // Mixed — eclectic English callsigns. Restored verbatim from the
  // pre-"Iter 22" source after the Mixed pool was deleted (0ae9740).
  Mixed: [
    'Atlas', 'Blackvein', 'Cascade', 'Dover', 'Ember', 'Foxglove',
    'Gravewright', 'Hangfire', 'Ironwake', 'Jasper', 'Kestrel', 'Longshore',
    'Marrow', 'Northstar', 'Outrider', 'Pall', 'Quickstrike', 'Reverie',
    'Silt-7', 'Tower', 'Undertow', 'Verdict', 'Whitlow', 'Xerxes',
    'Yardarm', 'Zenith', 'Coalbite', 'Mockingbird', 'Slate', 'Vagrant',
    'Brindle', 'Cinder', 'Dustwell', 'Furrow', 'Glasswort', 'Hush',
  ],

  '🎌': [
    // Gravity Rush — Nevi names
    'Are', 'Ari', 'Jiu', 'Fugare', 'Fugai', 'Lancan', 'Defnete', 'Defneti',
    'Mosui', 'Malloid', 'Giacago', 'Eckiray', 'Kinoue', 'Lorets', 'Shiga',
    'Manago', 'Batouyue', 'Minaye',
    // Gravity Rush — Boss Nevi
    'Taion', 'Cusuico', 'Lagan', 'Nucago', 'Nushi',
    // Vampire Hunter D — filtered (real names removed)
    'Garou', 'Rei-Ginsei', 'Mayerling', 'Borgoff', 'Nolt', 'Groveck',
    'Bengé', 'Mashira', 'Pluto-VIII', 'Bullow', 'Wu-Lin', 'Su-In',
    'Krolock', 'Kipsch', 'Taki', 'Gii', 'Shusha', 'Rocambole', 'Kuentz',
    'Gaskell', 'Laurencin', 'Shuma', 'Xenon', 'Gillis', 'Braujou', 'Valcua',
    'Dyalhis', 'Speeny', 'Jessup-the-Beheader', 'Goseau', 'Bierce', 'Kururu',
    'Stanza', 'Dolreack', 'Odama', 'Gilzen', 'Iriya', 'Bijima', 'Amne',
    'Murtock', 'Dynus', 'Greylancer', 'Shizam', 'Sunhawk', 'Bingo',
    'Samon', 'Curio', 'Wiseman',
  ],

  // Two-word combinations, drawn from these halves
  Compound: {
    a: ['Cold', 'Black', 'Iron', 'Saturn', 'Ember', 'Long', 'Slow', 'Last', 'First', 'Salt', 'River', 'Coffin', 'Bright', 'Dust', 'Pale', 'Dry', 'Old', 'Wet'],
    b: ['Hammer', 'Cantor', 'Saint', 'Forge', 'Watch', 'Mile', 'Hour', 'Word', 'Light', 'Tide', 'Mouth', 'Nail', 'Vein', 'Mark', 'Wake', 'Drum', 'Verse', 'Hand'],
  },
};

export const POOL_NAMES = Object.keys(POOLS);

export function rollCallsign(activePools = [], customList = []) {
  // Build combined list from all active pools
  const all = [];
  for (const poolName of activePools) {
    if (poolName === 'Custom') {
      customList.filter(Boolean).forEach(n => all.push(n));
    } else if (poolName === 'Compound') {
      const p = POOLS.Compound;
      const a = p.a[Math.floor(Math.random() * p.a.length)];
      const b = p.b[Math.floor(Math.random() * p.b.length)];
      all.push(`${a} ${b}`);
    } else {
      const pool = POOLS[poolName];
      if (pool) all.push(...pool);
    }
  }
  if (!all.length) return '';
  return all[Math.floor(Math.random() * all.length)];
}
