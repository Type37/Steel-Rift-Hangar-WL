import {SIZE_HEAVY, SIZE_LIGHT, SIZE_MEDIUM, SIZE_ULTRA} from './unit-sizes.js';
import {
    TRAIT_ANTI_AIR,
    TRAIT_AP,
    TRAIT_BLAST,
    TRAIT_BULKY,
    TRAIT_CONCUSSIVE,
    TRAIT_DISRUPTIVE,
    TRAIT_DRAG,
    TRAIT_DRAINING,
    TRAIT_FLAK,
    TRAIT_FRAG,
    TRAIT_KINETIC,
    TRAIT_LIGHT,
    TRAIT_LIMITED,
    TRAIT_MELEE,
    TRAIT_PARRY,
    TRAIT_REACH,
    TRAIT_SHORT,
    TRAIT_SMART,
    TRAIT_STAGGER,
    TRAIT_TETHER,
} from './weapon-traits.js';
import {makeFrozenStaticListIds, trait} from './data-helpers.js';
import {find, groupBy} from 'es-toolkit/compat';

export const AUTO_CANNON = 'AUTO_CANNON';
export const HOWITZER = 'HOWITZER';
export const LASER = 'LASER';
export const MELEE_WEAPON = 'MELEE_WEAPON';
export const MISSILES = 'MISSILES';
export const PARTICLE_CANNON = 'PARTICLE_CANNON';
export const RAIL_GUN = 'RAIL_GUN';
export const ROCKET_PACK = 'ROCKET_PACK';
export const ROTARY_CANNON = 'ROTARY_CANNON';
export const SHOT_CANNON = 'SHOT_CANNON';
export const SUBMUNITIONS = 'SUBMUNITIONS';
export const ARC_GUN = 'ARC_GUN';
export const COMBAT_BLADE = 'COMBAT_BLADE';
export const DEMOLITION_CUTTER = 'DEMOLITION_CUTTER';
export const HARPOON_GUN = 'HARPOON_GUN';
export const IMPACT_HAMMER = 'IMPACT_HAMMER';
export const MAG_TETHER = 'MAG_TETHER';
export const MASS_TETSUBO = 'MASS_TETSUBO';
export const MEGA_GLAIVE = 'MEGA_GLAIVE';
export const PLASMA_BLADE = 'PLASMA_BLADE';
export const PULSE_SALVO = 'PULSE_SALVO';
export const SHOCK_NET = 'SHOCK_NET';
export const AA_CANNON = 'AA_CANNON';
export const AA_MISSILES = 'AA_MISSILES';
export const CLUSTER_ROCKETS = 'CLUSTER_ROCKETS';

export const MECH_WEAPONS = makeFrozenStaticListIds({
    [AUTO_CANNON]: makeWeapon({
        display_name: 'Auto-Cannon',
        damage_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
        traits: [
            trait(TRAIT_KINETIC),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
    }),
    [HOWITZER]: makeWeapon({
        display_name: 'Howitzer',
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_SMART),
            trait(TRAIT_BLAST, 3),
            trait(TRAIT_KINETIC),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
    }),
    [LASER]: makeWeapon({
        display_name: 'Laser',
        damage: 2,
        traits: [
            trait(TRAIT_DRAINING),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_AP, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_AP, 1)],
            [SIZE_HEAVY]: [trait(TRAIT_AP, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_AP, 3)],
        },
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 7,
        },
    }),
    [MELEE_WEAPON]: makeWeapon({
        display_name: 'Melee Weapon',
        damage: 0,
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 1)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 2)],
        },
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 3,
            [SIZE_ULTRA]: 4,
        },
    }),
    [MISSILES]: makeWeapon({
        display_name: 'Missiles',
        damage: 0,
        damage_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 7,
        },
        traits: [
            trait(TRAIT_SMART),
            trait(TRAIT_LIMITED, 3),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
    }),
    [PARTICLE_CANNON]: makeWeapon({
        display_name: 'Particle Cannon',
        damage: 0,
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 8,
        },
        traits: [
            trait(TRAIT_SHORT, 18),
            trait(TRAIT_DRAINING),
            trait(TRAIT_DISRUPTIVE),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
    }),
    [RAIL_GUN]: makeWeapon({
        display_name: 'Rail Gun',
        damage: 1,
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_KINETIC),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_AP, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_AP, 1)],
            [SIZE_HEAVY]: [trait(TRAIT_AP, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_AP, 3)],
        },
    }),
    [ROCKET_PACK]: makeWeapon({
        display_name: 'Rocket Pack',
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 7,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_BLAST, 3),
            trait(TRAIT_LIMITED, 3),
        ],
    }),
    [ROTARY_CANNON]: makeWeapon({
        display_name: 'Rotary Cannon',
        damage_by_size: {
            [SIZE_LIGHT]: 6,
            [SIZE_MEDIUM]: 9,
            [SIZE_HEAVY]: 12,
            [SIZE_ULTRA]: 15,
        },
        traits: [
            trait(TRAIT_SHORT, 12),
            trait(TRAIT_LIGHT),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 8,
        },
    }),
    [SHOT_CANNON]: makeWeapon({
        display_name: 'Shot Cannon',
        damage_by_size: {
            [SIZE_LIGHT]: 6,
            [SIZE_MEDIUM]: 9,
            [SIZE_HEAVY]: 11,
            [SIZE_ULTRA]: 13,
        },
        traits: [
            trait(TRAIT_SHORT, 6),
            trait(TRAIT_LIGHT),
            trait(TRAIT_FRAG),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
    }),
    [SUBMUNITIONS]: makeWeapon({
        display_name: 'Submunitions',
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_SHORT, 6),
            trait(TRAIT_FLAK),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 3,
            [SIZE_ULTRA]: 4,
        },
    }),
    [ARC_GUN]: makeWeapon({
        display_name: 'Arc Gun',
        damage_by_size: {
            [SIZE_LIGHT]: 6,
        },
        traits: [
            trait(TRAIT_LIGHT),
            trait(TRAIT_SHORT, 6),
            trait(TRAIT_STAGGER),
        ],
        cost: 2,
        limited_size_ids: [SIZE_LIGHT],
    }),
    [COMBAT_BLADE]: makeWeapon({
        display_name: 'Combat Blade',
        damage: 0,
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_PARRY),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 1)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 2)],
        },
    }),
    [DEMOLITION_CUTTER]: makeWeapon({
        display_name: 'Demolition Cutter',
        damage: 0,
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 1), trait(TRAIT_AP, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 1), trait(TRAIT_AP, 2)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 2), trait(TRAIT_AP, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 2), trait(TRAIT_AP, 3)],
        },
    }),
    [HARPOON_GUN]: makeWeapon({
        display_name: 'Harpoon Gun',
        damage: 6,
        cost: 7,
        traits: [
            trait(TRAIT_SHORT, 12),
            trait(TRAIT_DRAG),
            trait(TRAIT_TETHER),
        ],
        limited_size_ids: [SIZE_ULTRA],
    }),
    [IMPACT_HAMMER]: makeWeapon({
        display_name: 'Impact Hammer',
        damage: 0,
        slots: 2,
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
        traits: [
            trait(TRAIT_BULKY),
            trait(TRAIT_CONCUSSIVE, 4),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 2)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 2)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 3)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 3)],
        },
    }),
    [MAG_TETHER]: makeWeapon({
        display_name: 'Mag Tether',
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
        traits: [
            trait(TRAIT_SHORT, 12),
            trait(TRAIT_TETHER),
        ],
    }),
    [MASS_TETSUBO]: makeWeapon({
        display_name: 'Mass Tetsubo',
        damage: 0,
        slots: 2,
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
        traits: [
            trait(TRAIT_BULKY),
            trait(TRAIT_CONCUSSIVE, 2),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 2)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 2), trait(TRAIT_REACH, 1)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 3), trait(TRAIT_REACH, 1)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 3), trait(TRAIT_REACH, 2)],
        },
    }),
    [MEGA_GLAIVE]: makeWeapon({
        display_name: 'Mega Glaive',
        damage: 0,
        slots: 2,
        cost_by_size: {
            [SIZE_LIGHT]: 4,
            [SIZE_MEDIUM]: 5,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 7,
        },
        traits: [
            trait(TRAIT_BULKY),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 3), trait(TRAIT_REACH, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 3), trait(TRAIT_REACH, 2)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 4), trait(TRAIT_REACH, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 4), trait(TRAIT_REACH, 3)],
        },
    }),
    [PLASMA_BLADE]: makeWeapon({
        display_name: 'Plasma Blade',
        damage: 0,
        cost_by_size: {
            [SIZE_LIGHT]: 4,
            [SIZE_MEDIUM]: 5,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 7,
        },
        traits: [
            trait(TRAIT_DISRUPTIVE),
        ],
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_MELEE, 2), trait(TRAIT_AP, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_MELEE, 2), trait(TRAIT_AP, 2)],
            [SIZE_HEAVY]: [trait(TRAIT_MELEE, 3), trait(TRAIT_AP, 2)],
            [SIZE_ULTRA]: [trait(TRAIT_MELEE, 3), trait(TRAIT_AP, 3)],
        },
    }),
    [PULSE_SALVO]: makeWeapon({
        display_name: 'Pulse Salvo',
        damage: 0,
        damage_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 8,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_LIMITED, 2),
            trait(TRAIT_DISRUPTIVE),
        ],
    }),
    [SHOCK_NET]: makeWeapon({
        display_name: 'Shock Net',
        damage: 0,
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 6,
        },
        traits: [
            trait(TRAIT_MELEE, 1),
            trait(TRAIT_STAGGER),
            trait(TRAIT_TETHER),
        ],
    }),
    [AA_CANNON]: makeWeapon({
        display_name: 'AA Cannon',
        damage_by_size: {
            [SIZE_LIGHT]: 5,
            [SIZE_MEDIUM]: 8,
            [SIZE_HEAVY]: 11,
            [SIZE_ULTRA]: 13,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 5,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 8,
        },
        traits: [
            trait(TRAIT_ANTI_AIR),
            trait(TRAIT_FLAK),
            trait(TRAIT_LIGHT),
            trait(TRAIT_SHORT, 24),
        ],
    }),
    [AA_MISSILES]: makeWeapon({
        display_name: 'AA Missiles',
        damage_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 5,
            [SIZE_HEAVY]: 7,
            [SIZE_ULTRA]: 9,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        traits: [
            trait(TRAIT_ANTI_AIR),
            trait(TRAIT_LIGHT),
            trait(TRAIT_SMART),
            trait(TRAIT_LIMITED, 2),
        ],
    }),
    [CLUSTER_ROCKETS]: makeWeapon({
        display_name: 'Cluster Rockets',
        damage_by_size: {
            [SIZE_LIGHT]: 4,
            [SIZE_MEDIUM]: 8,
            [SIZE_HEAVY]: 11,
            [SIZE_ULTRA]: 15,
        },
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 6,
            [SIZE_ULTRA]: 8,
        },
        traits: [
            trait(TRAIT_BLAST, 3),
            trait(TRAIT_LIGHT),
            trait(TRAIT_LIMITED, 2),
        ],
    }),
});

function makeWeapon({
                        display_name,
                        damage,
                        damage_by_size,
                        traits,
                        traits_by_size,
                        slots,
                        cost,
                        cost_by_size,
                        limited_size_ids,
                    }) {

    traits = traits || [];

    if (!cost_by_size) {
        cost_by_size = {
            [SIZE_LIGHT]: cost,
            [SIZE_MEDIUM]: cost,
            [SIZE_HEAVY]: cost,
            [SIZE_ULTRA]: cost,
        };
    }

    if (!traits_by_size) {
        traits_by_size = {
            [SIZE_LIGHT]: [],
            [SIZE_MEDIUM]: [],
            [SIZE_HEAVY]: [],
            [SIZE_ULTRA]: [],
        };
    }

    traits_by_size[SIZE_LIGHT] = traits_by_size[SIZE_LIGHT].concat(traits);
    traits_by_size[SIZE_MEDIUM] = traits_by_size[SIZE_MEDIUM].concat(traits);
    traits_by_size[SIZE_HEAVY] = traits_by_size[SIZE_HEAVY].concat(traits);
    traits_by_size[SIZE_ULTRA] = traits_by_size[SIZE_ULTRA].concat(traits);

    if (!damage_by_size) {
        damage_by_size = {
            [SIZE_LIGHT]: damage,
            [SIZE_MEDIUM]: damage,
            [SIZE_HEAVY]: damage,
            [SIZE_ULTRA]: damage,
        };
    }
    let range = getRangeFromShortTrait(traits);

    if (slots === undefined) {
        slots = 1;
    }

    limited_size_ids = limited_size_ids || [];

    return {
        display_name,
        damage_by_size,
        traits_by_size,
        cost_by_size,
        range,
        slots,
        limited_size_ids,
    };
}

export function getRangeFromShortTrait(traits) {
    let range = null;
    if (traits) {
        const result = find(traits, {id: TRAIT_SHORT});
        if (result) {
            range = result.number;
        }
    }
    return range;
}

export const MECH_WEAPONS_BY_TYPE = groupBy(
    Object.keys(MECH_WEAPONS),
    (weaponId) => {
        if (weaponHasTrait(weaponId, TRAIT_MELEE)) {
            return 'melee';
        }

        return 'ranged';
    },
);

export function weaponHasTrait(weaponId, traitId) {
    const weapon = MECH_WEAPONS[weaponId];
    const sizes = Object.keys(weapon.traits_by_size);

    return sizes.find(sizeId => {
        return find(weapon.traits_by_size[sizeId], {id: traitId});
    });
}
