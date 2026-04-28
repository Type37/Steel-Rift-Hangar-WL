import {SIZE_LIGHT} from '../unit-sizes.js';
import {makeStaticListIds, trait} from '../data-helpers.js';
import {
    CLUSTER_ROCKETS,
    LV_AUTO_CANNON,
    MISSILE_POD,
    VEH_SUBMUNITIONS,
} from '../unit-weapons.js';
import {
    TRAIT_AUXILIARY_UNIT,
    TRAIT_CLOSE_SUPPORT,
    TRAIT_MINE_SWEEPER,
    TRAIT_OUTRIDER,
    TRAIT_SQUADRON,
    TRAIT_SUPPRESSIVE_FIRE,
    TRAIT_TARGET_DESIGNATOR,
    TRAIT_UNIT_SIZE_AND_TYPE,
    TRAIT_VULNERABLE,
} from '../unit-traits.js';
import {TYPE_VEHICLE} from '../unit-types.js';

export const LIGHT_VEHICLE_SQUADRON = 'LIGHT_VEHICLE_SQUADRON';

export const LIGHT_VEHICLE_SQUADRON_DATA = {
    [LIGHT_VEHICLE_SQUADRON]: {
        unit_type_id: TYPE_VEHICLE,
        size_id: SIZE_LIGHT,
        display_name: 'Light Vehicle Squadron',
        cost: 10,
        // 5 vehicle slots. Two Recon vehicles may fill 1 slot; four Recon fill 2 slots.
        // Max 4 Recon vehicles total.
        max_vehicles: 5,
        defense: 3,
        traits: [
            trait(TRAIT_UNIT_SIZE_AND_TYPE, null, 'Light Vehicle'),
            trait(TRAIT_AUXILIARY_UNIT, null, 'Light'),
            trait(TRAIT_SQUADRON),
            trait(TRAIT_CLOSE_SUPPORT),
            trait(TRAIT_VULNERABLE),
        ],
        vehicles: makeStaticListIds({
            RECON: {
                move: 12,
                armor: 0,
                structure: 1,
                display_name: 'Recon',
                weapon_ids: [
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_TARGET_DESIGNATOR),
                    trait(TRAIT_OUTRIDER),
                ],
            },
            FIRE_SUPPORT: {
                move: 8,
                armor: 1,
                structure: 1,
                display_name: 'Fire Support',
                weapon_ids: [
                    LV_AUTO_CANNON,
                ],
                weapon_choice_ids: {
                    choice_1: [
                        CLUSTER_ROCKETS,
                        MISSILE_POD,
                    ],
                },
                traits: [],
            },
            TACTICAL: {
                move: 10,
                armor: 1,
                structure: 1,
                display_name: 'Tactical',
                weapon_ids: [
                    LV_AUTO_CANNON,
                ],
                traits: [
                    trait(TRAIT_SUPPRESSIVE_FIRE),
                ],
            },
            ENGINEERING: {
                move: 8,
                armor: 2,
                structure: 1,
                display_name: 'Engineering',
                weapon_ids: [
                    VEH_SUBMUNITIONS,
                ],
                traits: [
                    trait(TRAIT_MINE_SWEEPER),
                ],
            },
        }),
    },
};
