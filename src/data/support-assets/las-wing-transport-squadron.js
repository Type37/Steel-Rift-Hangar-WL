import {VEH_ROTARY_CANNON} from '../unit-weapons.js';
import {
    TRAIT_ALL_TERRAIN,
    TRAIT_ASSET_COMMAND,
    TRAIT_AUXILIARY_UNIT,
    TRAIT_FLYING,
    TRAIT_FLYING_SQUADRON,
    TRAIT_GARRISON,
    TRAIT_SQUADRON,
    TRAIT_SQUADRON_GARRISON,
    TRAIT_UNIT_SIZE_AND_TYPE,
    TRAIT_VULNERABLE,
    TRAIT_YIELDING,
} from '../unit-traits.js';
import {SIZE_LIGHT} from '../unit-sizes.js';
import {makeStaticListIds, trait} from '../data-helpers.js';
import {
    INFANTRY_ANTI_TANK_SQUAD,
    INFANTRY_ARC_SUIT_SQUAD,
    INFANTRY_REAPER_SUIT_SQUAD,
    INFANTRY_RECON_SQUAD,
    INFANTRY_RIFLE_SQUAD,
    INFANTRY_VIPER_SUIT_SQUAD,
} from '../infantry-squads.js';
import {TYPE_VEHICLE} from '../unit-types.js';

export const LAS_WING_TRANSPORT_SQUADRON = 'LAS_WING_TRANSPORT_SQUADRON';

const baseStats = {
    move: 12,
    armor: 1,
    structure: 2,
};

export const LAS_WING_TRANSPORT_SQUADRON_DATA = {
    [LAS_WING_TRANSPORT_SQUADRON]: {
        unit_type_id: TYPE_VEHICLE,
        size_id: SIZE_LIGHT,
        display_name: 'LAS-Wing Transport Squadron',
        cost: 10,
        max_vehicles: 3,
        all_vehicle_must_be_the_same: true,
        defense: 3,
        traits: [
            trait(TRAIT_UNIT_SIZE_AND_TYPE, null, 'Light Vehicle'),
            trait(TRAIT_AUXILIARY_UNIT, null, 'Light'),
            trait(TRAIT_FLYING),
            trait(TRAIT_FLYING_SQUADRON),
            trait(TRAIT_VULNERABLE),
            trait(TRAIT_YIELDING),
        ],
        vehicles: makeStaticListIds({
            INFANTRY_AIR_TRANSPORT: {
                ...baseStats,
                display_name: 'Infantry Air Transport',
                weapon_ids: [
                    VEH_ROTARY_CANNON,
                ],
                traits: [
                    trait(TRAIT_ASSET_COMMAND),
                    trait(TRAIT_GARRISON, 3, 'Infantry Squads'),
                ],
                garrison_choice_unit_ids: [
                    INFANTRY_RIFLE_SQUAD,
                    INFANTRY_ANTI_TANK_SQUAD,
                    INFANTRY_RECON_SQUAD,
                ],
                garrison_unit_traits: [
                    trait(TRAIT_SQUADRON),
                    trait(TRAIT_ALL_TERRAIN),
                ],
            },
            POWER_SUIT_AIR_TRANSPORT: {
                ...baseStats,
                display_name: 'Power Suit Air Transport',
                weapon_ids: [
                    VEH_ROTARY_CANNON,
                ],
                traits: [
                    trait(TRAIT_ASSET_COMMAND),
                    trait(TRAIT_GARRISON, 2, 'Power Suit Squads'),
                ],
                garrison_choice_unit_ids: [
                    INFANTRY_ARC_SUIT_SQUAD,
                    INFANTRY_REAPER_SUIT_SQUAD,
                    INFANTRY_VIPER_SUIT_SQUAD,
                ],
                garrison_unit_traits: [
                    trait(TRAIT_SQUADRON),
                    trait(TRAIT_ALL_TERRAIN),
                ],
            },
            UL_HEV_AIR_TRANSPORT: {
                ...baseStats,
                display_name: 'UL HE-V Air Transport',
                weapon_ids: [
                    VEH_ROTARY_CANNON,
                ],
                traits: [
                    trait(TRAIT_SQUADRON_GARRISON, 1, 'UL HE-V Squadron'),
                ],
                garrison_ul_hev: true,
            },
        }),
    },
};
