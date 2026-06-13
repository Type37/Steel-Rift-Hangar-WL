// ============================================================
// CALC + ELIGIBILITY HELPERS
// ============================================================

import { WC, RANGED, MELEE, UPGRADES, DEFENSIVE, OFF_TABLE_ASSETS, ADVANCED_ASSETS } from './data';

export const wcIdx = (cls) => WC[cls].idx;
export const valForClass = (arr, cls) => arr[wcIdx(cls)];
export const isAvailable = (item, cls) => {
  const c = valForClass(item.cost, cls);
  return c !== '-' && c != null;
};

// Cost of the Nth copy (1-indexed) of a weapon at a given class.
// PDF p. 19: "each additional copy of that weapon costs a further 50% more
// than the base cost (rounded down)". The example shows copy 3 = base * 2,
// so the formula is floor(base * (1 + 0.5*(N-1))).
export const copyCost = (base, n) => {
  if (base === '-' || base == null) return null;
  return Math.floor(Number(base) * (1 + 0.5 * (n - 1)));
};

export const totalWeaponCost = (weapon, cls, count) => {
  const base = valForClass(weapon.cost, cls);
  if (base === '-' || base == null) return 0;
  let t = 0;
  for (let i = 1; i <= count; i++) t += copyCost(base, i);
  return t;
};

export const findAsset = (name) =>
  [...OFF_TABLE_ASSETS, ...ADVANCED_ASSETS].find(a => a.name === name);

export const findWeapon = (name) =>
  [...RANGED, ...MELEE].find(w => w.name === name);

// Resolve the full effective perk list, including sub-perks granted by
// Tech Pirates (one Corp R&D perk) and Disgraced Trillionaire (one Deep War
// Chest perk). subPerkSelections maps perk name -> chosen sub-perk name.
// All four Freelancer "grants another faction's perk" abilities are handled:
//   Tech Pirates          → one Corp R&D perk (builder effect possible)
//   Disgraced Trillionaire → one Corp Deep War Chest perk (builder effect possible)
//   Political Extremists  → one Authorities Political Priority perk (game-day only)
//   Ex-Military Veterans  → one Authorities Military Training perk (at Deployment)
export const effectivePerks = (perks = [], subPerkSelections = {}) => {
  const list = [...perks];
  const GRANT_PERKS = ['Tech Pirates', 'Disgraced Trillionaire', 'Political Extremists', 'Ex-Military Veterans'];
  for (const grantPerk of GRANT_PERKS) {
    if (perks.includes(grantPerk) && subPerkSelections[grantPerk]) {
      list.push(subPerkSelections[grantPerk]);
    }
  }
  return list;
};

export const calcMech = (m, activePerks = []) => {
  const wc = WC[m.weightClass];
  const armor = m.armor;
  const structure = m.structure;

  // Perk flags
  const hasHardpoint  = activePerks.includes('Advanced Hardpoint Design');
  const hasTopEnd     = activePerks.includes('Top End Hardware');
  const hasMateriel   = activePerks.includes('Materiel Stockpiles');

  // Materiel Stockpiles: reinforcing costs 1t per step instead of 2t.
  // Stripping always refunds 2t per step regardless.
  // Ton cost of armor/structure is base + reinforced-above-base * factor.
  const reinforceFactor = hasMateriel ? 0.5 : 1.0;
  const armorBase = wc.baseArmor;
  const structBase = wc.baseStructure;
  const armorTons = armor <= armorBase
    ? armor
    : armorBase + (armor - armorBase) * reinforceFactor;
  const structureTons = structure <= structBase
    ? structure
    : structBase + (structure - structBase) * reinforceFactor;

  let weaponsTons = 0, weaponsSlots = 0;
  m.weapons.forEach(w => {
    const def = findWeapon(w.name);
    if (!def) return;
    weaponsTons += totalWeaponCost(def, m.weightClass, w.count);
    const slotsPerCopy = def.traits && def.traits.toLowerCase().includes('bulky') ? 2 : 1;
    weaponsSlots += w.count * slotsPerCopy;
  });
  let upgradesTons = 0, upgradesSlots = 0;
  m.upgrades.forEach(uName => {
    const def = UPGRADES.find(x => x.name === uName);
    if (!def) return;
    const c = valForClass(def.cost, m.weightClass);
    if (c !== '-' && c != null) upgradesTons += Number(c);
    if (!def.compact) upgradesSlots += 1;
  });
  let defensiveTons = 0, defensiveArmorBonus = 0;
  m.defensive.forEach(dName => {
    const def = DEFENSIVE.find(x => x.name === dName);
    if (!def) return;
    const c = valForClass(def.cost, m.weightClass);
    if (c !== '-' && c != null) defensiveTons += Number(c);
    if (def.mod && def.mod.armor) defensiveArmorBonus += def.mod.armor;
  });

  const totalUsed = armorTons + structureTons + weaponsTons + upgradesTons + defensiveTons;
  const totalSlotsUsed = weaponsSlots + upgradesSlots;
  const capTons  = wc.tons  + (hasTopEnd    ? 2 : 0);
  const capSlots = wc.slots + (hasHardpoint ? 1 : 0);

  return {
    armor, structure, armorTons, structureTons,
    weaponsTons, weaponsSlots, upgradesTons, upgradesSlots,
    defensiveTons, defensiveArmorBonus,
    effectiveArmor: armor + defensiveArmorBonus,
    totalUsed, totalSlotsUsed,
    overTons:  totalUsed      > capTons,
    overSlots: totalSlotsUsed > capSlots,
    capTons, capSlots,
    hasMateriel, hasTopEnd, hasHardpoint,
    reinforceCost: hasMateriel ? 1 : 2,
  };
};

export const newMech = (cls = 'Light', name = '', description = '') => ({
  id: crypto.randomUUID(),
  name,
  description,
  weightClass: cls,
  armor: WC[cls].baseArmor,
  structure: WC[cls].baseStructure,
  weapons: [],
  upgrades: [],
  defensive: [],
  drones: {},   // { 'Drone Name': 'Weapon or Upgrade Name' }
});

export const resetMechToClass = (m, cls) => ({
  ...m,
  weightClass: cls,
  armor: WC[cls].baseArmor,
  structure: WC[cls].baseStructure,
  weapons: [],
  upgrades: [],
  defensive: [],
  drones: {},   // { 'Drone Name': 'Weapon or Upgrade Name' }
});

// ---- Team eligibility ----
// Pragmatic checker: weight class, required upgrades/defensive, weapon constraints.
// Returns counts per requirement and whether minimums are met.

const clsMatch = (cls, weightClass) => {
  if (cls === 'Any HE-V') return true;
  // Verbatim PDF wording for Coordinated Assets Team: synonym for any HE-V.
  if (cls === 'Light, Medium, Heavy, or Ultraheavy HE-Vs') return true;
  if (cls === 'Medium or Heavy') return weightClass === 'Medium' || weightClass === 'Heavy';
  if (cls === 'UL HE-V or Assault Vehicle Squadron') return false;
  return cls === weightClass;
};

export const checkMechAgainstReq = (m, req) => {
  if (!clsMatch(req.cls, m.weightClass)) return false;

  if (req.needs) {
    if (req.needsAny) {
      // needsAny: mech must have AT LEAST ONE of the listed items (weapon, upgrade, or defensive config)
      const hasAny = req.needs.some(n =>
        m.upgrades.includes(n) ||
        m.defensive.includes(n) ||
        m.weapons.some(w => w.name === n)
      );
      if (!hasAny) return false;
    } else {
      // default: mech must have ALL of the listed items
      for (const n of req.needs) {
        const has =
          m.upgrades.includes(n) ||
          m.defensive.includes(n) ||
          m.weapons.some(w => w.name === n);
        if (!has) return false;
      }
    }
  }
  if (req.needsDefensive && m.defensive.length === 0) return false;

  if (req.melee) {
    const hasMelee = m.weapons.some(w => MELEE.find(x => x.name === w.name));
    if (!hasMelee) return false;
  }
  if (req.noReach) {
    const hasReach = m.weapons.some(w => {
      const def = MELEE.find(x => x.name === w.name);
      return def && /Reach/i.test(def.traits);
    });
    if (hasReach) return false;
  }
  if (req.noDup) {
    const seen = new Set();
    for (const w of m.weapons) {
      if (seen.has(w.name)) return false;
      seen.add(w.name);
    }
  }
  if (req.shortMeleeOnly) {
    const allOk = m.weapons.every(w => {
      const def = findWeapon(w.name);
      if (!def) return true;
      return /Short|Melee/i.test(def.traits);
    });
    if (!allOk) return false;
  }
  if (req.noBlast) {
    const hasBlast = m.weapons.some(w => {
      const def = findWeapon(w.name);
      return def && /Blast/i.test(def.traits);
    });
    if (hasBlast) return false;
  }

  if (req.reinforced) {
    const wc = WC[m.weightClass];
    if (m.armor <= wc.baseArmor && m.structure <= wc.baseStructure) return false;
  }
  if (req.stripped) {
    const wc = WC[m.weightClass];
    if (m.armor >= wc.baseArmor || m.structure >= wc.baseStructure) return false;
  }
  if (req.noStripped) {
    const wc = WC[m.weightClass];
    if (m.armor < wc.baseArmor || m.structure < wc.baseStructure) return false;
  }
  if (req.hasDrone) {
    if (!m.drones || Object.keys(m.drones).length === 0) return false;
  }
  return true;
};

// Human-readable list of what a mech is MISSING to satisfy one req row.
// Assumes the row's class already matches (caller checks clsMatch). Returns
// [] when the mech fully satisfies the row.
const missingForReq = (m, req) => {
  const miss = [];
  const have = n => m.upgrades.includes(n) || m.defensive.includes(n) || m.weapons.some(w => w.name === n);
  if (req.needs) {
    if (req.needsAny) {
      if (!req.needs.some(have)) miss.push(`one of: ${req.needs.join(', ')}`);
    } else {
      req.needs.forEach(n => { if (!have(n)) miss.push(n); });
    }
  }
  if (req.needsDefensive && m.defensive.length === 0) miss.push('a Defensive Config');
  if (req.melee && !m.weapons.some(w => MELEE.find(x => x.name === w.name))) miss.push('a Melee weapon');
  if (req.noReach && m.weapons.some(w => { const d = MELEE.find(x => x.name === w.name); return d && /Reach/i.test(d.traits); }))
    miss.push('remove Reach weapon');
  if (req.noDup) { const seen = new Set(); for (const w of m.weapons) { if (seen.has(w.name)) { miss.push('remove duplicate weapon'); break; } seen.add(w.name); } }
  if (req.shortMeleeOnly && !m.weapons.every(w => { const d = findWeapon(w.name); return !d || /Short|Melee/i.test(d.traits); }))
    miss.push('only Short/Melee weapons');
  if (req.noBlast && m.weapons.some(w => { const d = findWeapon(w.name); return d && /Blast/i.test(d.traits); }))
    miss.push('remove Blast weapon');
  if (req.reinforced) { const wc = WC[m.weightClass]; if (m.armor <= wc.baseArmor && m.structure <= wc.baseStructure) miss.push('reinforce Armor or Structure'); }
  if (req.stripped) { const wc = WC[m.weightClass]; if (!(m.armor < wc.baseArmor && m.structure < wc.baseStructure)) miss.push('strip Armor & Structure'); }
  if (req.noStripped) { const wc = WC[m.weightClass]; if (m.armor < wc.baseArmor || m.structure < wc.baseStructure) miss.push('must not be Stripped'); }
  if (req.hasDrone && (!m.drones || Object.keys(m.drones).length === 0)) miss.push('an AI Drone');
  return miss;
};

// For a mech + team: can this mech's weight CLASS ever fill a row in this team,
// and if so what's the closest-to-qualifying row + what it still needs.
//   classOk false  → wrong weight class; can never join this team.
//   classOk true, missing []      → fully qualifies.
//   classOk true, missing [..]     → eligible class but needs the listed gear.
export const teamFitForMech = (m, team) => {
  if (!team || !Array.isArray(team.req)) return { classOk: false, reqIdx: -1, missing: [] };
  const rows = team.req
    .map((req, i) => ({ req, i }))
    .filter(({ req }) => req.cls !== 'UL HE-V or Assault Vehicle Squadron' && clsMatch(req.cls, m.weightClass));
  if (!rows.length) return { classOk: false, reqIdx: -1, missing: [] };
  let best = null;
  for (const { req, i } of rows) {
    const missing = missingForReq(m, req);
    if (!best || missing.length < best.missing.length) best = { classOk: true, reqIdx: i, missing };
    if (best.missing.length === 0) break;
  }
  return best;
};

// Weight-class labels a team will accept (for "wrong class" messaging).
export const teamAcceptedClasses = (team) =>
  [...new Set((team?.req || [])
    .filter(r => r.cls !== 'UL HE-V or Assault Vehicle Squadron')
    .map(r => r.cls))];

// Given a mech and a team definition, return the first req row index this
// mech satisfies, or -1 if none. Used to flag assigned HE-V chips with a
// qualification badge so the player gets visible confirmation that the
// unit they dropped into the team actually counts toward its requirements.
export const mechQualifiesForTeam = (mech, team) => {
  if (!team || !Array.isArray(team.req)) return -1;
  for (let i = 0; i < team.req.length; i++) {
    const req = team.req[i];
    // Skip support-asset slots; those don't apply to HE-Vs.
    if (req.cls === 'UL HE-V or Assault Vehicle Squadron') continue;
    if (checkMechAgainstReq(mech, req)) return i;
  }
  return -1;
};

const SUPPORT_TEAM_SLOTS = ['UL HE-V or Assault Vehicle Squadron'];
const SUPPORT_SLOT_NAMES = ['UL HE-V Squadron', 'Assault Vehicle Squadron'];

export const checkTeamEligibility = (team, mechs, supportAssets = []) => {
  let totalEligible = 0;
  let minsMet = true;
  const perReq = team.req.map(req => {
    if (req.cls === 'UL HE-V or Assault Vehicle Squadron') {
      const matching = supportAssets.filter(n => SUPPORT_SLOT_NAMES.includes(n));
      const count = Math.min(matching.length, req.max);
      totalEligible += count;
      if (req.min > 0 && matching.length < req.min) minsMet = false;
      return { req, count, total: matching.length, supportSlot: true };
    }
    // checkMechAgainstReq now handles 'Any HE-V', 'Medium or Heavy', etc. via clsMatch
    const matching = mechs.filter(m => checkMechAgainstReq(m, req));
    const count = Math.min(matching.length, req.max);
    totalEligible += count;
    if (req.min > 0 && matching.length < req.min) minsMet = false;
    return { req, count, total: matching.length };
  });
  return { eligible: totalEligible, minsMet, perReq };
};

// Used per mission to figure out which team-band slots are free given selected teams.
export const slotsForBand = (mission, selectedTeams, teamsData) => {
  const result = { ...mission.teamCounts };
  selectedTeams.forEach(name => {
    const t = teamsData.find(td => td.name === name);
    if (!t) return;
    if (result[t.band] > 0) result[t.band] -= 1;
  });
  return result;
};

// Returns team names a single mech qualifies for (as an individual slot filler).
// A mech qualifies if it satisfies at least one non-support req row in the team.
export const teamsForMech = (mech, teams) => {
  return teams
    .filter(team =>
      team.req.some(req =>
        req.cls !== 'UL HE-V or Assault Vehicle Squadron' &&
        checkMechAgainstReq(mech, req)
      )
    )
    .map(team => team.name);
};
