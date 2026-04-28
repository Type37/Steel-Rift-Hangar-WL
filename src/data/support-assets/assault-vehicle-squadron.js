import {
    AA_ARRAY,
    DOZER_BLADE,
    HEAVY_INCINERATORS,
    MISSILE_PACK,
    VEH_AUTO_CANNON,
    VEH_HOWITZER,
    VEH_SUBMUNITIONS,
} from '../unit-weapons.js';
import {
    TRAIT_ALL_TERRAIN,
    TRAIT_ASSET_COMMAND,
    TRAIT_AUXILIARY_UNIT,
    TRAIT_CLOSE_SUPPORT,
    TRAIT_GARRISON,
    TRAIT_INFERNO_GEAR,
    TRAIT_MAGNETIC_GRAPPLES,
    TRAIT_MINE_SWEEPER,
    TRAIT_SHIELD_PROJECTOR,
    TRAIT_SQUADRON,
    TRAIT_UNIT_SIZE_AND_TYPE,
} from '../unit-traits.js';
import {SIZE_MEDIUM} from '../unit-sizes.js';
import {makeStaticListIds, trait} from '../data-helpers.js';
import {
    INFANTRY_ANTI_TANK_SQUAD,
    INFANTRY_ENGINEER_SQUAD,
    INFANTRY_RECON_SQUAD,
    INFANTRY_RIFLE_SQUAD,
} from '../infantry-squads.js';
import {TYPE_VEHICLE} from '../unit-types.js';

export const ASSAULT_VEHICLE_SQUADRON = 'ASSAULT_VEHICLE_SQUADRON';

const baseStats = {
    move: 8,
    armor: 3,
    structure: 2,
};
export const ASSAULT_VEHICLE_SQUADRON_DATA = {
    [ASSAULT_VEHICLE_SQUADRON]: {
        unit_type_id: TYPE_VEHICLE,
        size_id: SIZE_MEDIUM,
        display_name: 'Assault Vehicle Squadron',
        cost: 20,
        max_vehicles: 4,
        defense: 4,
        traits: [
            trait(TRAIT_UNIT_SIZE_AND_TYPE, null, 'Medium Vehicle'),
            trait(TRAIT_AUXILIARY_UNIT, null, 'Medium'),
            trait(TRAIT_SQUADRON),
            trait(TRAIT_ALL_TERRAIN),
        ],
        vehicles: makeStaticListIds({
            NETTER_VEHICLE: {
                ...baseStats,
                display_name: 'Netter Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_MAGNETIC_GRAPPLES),
                    trait(TRAIT_CLOSE_SUPPORT),
                ],
            },
            DEMOLITION_VEHICLE: {
                ...baseStats,
                display_name: 'Demolition Vehicle',
                weapon_ids: [
                    DOZER_BLADE,
                    HEAVY_INCINERATORS,
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_INFERNO_GEAR),
                ],
            },
            INFANTRY_FIGHTING_VEHICLE: {
                ...baseStats,
                display_name: 'Infantry Fighting Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_ASSET_COMMAND),
                    trait(TRAIT_GARRISON, 3, 'Infantry Squads'),
                ],
                garrison_choice_unit_ids: [
                    INFANTRY_RIFLE_SQUAD,
                    INFANTRY_ANTI_TANK_SQUAD,
                    INFANTRY_RECON_SQUAD,
                    INFANTRY_ENGINEER_SQUAD,
                ],
                garrison_unit_traits: [
                    trait(TRAIT_SQUADRON),
                    trait(TRAIT_ALL_TERRAIN),
                ],
            },
            COMBAT_ENGINEERING_VEHICLE: {
                ...baseStats,
                display_name: 'Combat Engineering Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_MINE_SWEEPER),
                ],
            },
            SHIELD_PROJECTOR_VEHICLE: {
                ...baseStats,
                display_name: 'Shield Projector Vehicle',
                weapon_ids: [
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_SHIELD_PROJECTOR),
                ],
            },
            FIRE_SUPPORT_VEHICLE: {
                ...baseStats,
                display_name: 'Fire Support Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                    MISSILE_PACK,
                ],
            },
            AA_VEHICLE: {
                ...baseStats,
                display_name: 'Anti-Aircraft Vehicle',
                weapon_ids: [
                    AA_ARRAY,
                ],
            },
            ARTILLERY_VEHICLE: {
                ...baseStats,
                display_name: 'Artillery Vehicle',
                weapon_ids: [
                    VEH_HOWITZER,
                    VEH_SUBMUNITIONS,
                ],
            },
        }),
    },
};
