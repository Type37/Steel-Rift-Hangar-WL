// ============================================================
// STEEL RIFT v1.5 DATA
// ============================================================
// Page references throughout point to the v1.5 rules PDF.
// If you find an error, fix it here and push. The UI reads from this file.
// ============================================================

// ---- Weight classes (p. 18, 19, 84) ----
export const WC = {
  Light:      { idx: 0, tons: 20, baseArmor: 6,  baseStructure: 4,  baseRem: 10, slots: 4, abbr: 'LT', blurb: 'Fast scouts and flankers. Low survivability; high mobility.' },
  Medium:     { idx: 1, tons: 30, baseArmor: 8,  baseStructure: 6,  baseRem: 16, slots: 5, abbr: 'MD', blurb: 'The workhorse. Balanced firepower and staying power.' },
  Heavy:      { idx: 2, tons: 40, baseArmor: 10, baseStructure: 8,  baseRem: 22, slots: 6, abbr: 'HV', blurb: 'Armored threat. High tonnage, slow to shift, hard to remove.' },
  Ultraheavy: { idx: 3, tons: 50, baseArmor: 12, baseStructure: 10, baseRem: 28, slots: 7, abbr: 'UH', blurb: 'Walking fortress. The heaviest thing on the field.' },
};
export const WC_ORDER = ['Light', 'Medium', 'Heavy', 'Ultraheavy'];

// ---- Mission sizes (p. 18, 84) ----
// teamCounts is the number of teams of each member-count band the mission allows.
export const MISSIONS = {
  'Recon':       { tons: 100, support: 1, agendas: 1, teamCounts: { '2': 1, '2-3': 0, '3-4': 0 }, board: '3×3', terrain: 8 },
  'Strike':      { tons: 150, support: 2, agendas: 2, teamCounts: { '2': 0, '2-3': 2, '3-4': 0 }, board: '3×3', terrain: 8 },
  'Battle':      { tons: 200, support: 3, agendas: 3, teamCounts: { '2': 0, '2-3': 2, '3-4': 1 }, board: '3×3', terrain: 8 },
  'All-Out War': { tons: 350, support: 4, agendas: 4, teamCounts: { '2': 0, '2-3': 2, '3-4': 2 }, board: '4×4', terrain: 14 },
};
export const MISSION_ORDER = ['Recon', 'Strike', 'Battle', 'All-Out War'];

// ---- Ranged weapons (p. 20, 85) ----
// cost / dmg arrays are [Light, Medium, Heavy, Ultraheavy]. '-' = not available.
export const RANGED = [
  { name: 'AA Cannon',       cost: [3,5,6,8],   dmg: ['5','8','11','13'], traits: 'Anti-Air, Flak, Light, Short (24")' },
  { name: 'AA Missiles',     cost: [2,3,4,5],   dmg: ['3','5','7','9'],   traits: 'Anti-Air, Light, Smart, Limited (2)' },
  { name: 'Arc Gun',         cost: [2,'-','-','-'], dmg: ['6','-','-','-'], traits: 'Light, Short (6"), Stagger' },
  { name: 'Autocannon',      cost: [3,4,5,6],   dmg: ['3','4','5','6'],   traits: 'Kinetic' },
  { name: 'Cluster Rockets', cost: [2,4,6,8],   dmg: ['4','8','11','15'], traits: 'Blast (3"), Light, Limited (2)' },
  { name: 'Harpoon Gun',     cost: ['-','-','-',7], dmg: ['-','-','-','6'], traits: 'Short (12), Drag, Tether' },
  { name: 'Howitzer',        cost: [2,3,4,5],   dmg: ['2','3','4','5'],   traits: 'Smart, Blast (3"), Kinetic' },
  { name: 'Laser',           cost: [3,4,6,7],   dmg: ['2','2','2','2'],   traits: 'AP (1/1/2/3), Draining' },
  { name: 'Mag Tether',      cost: [3,4,5,6],   dmg: ['2','3','4','5'],   traits: 'Short (12"), Tether' },
  { name: 'Missiles',        cost: [2,3,4,5],   dmg: ['3','4','5','7'],   traits: 'Smart, Limited (3)' },
  { name: 'Particle Cannon', cost: [2,3,5,6],   dmg: ['2','4','6','8'],   traits: 'Short (18"), Draining, Disruptive' },
  { name: 'Pulse Salvo',     cost: [2,3,4,5],   dmg: ['2','4','6','8'],   traits: 'Limited (2), Disruptive' },
  { name: 'Rail Gun',        cost: [2,2,4,5],   dmg: ['1','1','1','1'],   traits: 'AP (1/1/2/3), Kinetic' },
  { name: 'Rocket Pack',     cost: [2,3,4,5],   dmg: ['2','4','5','7'],   traits: 'Blast (3"), Limited (3)' },
  { name: 'Rotary Cannon',   cost: [2,4,6,8],   dmg: ['6','9','12','15'], traits: 'Short (12"), Light' },
  { name: 'Shot Cannon',     cost: [2,4,5,6],   dmg: ['6','9','11','13'], traits: 'Short (6"), Light, Frag' },
  { name: 'Submunitions',    cost: [1,2,3,4],   dmg: ['2','3','4','5'],   traits: 'Short (6"), Flak' },
];

// ---- Melee weapons (p. 20, 85) ----
export const MELEE = [
  { name: 'Basic Melee Weapon', cost: [1,2,3,4], dmg: ['-','-','-','-'], traits: 'Melee (1/1/2/2)' },
  { name: 'Combat Blade',       cost: [2,3,4,5], dmg: ['-','-','-','-'], traits: 'Melee (1/1/2/2), Parry' },
  { name: 'Demolition Cutter',  cost: [2,3,4,5], dmg: ['-','-','-','-'], traits: 'Melee (1/1/2/2), AP (1/2/2/3)' },
  { name: 'Impact Hammer',      cost: [3,4,5,6], dmg: ['-','-','-','-'], traits: 'Melee (2/2/3/3), Bulky, Concussive (4)' },
  { name: 'Mass Tetsubo',       cost: [3,4,5,6], dmg: ['-','-','-','-'], traits: 'Melee (2/2/3/3), Bulky, Reach (-/1/1/2)", Concussive (2)' },
  { name: 'Mega Glaive',        cost: [4,5,6,7], dmg: ['-','-','-','-'], traits: 'Melee (3/3/4/4), Bulky, Reach (1/2/2/3)' },
  { name: 'Plasma Blade',       cost: [4,5,6,7], dmg: ['-','-','-','-'], traits: 'Melee (2/2/3/3), AP (1/2/2/3), Disruptive' },
  { name: 'Shock Net',          cost: [3,4,5,6], dmg: ['-','-','-','-'], traits: 'Melee (1/1/2/2), Stagger, Tether' },
];

// ---- Upgrades (p. 24, 86) ----
export const UPGRADES = [
  { name: 'Anti Missile System',         cost: [3,5,6,8],          compact: false, rule: 'This Unit may not be Targeted by a Weapon using the Smart trait if that Weapon is using the LoS of another Model.' },
  { name: 'Combat Shield',               cost: [2,3,4,5],          compact: false, rule: 'When damaged by ENGAGE/SMASH from Front/Side, or makes a Defense Roll vs Blast, with >0 Armor: roll 1D6 per damage point, on 5+ ignore that point. Damage negated counts as not having happened for traits like AP. When this HE-V performs an ENGAGE, all of its Weapons receive -1 Damage Rating.' },
  { name: 'Coolant Tanks',               cost: [2,'-','-','-'],    compact: false, rule: 'At any point during a turn, this Unit may remove one Redline Marker. Limited (2).' },
  { name: 'Directional Thruster',        cost: [3,4,5,6],          compact: false, rule: 'This Unit gains the Dash (2) Order: move up to 2", then resolve a SMASH or ENGAGE. The secondary Order does not count toward the 2 Order limit.' },
  { name: 'Electronic Countermeasures',  cost: [2,4,6,8],          compact: false, rule: 'This Unit may not be targeted by LOCK ON Orders.' },
  { name: 'Haptic Suit',                 cost: ['-','-','-',7],    compact: true,  rule: 'When performing a Return Fire, you may re-roll any dice in the Defense Roll (not just natural 1s). Compact.' },
  { name: 'Heavy Reactor',               cost: [2,3,4,5],          compact: false, rule: 'When this Unit would take Structure damage from Overdrive or receiving a Redline Marker, roll 1D6. On 4+, that damage is ignored.' },
  { name: 'High Speed Servos',           cost: [3,4,6,7],          compact: false, rule: 'After performing a SMASH Order, this Unit may perform a second SMASH Order. The second SMASH does not count against the 2-Order limit and gets no movement bonuses.' },
  { name: 'Jump Jets',                   cost: [3,4,5,6],          compact: false, rule: 'This Unit may perform the JUMP Order.' },
  { name: 'Mine Drone Carrier System',   cost: [2,3,4,5],          compact: false, rule: 'This Unit has the Minelayer (MOVE) trait. Limited (1/2/3/3).' },
  { name: 'Mine Drone Tracking Munitions', cost: [2,3,5,6],        compact: false, rule: 'When making an ENGAGE Order, this Unit may target a Mine Drone Token. The Token\'s Commander makes Defense Rolls on 3+; if at least one point of Damage would be inflicted, remove the Token.' },
  { name: 'Neural Input',                cost: [2,3,4,5],          compact: true,  rule: 'Reduce the Damage Rating of SMASH Orders targeting this Unit by 1. Compact.' },
  { name: 'Nitro Boost',                 cost: [2,2,4,5],          compact: false, rule: 'At the beginning of a MOVE Order, you may move an additional 4". Limited (1).' },
  { name: 'Optic Camouflage',            cost: [2,3,4,5],          compact: false, rule: '+1 to Defense Rolls for this Unit when the Active Unit is outside 10".' },
  { name: 'Target Designator',           cost: [2,4,6,8],          compact: false, rule: 'After this Unit completes an Activation, place a Target Designator Marker on it (not after a JUMP). Remove the Marker at the start of its next Activation.' },
];

// ---- Defensive configurations (p. 25, 87) ----
// Don't take a slot. Lt/Md/Hv equip 1; UH equips 2.
export const DEFENSIVE = [
  { name: 'Ablative Armor',     cost: [1,1,2,2],          rule: 'May re-roll any failed Defense Rolls caused by the Blast effect.' },
  { name: 'Ceramic Plating',    cost: [2,2,1,1],          rule: 'Each time this Unit would take Damage from the AP trait, roll 1D6. On 4+, ignore that Damage.' },
  { name: 'Claymore Armor',     cost: [1,1,1,1],          rule: 'Reduce incoming SMASH Attack Pool by 1 (min 1). If Structure Damage taken from a SMASH, the Active Unit is immediately ENGAGEd with damage (2/2/3/3) and the Frag trait.' },
  { name: 'Extra Plating',      cost: [1,1,1,1],          rule: 'This Unit gains 2 additional Armor.', mod: { armor: 2 } },
  { name: 'Heavy Plating',      cost: ['-','-','-',2],    rule: 'This Unit gains 4 additional Armor.', mod: { armor: 4 } },
  { name: 'Reactive Armor',     cost: [1,1,1,1],          rule: 'Reduce the Attack Pool of Weapons with "Missile" or "Rocket" in the name targeting this Unit by 1 (min 1).' },
  { name: 'Redundant Internals', cost: [1,'-','-','-'],   rule: 'This Unit no longer has "Fragile Internals" applied when damaged.' },
];

// ---- Off-table support assets (p. 26, 89) ----
export const OFF_TABLE_ASSETS = [
  { name: 'Artillery Barrage',  cost: 10, kind: 'Off-Table',
    summary: 'Indirect bombardment, 4 dmg, big AoE.',
    fullDesc: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the Marker. Perform an ENGAGE Order targeting the enemy. Do not apply modifiers for Side/Rear, Covered, Blocking, Secondary Target, or Bypassing Shot. LoS is drawn from the top of the Target Model\'s Silhouette for any other purposes.',
    stats: { Damage: '4', Traits: 'Blast (6"), Limited (3)' } },
  { name: 'Mass Driver',        cost: 10, kind: 'Off-Table',
    summary: 'Single big Kinetic shot from your edge.',
    fullDesc: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the Marker. Perform an ENGAGE Order. LoS is drawn from any point on your Deployment Edge or Corner and is not blocked by Blocking Terrain.',
    stats: { Damage: '7', Traits: 'Kinetic (counts as Ultraheavy), Limited (3)' } },
  { name: 'Mine Drone Barrage', cost: 10, kind: 'Off-Table',
    summary: 'Place 3 Mine Drone Tokens at once.',
    fullDesc: 'Select 3 points on the table within LoS of one friendly Unit with a Target Designator Marker, and remove the Marker. Place a Mine Drone Token on each point. No Mine Drone Token may be placed within 6" of an existing Mine Drone Token.',
    stats: { Damage: '-', Traits: 'Limited (3) (9 tokens total per game)' } },
  { name: 'Orbital Laser',      cost: 10, kind: 'Off-Table',
    summary: 'Precision AP strike from orbit.',
    fullDesc: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the Marker. Perform an ENGAGE Order. Do not apply modifiers for Side/Rear, Covered, Blocking, Secondary Target, or Bypassing Shot.',
    stats: { Damage: '3', Traits: 'AP (3), Limited (3)' } },
];

// ---- Advanced support assets (p. 62-72) ----
// Each multi-model asset carries a `subunits` array with full statlines so
// the detail view can show each variant separately. `Per model`/`Per tank`
// shared stats stay on the parent for backwards compatibility.
export const ADVANCED_ASSETS = [
  { name: 'LAS-Wing Attack Squadron',     cost: 10, kind: 'Air',
    summary: '4 light flyers in any combination of Strike or Recon types.',
    fullDesc: 'A Squadron of 4 LAS-Wings. Pick any mix of the two types below. All LAS-Wings share Auxiliary Unit (Light), Flying, Flying Squadron, Vulnerable, Yielding.',
    stats: { 'Per model': 'SPD 12", ARM 1, STR 1', Traits: 'Auxiliary Unit (Light), Flying, Flying Squadron, Vulnerable, Yielding' },
    unitCount: 4,
    pickRule: 'any',
    subunits: [
      { name: 'Strike LAS Wing', spd: '12"', arm: '1', str: '1',
        weapons: 'Autocannon or Rotary Cannon, AG Missiles or Barrage Rockets',
        traits: '—' },
      { name: 'Reconnaissance and Disruption LAS Wing', spd: '12"', arm: '1', str: '1',
        weapons: 'Autocannon or Rotary Cannon',
        traits: 'Guidance Suite (Flying Move), MSOE Launcher (Flying Move), Scramblers' },
    ],
  },
  { name: 'LAS-Wing Transport Squadron',  cost: 10, kind: 'Air',
    summary: 'Air-deliver Infantry, Power Suits, or a UL HE-V Squadron.',
    fullDesc: 'A Squadron of LAS-Wing Transports, all of the same type. Garrisoned units are placed off-table until they perform a MUSTER Order. All Transports share Auxiliary Unit (Light), Flying, Flying Squadron, Vulnerable, Yielding.',
    stats: { 'Per model': 'SPD 12", ARM 1, STR 2', Weapons: 'Rotary Cannon (each)', Traits: 'Auxiliary Unit (Light), Flying, Flying Squadron, Vulnerable, Yielding' },
    unitCount: 4,
    pickRule: 'allSame',
    subunits: [
      { name: 'Infantry Air Transport', spd: '12"', arm: '1', str: '2',
        weapons: 'Rotary Cannon',
        traits: 'Asset Command, Garrison (3 Infantry Squads)' },
      { name: 'Power Suit Air Transport', spd: '12"', arm: '1', str: '2',
        weapons: 'Rotary Cannon',
        traits: 'Asset Command, Garrison (2 Power Suit Squads)' },
      { name: 'UL HE-V Air Transport', spd: '12"', arm: '1', str: '2',
        weapons: 'Rotary Cannon',
        traits: 'Squadron Garrison (1 UL HE-V Squadron)' },
    ],
  },
  { name: 'Assault Vehicle Squadron',     cost: 20, kind: 'Vehicle',
    summary: '4 ground vehicles in any combination.',
    fullDesc: 'A Squadron of 4 Assault Vehicles. Mix any of the eight types below. All vehicles share Auxiliary Unit (Medium), Squadron, All-Terrain.',
    stats: { 'Per model': 'SPD 8", ARM 3, STR 2', Traits: 'Auxiliary Unit (Medium), Squadron, All-Terrain' },
    unitCount: 4,
    pickRule: 'any',
    subunits: [
      { name: 'Netter Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Vehicle Autocannon, Submunitions',
        traits: 'Magnetic Grapples, Close Support' },
      { name: 'Demolition Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Dozer Blade, Heavy Incinerators, Submunitions',
        traits: 'Inferno Gear' },
      { name: 'Infantry Fighting Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Vehicle Autocannon, Submunitions',
        traits: 'Asset Command, Garrison (3 Infantry Squads)' },
      { name: 'Combat Engineering Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Vehicle Autocannon, Submunitions',
        traits: 'Minesweeper' },
      { name: 'Shield Projector Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Submunitions',
        traits: 'Shield Projector' },
      { name: 'Fire Support Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Vehicle Autocannon, Missile Pack',
        traits: '—' },
      { name: 'Anti-Aircraft Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'AA Array',
        traits: '—' },
      { name: 'Artillery Vehicle', spd: '8"', arm: '3', str: '2',
        weapons: 'Vehicle Howitzer, Submunitions',
        traits: '—' },
    ],
  },
  { name: 'Heavy Tank Troop',             cost: 20, kind: 'Vehicle',
    summary: '2 heavy tanks with HE-V scale weapons.',
    fullDesc: 'A Troop of 2 Heavy Tanks. Each tank scores as 10 Tons. Pick any 2 of the four loadouts below. All tanks share Auxiliary Unit (Heavy), Asset Command, All-Terrain.',
    stats: { 'Per tank': 'SPD 6", ARM 8, STR 8', Traits: 'Auxiliary Unit (Heavy), Asset Command, All-Terrain' },
    unitCount: 2,
    pickRule: 'any',
    subunits: [
      { name: 'Direct Fire Tank', spd: '6"', arm: '8', str: '8',
        weapons: 'Tank Laser, Submunitions',
        traits: '—' },
      { name: 'General Fire Support Tank', spd: '6"', arm: '8', str: '8',
        weapons: 'Tank Autocannon, Vehicle Rocket Pack, Submunitions',
        traits: '—' },
      { name: 'Missile Battery Tank', spd: '6"', arm: '8', str: '8',
        weapons: 'Tank Missiles ×2',
        traits: '—' },
      { name: 'Infantry Assault Tank', spd: '6"', arm: '8', str: '8',
        weapons: 'Tank Howitzer, Rotary Cannon, Dozer Blade, Submunitions',
        traits: 'Garrison (4 Infantry Squads)' },
    ],
  },
  { name: 'Infantry Outpost',             cost: 10, kind: 'Garrison',
    summary: '2 fortified bunkers with garrisoned infantry squads.',
    fullDesc: 'Two Bunkers, each carrying 6 Infantry Squad Models. Each Bunker mounts a single weapon picked from the list below. Each Bunker scores as 5 Tons.',
    stats: { 'Per bunker': 'ARM 2, STR 8', Traits: 'Auxiliary Unit (Ultraheavy), Asset Command, Fortification, Garrison (6 Infantry Squads), Minelayer (ENGAGE)' },
    unitCount: 2,
    pickRule: 'any',
    subunits: [
      { name: 'Bunker (Autocannon)', spd: '0"', arm: '2', str: '8',
        weapons: 'Autocannon (DMG 2, Short 12", Kinetic)',
        traits: 'Auxiliary Unit (Ultraheavy), Asset Command, Fortification, Garrison (6 Infantry Squads), Minelayer (ENGAGE)' },
      { name: 'Bunker (Missile Pack)', spd: '0"', arm: '2', str: '8',
        weapons: 'Missile Pack (DMG 3, Smart, Limited 3)',
        traits: 'Auxiliary Unit (Ultraheavy), Asset Command, Fortification, Garrison (6 Infantry Squads), Minelayer (ENGAGE)' },
      { name: 'Bunker (Rocket Pack)', spd: '0"', arm: '2', str: '8',
        weapons: 'Rocket Pack (DMG 3, Blast 3", Limited 3)',
        traits: 'Auxiliary Unit (Ultraheavy), Asset Command, Fortification, Garrison (6 Infantry Squads), Minelayer (ENGAGE)' },
    ],
  },
  { name: 'Support Vehicle Squadron',     cost: 20, kind: 'Vehicle',
    summary: '4 specialist support vehicles, no type more than twice.',
    fullDesc: 'A Squadron of 4 Support Vehicles. No vehicle type may be picked more than twice. All vehicles share Auxiliary Unit (Medium), Squadron, Support Orders.',
    stats: { 'Per model': 'SPD 8", ARM 2, STR 2', Traits: 'Auxiliary Unit (Medium), Squadron, Support Orders' },
    unitCount: 4,
    pickRule: 'maxTwoEach',
    subunits: [
      { name: 'Recon Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'Target Designator, Outrider' },
      { name: 'Command Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'SUPPORT: Command and Control Station' },
      { name: 'Resupply Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'SUPPORT: Combat Supplies' },
      { name: 'Targeting Support Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'SUPPORT: Guidance Suite' },
      { name: 'Obscuration Projection Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'SUPPORT: Multi-spectral Obscuration Emitter Deployer' },
      { name: 'Minelayer Vehicle', spd: '8"', arm: '2', str: '2',
        weapons: 'Vehicle Autocannon',
        traits: 'SUPPORT: Mine-Drone Layer (4)' },
    ],
  },
];

// Vehicle / sub-unit weapon profiles (p. 69). These are referenced by
// support asset subunits but loaded out at the unit, not picked individually.
export const VEHICLE_WEAPONS = [
  { name: 'AA Array',           dmg: '2 (Anti-Air)', traits: 'Anti-Air, Flak, Light, Short (24")' },
  { name: 'Vehicle Autocannon', dmg: '2',            traits: 'Kinetic' },
  { name: 'Dozer Blade',        dmg: '—',            traits: 'Smasher (Medium, X), Concussive (2)' },
  { name: 'Missile Pack',       dmg: '3',            traits: 'Smart, Limited (3)' },
  { name: 'Submunitions',       dmg: '1',            traits: 'Short (6"), Flak' },
  { name: 'Vehicle Howitzer',   dmg: '3',            traits: 'Smart, Blast (3"), Kinetic' },
  { name: 'Heavy Incinerators', dmg: '5',            traits: 'Short (8"), Disruptive, Light' },
  { name: 'Tank Autocannon',    dmg: '5',            traits: 'Kinetic' },
  { name: 'Tank Laser',         dmg: '2',            traits: 'AP (2), Draining' },
  { name: 'Tank Missiles',      dmg: '5',            traits: 'Smart, Limited (3)' },
  { name: 'Tank Howitzer',      dmg: '4',            traits: 'Smart, Blast (3"), Kinetic' },
  { name: 'Vehicle Rocket Pack',dmg: '4',            traits: 'Blast (3"), Limited (3)' },
  { name: 'Rotary Cannon',      dmg: '6',            traits: 'Short (12"), Light' },
  { name: 'Autocannon',         dmg: '2',            traits: 'Short (12"), Kinetic' },
  { name: 'Rocket Pack',        dmg: '3',            traits: 'Blast (3"), Limited (3)' },
];

// ---- Factions (p. 46-49) ----
// Pick a Faction Type, then 2 Perks (one per Grouping).
export const FACTIONS = {
  Authorities: {
    blurb: 'Old governments and nations of Earth, their fragments, and their imitators. The Sahel Alliance, the 67th North Horizon Corps, the Antarctic Habitation, the Knightwatch.',
    agenda: 'Territorial: When checking Victory, if no enemy Units are within 10" of any of your Deployment Edges or Corners, score 1 VP.',
    perks: {
      'Old Infrastructure': [
        { name: 'Orbital Stockpiles', text: 'Off-Table Support Assets with the Limited trait have this value increased by 1.' },
        { name: 'Strategic Energy Reserves', text: 'During Game Turn 1: friendly HE-Vs +2" to MOVE/JUMP and may MOVE twice.' },
        { name: 'Materiel Stockpiles', text: 'When Loading out HE-Vs, you may spend 1 less ton to Reinforce Armor and/or Structure.' },
      ],
      'Military Training': [
        { name: 'Drilled Maneuvers', text: 'Once per game turn, an HE-V may perform an additional MOVE Order without paying the second-Order cost.' },
        { name: 'Veteran Gunners', text: 'Once per game, a friendly HE-V may re-roll one ENGAGE attack pool.' },
        { name: 'Hardened Crews', text: 'Friendly HE-Vs ignore the first Redline Marker assigned per game.' },
      ],
      'Political Priorities': [
        { name: 'Show of Force', text: 'When the enemy declares an Agenda, you may score 1 VP if you have HE-Vs in 3 separate table quadrants.' },
        { name: 'Hold the Line', text: '+1 to Defense Rolls within 6" of your Deployment Edge or Corner.' },
        { name: 'Civic Pride', text: 'Friendly Units may re-roll Defense Rolls vs Blast within 8" of an Objective.' },
      ],
    },
  },
  Corporations: {
    blurb: 'Economic monsters of Mars and their contractors. Visal Corporation, Helios Industries, the Echelon Group, WegMaCo, Akamatsu.',
    agenda: 'Asset Protection: When checking Victory, if the enemy has had more overall Tonnage in Units Destroyed than you, score 1 VP.',
    perks: {
      'Espionage': [
        { name: 'Embedded Informants', text: 'During Deployment, the enemy must Deploy 2 Assets for every 1 of yours.' },
        { name: 'Paid Saboteurs', text: 'Enemy Off-Table Support Assets have Limited reduced by 1, min 0.' },
        { name: 'Exhaustive Intel Gathering', text: 'Once per game turn, an ENGAGE on a chosen enemy HE-V counts as preceded by LOCK ON.' },
      ],
      'Research and Development': [
        { name: 'Advanced Hardpoint Design', text: 'All your HE-Vs gain +1 Weapon and Upgrade slot.' },
        { name: 'Advanced Energy Management Systems', text: 'Once per turn, remove a Redline Marker from any chosen Unit.' },
        { name: 'Advanced Structural Components', text: 'All your HE-Vs count as having +2 Structure for Critical Damage status checks.' },
      ],
      'Deep War Chest': [
        { name: 'Top End Hardware', text: 'All HE-Vs receive 2 additional Tons for Weapons & Upgrades. These do not exceed Class Tonnage.' },
        { name: 'Outrageous Support Budget', text: 'Recruit one Off-Table Support Asset (≤10 tons) free; reduce its numerical values by 1, min 1.' },
        { name: 'Purchased Outcomes', text: 'Once per game, cancel an enemy Order. The Order still counts as having been performed.' },
      ],
    },
  },
  Freelancers: {
    blurb: 'Unconventional bands with unpredictable forces. Vanguard Industrial Cooperative, Dairo Mining Group, Cerberus Group, Roland\'s Reavers.',
    agenda: 'Wildcards: When checking Victory, if you have 2+ Wildcard Kills, score 1 VP.',
    perks: {
      'Rogue Agency': [
        { name: 'Unpredictable Gambits', text: 'Once per game turn: randomly pick one of your unactivated HE-Vs to Activate; it may perform an additional Order.' },
        { name: 'Reckless Piloting', text: 'Once per game turn, an Overdriven HE-V may take a 2nd Structure Damage to perform 2 Orders during Overdrive.' },
        { name: 'Bait & Switch', text: 'Pre-deploy: secretly note a different Mission. On Turn 5 reveal; for the rest of the game, score from that Mission instead.' },
      ],
      'Underworld Affiliations': [
        { name: 'Network Hackers', text: 'Once per game, Activate one enemy Off-Table Support Asset as your own.' },
        { name: 'Tech Pirates', text: 'During Recruitment, take one Research and Development perk from Corporations.' },
        { name: 'Intimidation Tactics', text: 'Enemy units with 2+ of your HE-Vs within 6" suffer -1 to Defense vs ENGAGE/SMASH.' },
      ],
      'Big League Origins': [
        { name: 'Ex-Military Veterans', text: 'Take one Military Training perk from Authorities for this Mission.' },
        { name: 'Political Extremists', text: 'Take one Political Priorities perk from Authorities.' },
        { name: 'Disgraced Trillionaire', text: 'Take one Deep War Chest perk from Corporations.' },
      ],
    },
  },
};

// ---- Faction default logos ----
// Each faction ships with a list of organization logos that exist as
// pre-shipped images under /public/faction-logos/<slug>/. Users can
// pick one as their default or upload a custom file.
export const FACTION_LOGOS = {
  Authorities: [
    { name: '67th North Horizon Corps', file: 'authorities/67th-north-horizon-corp.png' },
    { name: 'Knight Watch',             file: 'authorities/knight-watch.png' },
    { name: 'Old Solar Republic',       file: 'authorities/old-solar-republic.png' },
    { name: 'Sahel Alliance',           file: 'authorities/sahel-alliance.png' },
  ],
  Corporations: [
    { name: 'Akamatsu',              file: 'corporations/akamatsu.png' },
    { name: 'Empyrean Reach',        file: 'corporations/empyrean-reach.png' },
    { name: 'Helios',                file: 'corporations/helios.png' },
    { name: 'The Echelon Group',     file: 'corporations/the-echelon-group.png' },
    { name: 'The Selegin Cooperative', file: 'corporations/the-selegin-cooperative.png' },
    { name: 'Visal Corp',            file: 'corporations/visal-corp.png' },
    { name: 'WegMaCo',               file: 'corporations/wegmaco.png' },
  ],
  Freelancers: [
    { name: 'Cerberus Group',   file: 'freelancers/cerberus-group.png' },
    { name: "Roland's Reavers", file: 'freelancers/rolands-reavers.png' },
  ],
};

// ---- HE-V Teams (p. 50-61) ----
// `band` is which mission team-count slot it consumes: '2', '2-3', or '3-4'.
export const TEAMS = [
  {
    name: 'Reconnaissance Team', band: '2-3',
    blurb: 'Eyes on the ground. Target Designators feed off-table strikes.',
    req: [
      { cls: 'Light', min: 1, max: 4, needs: ['Target Designator'] },
      { cls: 'Medium', min: 0, max: 2, needs: ['Target Designator'], stripped: true },
      { cls: 'Heavy', min: 0, max: 2, needs: ['Target Designator'], stripped: true },
    ],
    benefits: 'At 2+: Lights ignore slot for Electronic Countermeasures. At 3+: Off-Table Assets +1 Damage Rating; Lights\' Target Designators are slot-free. At 4: TD and ECM cost 0; one Medium/Heavy gains Guidance Suite (MOVE) once per turn.',
    benefitsList: [
      { gate: '2+', items: ['Lights ignore the slot cost for Electronic Countermeasures'] },
      { gate: '3+', items: [
        'Off-Table Support Assets gain +1 Damage Rating',
        'Lights\' Target Designators are slot-free',
      ] },
      { gate: '4', items: [
        'Target Designator and Electronic Countermeasures cost 0',
        'One Medium or Heavy gains Guidance Suite (MOVE) once per turn',
      ] },
    ],
    agenda: 'Death from Above: When checking for Victory, if 2 or more enemy HE-Vs have been Destroyed while resolving an Off-Table Asset called in using a Target Designator from a Unit on this Team, score 1 VP.',
  },
  {
    name: 'Security Team', band: '2-3',
    blurb: 'Hold ground. Defensive configurations are king.',
    req: [
      { cls: 'Medium', min: 1, max: 4, needsDefensive: true, reinforced: true },
      { cls: 'Heavy', min: 1, max: 2, needsDefensive: true },
      { cls: 'Ultraheavy', min: 0, max: 2, needsDefensive: true },
    ],
    benefits: 'At 2+: HE-V gets a 2nd Defensive Configuration slot; Heavy/UH count as +5 Tons for scoring. At 3+: Defensive Configs cost 0; Mediums also score +5 Tons; Heavy/UH ignore Side Arc bonuses against them. At 4: Suppressive Fire trait; Mediums ignore Side Arc bonuses.',
    benefitsList: [
      { gate: '2+', items: [
        'Each HE-V gets a 2nd Defensive Configuration slot',
        'Heavy and Ultraheavy count as +5 Tons for scoring objectives',
      ] },
      { gate: '3+', items: [
        'Defensive Configurations cost 0',
        'Mediums also score as +5 Tons',
        'Heavy and Ultraheavy ignore Side Arc attack bonuses against them',
      ] },
      { gate: '4', items: [
        'Team gains the Suppressive Fire trait',
        'Mediums also ignore Side Arc attack bonuses',
      ] },
    ],
    agenda: 'Don\'t Give an Inch: When checking for Victory, if there are more friendly HE-Vs than Enemy HE-Vs within 12" of your Deployment Corners or Edge, score 1 VP. In the case of multiple Corners, there must be a friendly HE-V in range of all of them for this Agenda to be scored.',
  },
  {
    name: 'Assassination Team', band: '2-3',
    blurb: 'Few in number. Bring down high-value targets fast.',
    req: [
      { cls: 'Light', min: 1, max: 3, needs: ['Directional Thruster'], melee: true, noReach: true },
      { cls: 'Medium', min: 1, max: 2, needs: ['Directional Thruster'], melee: true, noReach: true },
    ],
    benefits: 'At 2+: deploy as Support Assets; Mediums get +1" JUMP. At 3+: Melee on enemies in B2B with 2+ team members gets Frag; Lights\' Directional Thrusters slot-free. At 4: SMASH-interrupt; Mediums\' Directional Thrusters slot-free.',
    benefitsList: [
      { gate: '2+', items: [
        'Team deploys as Support Assets (off-table)',
        'Mediums gain +1" JUMP',
      ] },
      { gate: '3+', items: [
        'Melee against an enemy in base contact with 2+ team members gains the Frag trait',
        'Lights\' Directional Thrusters are slot-free',
      ] },
      { gate: '4', items: [
        'SMASH-interrupt: react to enemy MOVE with a SMASH Order',
        'Mediums\' Directional Thrusters are slot-free',
      ] },
    ],
    agenda: 'Target Eliminated: When checking for Victory, if the heaviest HE-V deployed by the opposing Commander has been Destroyed by a member of this Team, score 1 VP. If the enemy Commander has multiple HE-Vs in that size class, select one and note that after Forces are Deployed.',
  },
  {
    name: 'Berserker Team', band: '2-3',
    blurb: 'Close combat veterans. Defensive cost slashed for Lights.',
    req: [
      { cls: 'Light', min: 0, max: 2, melee: true },
      { cls: 'Medium', min: 1, max: 3, melee: true },
      { cls: 'Heavy', min: 1, max: 2, melee: true, needs: ['Nitro Boost'] },
      { cls: 'Ultraheavy', min: 0, max: 1, needs: ['Heavy Plating', 'Nitro Boost'] },
    ],
    benefits: 'At 2+: Lights\' Defensive Configs cost 0; Mediums\' & Heavies\' Directional Thrusters slot-free. At 3+: Lights\' Directional Thrusters slot-free; Mediums may buy a Shield for 3 Tons; UH gains Nitro Boost Limited (2). At 4: Heavies\' Nitro Boost Limited (2); UH\'s Directional Thrusters slot-free.',
    benefitsList: [
      { gate: '2+', items: [
        'Lights\' Defensive Configurations cost 0',
        'Mediums\' and Heavies\' Directional Thrusters are slot-free',
      ] },
      { gate: '3+', items: [
        'Lights\' Directional Thrusters are slot-free',
        'Mediums may buy a Combat Shield for 3 Tons',
        'Ultraheavy gains Nitro Boost Limited (2)',
      ] },
      { gate: '4', items: [
        'Heavies\' Nitro Boost becomes Limited (2)',
        'Ultraheavy\'s Directional Thrusters are slot-free',
      ] },
    ],
    agenda: 'Drive Them Out: When checking for Victory, if 40 Tons or more of opposing HE-Vs have been Destroyed with a SMASH Order while within 18" of the enemy Commander\'s Deployment Edge or Corner, score 1 VP.',
  },
  {
    name: 'Multirole Team', band: '2-3',
    blurb: 'Mixed-class team, no duplicate weapons.',
    req: [
      { cls: 'Light', min: 1, max: 1, noDup: true },
      { cls: 'Medium', min: 1, max: 2, noDup: true },
      { cls: 'Heavy', min: 0, max: 1, noDup: true },
    ],
    benefits: 'Cumulative weapon-specific buffs (Light, Blast, Kinetic, Melee, Short, Draining handling) per class as the team grows.',
    benefitsList: [
      { gate: 'Light', items: ['+1 Damage Rating to weapons with the Light trait'] },
      { gate: 'Medium', items: ['+1 Damage Rating to weapons with the Blast trait'] },
      { gate: 'Heavy', items: ['+1 Damage Rating to weapons with the Kinetic trait'] },
      { gate: 'Each member', items: [
        'Melee weapons gain +1 to Attack Pool',
        'Short weapons add 4" range',
        'Draining trait may be re-rolled once per turn',
      ] },
    ],
    agenda: 'Mission Momentum: When checking for Victory, if your Force scored VP from the primary Mission Objective on turns 2 and 3, score 1 VP.',
  },
  {
    name: 'Gunslinger Team', band: '3-4',
    blurb: 'Short-range only. Return Fire even when activated.',
    req: [
      { cls: 'Light', min: 0, max: 2, needs: ['Haptic Suit'], shortMeleeOnly: true },
      { cls: 'Medium', min: 1, max: 2, needs: ['Haptic Suit'], shortMeleeOnly: true },
      { cls: 'Heavy', min: 1, max: 2, needs: ['Haptic Suit'], shortMeleeOnly: true },
    ],
    benefits: 'At 2+: Return Fire when Activated (taking a Redline Marker instead). At 3+: Short weapons +2" range. At 4: Return Smash interrupt.',
    benefitsList: [
      { gate: '2+', items: [
        'May Return Fire even after being Activated; takes a Redline Marker instead of the usual cost',
      ] },
      { gate: '3+', items: ['Short weapons gain +2" range'] },
      { gate: '4', items: [
        'May interrupt with a SMASH Order in addition to Return Fire',
      ] },
    ],
    agenda: 'Trophy Takers: When any Unit in this Team, that is not within 18" of your Deployment Edge or Corner, Destroys an HE-V, mark a Kill for that Unit. If any Units in this Team with a marked Kill are not Destroyed and within 8" of a friendly Deployment Edge or Corner at the end of the mission, score 1 VP.',
  },
  {
    name: 'Fire Support Team', band: '2-3',
    blurb: 'Forward observers directing massed indirect fire from mobile artillery.',
    req: [
      { cls: 'Light', min: 1, max: 2, needs: ['Target Designator'] },
      { cls: 'Medium or Heavy', min: 1, max: 2, needs: ['Rocket Pack', 'Missiles', 'Howitzer'] },
    ],
    benefits: 'At 2+: Light TDs slot-free; Medium/Heavy Rocket Packs gain Smart and Short (16\"). At 3+: Light TDs cost 0; Smart weapons may target out of LoS with Short (6\"). At 4: Cluster Rockets +1 Limited.',
    benefitsList: [
      { gate: '2+', items: [
        'Light: Target Designators do not use an Upgrade Slot',
        'Medium/Heavy: Rocket Packs gain the Smart and Short (16\") traits',
      ] },
      { gate: '3+', items: [
        'Light: Target Designators have their Cost reduced to 0',
        'Medium/Heavy: Any SMART weapon may select a Target not in LoS (Short (6\") when doing so; no arc bonuses)',
      ] },
      { gate: '4', items: [
        'Light: Cluster Rockets gain +1 to their Limited trait',
      ] },
    ],
    agenda: 'Fire for Effect: When checking for Victory, if 2 or more enemy HE-Vs have been Destroyed by a Weapon on a member of this team actively using the Smart Trait for Line of Sight, score 1 VP.',
  },
  {
    name: 'Coordinated Assets Team', band: '3-4',
    blurb: 'HE-Vs and Support Assets training together.',
    req: [
      { cls: 'Any HE-V', min: 1, max: 2, noBlast: true },
      { cls: 'UL HE-V or Assault Vehicle Squadron', min: 1, max: 2 },
    ],
    benefits: 'At 2+: team members may move through each other. At 3+: stack a 2nd matching Support Asset. At 4: activation handoff between HE-V and Support Asset.',
    benefitsList: [
      { gate: '2+', items: ['Team members may move through each other freely'] },
      { gate: '3+', items: ['May take a 2nd matching Support Asset, normal cost'] },
      { gate: '4', items: [
        'Activation handoff: when the HE-V or Support Asset Activates, the other in the team may also Activate immediately',
      ] },
    ],
    agenda: 'Combined Arms Assault: When any member of this team destroys an enemy HE-V, before it is removed, place an Objective token in base to base with the Destroyed HE-V. If a Support Asset member destroyed the HE-V, an HE-V member may CAPTURE it. If an HE-V member destroyed the HE-V, a Support Asset member may CAPTURE it (the Support Asset member may Control and CAPTURE an Objective for this Agenda only). No other units may CAPTURE it. If you CAPTURED this Objective token, when checking for Victory, score 1 VP.',
  },
];
