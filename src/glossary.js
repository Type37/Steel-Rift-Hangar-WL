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

  // -------- Advanced unit traits (for support assets, vehicles, infantry) --------


  'auxiliary unit': {
    title: 'Auxiliary Unit (X)',
    text: 'Defends as Weight Class (X). Side/Rear Arc modifiers do not apply. Does not suffer Critical Damage, Fragile Internals, or Backup Systems Engage. Counts as Class (X) for other rolls (e.g. Kinetic). May not SMASH unless it has the Smasher trait. May not Overdrive; Redline triggers cause 1 Structure Damage instead. Does not count as an HE-V unless otherwise stated.',
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
    text: 'If a friendly Unit with this trait is within 6" of an enemy target of an ENGAGE or SMASH Order, add 1 to the Damage Rating of each weapon used in that Order. This bonus is only applied once regardless of how many Close Support Units are in range.',
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
    text: 'At the start or end of Order (X), select an enemy Unit in LOS and place a Guidance Marker on it. When that Unit is later targeted by an ENGAGE, the attacking Commander may choose: (a) all weapons count as following a LOCK ON, or (b) one weapon gains +2 to its Damage Rating. Remove the Marker after the ENGAGE or when this Unit activates again.',
  },
  'msoe launcher': {
    title: 'MSOE Launcher (X)',
    text: 'At the start or end of Order (X), place an Obscuration Emitter Token within 6" of this model. Units within 3" of the Token count as being in Covering Terrain and gain Anti-Missile System and Electronic Countermeasures. Token is removed when this Unit activates again.',
  },
  'scramblers': {
    title: 'Scramblers',
    text: 'All Units within 6" of a model with Scramblers, including its own Unit, count as equipped with Anti-Missile Systems and Electronic Countermeasures.',
  },
  'inferno gear': {
    title: 'Inferno Gear',
    text: 'If one or more Models in this Unit have this Trait, the Unit ignores the effects of the Disruptive Trait.',
  },
  'magnetic grapples': {
    title: 'Magnetic Grapples',
    text: 'When this Unit MOVEs or JUMPs into base contact with an Enemy Unit, that Enemy Unit receives a Tether Marker and the Active Unit receives a corresponding Anchor Marker.',
  },
  'minesweeper': {
    title: 'Minesweeper',
    text: 'This Unit may not be Targeted by Mine Drone Tokens. This Unit may ENGAGE Mine Drone Tokens as if equipped with the Mine Drone Tracking Munitions Upgrade.',
  },
  'outrider': {
    title: 'Outrider',
    text: 'If part of a Squadron, these Models may deploy and end moves within 12" of the Squadron Leader (instead of 3"). However, all Models with Outrider must stay within 3" of each other.',
  },
  'shield projector': {
    title: 'Shield Projector',
    text: 'Friendly Units within 6" of a model with this trait count as carrying a Combat Shield Upgrade when making Defense Rolls. Not cumulative with an existing Combat Shield.',
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
  'support orders': {
    title: 'Support Orders',
    text: 'Units with this trait have one or more "SUPPORT:" traits. They may perform the SUPPORT Order, activating the effect of any or all SUPPORT: traits. In a Squadron, all models must perform the SUPPORT Order together; each model with a SUPPORT: trait activates it individually.',
  },
  'smasher': {
    title: 'Smasher (X, Y)',
    text: 'This Unit may perform SMASH Orders even with the Auxiliary Unit Trait. It counts as Weight Class X when SMASHing and adds Y dice to the Attack Pool.',
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
    text: 'If an enemy Unit within 6" of this Model performs an ENGAGE Order, the target of that ENGAGE gains +1 to its Defense Rolls.',
  },
  'vulnerable': {
    title: 'Vulnerable',
    text: 'This Unit takes full Damage from Weapons or effects with the Light trait (Light damage is NOT halved against it).',
  },
  'yielding': {
    title: 'Yielding',
    text: 'Models without Yielding may move through Models with Yielding. If a non-Yielding Model ends its move on top of a Yielding Model, move the Yielding Model the minimum distance to permit the placement.',
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
