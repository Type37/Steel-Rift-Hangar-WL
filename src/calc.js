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

export const calcMech = (m) => {
  const wc = WC[m.weightClass];
  const armor = m.armor;
  const structure = m.structure;
  let weaponsTons = 0, weaponsSlots = 0;
  m.weapons.forEach(w => {
    const def = findWeapon(w.name);
    if (!def) return;
    weaponsTons += totalWeaponCost(def, m.weightClass, w.count);
    weaponsSlots += w.count;
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
  const totalUsed = armor + structure + weaponsTons + upgradesTons + defensiveTons;
  const totalSlotsUsed = weaponsSlots + upgradesSlots;
  return {
    armor, structure, weaponsTons, weaponsSlots, upgradesTons, upgradesSlots,
    defensiveTons, defensiveArmorBonus,
    effectiveArmor: armor + defensiveArmorBonus,
    totalUsed, totalSlotsUsed,
    overTons: totalUsed > wc.tons,
    overSlots: totalSlotsUsed > wc.slots,
    capTons: wc.tons,
    capSlots: wc.slots,
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
});

export const resetMechToClass = (m, cls) => ({
  ...m,
  weightClass: cls,
  armor: WC[cls].baseArmor,
  structure: WC[cls].baseStructure,
  weapons: [],
  upgrades: [],
  defensive: [],
});

// ---- Team eligibility ----
// Pragmatic checker: weight class, required upgrades/defensive, weapon constraints.
// Returns counts per requirement and whether minimums are met.

const checkMechAgainstReq = (m, req) => {
  if (req.cls !== 'Any HE-V' && req.cls !== m.weightClass) {
    if (req.cls === 'UL HE-V or Assault Vehicle Squadron') return false;
    if (m.weightClass !== req.cls) return false;
  }

  if (req.needs) {
    for (const n of req.needs) {
      const has = m.upgrades.includes(n) || m.defensive.includes(n);
      if (!has) return false;
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
  if (req.noDup) {
    const dup = m.weapons.some(w => w.count > 1);
    if (dup) return false;
  }
  if (req.reinforced) {
    const wc = WC[m.weightClass];
    if (m.armor <= wc.baseArmor && m.structure <= wc.baseStructure) return false;
  }
  if (req.stripped) {
    const wc = WC[m.weightClass];
    if (m.armor >= wc.baseArmor || m.structure >= wc.baseStructure) return false;
  }
  return true;
};

export const checkTeamEligibility = (team, mechs) => {
  let totalEligible = 0;
  let minsMet = true;
  const perReq = team.req.map(req => {
    if (req.cls === 'UL HE-V or Assault Vehicle Squadron') {
      // Not modeled in detail; flag as 0 and skip the min check
      return { req, count: 0 };
    }
    let matching;
    if (req.cls === 'Any HE-V') {
      matching = mechs.filter(m => checkMechAgainstReq(m, { ...req, cls: m.weightClass }));
    } else {
      matching = mechs.filter(m => checkMechAgainstReq(m, req));
    }
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
// Used for roster badge display. Pass the full mechs array for noDup checks.
export const teamsForMech = (mech, mechs, teams) => {
  const qualifying = [];
  for (const team of teams) {
    for (const req of team.req) {
      if (req.cls === 'UL HE-V or Assault Vehicle Squadron') continue;
      const clsMatch = req.cls === 'Any HE-V' || req.cls === mech.weightClass || req.cls === 'Medium or Heavy';
      if (!clsMatch) continue;
      // Use the existing per-mech checker with a tweaked req
      const effReq = req.cls === 'Medium or Heavy'
        ? { ...req, cls: mech.weightClass }
        : req;
      // Import checkMechAgainstReq is private; re-check inline
      let pass = true;
      if (effReq.cls !== 'Any HE-V' && effReq.cls !== mech.weightClass) pass = false;
      if (pass && effReq.needs) {
        for (const n of effReq.needs) {
          if (!mech.upgrades.includes(n) && !mech.defensive.includes(n)) { pass = false; break; }
        }
      }
      if (pass && effReq.needsDefensive && mech.defensive.length === 0) pass = false;
      if (pass && effReq.melee) {
        const { MELEE } = require ? {} : {};
        const hasMelee = mech.weapons.some(w => w.name && /Blade|Claw|Fist|Slam|Cleaver|Hammer|Spike|Talon|Punch|Strike|Sweep|Crush|Stomp|Melee/i.test(w.name));
        if (!hasMelee) pass = false;
      }
      if (pass) { qualifying.push(team.name); break; }
    }
  }
  return qualifying;
};
