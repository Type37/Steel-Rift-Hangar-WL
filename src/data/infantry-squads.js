import {makeFrozenStaticListIds, trait} from './data-helpers.js';
import {
    INFANTRY_ELECTRO_ARC_PULSERS,
    INFANTRY_HEAVY_MISSILE_LAUNCHER,
    INFANTRY_HEAVY_RIFLES,
    INFANTRY_MISSILE_LAUNCHER,
    INFANTRY_RIFLES,
} from './unit-weapons.js';
import {
    TRAIT_ALL_TERRAIN,
    TRAIT_AUXILIARY_UNIT,
    TRAIT_INFANTRY,
    TRAIT_MINE_SWEEPER,
    TRAIT_SQUADRON,
    TRAIT_SUPPRESSIVE_FIRE,
    TRAIT_TARGET_DESIGNATOR,
    TRAIT_VULNERABLE,
    TRAIT_YIELDING,
} from './unit-traits.js';
import {SIZE_ULTRA_LIGHT} from './unit-sizes.js';
import {TYPE_INFANTRY} from './unit-types.js';

export const INFANTRY_RIFLE_SQUAD = 'INFANTRY_RIFLE_SQUAD';
export const INFANTRY_ANTI_TANK_SQUAD = 'INFANTRY_ANTI_TANK_SQUAD';
export const INFANTRY_RECON_SQUAD = 'INFANTRY_RECON_SQUAD';
export const INFANTRY_ENGINEER_SQUAD = 'INFANTRY_ENGINEER_SQUAD';
export const INFANTRY_ARC_SUIT_SQUAD = 'INFANTRY_ARC_SUIT_SQUAD';
export const INFANTRY_REAPER_SUIT_SQUAD = 'INFANTRY_REAPER_SUIT_SQUAD';
export const INFANTRY_VIPER_SUIT_SQUAD = 'INFANTRY_VIPER_SUIT_SQUAD';

// Universal traits applied to all infantry and power suit squad models
const universalInfantryTraits = [
    trait(TRAIT_AUXILIARY_UNIT, null, 'Ultralight'),
    trait(TRAIT_INFANTRY),
    trait(TRAIT_SQUADRON),
    trait(TRAIT_ALL_TERRAIN),
    trait(TRAIT_VULNERABLE),
    trait(TRAIT_YIELDING),
];

const baseInfantryStats = {
    unit_type_id: TYPE_INFANTRY,
    size_id: SIZE_ULTRA_LIGHT,
    move: 3,
    armor: 0,
    structure: 2,
};

const baseSuitStats = {
    unit_type_id: TYPE_INFANTRY,
    size_id: SIZE_ULTRA_LIGHT,
    armor: 2,
    structure: 2,
};

export const INFANTRY_SQUADS = makeFrozenStaticListIds({
    [INFANTRY_RIFLE_SQUAD]: {
        ...baseInfantryStats,
        display_name: 'Rifle',
        weapon_ids: [
            INFANTRY_RIFLES,
        ],
        traits: [
            ...universalInfantryTraits,
            trait(TRAIT_SUPPRESSIVE_FIRE),
        ],
    },
    [INFANTRY_ANTI_TANK_SQUAD]: {
        ...baseInfantryStats,
        display_name: 'Anti-Tank',
        weapon_ids: [
            INFANTRY_RIFLES,
            INFANTRY_MISSILE_LAUNCHER,
        ],
        traits: [
            ...universalInfantryTraits,
        ],
    },
    [INFANTRY_RECON_SQUAD]: {
        ...baseInfantryStats,
        display_name: 'Recon',
        weapon_ids: [
            INFANTRY_RIFLES,
        ],
        traits: [
            ...universalInfantryTraits,
            trait(TRAIT_TARGET_DESIGNATOR),
        ],
    },
    [INFANTRY_ENGINEER_SQUAD]: {
        ...baseInfantryStats,
        display_name: 'Engineers',
        weapon_ids: [
            INFANTRY_RIFLES,
        ],
        traits: [
            ...universalInfantryTraits,
            trait(TRAIT_MINE_SWEEPER),
        ],
    },
    [INFANTRY_ARC_SUIT_SQUAD]: {
        ...baseSuitStats,
        move: 4,
        display_name: 'Arc Suits',
        weapon_ids: [
            INFANTRY_RIFLES,
            INFANTRY_ELECTRO_ARC_PULSERS,
        ],
        traits: [
            ...universalInfantryTraits,
            trait(TRAIT_SUPPRESSIVE_FIRE),
        ],
    },
    [INFANTRY_REAPER_SUIT_SQUAD]: {
        ...baseSuitStats,
        move: 4,
        display_name: 'Reaper Suits',
        weapon_ids: [
            INFANTRY_RIFLES,
            INFANTRY_HEAVY_MISSILE_LAUNCHER,
        ],
        traits: [
            ...universalInfantryTraits,
        ],
    },
    [INFANTRY_VIPER_SUIT_SQUAD]: {
        ...baseSuitStats,
        move: 5,
        display_name: 'Viper Suits',
        weapon_ids: [
            INFANTRY_HEAVY_RIFLES,
        ],
        traits: [
            ...universalInfantryTraits,
            trait(TRAIT_TARGET_DESIGNATOR),
        ],
    },
});

export function getInfantrySquad(id) {
    return Object.assign({}, INFANTRY_SQUADS[id]);
}
