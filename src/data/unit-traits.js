import {MECH_UPGRADES, TARGET_DESIGNATOR} from './mech-upgrades.js';
import {
    ORDER_SUPPORT,
    ORDER_SUPPORT_CNC_STATION,
    ORDER_SUPPORT_COMBAT_SUPPLIES,
    ORDER_SUPPORT_GUIDANCE_SUITE,
    ORDER_SUPPORT_MINE_DRONE_LAYER,
    ORDER_SUPPORT_MSOE,
} from './orders/support-orders.js';

import {makeTraits} from './data-helpers.js';
import {numberFormater} from './data-formatters.js';
import {ORDER_CLEAR_MINEFIELD} from './orders/special-orders.js';
import {ORDER_INFANTRY_MUSTER} from './orders/infantry-orders.js';

export const TRAIT_ALL_TERRAIN = 'TRAIT_ALL_TERRAIN';
export const TRAIT_CLOSE_SUPPORT = 'TRAIT_CLOSE_SUPPORT';
export const TRAIT_GARRISON = 'TRAIT_GARRISON';
export const TRAIT_GROUP_COMMAND = 'TRAIT_GROUP_COMMAND'; // deprecated — use TRAIT_ASSET_COMMAND
export const TRAIT_ASSET_COMMAND = 'TRAIT_ASSET_COMMAND';
export const TRAIT_MAGNETIC_GRAPPLES = 'TRAIT_MAGNETIC_GRAPPLES';
export const TRAIT_MINE_SWEEPER = 'TRAIT_MINE_SWEEPER';
export const TRAIT_SHIELD_PROJECTOR = 'TRAIT_SHIELD_PROJECTOR';
export const TRAIT_TARGET_DESIGNATOR = 'TRAIT_TARGET_DESIGNATOR';
export const TRAIT_OUTRIDER = 'TRAIT_OUTRIDER';
export const TRAIT_SUPPORT_ORDER_CNC = 'TRAIT_SUPPORT_ORDER_CNC';
export const TRAIT_SUPPORT_ORDER_COMBAT_SUPPLIES = 'TRAIT_SUPPORT_ORDER_COMBAT_SUPPLIES';
export const TRAIT_SUPPORT_GUIDANCE_SUITE = 'TRAIT_SUPPORT_GUIDANCE_SUITE';
export const TRAIT_SUPPORT_MINE_DRONE_LAYER = 'TRAIT_SUPPORT_MINE_DRONE_LAYER';
export const TRAIT_SUPPORT_MOED = 'TRAIT_SUPPORT_MOED';
export const TRAIT_MSOE_LAUNCHER = 'TRAIT_MSOE_LAUNCHER';
export const TRAIT_MSOE_DEPLOYER = 'TRAIT_MSOE_DEPLOYER';
export const TRAIT_SCRAMBLERS = 'TRAIT_SCRAMBLERS';
export const TRAIT_INFERNO_GEAR = 'TRAIT_INFERNO_GEAR';
export const TRAIT_SUPPRESSIVE_FIRE = 'TRAIT_SUPPRESSIVE_FIRE';
export const TRAIT_UL_HEV_LAUNCH_GEAR = 'TRAIT_UL_HEV_LAUNCH_GEAR';
export const TRAIT_FORTIFICATION = 'TRAIT_FORTIFICATION';
export const TRAIT_COMMAND = 'TRAIT_COMMAND';
export const TRAIT_BUNKER_MINE_DRONES = 'TRAIT_BUNKER_MINE_DRONES'; // deprecated — use TRAIT_MINELAYER
export const TRAIT_SQUADRON = 'TRAIT_SQUADRON';
export const TRAIT_FLYING = 'TRAIT_FLYING';
export const TRAIT_FLYING_SQUADRON = 'TRAIT_FLYING_SQUADRON';
export const TRAIT_SUPPORT_ORDERS = 'TRAIT_SUPPORT_ORDERS';
export const TRAIT_HEAVY_SUPPORT_ASSET = 'TRAIT_HEAVY_SUPPORT_ASSET'; // deprecated
export const TRAIT_HAULER = 'TRAIT_HAULER'; // deprecated — use TRAIT_SQUADRON_GARRISON
export const TRAIT_UNIT_SIZE_AND_TYPE = 'TRAIT_UNIT_SIZE_AND_TYPE';

// Ch17 additions
export const TRAIT_AUXILIARY_UNIT = 'TRAIT_AUXILIARY_UNIT';
export const TRAIT_VULNERABLE = 'TRAIT_VULNERABLE';
export const TRAIT_YIELDING = 'TRAIT_YIELDING';
export const TRAIT_INFANTRY = 'TRAIT_INFANTRY';
export const TRAIT_MINELAYER = 'TRAIT_MINELAYER';
export const TRAIT_SMASHER = 'TRAIT_SMASHER';
export const TRAIT_GUIDANCE_SUITE = 'TRAIT_GUIDANCE_SUITE';
export const TRAIT_SQUADRON_GARRISON = 'TRAIT_SQUADRON_GARRISON';

export const UNIT_TRAITS = makeTraits({
    [TRAIT_ALL_TERRAIN]: {
        display_name: 'All-Terrain',
        description: 'Units with this Trait ignore the movement penalty for Rough Terrain.',
    },
    [TRAIT_CLOSE_SUPPORT]: {
        display_name: 'Close Support',
        description: 'If a friendly Unit with this trait is within 6" of an enemy target of an ENGAGE or SMASH Order, add one to the Damage Rating of each weapon used in that ENGAGE or SMASH Order. This bonus is only applied once, regardless of the number of Units with this Trait in range.',
    },
    [TRAIT_GARRISON]: {
        display_name: 'Garrison',
        formatter: (name, number, type = null) => `${name}(${number} ${type})`,
        description: 'A Model with this Trait contains an assigned Unit as listed in its (X). Note what specific Models are selected for the Garrison Unit when this Model is recruited during the Recruit Forces step. These Units will not be Deployed during the Deploy Forces step, and will instead be placed to the side. Such a Unit is "Garrisoned" until it performs the MUSTER Order. Garrisoned Units may not perform any Order except the MUSTER Order. MUSTER: The Garrisoned Unit is placed within 1" of its Garrison. This Unit is no longer considered Garrisoned, and is now "Mustered". If a Model with the Garrison trait is Destroyed, and its Garrisoned Unit has not yet performed the MUSTER Order, that Unit is considered Destroyed as well.',
    },
    [TRAIT_GROUP_COMMAND]: {
        display_name: 'Asset Command',
        description: 'All Units in this Asset are issued Orders during the same Activation. When Activating one of these Units, select one Unit from this Asset, resolve its Activation as normal. Then, immediately select another Unit from this Asset, perform its Orders until it has finished, and so on until all Units from this Asset have Activated. The opponent Commander then becomes the Active Commander as normal. If a Unit from this Asset is no longer in play, any other Units from its Asset will still activate with Asset Command.',
    },
    [TRAIT_ASSET_COMMAND]: {
        display_name: 'Asset Command',
        description: 'All Units in this Asset are issued Orders during the same Activation. When Activating one of these Units, select one Unit from this Asset, resolve its Activation as normal. Then, immediately select another Unit from this Asset, perform its Orders until it has finished, and so on until all Units from this Asset have Activated. The opponent Commander then becomes the Active Commander as normal. If a Unit from this Asset is no longer in play, any other Units from its Asset will still activate with Asset Command.',
    },
    [TRAIT_MAGNETIC_GRAPPLES]: {
        display_name: 'Magnetic Grapples',
        description: 'When this Unit MOVEs or JUMPs into base contact with an Enemy Unit, that Enemy Unit receives a Tether Marker and the Active Unit receives a corresponding Anchor Marker.',
    },
    [TRAIT_MINE_SWEEPER]: {
        display_name: 'Mine Sweeper',
        description: 'A Unit with this Trait may not be Targeted by a Mine Drone Token. This Unit may ENGAGE Mine Drone Tokens as if it had the Mine Drone Tracking Munitions Upgrade.',
    },
    [TRAIT_SHIELD_PROJECTOR]: {
        display_name: 'Shield Projector',
        description: 'When a friendly Unit within 6" of the model with this trait makes a Defense Roll, it counts as carrying a Combat Shield Upgrade. This is not cumulative with an existing Combat Shield Upgrade on that Unit.',
    },
    [TRAIT_TARGET_DESIGNATOR]: {
        display_name: 'Target Designator',
        description: MECH_UPGRADES[TARGET_DESIGNATOR].description,
    },
    [TRAIT_OUTRIDER]: {
        display_name: 'Outrider',
        description: 'If these Models are part of a Squadron, they may be deployed and end moves within 12" of the Squadron Leader (instead of 3"). However, all Models with this Trait in a Squadron must deploy and end moves within 3" of all other Models with this Trait in the Squadron.',
    },
    [TRAIT_SUPPORT_ORDERS]: {
        display_name: 'Support Orders',
        description: 'Units with this trait possess unusual equipment that is intended to support other units, but must be actively operated to take effect. These traits will be prefixed with the term "SUPPORT:". Units with these traits may perform the SUPPORT Order. SUPPORT: The Unit may activate the effect of any or all "SUPPORT:" traits. See each trait entry for the effects of the "SUPPORT:" trait. Note that if a model (or models) in a Squadron have a "SUPPORT:" trait, the entire Squadron must perform the SUPPORT Order. However, each model with a "SUPPORT:" will activate that trait during the Order, in any order its Commander wishes.',
        granted_order_ids: [ORDER_SUPPORT],
    },
    [TRAIT_SUPPORT_ORDER_CNC]: {
        display_name: 'Support: Command and Control Station',
        description: 'When calculating Tonnage for the purpose of any Objective, if a friendly Unit contributing Tonnage to that calculation is within 12" of this Model, the Commander controlling this Model may choose to win or lose any ties. When this Model performs a SUPPORT Order, select an HE-V and move that model up to 3" immediately. A Unit may not be moved by this trait more than once a turn.',
        granted_order_ids: [ORDER_SUPPORT_CNC_STATION],
    },
    [TRAIT_SUPPORT_ORDER_COMBAT_SUPPLIES]: {
        display_name: 'Support: Combat Supplies',
        description: 'When this model performs a SUPPORT Order, select one Unit within 2" of this Model, and select one of the benefits below: If the friendly Model is an HE-V, 4 Armor may be restored (this may not increase the HE-V\'s Armor above the value the Unit began the game with). If the friendly Model has a Weapon, Upgrade or other Trait with the Limited Trait, one use of that system is restored (this may not increase its available uses above the initial Limited value). Note: if multiple Models in a Squadron have this Trait, you may select the same or different Target and benefit for each Model with this trait.',
        granted_order_ids: [ORDER_SUPPORT_COMBAT_SUPPLIES],
    },
    [TRAIT_SUPPORT_GUIDANCE_SUITE]: {
        display_name: 'Support: Guidance Suite',
        description: 'When this model performs a SUPPORT Order, it counts as having the Guidance Suite (SUPPORT) trait.',
        granted_order_ids: [ORDER_SUPPORT_GUIDANCE_SUITE],
    },
    [TRAIT_SUPPORT_MINE_DRONE_LAYER]: {
        display_name: 'Support: Mine Drone Layer',
        formatter: numberFormater,
        description: 'When this model performs a SUPPORT Order, it counts as having the Minelayer (SUPPORT) trait. Use of this Upgrade has the Limited (X) trait.',
        granted_order_ids: [ORDER_SUPPORT_MINE_DRONE_LAYER],
    },
    [TRAIT_SUPPORT_MOED]: {
        display_name: 'Support: Multi-spectral Obscuration Emitter Deployer',
        description: 'When this model performs a SUPPORT Order, it counts as having the MSOE Launcher (SUPPORT) trait.',
        granted_order_ids: [ORDER_SUPPORT_MSOE],
    },
    [TRAIT_MSOE_LAUNCHER]: {
        display_name: 'MSOE Launcher',
        formatter: (name, number, type = null) => type ? `${name} (${type})` : name,
        description: 'At the beginning or end of the Order listed in (X), you may place an Obscuration Emitter Token within 6" of this model. Obscuration Emitter Token: An Obscuration Emitter is a 25mm circle. Any Unit, regardless of Commander, within 3" of this Token counts as being within Covering Terrain. Additionally, these Units count as being equipped with Anti-Missile System and Electronic Countermeasures Upgrades, if they are not already. Remove the Token when the Unit that placed this Token is Activated again.',
    },
    [TRAIT_MSOE_DEPLOYER]: {
        display_name: 'Support: MSOE Deployer',
        description: 'When this model performs a SUPPORT Order, it counts as having the MSOE Launcher (SUPPORT) trait.',
        granted_order_ids: [ORDER_SUPPORT_MSOE],
    },
    [TRAIT_SCRAMBLERS]: {
        display_name: 'Scramblers',
        description: 'All Units within 6" of a model equipped with Scramblers, including its own Unit, count as being equipped with Anti-Missile Systems and Electronic Countermeasures.',
    },
    [TRAIT_INFERNO_GEAR]: {
        display_name: 'Inferno Gear',
        description: 'If a Model or Models in the Unit have this Trait, the Unit ignores the effects of the Disruptive Trait.',
    },
    [TRAIT_SUPPRESSIVE_FIRE]: {
        display_name: 'Suppressive Fire',
        description: 'If an enemy Unit within 6" of a friendly model with this Trait performs an ENGAGE Order, the target of that Order receives +1 to their Defense Rolls.',
    },
    [TRAIT_UL_HEV_LAUNCH_GEAR]: {
        display_name: 'Launch Gear',
        description: 'This Unit may perform the JUMP Order at distance of +2" to their Speed value.',
    },
    [TRAIT_FORTIFICATION]: {
        display_name: 'Fortification',
        description: 'Once placed in Deployment, this Unit may not be moved or placed by any Order or effect, voluntarily or involuntarily.',
    },
    [TRAIT_COMMAND]: {
        display_name: 'Command',
        formatter: numberFormater,
        description: 'Units with the Command Trait issue Orders to their Garrison. Once per Activation, when this Unit is issued an Order, instead of performing an Order itself, it will instead issue one of the following Orders to up to (X) Units within its Garrison, or currently deployed on the Battlefield.',
    },
    [TRAIT_BUNKER_MINE_DRONES]: {
        // Deprecated — replaced by TRAIT_MINELAYER with type='ENGAGE'
        display_name: 'Garrison',
        formatter: (name, number, type = null) => `${name}(${number} ${type})`,
        type: 'Mine Drones',
        description: '',
    },
    [TRAIT_SQUADRON]: {
        display_name: 'Squadron',
        description: 'A Squadron is a Unit made up of multiple Models. These Models will Activate together and perform the same Orders together during that Activation.',
    },
    [TRAIT_FLYING]: {
        display_name: 'Flying',
        description: 'When this unit performs a MOVE Order, it instead performs a FLYING MOVE Order. FLYING MOVE: Place the unit within its Speed horizontally of its current position. This ignores any restrictions for moving through Terrain or other Units provided it can be placed in range. The unit must be able to end its move in a place where its Base will fit, and may face any direction. Targeting a Flying Unit: This Unit gains a +1 to Defense Rolls when targeted by ENGAGE Orders. Weapons Targeting this Unit are not modified for Covered or Blocked modifiers. LoS is still required to Target this Unit. If this Unit is Targeted by a Weapon with the Blast (X) trait, Units without the Flying Trait are not affected. If this Unit is in the range of a Blast effect, it does not make a Defense Roll. This Unit may not perform a SMASH Order, or be the Target of SMASH Orders. The Silhouette of a Flying Unit extends from bottom of the base to 4" above the bottom of the base, regardless of the actual Model\'s dimensions.',
    },
    [TRAIT_FLYING_SQUADRON]: {
        display_name: 'Flying Squadron',
        description: 'This unit has all rules from the Squadron trait, with the following exceptions: All other models in the Squadron must end their deployment or movement within 6" of the Leader Model. When targeted by an ENGAGE Order, if enough damage is dealt by a Weapon to destroy the Target Model, do not apply any remaining damage to another Model of the squadron. Do not add 2 to the Attack Pool of a Blast Weapon during an ENGAGE Order against a unit with this trait.',
        dependent_trait_ids: [TRAIT_SQUADRON],
    },
    [TRAIT_HEAVY_SUPPORT_ASSET]: {
        // Deprecated in 1.5 — replaced by Asset Command
        display_name: 'Heavy Support Asset',
        description: 'When a Heavy Support Asset is deployed, all units of the Heavy Support Asset must deploy within 3" of another Model from the same Heavy Support Asset.',
    },
    [TRAIT_HAULER]: {
        // Deprecated in 1.5 — replaced by Squadron Garrison for UL HEV transport
        display_name: 'Hauler',
        description: `This unit Garrisons a Unit from a separate Asset, and is not in its Group Command. The Garrisoned Unit must be purchased as a separate Asset, following all rules for its selection.`,
        granted_order_ids: [ORDER_INFANTRY_MUSTER],
    },
    // temporary until unit types and sizes are separate stats
    [TRAIT_UNIT_SIZE_AND_TYPE]: {
        display_name: 'Unit Type: ',
        description: null,
        formatter: (name, number, type) => `${name} ${type}`,
    },

    // ── Ch17 additions ──────────────────────────────────────────────────────

    [TRAIT_AUXILIARY_UNIT]: {
        display_name: 'Auxiliary Unit',
        formatter: (name, number, type = null) => type ? `${name} (${type})` : name,
        description: 'This Unit will Defend against ENGAGE and SMASH Orders as if it were the Weight Class indicated by (X). Attack Pools against this Unit are never modified for Side or Rear Arc. This Unit does not suffer Critical Damage. This Unit never suffers or benefits from Fragile Internals or Backup Systems Engage. This Unit will count as the Weight Class indicated by (X) when making Rolls for other Weapons, Upgrades, and other traits when relevant. This Unit may never perform a SMASH Order, unless it has a weapon with the Smasher (X,Y) Trait. This Unit may never Overdrive. If this Unit would be marked with a Redline Marker from an effect, it suffers 1 point of Structure damage, but do not mark it with a Redline Marker. Units with the Auxiliary Unit (X) Trait do not count as HE-Vs unless otherwise specified.',
    },
    [TRAIT_VULNERABLE]: {
        display_name: 'Vulnerable',
        description: 'This Unit receives full Damage to Armor and Structure from Weapons or effects with the Light trait.',
    },
    [TRAIT_YIELDING]: {
        display_name: 'Yielding',
        description: 'Any Model without the Yielding trait may move through any Model with the Yielding trait. If such a Model ends its move on top of a Model with the Yielding trait, move any Models with the Yielding trait the minimum distance possible to permit this.',
    },
    [TRAIT_INFANTRY]: {
        display_name: 'Infantry',
        description: 'When Infantry Units are activated, do not select their orders from the usual list. Instead, select two orders from the list below: MUSTER (see Garrison rules), MOVE (as normal, except this unit may perform this order twice in one Activation), LOCK ON (as normal), ENGAGE (as normal), DIG IN (this unit counts as being in Rough Terrain until the beginning of their next activation). Infantry suffers a -1 penalty to Defense Rolls when not in Rough or Covering Terrain. Infantry Units count as 0 tons for Scoring Objectives or Agendas.',
    },
    [TRAIT_MINELAYER]: {
        display_name: 'Minelayer',
        formatter: (name, number, type = null) => type ? `${name} (${type})` : name,
        description: 'Immediately before or after resolving (X) Order, place one friendly Mine Drone Token within 3" of the Active Model and not within 6" of another friendly Mine Drone Token.',
    },
    [TRAIT_SMASHER]: {
        display_name: 'Smasher',
        formatter: (name, number, type = null) => type ? `${name} (${type}, ${number})` : name,
        description: 'This Unit is permitted to make the SMASH Order, even if it has the Auxiliary Unit Trait. The Unit is considered of Weight Class (X) when making a SMASH Order. Add (Y) dice to the Attack Pool when performing a SMASH Order.',
    },
    [TRAIT_GUIDANCE_SUITE]: {
        display_name: 'Guidance Suite',
        formatter: (name, number, type = null) => type ? `${name} (${type})` : name,
        description: 'At the beginning or end of the Order listed in (X), select one enemy unit within LOS of this Model. Place a Guidance Marker on this unit. When a Unit with a Guidance Marker is the Target of an ENGAGE Order, the Unit performing the ENGAGE selects one of the following effects: (a) All weapons used in this ENGAGE Order count as having the benefit of a LOCK ON Order. (b) One weapon used in this ENGAGE Order may have +2 added to its Damage Rating. When the ENGAGE Order is complete, remove the Guidance Marker. If the Marker has not been otherwise removed, remove the Marker when this Unit is activated again.',
    },
    [TRAIT_SQUADRON_GARRISON]: {
        display_name: 'Squadron Garrison',
        formatter: (name, number, type = null) => type ? `${name}(${number} ${type})` : name,
        description: 'This unit follows all of the rules of the Garrison (X) trait, with the following exceptions: The Unit (not Models) with the Squadron Garrison (X) trait carry the Garrisoned Unit collectively. Select one member Model of the Unit to count as the Garrison when the Garrisoned Unit performs the MUSTER Order. If the Unit with this trait loses a member Model, its Commander removes Garrisoned models proportionately, rounding up the number of Models removed.',
    },
});

export function unitTraitDisplayName({id, number, type}) {

    const trait = UNIT_TRAITS[id];

    if (!trait) {
        throw new Error('trait not found: '.id);
    }
    if (trait.formatter) {
        return trait.formatter(trait.display_name, number, type);
    }
    return trait.display_name;
}

export function freshUnitTrait(trait) {
    trait = Object.assign({}, UNIT_TRAITS[trait.id], trait);
    trait.display_name = unitTraitDisplayName(trait);

    return trait;
}
