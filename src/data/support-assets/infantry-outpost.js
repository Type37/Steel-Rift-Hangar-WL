import {BUNKER_AUTO_CANNON, BUNKER_MISSILE_PACK, BUNKER_ROCKET_PACK} from '../unit-weapons.js';
import {
    TRAIT_ALL_TERRAIN,
    TRAIT_ASSET_COMMAND,
    TRAIT_AUXILIARY_UNIT,
    TRAIT_FORTIFICATION,
    TRAIT_GARRISON,
    TRAIT_MINELAYER,
    TRAIT_SQUADRON,
    TRAIT_UNIT_SIZE_AND_TYPE,
} from '../unit-traits.js';
import {SIZE_ULTRA} from '../unit-sizes.js';
import {makeStaticListIds, trait} from '../data-helpers.js';
import {
    INFANTRY_ANTI_TANK_SQUAD,
    INFANTRY_ENGINEER_SQUAD,
    INFANTRY_RECON_SQUAD,
    INFANTRY_RIFLE_SQUAD,
} from '../infantry-squads.js';
import {TYPE_FORTIFICATION} from '../unit-types.js';

export const INFANTRY_OUTPOST = 'INFANTRY_OUTPOST';

export const INFANTRY_OUTPOST_DATA = {
    [INFANTRY_OUTPOST]: {
        unit_type_id: TYPE_FORTIFICATION,
        size_id: SIZE_ULTRA,
        display_name: 'Infantry Outpost',
        cost: 10,
        max_vehicles: 2,
        all_vehicle_must_be_the_same: true,
        defense: 6,
        traits: [
            trait(TRAIT_UNIT_SIZE_AND_TYPE, null, 'Fortification'),
            trait(TRAIT_AUXILIARY_UNIT, null, 'Ultraheavy'),
            trait(TRAIT_ASSET_COMMAND),
        ],
        vehicles: makeStaticListIds({
            BUNKER: {
                display_name: 'Bunker',
                armor: 2,
                structure: 8,
                weapon_choice_ids: {
                    choice_1: [
                        BUNKER_AUTO_CANNON,
                        BUNKER_MISSILE_PACK,
                        BUNKER_ROCKET_PACK,
                    ],
                },
                traits: [
                    trait(TRAIT_FORTIFICATION),
                    trait(TRAIT_GARRISON, 6, 'Infantry Squads'),
                    trait(TRAIT_MINELAYER, null, 'ENGAGE'),
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
        }),
        infantry_squads: makeStaticListIds({}),
    },
};
