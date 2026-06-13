// Pre-built starter forces from the boxed sets.
// These are loaded via the Lists modal. Mechs have no `id` — instantiateStarterList()
// generates them at load time.

import { TEAMS, WC } from './data';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
const asset = (p) => `${BASE}${p.replace(/^\//, '')}`;

export const STARTER_LISTS = [
  // ── AUTHORITY ──────────────────────────────────────────────────────────────
  // Protectivist / Strategic Energy Reserves · Battle 200t
  // Berserker Team (4-mech) + recon Light
  {
    id: 'authority',
    label: 'Authority Starter',
    faction: 'Authorities',
    perks: ['Protectivist', 'Strategic Energy Reserves'],
    mission: 'Battle',
    supportAssets: ['Orbital Laser', 'Mass Driver'],
    mechs: [
      { _team: 0, name: 'HE-V 01', weightClass: 'Medium',
        weapons: [{ name: 'Combat Blade', count: 1 }],
        upgrades: ['Combat Shield', 'Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 02', weightClass: 'Medium',
        weapons: [{ name: 'Plasma Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: ['Extra Plating'], drones: {} },
      { _team: 0, name: 'HE-V 03', weightClass: 'Heavy',
        weapons: [{ name: 'Mega Glaive', count: 1 }],
        upgrades: ['Nitro Boost', 'Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 04', weightClass: 'Ultraheavy',
        weapons: [{ name: 'Mega Glaive', count: 1 }],
        upgrades: ['Combat Shield', 'Directional Thruster', 'High Speed Servos', 'Jump Jets', 'Nitro Boost'],
        defensive: ['Heavy Plating'], drones: {} },
      { name: 'HE-V 05', weightClass: 'Light',
        weapons: [],
        upgrades: ['Jump Jets', 'Optic Camouflage', 'Target Designator'],
        defensive: ['Extra Plating'], drones: {} },
    ],
    teams: [
      { teamName: 'Berserker Team', mechIndices: [0, 1, 2, 3] },
    ],
  },

  // ── FREELANCE ──────────────────────────────────────────────────────────────
  // Covered Advances (Auth) / Advanced Energy Management Systems (Corp) · Battle 200t
  // Gunslinger Team (4-mech) + missile Heavy + recon Light
  {
    id: 'freelance',
    label: 'Freelance Starter',
    faction: 'Freelancers',
    perks: ['Covered Advances', 'Advanced Energy Management Systems'],
    mission: 'Battle',
    supportAssets: ['Orbital Laser'],
    mechs: [
      { _team: 0, name: 'HE-V 01', weightClass: 'Light',
        weapons: [{ name: 'Arc Gun', count: 1 }, { name: 'Shot Cannon', count: 1 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 02', weightClass: 'Medium',
        weapons: [{ name: 'Basic Melee Weapon', count: 1 }, { name: 'Mag Tether', count: 1 }, { name: 'Rotary Cannon', count: 1 }],
        upgrades: ['Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 03', weightClass: 'Medium',
        weapons: [{ name: 'Shot Cannon', count: 2 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 04', weightClass: 'Heavy',
        weapons: [{ name: 'Plasma Blade', count: 1 }, { name: 'Rotary Cannon', count: 1 }, { name: 'Shot Cannon', count: 1 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { name: 'HE-V 05', weightClass: 'Heavy',
        weapons: [{ name: 'Missiles', count: 2 }, { name: 'Rocket Pack', count: 2 }],
        upgrades: [],
        defensive: [], drones: {} },
      { name: 'HE-V 06', weightClass: 'Light',
        weapons: [{ name: 'Submunitions', count: 1 }],
        upgrades: ['Jump Jets', 'Optic Camouflage', 'Target Designator'],
        defensive: [], drones: {} },
    ],
    teams: [
      { teamName: 'Gunslinger Team', mechIndices: [0, 1, 2, 3] },
    ],
  },

  // ── CERBERUS ───────────────────────────────────────────────────────────────
  // Freelance Gunslinger Team box · 4 mechs (Chesty Light, 2× Ermey Medium, Zuma Heavy)
  {
    id: 'cerberus',
    label: 'Cerberus Gunslinger Team',
    faction: 'Freelancers',
    perks: [],
    mission: 'Battle',
    supportAssets: [],
    factionLogoFile: 'faction-logos/freelancers/cerberus-group.png',
    mechs: [
      { _team: 0, name: 'Chesty', weightClass: 'Light',
        weapons: [{ name: 'Arc Gun', count: 1 }, { name: 'Shot Cannon', count: 1 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'Ermey 1', weightClass: 'Medium',
        weapons: [{ name: 'Basic Melee Weapon', count: 1 }, { name: 'Mag Tether', count: 1 }, { name: 'Rotary Cannon', count: 1 }],
        upgrades: ['Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'Ermey 2', weightClass: 'Medium',
        weapons: [{ name: 'Shot Cannon', count: 2 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'Zuma', weightClass: 'Heavy',
        weapons: [{ name: 'Plasma Blade', count: 1 }, { name: 'Rotary Cannon', count: 1 }, { name: 'Shot Cannon', count: 1 }],
        upgrades: ['Coolant Tanks', 'Haptic Suit', 'Jump Jets'],
        defensive: [], drones: {} },
    ],
    teams: [
      { teamName: 'Gunslinger Team', mechIndices: [0, 1, 2, 3] },
    ],
  },

  // ── AKAMATSU ───────────────────────────────────────────────────────────────
  // Akamatsu Assassination Team box · 4 mechs (2 Light Haro, 2 Medium Kenshiro)
  {
    id: 'akamatsu',
    label: 'Akamatsu Assassination Team',
    faction: 'Corporations',
    perks: [],
    mission: 'Battle',
    supportAssets: [],
    factionLogoFile: 'faction-logos/corporations/akamatsu.png',
    mechs: [
      { _team: 0, name: 'Haro 1', weightClass: 'Light',
        weapons: [{ name: 'Combat Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'Haro 2', weightClass: 'Light',
        weapons: [{ name: 'Combat Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'Kenshiro 1', weightClass: 'Medium',
        weapons: [{ name: 'Plasma Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: ['Extra Plating'], drones: {} },
      { _team: 0, name: 'Kenshiro 2', weightClass: 'Medium',
        weapons: [{ name: 'Plasma Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: ['Extra Plating'], drones: {} },
    ],
    teams: [
      { teamName: 'Assassination Team', mechIndices: [0, 1, 2, 3] },
    ],
  },

  // ── CORPORATE ──────────────────────────────────────────────────────────────
  // Embedded Informants / Outrageous Support Budget · Battle 200t
  // Assassination Team (4-mech) + Heavy brawler + Medium rail
  {
    id: 'corporate',
    label: 'Corporate Starter',
    faction: 'Corporations',
    perks: ['Embedded Informants', 'Outrageous Support Budget'],
    mission: 'Battle',
    supportAssets: ['Orbital Laser', 'Mass Driver'],
    mechs: [
      { _team: 0, name: 'HE-V 01', weightClass: 'Light',
        weapons: [{ name: 'Combat Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 02', weightClass: 'Light',
        weapons: [{ name: 'Combat Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { _team: 0, name: 'HE-V 03', weightClass: 'Medium',
        weapons: [{ name: 'Plasma Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: ['Extra Plating'], drones: {} },
      { _team: 0, name: 'HE-V 04', weightClass: 'Medium',
        weapons: [{ name: 'Plasma Blade', count: 1 }],
        upgrades: ['Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: ['Extra Plating'], drones: {} },
      { name: 'HE-V 05', weightClass: 'Heavy',
        weapons: [{ name: 'Impact Hammer', count: 1 }],
        upgrades: ['Combat Shield', 'Directional Thruster', 'High Speed Servos', 'Jump Jets'],
        defensive: [], drones: {} },
      { name: 'HE-V 06', weightClass: 'Medium',
        weapons: [{ name: 'Rail Gun', count: 3 }],
        upgrades: ['Jump Jets', 'Target Designator'],
        defensive: ['Extra Plating'], drones: {} },
    ],
    teams: [
      { teamName: 'Assassination Team', mechIndices: [0, 1, 2, 3] },
    ],
  },
];

// Convert a starter list definition into a full app state blob ready for onLoad().
// Async so it can fetch the faction logo and convert it to a data URL (matching
// what FactionLogoPicker does), ensuring the logo persists in localStorage.
export async function instantiateStarterList(list) {
  const mechsWithIds = list.mechs.map(({ _team, ...m }) => ({
    ...m,
    id: crypto.randomUUID(),
    armor: WC[m.weightClass].baseArmor,
    structure: WC[m.weightClass].baseStructure,
  }));

  const selectedTeams = [];
  const teamAssignments = {};

  list.teams.forEach(({ teamName, mechIndices }) => {
    // selectedTeams is an array of team NAME strings (matches setSelectedTeams
    // in App.jsx), not team definition objects.
    const def = TEAMS.find(t => t.name === teamName);
    if (def && !selectedTeams.includes(teamName)) selectedTeams.push(teamName);
    // Assignment IDs are namespaced ("hev:<uuid>") so the team picker can tell
    // HE-Vs from support assets and resolve each chip back to its mech.
    teamAssignments[teamName] = mechIndices.map(i => `hev:${mechsWithIds[i].id}`);
  });

  let factionLogo = null;
  if (list.factionLogoFile) {
    try {
      const res = await fetch(asset(list.factionLogoFile));
      const blob = await res.blob();
      factionLogo = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      factionLogo = asset(list.factionLogoFile);
    }
  }

  return {
    forceName: list.label,
    mission: list.mission,
    faction: list.faction,
    perks: list.perks,
    subPerkSelections: {},
    factionLogo,
    mechs: mechsWithIds,
    supportAssets: list.supportAssets || [],
    selectedTeams,
    teamAssignments,
    supportNicknames: {},
    supportLoadouts: {},
    garrisonLoadouts: {},
  };
}
