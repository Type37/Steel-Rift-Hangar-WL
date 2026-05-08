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

  'command and control station': {
    title: 'SUPPORT: Command and Control Station',
    text: 'When performing the SUPPORT Order: select an HE-V and move it up to 3" immediately (once per turn per Unit). Additionally, when calculating Tonnage for any Objective, if a friendly Unit within 12" is contributing, the controlling Commander may choose to win or lose any ties.',
  },
  'combat supplies': {
    title: 'SUPPORT: Combat Supplies',
    text: 'When performing the SUPPORT Order: select one Unit within 2" and choose — restore 4 Armor to an HE-V (not above starting value), or restore one use of a Limited trait to a weapon, upgrade, or trait.',
  },
  'mine-drone layer': {
    title: 'SUPPORT: Mine-Drone Layer (X)',
    text: 'When performing the SUPPORT Order, counts as having the Minelayer (SUPPORT) trait. Limited (X).',
  },
  'multi-spectral obscuration emitter deployer': {
    title: 'SUPPORT: MSOE Deployer',
    text: 'When performing the SUPPORT Order, counts as having the MSOE Launcher (SUPPORT) trait, placing an Obscuration Emitter Token within 6". Units within 3" gain Covering Terrain and count as having Anti-Missile System and Electronic Countermeasures.',
  },


















  'anti-air': {
    title: 'Anti-Air',
    text: 'When targeting a Unit with the Flying trait, the Target is at -2 to Defense Rolls (e.g. normally avoids on 2+, now avoids on 4+). If this Weapon destroys a Model in a Flying Squadron, remaining damage may be applied to another Model in that Squadron as if it were not a Flying Squadron.',
  },
  'ap': {
    title: 'AP (X)',
    text: 'When a Target Unit suffers Damage from this Weapon, apply AP(Lt/Md/Hv/UH) Damage directly to the Target Unit\'s Structure (bypassing remaining Armor).',
  },
  'blast': {
    title: 'Blast (X")',
    text: 'All Units (friend or foe) within (X)" of the Target Model must also make a Defense Roll using the same total Attack Pool as the main target. Each Unit\'s Defense Roll is based on its own Weight Class. Units making these rolls are not considered Targeted.',
  },
  'bulky': {
    title: 'Bulky',
    text: 'This Weapon/Upgrade takes two of the HE-V\'s Weapon/Upgrade Slots to equip rather than one.',
  },
  'concussive': {
    title: 'Concussive (X)',
    text: 'On damage: roll 1D6, +1 per Weight Class larger than the Target, -1 per smaller. On 4+, move Target up to (X)" directly away. If it contacts Blocking Terrain or another Unit, it stops in base contact and both take 1 Damage with no Defense Roll.',
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
    text: 'On damage, roll 1D6. On 3+, mark the Target with a Redline Marker. If the Unit already has one or cannot receive one, it takes 1 Structure Damage instead.',
  },
  'draining': {
    title: 'Draining',
    text: 'After completing Orders in the Activation this Weapon was used, the Unit receives a Redline Marker (in addition to an Activation Marker). While the Unit already has a Redline Marker, it may not use this Weapon.',
  },
  'drag': {
    title: 'Drag',
    text: 'On damage: roll 1D6+4, +1 per Weight Class larger than the Target, -1 per smaller. Move Target that many inches directly toward the Active Unit, stopping at base contact with the Active Unit. If it contacts Blocking Terrain or another Unit (not the Active Unit), it stops and both take 1 Damage with no Defense Roll.',
  },
  'flak': {
    title: 'Flak',
    text: 'When this Unit is Targeted by a Weapon with "Missile" or "Rocket" in the name and the Active Unit is in this Model\'s front 180°, reduce that Attack Pool by 1. Also reduces Mine Drone Attack Pools by 1.',
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
    text: 'On damage, Target receives a Stagger Marker. Staggered Units apply -1 to Defense Roll dice when Targeted by ENGAGE or SMASH; Marker is removed after that Order. If a Unit has a Stagger Marker at start of its Activation, it may only perform one Order and may not MOVE; Marker removed at end of Activation.',
  },
  'tether': {
    title: 'Tether',
    text: 'On damage, Target receives a Tether Marker and the Active Unit receives an Anchor Marker. The Tethered Unit may not end a MOVE or JUMP further from the Anchor Unit. At end of the Tethered Unit\'s Activation roll D6 — on 4+, remove both Markers. Anchor Unit destroyed removes all corresponding Tethers. Overdrive does not remove the Marker.',
  },

  // -------- Advanced unit traits (for support assets, vehicles, infantry) --------


  'auxiliary unit': {
    title: 'Auxiliary Unit (X)',
    bullets: [
      'Defends against ENGAGE and SMASH as if it were Weight Class (X).',
      'Attack Pools against this Unit are never modified for Side or Rear Arc.',
      'Does not suffer Critical Damage, Fragile Internals, or Backup Systems Engage.',
      'Counts as Weight Class (X) when making other rolls (e.g. Kinetic trait comparisons).',
      'May never perform a SMASH Order unless it has a weapon with the Smasher trait.',
      'May never Overdrive. If it would receive a Redline Marker from an effect, it suffers 1 Structure Damage instead; do not mark it with the Marker.',
      'Does not count as an HE-V for rules purposes unless otherwise specified.',
    ],
  },

  'flying': {
    title: 'Flying',
    text: 'MOVE Order is replaced by a FLYING MOVE: place the Unit within its Speed horizontally, ignoring Terrain and Unit movement restrictions provided the base fits and faces any direction. Targeting a Flying Unit gives +1 to Defense vs ENGAGE; not modified by Covered or Blocked. Blast Weapons targeting a Flying Unit do not affect non-Flying Units; Flying Units in Blast range of a non-Flying Target do not roll Defense. Cannot SMASH or be SMASHed. Silhouette extends 4" above the base.',
  },
  'flying squadron': {
    title: 'Flying Squadron',
    text: 'Follows all Squadron rules with three differences. Movement: Models must end within 6" of the Leader, not 3". ENGAGE damage overflow: if a weapon destroys the Target Model, remaining damage is not carried to another Model in the Squadron — this is the key exception from regular Squadron. Blast: a Blast Weapon targeting this Unit does not add 2 to its Attack Pool.',
  },











  'all-terrain': {
    title: 'All-Terrain',
    text: 'Units with this Trait ignore the movement penalty for Rough Terrain.',
  },
  'asset command': {
    title: 'Asset Command',
    text: 'All Units in this Asset are issued Orders during the same Activation. When activating one, select any Unit from this Asset and resolve its Activation, then continue until all Units have Activated. The opponent then becomes Active Commander.',
  },
  'close support': {
    title: 'Close Support',
    text: 'If a friendly Unit with this trait is within 6\" of an enemy target of an ENGAGE or SMASH Order, add one to the Damage Rating of each weapon used in that ENGAGE or SMASH Order. This bonus is only applied once, regardless of the number of Units with this Trait in range.',
  },
  'fortification': {
    title: 'Fortification',
    text: 'Once placed in Deployment, this Unit may not be moved or placed by any Order or effect, voluntarily or involuntarily.',
  },
  'garrison': {
    title: 'Garrison (X)',
    text: 'This Model contains a garrisoned Unit (specified in X). The Garrison is placed off-table until it performs the MUSTER Order: place the Garrisoned Unit within 1" of its Garrison. If the Garrison Model is Destroyed before MUSTER, the garrisoned Unit is also Destroyed.',
  },

  'guidance suite': {
    title: 'Guidance Suite (X)',
    text: 'At the beginning or end of the Order listed in (X), select one enemy unit within LoS of this Model and place a Guidance Marker on it. When that Unit is Targeted by an ENGAGE Order, the attacker selects one effect: (a) all weapons count as having a LOCK ON Order, or (b) one weapon may have +2 added to its Damage Rating. Remove the Marker when the ENGAGE Order is complete, or when this Unit activates again.',
  },
  'msoe launcher': {
    title: 'MSOE Launcher (X)',
    text: 'At the beginning or end of the Order listed in (X), place an Obscuration Emitter Token within 6\" of this model. Any Unit within 3\" of the Token counts as being within Covering Terrain; LoS drawn to those models is considered to pass through Covering Terrain. Those Units also count as having Anti-Missile System and Electronic Countermeasures. Remove the Token when the placing Unit activates again.',
  },
  'scramblers': {
    title: 'Scramblers',
    text: 'All Units within 6\" of a model equipped with Scramblers, including its own Unit, count as being equipped with Anti-Missile Systems and Electronic Countermeasures.',
  },
  'inferno gear': {
    title: 'Inferno Gear',
    text: 'If a Model or Models in the Unit have this Trait, the Unit ignores the effects of the Disruptive Trait.',
  },
  'magnetic grapples': {
    title: 'Magnetic Grapples',
    text: 'When this Unit MOVEs or JUMPs into base contact with an Enemy Unit, that Enemy Unit receives a Tether Marker and the Active Unit receives a corresponding Anchor Marker.',
  },
  'minesweeper': {
    title: 'Minesweeper',
    text: 'A Unit with this Trait may not be Targeted by a Mine Drone Token. This Unit may ENGAGE Mine Drone Tokens as if it had the Mine Drone Tracking Munitions Upgrade.',
  },
  'outrider': {
    title: 'Outrider',
    text: 'If these Models are part of a Squadron, they may be deployed and end moves within 12\" of the Squadron Leader (instead of 3\"). However, all Models with this Trait in a Squadron must deploy and end moves within 3\" of all other Models with this Trait in the Squadron.',
  },
  'shield projector': {
    title: 'Shield Projector',
    text: 'When a friendly Unit within 6\" of the model with this trait makes a Defense Roll, it counts as carrying a Combat Shield Upgrade. This is not cumulative with an existing Combat Shield Upgrade on that Unit.',
  },



  'infantry': {
    title: 'Infantry',
    text: 'Infantry Activate with a special Order list: MUSTER, MOVE (may be performed twice per Activation), LOCK ON, ENGAGE, DIG IN. Infantry suffer -1 to Defense Rolls when not in Rough or Covering Terrain. Infantry count as 0 Tons for scoring.',
  },


  'overdrive': {
    title: 'Overdrive',
    text: 'When a Commander would Activate a Unit but all their Units have Activation Markers and the opponent has at least one without: select a Unit (not one with a Redline Marker or only 1 Structure remaining) to Overdrive. It receives a Redline Marker, suffers 1 Structure Damage, then performs a single Order.',
  },
  'return fire': {
    title: 'Return Fire',
    text: 'When targeted by an ENGAGE Order, a Unit may declare Return Fire if: (a) it has LoS to the Active Unit, (b) it has no Activation Marker, and (c) it has no Redline Marker. If declared, the Target may re-roll natural 1s in their Defense Roll. Once the Active Unit\'s Order is complete, if LoS still exists, the Target Unit may immediately ENGAGE the Active Unit. The returning unit is then marked with an Activation Marker.',
  },
  'fragile internals': {
    title: 'Fragile Internals',
    text: 'Light HE-Vs only. Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, the Unit suffers one additional point of Damage. This does not trigger further Fragile Internals rolls.',
  },
  'backup systems engage': {
    title: 'Backup Systems Engage',
    text: 'Ultraheavy HE-Vs only. Whenever this Unit suffers Structure Damage, the Target Commander rolls 1D6 per point of Structure Damage lost. On a 5+, one point of Damage is ignored and the Structure is not reduced.',
  },
  'tracked': {
    title: 'Tracked',
    text: 'Variant Motive Type upgrade (cost 0). Grants the PLOW THROUGH Order: pivot up to 90°, then move up to the HE-V\'s current move speed in a straight line, ignoring Rough Terrain. Facing may not change at the end of this Order. Does not count as a MOVE Order.',
  },
  'plow through': {
    title: 'Plow Through',
    text: 'Available to Tracked HE-Vs. Pivot up to 90°, then move up to current move speed in a straight line, ignoring Rough Terrain. Facing may not change at end of Order. Does not count as a MOVE Order.',
  },
  'multi-limbed': {
    title: 'Multi-Limbed',
    text: 'Variant Motive Type upgrade (cost 0). Grants the HUNKER DOWN Order: move following all MOVE rules except distance is 10\"/8\"/6\"/4\". Counts as a MOVE Order. The Unit receives a Hunkered Down Marker, which modifies incoming ENGAGE attacks as Covered (or Blocked if already Covered). Marker is removed if the Unit moves or is SMASHed.',
  },
  'hunker down': {
    title: 'Hunker Down',
    text: 'Available to Multi-Limbed HE-Vs. Move up to 10\"/8\"/6\"/4\" (counts as a MOVE Order), then place a Hunkered Down Marker. While Hunkered Down, incoming ENGAGE attacks treat this unit as Covered (or Blocked if already Covered). Removed if the Unit moves or is SMASHed.',
  },

  'support: command and control station': {
    title: 'SUPPORT: Command and Control Station',
    text: 'When performing the SUPPORT Order: select an HE-V and move it up to 3" immediately (once per turn per Unit). Additionally, when calculating Tonnage for any Objective, if a friendly Unit within 12" is contributing, the controlling Commander may choose to win or lose any ties.',
  },
  'support: combat supplies': {
    title: 'SUPPORT: Combat Supplies',
    text: 'When performing the SUPPORT Order: select one Unit within 2" and choose one — restore 4 Armor to an HE-V (not above starting value), or restore one use of a Limited trait to a weapon, upgrade, or trait.',
  },
  'support: guidance suite': {
    title: 'SUPPORT: Guidance Suite',
    text: 'When performing the SUPPORT Order, this model counts as having the Guidance Suite (SUPPORT) trait.',
  },
  'support: multi-spectral obscuration emitter deployer': {
    title: 'SUPPORT: MSOE Deployer',
    text: 'When performing the SUPPORT Order, this model counts as having the MSOE Launcher (SUPPORT) trait.',
  },
  'support: mine-drone layer': {
    title: 'SUPPORT: Mine-Drone Layer (X)',
    text: 'When performing the SUPPORT Order, counts as having the Minelayer (SUPPORT) trait. Limited (X).',
  },

  'smasher': {
    title: 'Smasher (X, Y)',
    text: 'This Unit is permitted to make the SMASH Order, even if it has the Auxiliary Unit Trait. The Unit is considered of Weight Class X when making a SMASH Order. Add Y dice to the Attack Pool when performing a SMASH Order.',
  },
  'squadron': {
    title: 'Squadron',
    text: 'A Unit of multiple Models that activates together and shares Orders. On deploy or movement, nominate a Squadron Leader; all other Models must end within 3" of the Leader. Damage from ENGAGE spills to other Models if the Target is destroyed; Blast adds 2 to the Attack Pool when targeting the Squadron.',
  },
  'squadron garrison': {
    title: 'Squadron Garrison (X)',
    text: 'Like Garrison, but the whole Unit collectively carries the Garrisoned Unit. Pick one Member Model to count as the Garrison for MUSTER. If a Member is lost, drop a proportional number of Garrisoned Models, rounding up.',
  },
  'support orders': {
    title: 'Support Orders',
    text: 'Units with this trait may perform the SUPPORT Order to activate any number of their "SUPPORT:" prefixed traits. If a Squadron contains Support Orders Models, the whole Squadron performs SUPPORT, and each Support Model activates its trait in any order chosen.',
  },
  'suppressive fire': {
    title: 'Suppressive Fire',
    text: 'If an enemy Unit within 6\" of a friendly model with this Trait performs an ENGAGE Order, the target of that Order receives +1 to their Defense Rolls.',
  },
  'vulnerable': {
    title: 'Vulnerable',
    text: 'This Unit receives full Damage to Armor and Structure from Weapons or effects with the Light trait.',
  },
  'yielding': {
    title: 'Yielding',
    text: 'Any Model without the Yielding trait may move through any Model with the Yielding trait. If such a Model ends its move on top of a Model with the Yielding trait, move any Models with the Yielding trait the minimum distance possible to permit this.',
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

// resolveTraitDefs: like collectTraits+defineToken but substitutes
// actual X values from the original trait string.
// "Short (6"), Blast (3")" → [{title:'Short (6")', text:'...within 6"...'}...]
// Class index: 0=Light 1=Medium 2=Heavy 3=Ultraheavy
const WC_IDX_MAP = { Light: 0, Medium: 1, Heavy: 2, Ultraheavy: 3 };

// Resolve a per-class value string like "1/1/2/3" for a given weight class.
// Returns the resolved string, or the original if it isn't a slash-list.
function resolvePerClass(raw, cls) {
  if (!raw || !cls) return raw;
  const parts = raw.split('/');
  if (parts.length < 4) return raw;
  const idx = WC_IDX_MAP[cls] ?? 0;
  return parts[idx] !== undefined ? parts[idx] : raw;
}

export function resolveTraitDefs(traitStr, cls) {
  if (!traitStr) return [];
  const seen = new Set();
  const results = [];
  traitStr.split(/,\s*/).forEach(part => {
    part = part.trim();
    const valueMatch = part.match(/\(([^)]+)\)/);
    const rawValue = valueMatch ? valueMatch[1] : null;
    // If the value is a per-class list like "1/1/2/3", resolve to the active class
    const resolvedRaw = rawValue && cls ? resolvePerClass(rawValue, cls) : rawValue;
    const numStr = resolvedRaw ? resolvedRaw.replace(/"/g, '').trim() : null;
    const clean = part.replace(/\s*\([^)]*\)/g, '').replace(/"/g, '').trim();
    const key = clean.toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    const def = GLOSSARY[key];
    if (!def) return;
    if (numStr) {
      const sub = (s) => s
        .replace(/\(X"\)/g, `(${numStr}")`)
        .replace(/\bX"/g, `${numStr}"`)
        .replace(/\(X\)/g, `(${numStr})`)
        .replace(/\bX\b/g, numStr);
      results.push({ key, title: sub(def.title), text: sub(def.text), bullets: def.bullets });
    } else {
      results.push({ key, title: def.title, text: def.text, bullets: def.bullets });
    }
  });
  return results;
}

