import {VEH_AUTO_CANNON} from '../unit-weapons.js';
import {
    TRAIT_AUXILIARY_UNIT,
    TRAIT_MSOE_DEPLOYER,
    TRAIT_OUTRIDER,
    TRAIT_SQUADRON,
    TRAIT_SUPPORT_GUIDANCE_SUITE,
    TRAIT_SUPPORT_MINE_DRONE_LAYER,
    TRAIT_SUPPORT_ORDER_CNC,
    TRAIT_SUPPORT_ORDER_COMBAT_SUPPLIES,
    TRAIT_SUPPORT_ORDERS,
    TRAIT_TARGET_DESIGNATOR,
    TRAIT_UNIT_SIZE_AND_TYPE,
} from '../unit-traits.js';
import {SIZE_MEDIUM} from '../unit-sizes.js';
import {makeStaticListIds, trait} from '../data-helpers.js';
import {TYPE_VEHICLE} from '../unit-types.js';

export const SUPPORT_VEHICLE_SQUADRON = 'SUPPORT_VEHICLE_SQUADRON';

const baseStats = {
    move: 8,
    armor: 2,
    structure: 2,
};

export const SUPPORT_VEHICLE_SQUADRON_DATA = {
    [SUPPORT_VEHICLE_SQUADRON]: {
        unit_type_id: TYPE_VEHICLE,
        size_id: SIZE_MEDIUM,
        display_name: 'Support Vehicle Squadron',
        cost: 20,
        max_duplicate_vehicles: 2,
        max_vehicles: 4,
        defense: 4,
        traits: [
            trait(TRAIT_UNIT_SIZE_AND_TYPE, null, 'Medium Vehicle'),
            trait(TRAIT_AUXILIARY_UNIT, null, 'Medium'),
            trait(TRAIT_SQUADRON),
            trait(TRAIT_SUPPORT_ORDERS),
        ],
        vehicles: makeStaticListIds({
            RECON_VEHICLE: {
                ...baseStats,
                display_name: 'Recon Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_TARGET_DESIGNATOR),
                    trait(TRAIT_OUTRIDER),
                ],
            },
            COMMAND_VEHICLE: {
                ...baseStats,
                display_name: 'Command Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_SUPPORT_ORDER_CNC),
                ],
            },
            RESUPPLY_VEHICLE: {
                ...baseStats,
                display_name: 'Resupply Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_SUPPORT_ORDER_COMBAT_SUPPLIES),
                ],
            },
            TARGETING_VEHICLE: {
                ...baseStats,
                display_name: 'Targeting Support Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_SUPPORT_GUIDANCE_SUITE),
                ],
            },
            MINELAYER_VEHICLE: {
                ...baseStats,
                display_name: 'Minelayer',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_SUPPORT_MINE_DRONE_LAYER, 4),
                ],
            },
            OBSCURATION_VEHICLE: {
                ...baseStats,
                display_name: 'Obscuration Projection Vehicle',
                weapon_ids: [
                    VEH_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_MSOE_DEPLOYER),
                ],
            },
        }),
    },
};
