import {SIZE_HEAVY, SIZE_LIGHT, SIZE_MEDIUM, SIZE_ULTRA} from './unit-sizes.js';
import {makeFrozenStaticListIds, trait} from './data-helpers.js';
import {
    TRAIT_COMPACT,
    TRAIT_DASH,
    TRAIT_UPGRADE_LIMITED,
    UPGRADE_TRAITS,
    upgradeTraitDisplayName,
} from './upgrade-traits.js';

export const ANTI_MISSILE_SYSTEM = 'ANTI_MISSILE_SYSTEM';
export const ELECTRONIC_COUNTERMEASURES = 'ELECTRONIC_COUNTERMEASURES';
export const HEAVY_REACTOR = 'HEAVY_REACTOR';
export const JUMP_JETS = 'JUMP_JETS';
export const MINEFIELD_DRONE_CARRIER_SYSTEM = 'MINEFIELD_DRONE_CARRIER_SYSTEM';
export const MINEFIELD_DRONE_TRACKING_SYSTEM = 'Minefield Drone Tracking Submunitions';
export const OPTIC_CAMO = 'OPTIC_CAMO';
export const TARGET_DESIGNATOR = 'TARGET_DESIGNATOR';
export const COOLANT_TANKS = 'COOLANT_TANKS';
export const DIRECTIONAL_THRUSTER = 'DIRECTIONAL_THRUSTER';
export const HAPTIC_SUIT = 'HAPTIC_SUIT';
export const HIGH_SPEED_SERVOS = 'HIGH_SPEED_SERVOS';
export const NEURAL_INPUT = 'NEURAL_INPUT';
export const NITRO_BOOST = 'NITRO_BOOST';
export const COMBAT_SHIELD = 'COMBAT_SHIELD';
export const TARGETING_SUPPORT_DRONE = 'TARGETING_SUPPORT_DRONE';
export const TACTICAL_AWARENESS_DRONE = 'TACTICAL_AWARENESS_DRONE';
export const MINE_DIRECTOR_DRONE = 'MINE_DIRECTOR_DRONE';

export const MECH_UPGRADES = makeFrozenStaticListIds({
    [ANTI_MISSILE_SYSTEM]: makeUpgrade({
        display_name: 'Anti-Missile System',
        description: 'This Unit may not be Targeted by a Weapon using the Smart trait if that Weapon is using the LoS of another Model.',
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [ELECTRONIC_COUNTERMEASURES]: makeUpgrade({
        display_name: 'Electronic Countermeasures',
        description: 'This Unit may not be targeted by LOCK ON orders.',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 1,
            [SIZE_ULTRA]: 1,
        },
    }),
    [HEAVY_REACTOR]: makeUpgrade({
        display_name: 'Heavy Reactor',
        description: 'When this Unit would take Structure damage from Overdrive or receiving a Redline Marker, roll a D6. On a 4+ this Damage is ignored.',
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [JUMP_JETS]: makeUpgrade({
        display_name: 'Jump Jets',
        description: 'This Unit may perform the JUMP Order.',
        cost_by_size: {
            [SIZE_LIGHT]: 3,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [MINEFIELD_DRONE_CARRIER_SYSTEM]: makeUpgrade({
        display_name: 'Mine Drone Carrier System',
        description: 'This Unit has the Minelayer (MOVE) trait.',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 5,
            [SIZE_ULTRA]: 5,
        },
        traits_by_size: {
            [SIZE_LIGHT]: [trait(TRAIT_UPGRADE_LIMITED, 1)],
            [SIZE_MEDIUM]: [trait(TRAIT_UPGRADE_LIMITED, 2)],
            [SIZE_HEAVY]: [trait(TRAIT_UPGRADE_LIMITED, 3)],
            [SIZE_ULTRA]: [trait(TRAIT_UPGRADE_LIMITED, 3)],
        },
    }),
    [MINEFIELD_DRONE_TRACKING_SYSTEM]: makeUpgrade({
        display_name: 'Mine Drone Tracking Munitions',
        description: 'When making an ENGAGE Order, this Unit may target a Mine Drone Token. The Commander of the Target Mine Drone Token makes Defense Rolls on a 3+. If at least one point of Damage would be inflicted, remove the Token.',
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [OPTIC_CAMO]: makeUpgrade({
        display_name: 'Optic Camouflage',
        description: 'Add +1 to Defense Rolls for this Unit when the Active Unit is outside of 10".',
        cost_by_size: {
            [SIZE_LIGHT]: 5,
            [SIZE_MEDIUM]: 4,
            [SIZE_HEAVY]: 3,
            [SIZE_ULTRA]: 2,
        },
    }),
    [TARGET_DESIGNATOR]: makeUpgrade({
        display_name: 'Target Designator',
        description: 'Once this Unit has completed an Activation, place a Target Designator Marker on it. This Marker may not be placed if this Unit performed a JUMP Order during its Activation. Remove this Marker at the start of the Unit\'s next Activation.',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 1,
            [SIZE_ULTRA]: 1,
        },
    }),
    [COOLANT_TANKS]: makeUpgrade({
        display_name: 'Coolant Tanks',
        description: 'At any point during a turn, this Unit may remove one Redline Marker it currently has. Limited (2).',
        traits: [
            trait(TRAIT_UPGRADE_LIMITED, 2),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [DIRECTIONAL_THRUSTER]: makeUpgrade({
        display_name: 'Directional Thruster',
        description: 'This Unit may be issued the DASH (2) Order.',
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 3,
            [SIZE_ULTRA]: 4,
        },
        traits: [
            trait(TRAIT_DASH, 2),
        ],
    }),
    [HAPTIC_SUIT]: makeUpgrade({
        display_name: 'Haptic Suit',
        description: 'When performing a Return Fire, you may re-roll any dice in the Defense Roll (not just natural 1s).',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 1,
            [SIZE_ULTRA]: 1,
        },
        traits: [
            trait(TRAIT_COMPACT),
        ],
        slots: 0,
    }),
    [HIGH_SPEED_SERVOS]: makeUpgrade({
        display_name: 'High Speed Servos',
        description: 'After performing a SMASH Order, this Unit may perform a second SMASH Order. This does not count against the 2 Order Limit. Note: The second SMASH Order is now preceded by a SMASH Order and not a MOVE or JUMP Order and thus gets no bonuses for those conditions.',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
    }),
    [NEURAL_INPUT]: makeUpgrade({
        display_name: 'Neural Input',
        description: 'Reduce the Damage Rating of SMASH Orders targeting this Unit by 1.',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 1,
            [SIZE_ULTRA]: 1,
        },
        traits: [
            trait(TRAIT_COMPACT),
        ],
        slots: 0,
    }),
    [NITRO_BOOST]: makeUpgrade({
        display_name: 'Nitro Boost',
        description: 'At the beginning of a MOVE Order, you may move an additional 4".',
        traits: [
            trait(TRAIT_UPGRADE_LIMITED, 1),
        ],
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
    }),
    [COMBAT_SHIELD]: makeUpgrade({
        display_name: 'Combat Shield',
        description: 'When this HE-V is damaged by an ENGAGE or SMASH Order from its Front or Side Arcs, or makes a Defense Roll against a Blast effect, and it has more than 0 Armor remaining, roll 1D6 for each point of Damage it would receive. On a 5+, that point of Damage is ignored. Damage negated by this rule is treated as not having happened for the purposes of other weapon Trait effects, such as AP. When this HE-V performs an ENGAGE Order, all of its Weapons receive a -1 to their Damage Rating.',
        cost_by_size: {
            [SIZE_LIGHT]: 0,
            // only available in medium with TEAM_PERK_COMBAT_BUCKLER
            [SIZE_MEDIUM]: 3,
            [SIZE_HEAVY]: 4,
            [SIZE_ULTRA]: 5,
        },
        limited_size_ids: [SIZE_HEAVY, SIZE_ULTRA],
    }),
    [TARGETING_SUPPORT_DRONE]: makeUpgrade({
        display_name: 'Targeting Support Drone',
        description: 'Assign a Weapon on this HE-V to this Drone. When using the Weapon in an ENGAGE Order, this Weapon gains the benefits of having been preceded by a LOCK ON Order. If the Target has Electronic Countermeasures, they prevent the LOCK ON Order benefits.',
        cost: 1,
        slots: 0,
        requires_weapon_assignment: true,
        traits: [
            trait(TRAIT_COMPACT),
        ],
    }),
    [TACTICAL_AWARENESS_DRONE]: makeUpgrade({
        display_name: 'Tactical Awareness Drone',
        description: 'Assign a Weapon on this HE-V to this Drone. When selecting a Unit as a Target with the Weapon, Line of Sight may be drawn from any part of your silhouette, not just the nearest point on the front 180° Arc. This Weapon does not suffer the Secondary Target or Bypass Shot penalties.',
        cost: 1,
        slots: 0,
        requires_weapon_assignment: true,
        traits: [
            trait(TRAIT_COMPACT),
        ],
    }),
    [MINE_DIRECTOR_DRONE]: makeUpgrade({
        display_name: 'Mine Director Drone',
        description: 'Assign a Minefield Drone Carrier System equipped by this HE-V to this Drone. Mine Drone Tokens placed with this HE-V\'s trait may be placed within 6" of the Active Model. Once per turn during this HE-V\'s Activation, one Mine Drone Token within 12" of this HE-V may be placed within 6" of its current position. These abilities may not be used while this HE-V has a Redline Marker.',
        cost: 1,
        slots: 0,
        upgrade_required: [MINEFIELD_DRONE_CARRIER_SYSTEM],
        traits: [
            trait(TRAIT_COMPACT),
        ],
    }),
});

export function upgradeDisplayName(id) {
    return MECH_UPGRADES[id].display_name;
}

export function getUpgradeTraits(upgradeId, sizeId) {

    const upgrade = MECH_UPGRADES[upgradeId];

    let traits = [];
    if (upgrade.traits) {
        traits = upgrade.traits;
    } else if (upgrade.traits_by_size) {
        traits = upgrade.traits_by_size[sizeId] || [];
    }

    return traits.map(({id, number}) => {
        return {
            ...UPGRADE_TRAITS[id],
            number,
            display_name: upgradeTraitDisplayName({id, number}),
        };
    });
}

function makeUpgrade(item) {
    if (!item.cost_by_size) {
        item.cost_by_size = {
            [SIZE_LIGHT]: item.cost,
            [SIZE_MEDIUM]: item.cost,
            [SIZE_HEAVY]: item.cost,
            [SIZE_ULTRA]: item.cost,
        };
    }

    if (item.slots === undefined) {
        item.slots = 1;
    }

    if (!item.limited_size_ids) {
        item.limited_size_ids = [];
    }

    return item;
}