// ============================================================
// KEYWORD GLOSSARY
// ============================================================
// Definitions reproduced from the v1.5 rules PDF (p. 21-22 weapon traits,
// p. 25 upgrade traits, scattered upgrade rules). Used by the inline
// definitions panel. When a trait token is clicked anywhere in the UI,
// its definition is surfaced below.
// ============================================================

// Map keyword (lowercase, no parens) → definition object
export const GLOSSARY = {
  'anti-air': {
    title: 'Anti-Air',
    text: 'Targets with the Flying Trait suffer -2 to Defense Rolls vs this Weapon. If a Flying Squadron Model is destroyed, remaining damage may be applied to another Model in the Squadron as if it weren\'t a Flying Squadron.',
  },
  'ap': {
    title: 'AP (X)',
    text: 'When a Target Unit suffers Damage from this Weapon, apply AP(Lt/Md/Hv/UH) Damage directly to the Target Unit\'s Structure (bypassing remaining Armor).',
  },
  'blast': {
    title: 'Blast (X")',
    text: 'All Units (friend or foe) within X" of the Target Model also make a Defense Roll. The total Attack Pool equals the Attack Pool against the original Target. Each Unit\'s Defense Roll uses its own Weight Class. These Units are not "Targeted".',
  },
  'bulky': {
    title: 'Bulky',
    text: 'This Weapon/Upgrade takes two of the HE-V\'s Weapon/Upgrade Slots to equip rather than one.',
  },
  'concussive': {
    title: 'Concussive (X)',
    text: 'When the Target suffers Damage, roll 1D6 (+1 per Class larger Active is, -1 per Class smaller). On 4+, move the Target up to X" directly away from the Active Unit. Collisions deal +1 Damage with no Defense Roll, on both Target and what it hit.',
  },
  'compact': {
    title: 'Compact',
    text: 'This Upgrade does not take an Upgrade Slot. No HE-V may be equipped with more than one Upgrade with the Compact trait.',
  },
  'dash': {
    title: 'Dash (X)',
    text: 'New Order. DASH: move up to X" ignoring Rough Terrain, then immediately resolve a SMASH or ENGAGE Order. The secondary Order does not count toward the 2-Order limit. DASH counts as a MOVE for movement-based bonuses to SMASH.',
  },
  'disruptive': {
    title: 'Disruptive',
    text: 'When the Target suffers Damage from this Weapon, the Active Commander rolls 1D6. On 3+, mark the Target with a Redline Marker. If a Unit already has one (or cannot receive one), it takes 1 Structure Damage instead.',
  },
  'draining': {
    title: 'Draining',
    text: 'When a Unit uses this Weapon during its Activation, mark it with a Redline Marker after Orders are completed (in addition to its Activation Marker). A Unit with a Redline Marker may not use this Weapon when performing an Order.',
  },
  'drag': {
    title: 'Drag',
    text: 'When the Target suffers Damage, roll 1D6+4 (+1 per Class larger Active is, -1 per Class smaller). Move the Target that many inches directly toward the Active Unit. Collisions deal +1 Damage with no Defense Roll.',
  },
  'flak': {
    title: 'Flak',
    text: 'When this Unit is Targeted by a Weapon with "Missile" or "Rocket" in the name, and the Active Unit is in this Model\'s front 180°, reduce that Weapon\'s Attack Pool by 1. Also reduces Mine Drone Attack Pools by 1.',
  },
  'frag': {
    title: 'Frag',
    text: 'Targets of this Weapon are -1 to Defense Rolls caused by this Weapon.',
  },
  'kinetic': {
    title: 'Kinetic',
    text: 'When the Target suffers Damage, roll 1D6 (+1 per Class larger Active is, -1 per Class smaller). On 4+, rotate the Target 45° away from the Active Unit, in a direction chosen by the Active Commander. If Class modifiers make the roll impossible, no effect.',
  },
  'light': {
    title: 'Light',
    text: 'When applying Damage from this Weapon (or its Blast effect), Damage is halved, rounded down.',
  },
  'limited': {
    title: 'Limited (X)',
    text: 'This Weapon, Upgrade, or Asset may only be used X times per Mission. Track uses remaining.',
  },
  'melee': {
    title: 'Melee (X)',
    text: 'This Unit counts as one Weight Class larger during a SMASH Order. Add X to the Attack Pool when performing SMASH. The Weapon is not used during ENGAGE. Multiple Melee weapons do not stack this bonus.',
  },
  'minelayer': {
    title: 'Minelayer (Order)',
    text: 'Immediately before or after resolving the named Order, place one friendly Mine Drone Token within 3" of the Active Model and not within 6" of another friendly Mine Drone Token.',
  },
  'parry': {
    title: 'Parry',
    text: 'Once per ENGAGE or SMASH Order where the Active Unit is in this Unit\'s LoS, this Unit may re-roll up to 2 Defense Dice.',
  },
  'reach': {
    title: 'Reach (X)',
    text: 'In SMASH using this Weapon, Units in LoS within X" count as in base contact. Once Attack Pool is determined, you may reduce it by 1 to nominate a secondary Target in B2B and LoS, dividing the Attack Pool between primary and secondary.',
  },
  'short': {
    title: 'Short (X)',
    text: 'This Weapon may only Target Units within X" of the Active Unit.',
  },
  'smart': {
    title: 'Smart',
    text: 'At the start of an ENGAGE, you may select a friendly Model with a Target Designator Marker. The selected Model counts as the Active Unit when drawing LoS and determining Side/Rear Arc. Attack Pool -1 when used this way. Marker is removed at the end of the Order.',
  },
  'stagger': {
    title: 'Stagger',
    text: 'When the Target suffers Damage from this Weapon, the Target receives a Stagger Marker at the end of the Order. A Unit with a Stagger Marker is -1 to Defense Roll dice when Targeted by ENGAGE or SMASH. Removed after the next ENGAGE/SMASH Targeting it completes.',
  },
  'tether': {
    title: 'Tether',
    text: 'Target receives a Tether Marker, the Active Unit a corresponding Anchor Marker. Tethered Units may not end MOVE or JUMP further from the Anchor. At end of a Tethered Unit\'s Activation, on a 4+ remove the Tether (and Anchor).',
  },

  // Upgrade-specific keywords (some duplicated above for findability)
  'redline': {
    title: 'Redline Marker',
    text: 'Indicates a Unit\'s systems are pushed past the limit. Prevents certain actions and traits while present. A Unit cannot have more than one Redline Marker; if it would receive a second, it suffers 1 Structure Damage instead.',
  },
  'lock on': {
    title: 'LOCK ON Order',
    text: 'A 1-Order action that negates Defensive Traits for a subsequent ENGAGE on the Targeted Unit.',
  },
  'target designator': {
    title: 'Target Designator Marker',
    text: 'Placed on a Unit after it Activates (not after JUMP). Allows Smart weapons (and Off-Table Assets) to use that Unit\'s LoS. Removed at the start of the Unit\'s next Activation.',
  },
};

// Pull leading keyword tokens out of a trait string. Best-effort.
// "Anti-Air, Flak, Light, Short (24")" → ['anti-air','flak','light','short']
export function tokenize(traits) {
  if (!traits) return [];
  return traits
    .split(/,\s*/)
    .map(t => t.replace(/\([^)]*\)/g, '').trim().toLowerCase())
    .filter(Boolean)
    .map(t => t.replace(/"/g, ''));
}

// Look up a single trait token.
export function defineToken(token) {
  if (!token) return null;
  const k = token.toLowerCase().trim().replace(/\s*\([^)]*\)/g, '').replace(/"/g, '').trim();
  return GLOSSARY[k] || null;
}
