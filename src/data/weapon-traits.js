import {makeTraits} from './data-helpers.js';
import {inchFormater, numberFormater} from './data-formatters.js';

export const TRAIT_AP = 'TRAIT_AP';
export const TRAIT_BLAST = 'TRAIT_BLAST';
export const TRAIT_DISRUPTIVE = 'TRAIT_DISRUPTIVE';
export const TRAIT_DRAINING = 'TRAIT_DRAINING';
export const TRAIT_FLAK = 'TRAIT_FLAK';
export const TRAIT_FRAG = 'TRAIT_FRAG';
export const TRAIT_KINETIC = 'TRAIT_KINETIC';
export const TRAIT_LIGHT = 'TRAIT_LIGHT';
export const TRAIT_LIMITED = 'TRAIT_LIMITED';
export const TRAIT_MELEE = 'TRAIT_MELEE';
export const TRAIT_SHORT = 'TRAIT_SHORT';
export const TRAIT_SMART = 'TRAIT_SMART';
export const TRAIT_MINE_TOKENS = 'TRAIT_MINE_TOKENS';
export const TRAIT_BULKY = 'TRAIT_BULKY';
export const TRAIT_CONCUSSIVE = 'TRAIT_CONCUSSIVE';
export const TRAIT_DRAG = 'TRAIT_DRAG';
export const TRAIT_PARRY = 'TRAIT_PARRY';
export const TRAIT_REACH = 'TRAIT_REACH';
export const TRAIT_STAGGER = 'TRAIT_STAGGER';
export const TRAIT_TETHER = 'TRAIT_TETHER';
export const TRAIT_ANTI_AIR = 'TRAIT_ANTI_AIR';

export const WEAPON_TRAITS = makeTraits({
    [TRAIT_AP]: {
        display_name: 'AP',
        description: 'If any damage is inflicted by this Attack, apply AP(X) damage directly to the target unit\'s Structure',
        formatter: numberFormater,
    },
    [TRAIT_BLAST]: {
        display_name: 'Blast',
        description: 'All units (friend or foe) within (x”) of the Target model must also make a Defense Roll. The number of dice in the Defense Roll(s) is equal to the Engage Damage Rating of this Weapon, minus 1, to a minimum of 1. Modify the Defense Roll for each affected unit based on each unit’s weight class, as usual. All units making Defense Rolls due to this trait are not being attacked, nor are they considered “Targeted”',
        formatter: inchFormater,
    },
    [TRAIT_DISRUPTIVE]: {
        display_name: 'Disruptive',
        description: 'If a target model suffers any damage from a weapon with this Trait, the Active Player rolls 1D6. On a 5 or 6, mark the target unit with a Redlined marker.',
    },
    [TRAIT_DRAINING]: {
        display_name: 'Draining',
        description: 'If a model uses this Weapon System during an activation, mark it with a Redline marker as well as an Activated token when it has completed its Orders. This does not cause Structure damage. If a model has a Redlined token when it activates, it may not use Weapon Systems with this Trait.',
    },
    [TRAIT_FLAK]: {
        display_name: 'Flak',
        description: 'If this unit is targeted by Missiles or Rocket Packs, reduce the attack pool from that weapon by 2. If this unit is targeted by Mine Drones, reduce the attack pool from that weapon by 1. This trait does not apply if this unit has a Redline Marker.',
    },
    [TRAIT_FRAG]: {
        display_name: 'Frag',
        description: 'Targets are -1 to Defense Rolls from attacks with this Trait.',
    },
    [TRAIT_KINETIC]: {
        display_name: 'Kinetic',
        formatter: (name, size = null) => {
            if (size) {
                return `${name}(${size})`;
            }
            return name;
        },
        description: 'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger the Active model is than the target model. Subtract -1 from the roll for each Class Size smaller the Active model is than the target model. On a result of 4+, rotate the target model 45° away from the Active Unit, in a direction chosen by the Active Player.',
    },
    [TRAIT_LIGHT]: {
        display_name: 'Light',
        description: 'This attack will cause 1 damage to Armor or Structure for every 2 hits that are not evaded, rounding down.',
    },
    [TRAIT_LIMITED]: {
        display_name: 'Limited',
        description: 'This attack may only be made (x) times during a mission.',
        formatter: numberFormater,
    },
    [TRAIT_MELEE]: {
        display_name: 'Melee',
        description: 'Add (x) to the Attack Pool of this mech when it is performing a Smash Order. This model counts as one Class Size larger during a Smash order. This weapon System is not used in an Engage Order. Note that more than one Melee weapon does not grant this bonus multiple times.',
        formatter: numberFormater,
    },
    [TRAIT_SHORT]: {
        display_name: 'Short',
        description: 'The maximum range for this attack is (x") instead of unlimited during an Engage Order.',
    },
    [TRAIT_SMART]: {
        display_name: 'Smart',
        description: 'The Active Unit may use any friendly unit with a Target Designator for determining Line of Sight for attacks with this Weapon System.',
    },
    [TRAIT_MINE_TOKENS]: {
        display_name: 'Mine Tokens',
        description: '',
        formatter: numberFormater,
    },
    [TRAIT_BULKY]: {
        display_name: 'Bulky',
        description: 'This upgrade takes two upgrade slots to equip.',
    },
    [TRAIT_CONCUSSIVE]: {
        display_name: 'Concussive',
        description: 'If any damage is inflicted by this attack, roll 1D6. Add +1 to the roll for each Class Size larger that the Active Unit is than the target Unit. Subtract -1 from the roll for each Class Size smaller the Active Unit is than the target Unit. On a result of 4+, move the target Unit up to X” directly away from the Active Unit. If, when the target Unit is moved, it contacts any blocking terrain feature or another Unit, the target Unit stops in base contact with the terrain or Unit. If the target Unit stops in this manner, it receives an additional 1 point of Damage with no additional defense roll. A Unit that is contacted by the Target Unit also receives 1 point of Damage with no defense roll. This trait has no effect on Targets with the “Fortification” trait.',
        formatter: numberFormater,
    },
    [TRAIT_DRAG]: {
        display_name: 'Drag',
        description: 'When an Engage Order selects this weapon, and the target receives any Damage after the Defense Roll, Roll 1D6+4. Add +1 to the roll for each Class Size larger the Active Unit is than the target Unit. Subtract -1 from the roll for each Class Size smaller the Active Unit is than the target Unit. Move the target Unit up to this many inches directly towards the Active Unit. If, when the target is moved, it contacts any blocking terrain feature or another Unit, the target Unit stops in base contact with the terrain or Unit. If the target Unit stops in this manner, it receives an additional 1 point of Damage with no additional defense roll. A Unit that is contacted by the Target Unit also receives 1 point of Damage with no defense roll. This trait has no effect on Targets with the “Fortification” trait.',
    },
    [TRAIT_PARRY]: {
        display_name: 'Parry',
        description: 'Once per Engage or Smash Order, after this Unit makes a Defense Roll for an Attack originating in its Line of Sight, this Unit may re-roll up to 2 dice that did not score a 4+ after modifiers.',
    },
    [TRAIT_REACH]: {
        display_name: 'Reach',
        description: 'When performing a Smash Order, Units within X” of the Active Unit and Line of Sight, count as being in base contact for the purposes of the Smash Order. In addition, during a Smash Order, once the Attack Pool has been determined, you may reduce the pool by 1 die to nominate a secondary Unit in Base Contact and Line of Sight and divide the pool between the primary and secondary target. Defense rolls are made as normal by the target Units based on the number of Damage allocated. Cover bonuses are not applied to Defense Rolls for this attack.',
        formatter: numberFormater,
    },
    [TRAIT_STAGGER]: {
        display_name: 'Stagger',
        description: 'When a Unit is Targeted by this weapon, the Target Unit receives a Stagger Marker at the end of this Order and is considered Staggered. A Unit with a Stagger Marker applies a -1 modifier to their Defense Roll when targeted by an Engage or Smash Order. After the Engage or Smash Order targeting this unit is completed, the Stagger Marker is removed and the unit is no longer considered Staggered. If a Unit is Staggered when it activates, it may only take one action during that activation, and may not take a Move Order in that activation. At the end of that activation, the unit is no longer Staggered.',
    },
    [TRAIT_TETHER]: {
        display_name: 'Tether',
        description: 'When a Unit is Targeted by this weapon, assign it a Tether Marker and the Attacking Unit an Anchor Marker. Units with a Tether Marker may not make any move that causes the Unit to end further from the Anchor Unit. At the end of an Activation, not a Redline, of a Unit that has a Tether Marker, roll a D6. On a 4+, remove the Tether Marker. If the Anchoring Unit is destroyed, remove any Tether Markers associated with it.',
    },
    [TRAIT_ANTI_AIR]: {
        display_name: 'Anti-Air',
        description: 'When targeting a unit with the Flying Trait, the target is at -2 to Defense Rolls from weapons with this trait. (I.e., if the target until would normally remove damage from the Attack Pool on a 2+, it avoids damage from this weapon on a 4+). If a Weapon with this trait destroys the Target Model, you may apply remaining damage to another Model of the Squadron as if the Squadron was not a Flying Squadron. ',
    },
});

export function weaponTraitDisplayName({id, number, type}) {

    const trait = WEAPON_TRAITS[id];

    if (!trait) {
        throw new Error('trait not found: '.id);
    }
    if (trait.formatter) {
        return trait.formatter(trait.display_name, number, type);
    }
    return trait.display_name;
}

export function freshWeaponTrait(trait) {
    return Object.assign(
        {},
        WEAPON_TRAITS[trait.id],
        trait,
        {
            display_name: weaponTraitDisplayName(trait),
        },
    );
}
