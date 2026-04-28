import {SIZE_HEAVY, SIZE_LIGHT, SIZE_MEDIUM, SIZE_ULTRA} from './unit-sizes.js';
import {makeFrozenStaticListIds} from './data-helpers.js';

export const NO_ARMOR_UPGRADE = 'NO_ARMOR_UPGRADE';
export const ABLATIVE_ARMOR_UPGRADE = 'ABLATIVE_ARMOR_UPGRADE';
export const REACTIVE_ARMOR_UPGRADE = 'REACTIVE_ARMOR_UPGRADE';
export const CERAMIC_ARMOR_UPGRADE = 'CERAMIC_ARMOR_UPGRADE';
export const CLAYMORE_ARMOR_UPGRADE = 'CLAYMORE_ARMOR_UPGRADE';
export const EXTRA_PLATING_ARMOR_UPGRADE = 'EXTRA_PLATING_ARMOR_UPGRADE';
export const HEAVY_PLATING_ARMOR_UPGRADE = 'HEAVY_PLATING_ARMOR_UPGRADE';
export const REDUNDANT_INTERNALS_ARMOR_UPGRADE = 'REDUNDANT_INTERNALS_ARMOR_UPGRADE';

export const MECH_ARMOR_UPGRADES = makeFrozenStaticListIds({
    [NO_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Standard',
        cost: 0,
        slots: 0,
    }),
    [ABLATIVE_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Ablative',
        card_upgrade_display_name: 'Ablative Armor',
        cost_by_size: {
            [SIZE_LIGHT]: 1,
            [SIZE_MEDIUM]: 1,
            [SIZE_HEAVY]: 2,
            [SIZE_ULTRA]: 2,
        },
        slots: 1,
        description: 'This Unit may re-roll any failed Defense Rolls caused by the Blast effect.',
    }),
    [REACTIVE_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Reactive',
        card_upgrade_display_name: 'Reactive Armor',
        cost: 1,
        slots: 1,
        description: 'Reduce the Attack Pool of Weapons with "Missile" or "Rocket" in the name Targeting this Unit by 1, to a minimum of 1.',
    }),
    [CERAMIC_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Ceramic',
        card_upgrade_display_name: 'Ceramic Plating',
        cost_by_size: {
            [SIZE_LIGHT]: 2,
            [SIZE_MEDIUM]: 2,
            [SIZE_HEAVY]: 1,
            [SIZE_ULTRA]: 1,
        },
        slots: 1,
        description: 'Each time this Unit would take Damage from the AP trait, roll a D6. On a 4+, ignore that Damage.',
    }),
    [CLAYMORE_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Claymore',
        card_upgrade_display_name: 'Claymore Armor',
        description: 'Reduce the Attack Pool of incoming SMASH Orders by 1 to a minimum of 1. If a Unit equipped with Claymore Armor takes Structure Damage from a SMASH Order, the Active Unit is immediately targeted by an ENGAGE Order with a damage value of (2/2/3/3) and the Frag trait.',
        cost: 1,
        slots: 1,
    }),
    [EXTRA_PLATING_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Extra Plating',
        card_upgrade_display_name: 'Extra Plating (+2 applied)',
        description: 'This Unit gains 2 additional Armor.',
        cost: 1,
        slots: 1,
        armor_mod: 2,
    }),
    [HEAVY_PLATING_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Heavy Plating',
        card_upgrade_display_name: 'Heavy Plating (+4 applied)',
        description: 'This Unit gains 4 additional Armor.',
        cost: 2,
        slots: 1,
        armor_mod: 4,
        limited_size_ids: [SIZE_ULTRA],
    }),
    [REDUNDANT_INTERNALS_ARMOR_UPGRADE]: makeArmorUpgrade({
        display_name: 'Redundant Internals',
        card_upgrade_display_name: 'Redundant Internals',
        description: 'This Unit no longer has the Fragile Internals rule applied when damaged.',
        cost: 1,
        slots: 1,
        limited_size_ids: [SIZE_LIGHT],
    }),
});

function makeArmorUpgrade(item) {
    if (!item.cost_by_size) {
        item.cost_by_size = {
            [SIZE_LIGHT]: item.cost,
            [SIZE_MEDIUM]: item.cost,
            [SIZE_HEAVY]: item.cost,
            [SIZE_ULTRA]: item.cost,
        };
    }
    if (!item.limited_size_ids) {
        item.limited_size_ids = [];
    }

    return item;
}