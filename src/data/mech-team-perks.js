import {
    DIRECTIONAL_THRUSTER,
    ELECTRONIC_COUNTERMEASURES,
    TARGET_DESIGNATOR,
    upgradeDisplayName,
} from './mech-upgrades.js';
import {each} from 'es-toolkit/compat';

// Existing perks
export const TEAM_PERK_EXTRA_MISSILE_AMMO = 'TEAM_PERK_EXTRA_MISSILE_AMMO';
export const TEAM_PERK_0_SLOT_TARGET_DESIGNATORS = 'TEAM_PERK_0_SLOT_TARGET_DESIGNATORS';
export const TEAM_PERK_0_TON_TARGET_DESIGNATORS = 'TEAM_PERK_0_TON_TARGET_DESIGNATORS';
export const TEAM_PERK_SMART_HOWITZERS = 'TEAM_PERK_SMART_HOWITZERS'; // deprecated
export const TEAM_PERK_0_SLOT_ECM = 'TEAM_PERK_0_SLOT_ECM';
export const TEAM_PERK_0_TON_ECM = 'TEAM_PERK_0_TON_ECM';
export const TEAM_PERK_RECON_INITIATIVE = 'TEAM_PERK_RECON_INITIATIVE';
export const TEAM_PERK_SUPPORT_ASSET_DAMAGE = 'TEAM_PERK_SUPPORT_ASSET_DAMAGE';
export const TEAM_PERK_DIRECTIONAL_ASSETS = 'TEAM_PERK_DIRECTIONAL_ASSETS'; // deprecated
export const TEAM_PERK_0_SLOT_ARMOR_UPGRADES = 'TEAM_PERK_0_SLOT_ARMOR_UPGRADES';
export const TEAM_PERK_0_TON_ARMOR_UPGRADES = 'TEAM_PERK_0_TON_ARMOR_UPGRADES';
export const TEAM_PERK_EXTRA_TONNAGE = 'TEAM_PERK_EXTRA_TONNAGE';
export const TEAM_PERK_SIDE_DEFENSE = 'TEAM_PERK_SIDE_DEFENSE';
export const TEAM_PERK_FORWARD_DEPLOY_HEVS = 'TEAM_PERK_FORWARD_DEPLOY_HEVS';
export const TEAM_PERK_MELEE_FLANK = 'TEAM_PERK_MELEE_FLANK';
export const TEAM_PERK_0_SLOT_DIRECTIONAL_THRUSTERS = 'TEAM_PERK_0_SLOT_DIRECTIONAL_THRUSTERS';
export const TEAM_PERK_COUNTER_ATTACK = 'TEAM_PERK_COUNTER_ATTACK';
export const TEAM_PERK_JUMP_BOOSTER = 'TEAM_PERK_JUMP_BOOSTER';
export const TEAM_PERK_COMBAT_BUCKLER = 'TEAM_PERK_COMBAT_BUCKLER';
export const TEAM_PERK_EXTRA_NITRO = 'TEAM_PERK_EXTRA_NITRO';
export const TEAM_PERK_QUICKDRAW = 'TEAM_PERK_QUICKDRAW';
export const TEAM_PERK_BARREL_EXTENSIONS = 'TEAM_PERK_BARREL_EXTENSIONS';
export const TEAM_PERK_SUPPRESSIVE_FIRE_TRAIT = 'TEAM_PERK_SUPPRESSIVE_FIRE_TRAIT';
export const TEAM_PERK_EXTRA_DEF_CONFIG = 'TEAM_PERK_EXTRA_DEF_CONFIG';

// Fire Support Team new perks
export const TEAM_PERK_ROCKET_PACK_SMART_SHORT = 'TEAM_PERK_ROCKET_PACK_SMART_SHORT';
export const TEAM_PERK_SMART_OFF_LOS = 'TEAM_PERK_SMART_OFF_LOS';
export const TEAM_PERK_CLUSTER_ROCKETS_AMMO = 'TEAM_PERK_CLUSTER_ROCKETS_AMMO';

// Recon Team new perks
export const TEAM_PERK_GUIDANCE_SUITE_MOVE_ONCE = 'TEAM_PERK_GUIDANCE_SUITE_MOVE_ONCE';

// Gunslinger Team new perks
export const TEAM_PERK_RETURN_SMASH = 'TEAM_PERK_RETURN_SMASH';

// Multirole Team new perks
export const TEAM_PERK_LIGHT_WEAPON_EFFECT = 'TEAM_PERK_LIGHT_WEAPON_EFFECT';
export const TEAM_PERK_DRAINING_REDLINE_AVOIDANCE = 'TEAM_PERK_DRAINING_REDLINE_AVOIDANCE';
export const TEAM_PERK_BLAST_PLUS_ONE = 'TEAM_PERK_BLAST_PLUS_ONE';
export const TEAM_PERK_KINETIC_PLUS_ONE = 'TEAM_PERK_KINETIC_PLUS_ONE';
export const TEAM_PERK_MELEE_PLUS_ONE = 'TEAM_PERK_MELEE_PLUS_ONE';

// Coordinated Assets Team new perks
export const TEAM_PERK_MOVE_THROUGH_TEAM = 'TEAM_PERK_MOVE_THROUGH_TEAM';
export const TEAM_PERK_EXTRA_SUPPORT_ASSET_SLOT = 'TEAM_PERK_EXTRA_SUPPORT_ASSET_SLOT';
export const TEAM_PERK_COMBINED_ACTIVATION = 'TEAM_PERK_COMBINED_ACTIVATION';

// Networked AI Team perks
export const TEAM_PERK_DRONE_MULTI = 'TEAM_PERK_DRONE_MULTI';
export const TEAM_PERK_DRONE_NETWORK_SHARE = 'TEAM_PERK_DRONE_NETWORK_SHARE';
export const TEAM_PERK_NETWORKED_POSITION = 'TEAM_PERK_NETWORKED_POSITION';

export const MECH_TEAM_PERKS = makeTeamPerks({
    [TEAM_PERK_0_SLOT_TARGET_DESIGNATORS]: makeMini(upgradeDisplayName(TARGET_DESIGNATOR)),
    [TEAM_PERK_0_TON_TARGET_DESIGNATORS]: makeLightWeight(upgradeDisplayName(TARGET_DESIGNATOR)),
    [TEAM_PERK_0_SLOT_ECM]: makeMini(upgradeDisplayName(ELECTRONIC_COUNTERMEASURES)),
    [TEAM_PERK_0_TON_ECM]: makeLightWeight(upgradeDisplayName(ELECTRONIC_COUNTERMEASURES)),
    [TEAM_PERK_0_SLOT_ARMOR_UPGRADES]: makeMini('Defensive Configuration'),
    [TEAM_PERK_0_TON_ARMOR_UPGRADES]: makeLightWeight('Defensive Configuration'),
    [TEAM_PERK_0_SLOT_DIRECTIONAL_THRUSTERS]: makeMini(upgradeDisplayName(DIRECTIONAL_THRUSTER)),
    [TEAM_PERK_SMART_HOWITZERS]: {
        display_name: 'Smart Howitzers',
        description: 'Howitzers gain the Smart Trait.',
    },
    [TEAM_PERK_RECON_INITIATIVE]: {
        display_name: 'Recon Initiative',
        description: 'If one or more Medium or Heavy HE-V from this Team is within 18" of an enemy Deployment Edge or Corner, you gain +1 to the Initiative Roll.',
        visible_on_card: true,
    },
    [TEAM_PERK_SUPPORT_ASSET_DAMAGE]: {
        display_name: 'OT Asset Damage',
        description: 'Off-Table Support Assets gain +1 to their Damage Rating.',
        visible_on_card: true,
    },
    [TEAM_PERK_DIRECTIONAL_ASSETS]: {
        display_name: 'Mobile OT Assets',
        description: 'When determining the origin of direction for an Off-Table Support Asset directed by a member of this team, it can be from any direction.',
        visible_on_card: true,
    },
    [TEAM_PERK_EXTRA_TONNAGE]: {
        display_name: 'Objective Tonnage (+5)',
        description: 'These Units count as 5 Tons heavier for the purpose of scoring.',
        visible_on_card: true,
    },
    [TEAM_PERK_SIDE_DEFENSE]: {
        display_name: 'Side Defense',
        description: 'Enemy Units do not gain bonuses to their Attack Pool for Side Arcs.',
        visible_on_card: true,
    },
    [TEAM_PERK_SUPPRESSIVE_FIRE_TRAIT]: {
        display_name: 'Suppressive Fire',
        description: 'This HE-V has the Suppressive Fire trait.',
        visible_on_card: true,
    },
    [TEAM_PERK_EXTRA_DEF_CONFIG]: {
        display_name: 'Extra Defensive Config',
        description: 'This HE-V may equip an additional Defensive Configuration. This uses an Upgrade slot.',
        visible_on_card: true,
    },
    [TEAM_PERK_FORWARD_DEPLOY_HEVS]: {
        display_name: 'Forward Deploy',
        description: 'HE-Vs in this Team may deploy as Support Assets.',
        visible_on_card: true,
    },
    [TEAM_PERK_MELEE_FLANK]: {
        display_name: 'Melee Flank',
        description: 'Weapons with the Melee Trait targeting opposing HE-Vs that are base to base with 2 or more Units in this Team receive the Frag trait.',
        visible_on_card: true,
    },
    [TEAM_PERK_COUNTER_ATTACK]: {
        display_name: 'Counter Attack',
        description: 'When targeted by an ENGAGE or SMASH Order, an HE-V in this Team without an Activation Marker may gain an Activation Marker. If they do, they may interrupt that Order and perform a SMASH Order. Once that SMASH Order is complete, finish the interrupted Order.',
        visible_on_card: true,
    },
    [TEAM_PERK_JUMP_BOOSTER]: {
        display_name: 'Jump Boost',
        description: '+1" to JUMP Distance.',
    },
    [TEAM_PERK_COMBAT_BUCKLER]: {
        display_name: 'Combat Buckler',
        description: 'May purchase a Shield for 3 Tons.',
    },
    [TEAM_PERK_EXTRA_NITRO]: {
        display_name: 'Extra Nitro',
        description: 'Increase the Limited trait of Nitro Boost to (2).',
    },
    [TEAM_PERK_QUICKDRAW]: {
        display_name: 'Quickdraw',
        description: 'This Unit may choose to Return Fire when it has an Activation Marker. After completing a Return Fire, the Unit is marked with a Redline Marker instead of an Activation Marker.',
        visible_on_card: true,
    },
    [TEAM_PERK_ROCKET_PACK_SMART_SHORT]: {
        display_name: 'Rocket Pack Guidance',
        description: 'Rocket Packs gain the Smart and Short (16") traits.',
        visible_on_card: true,
    },
    [TEAM_PERK_SMART_OFF_LOS]: {
        display_name: 'Off-LoS Smart Targeting',
        description: 'Any Weapon with the SMART trait may select a Target that is not in LoS of the Active Unit. This Weapon has the Short (6") trait when doing so. Attack Pools are not modified for Side or Rear Arc.',
        visible_on_card: true,
    },
    [TEAM_PERK_CLUSTER_ROCKETS_AMMO]: {
        display_name: 'Cluster Rocket Ammo',
        description: 'Cluster Rockets gain +1 to their Limited Trait.',
    },
    [TEAM_PERK_GUIDANCE_SUITE_MOVE_ONCE]: {
        display_name: 'Guidance Suite (MOVE)',
        description: 'Once per turn, this HE-V counts as having the Guidance Suite (MOVE) trait. Declare the use of this at the beginning of that HE-V\'s activation.',
        visible_on_card: true,
    },
    [TEAM_PERK_RETURN_SMASH]: {
        display_name: 'Return Smash',
        description: 'When this Unit is Targeted by an ENGAGE or SMASH Order and does not have a Redline Marker, they may choose to declare "Return Smash". Once the Active Unit\'s ENGAGE or SMASH Order is complete, before it performs any further Orders, the Target Unit may immediately perform a SMASH Order. The SMASH Order must Target the interrupted Unit. Once this SMASH Order is complete, mark the Unit Returning Smash with a Redline Marker. If the interrupted Unit has Orders left to perform, they return to being the Active Unit, and play continues as normal.',
        visible_on_card: true,
    },
    [TEAM_PERK_LIGHT_WEAPON_EFFECT]: {
        display_name: 'Light Weapon Effect',
        description: 'Light Weapons cause 1 Damage for every 2 damage not evaded, rounding up.',
        visible_on_card: true,
    },
    [TEAM_PERK_DRAINING_REDLINE_AVOIDANCE]: {
        display_name: 'Draining Redline Avoidance',
        description: 'When marking this Unit with a Redline Marker due to Draining, roll 1D6. On a 4+, do not mark this Unit.',
        visible_on_card: true,
    },
    [TEAM_PERK_BLAST_PLUS_ONE]: {
        display_name: 'Blast +1',
        description: 'Blast Weapons add +1 to their Blast (X) value.',
        visible_on_card: true,
    },
    [TEAM_PERK_KINETIC_PLUS_ONE]: {
        display_name: 'Kinetic +1',
        description: 'Kinetic Weapons add +1 to the D6 to determine if the Target is rotated.',
        visible_on_card: true,
    },
    [TEAM_PERK_MELEE_PLUS_ONE]: {
        display_name: 'Melee +1',
        description: 'Melee (X) weapons add +1 to their X value.',
        visible_on_card: true,
    },
    [TEAM_PERK_DRONE_MULTI]: {
        display_name: 'Drone Proliferation',
        description: 'All Companion Drones may be taken more than once on each member HE-V (ignore the restriction on the number of Compact upgrades). No Weapon or Upgrade on an HE-V may be assigned more than one Companion Drone.',
        visible_on_card: true,
    },
    [TEAM_PERK_DRONE_NETWORK_SHARE]: {
        display_name: 'Network Share',
        description: 'If a Weapon or Upgrade on this HE-V is assigned to a Companion Drone, and any other member of this team has the same Weapon or Upgrade assigned to a Companion Drone, this Weapon or Upgrade receives the benefit of all Companion Drones assigned to the same Weapon or Upgrade in this team.',
        visible_on_card: true,
    },
    [TEAM_PERK_NETWORKED_POSITION]: {
        display_name: 'Network Position',
        description: 'When this HE-V performs an ENGAGE Order, if another member of this team has LoS to the Target and is within 12" of this HE-V, this HE-V may be counted as in either member\'s position for the purposes of determining Side or Rear modifiers for that ENGAGE Order.',
        visible_on_card: true,
    },
    [TEAM_PERK_MOVE_THROUGH_TEAM]: {
        display_name: 'Move Through',
        description: 'Models in this team may move through other Models in this team. They may not end their movement on another Model\'s base.',
        visible_on_card: true,
    },
    [TEAM_PERK_EXTRA_SUPPORT_ASSET_SLOT]: {
        display_name: 'Extra Support Asset',
        description: 'If you have already selected a UL HE-V Squadron for this team, you may select and include another in this team. If you have already selected an Assault Vehicle Squadron for this team, you may select and include another in this team. This ignores the usual restriction on including more than one Support Asset of a single type.',
        visible_on_card: true,
    },
    [TEAM_PERK_COMBINED_ACTIVATION]: {
        display_name: 'Combined Activation',
        description: 'Once per game, immediately after Activating a member Unit of this team, nominate another member Unit of this team that does not have an Activation Marker. If the Activated Unit was an HE-V, you must nominate a Support Asset. If the Activated Unit was a Support Asset, you must nominate an HE-V. The nominated Unit may Activate immediately. Play then passes as normal.',
        visible_on_card: true,
    },
    [TEAM_PERK_EXTRA_MISSILE_AMMO]: {
        renderDisplayName: makeRenderDisplayName('Extra Guided Ammo'),
        renderDesc(baseValue, repeatCount = 1) {
            let repeatStr = renderDescriptionRepeat(baseValue, repeatCount);
            return `All Rocket Packs and Missiles gain +${baseValue}${repeatStr} to their Limited Trait`;
        },
        value: 1,
        stackable: true,
    },
    [TEAM_PERK_BARREL_EXTENSIONS]: {
        renderDisplayName: makeRenderDisplayName('Barrel Extensions'),
        renderDesc(baseValue, repeatCount = 1) {
            let repeatStr = renderDescriptionRepeat(baseValue, repeatCount);
            return `Short (X) weapons add +${baseValue}${repeatStr} to their Short (X) value.`;
        },
        card_note: '+2 applied',
        value: 2,
        visible_on_card: true,
    },
});

function makeRenderDisplayName(prefix) {
    return function renderDisplayName(value, repeatCount = 1) {
        let repeatStr = '';
        if (repeatCount > 1) {
            repeatStr = ` (x${repeatCount})`;
        }
        return `${prefix}${repeatStr}`;
    };
}

function renderDescriptionRepeat(baseValue, repeatCount = 1) {
    let value = baseValue * repeatCount;
    if (repeatCount > 1) {
        return ` (+${baseValue} x ${repeatCount} = +${value})`;
    }
    return '';
}

function makeMini(name) {
    return {
        display_name: `Mini ${name}`,
        display_name_short: 'Mini',
        description: `Cost 0 Slots.`,
    };
}

function makeLightWeight(name) {
    return {
        display_name: `Lightweight ${name}`,
        display_name_short: 'Lightweight',
        description: `Cost 0 Tons.`,
    };
}

function makeTeamPerks(perks) {
    let display_order = 0;
    each(perks, (perk, perkId, index) => {
        perk.id = perkId;
        if (perk.renderDisplayName) {
            perk.display_name = perk.renderDisplayName(perk.value);
        }
        if (perk.renderDesc) {
            perk.description = perk.renderDesc(perk.value);
        }
        perk.display_order = display_order++;
        Object.freeze(perk);
    });
    return Object.freeze(perks);
}
