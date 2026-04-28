export const ORDER_SUPPORT = 'ORDER_SUPPORT';
export const ORDER_SUPPORT_CNC_STATION = 'ORDER_SUPPORT_CNC_STATION';
export const ORDER_SUPPORT_COMBAT_SUPPLIES = 'ORDER_SUPPORT_COMBAT_SUPPLIES';
export const ORDER_SUPPORT_GUIDANCE_SUITE = 'ORDER_SUPPORT_GUIDANCE_SUITE';
export const ORDER_SUPPORT_MSOE = 'ORDER_SUPPORT_MSOE';
export const ORDER_SUPPORT_MINE_DRONE_LAYER = 'ORDER_SUPPORT_MINE_DRONE_LAYER';

export const ORDER_SUPPORT_DEFINITION = {
    [ORDER_SUPPORT]: {
        display_name: 'Support',
        description: ' The unit may activate the effect of any or all “Support:” traits. See each trait entry for the effects of the “Support:” trait. Note that if a model (or models) in a Squadron have a “Support:” trait, the entire Squadron must perform the Support Order. However, each model with a “Support:” will activate that trait during the Order, in any order its Commander wishes.',
    },
};

export const SUPPORT_ORDERS_DATA = {
    [ORDER_SUPPORT_CNC_STATION]: makeSupportOrder({
        display_name: 'Command and Control Station',
        description: 'When calculating Tonnage for the purpose of any Objective, if a friendly Unit contributing Tonnage to that calculation is within 12" of this Model, the Commander controlling this Model may choose to win or lose any ties. When this Model performs a SUPPORT Order, select an HE-V and move that model up to 3" immediately. A Unit may not be moved by this trait more than once a turn.',
    }),
    [ORDER_SUPPORT_COMBAT_SUPPLIES]: makeSupportOrder({
        display_name: 'Combat Supplies',
        description: 'When this model performs a SUPPORT Order, select one Unit within 2" of this Model, and select one of the benefits below: If the friendly Model is an HE-V, 4 Armor may be restored (this may not increase the HE-V\'s Armor above the value the Unit began the game with). If the friendly Model has a Weapon, Upgrade or other Trait with the Limited Trait, one use of that system is restored (this may not increase its available uses above the initial Limited value). Note: if multiple Models in a Squadron have this Trait, you may select the same or different Target and benefit for each Model with this trait.',
    }),
    [ORDER_SUPPORT_GUIDANCE_SUITE]: makeSupportOrder({
        display_name: 'Guidance Suite',
        description: 'When this model performs a SUPPORT Order, it counts as having the Guidance Suite (SUPPORT) trait. Select one enemy unit within LOS of this model. Place a Guidance Marker on this unit. When a unit with a Guidance Marker is Targeted by an ENGAGE Order, the attacking unit selects one effect: (a) all weapons in this ENGAGE Order count as having a LOCK ON Order benefit, or (b) one weapon may have +2 added to its Damage Rating. Remove the Guidance Marker when the ENGAGE Order is complete, or when this model is activated again.',
    }),
    [ORDER_SUPPORT_MSOE]: makeSupportOrder({
        display_name: 'Multi-spectral Obscuration Emitter (MSOE) Deployer',
        description: 'When this model performs a SUPPORT Order, it counts as having the MSOE Launcher (SUPPORT) trait. Place an Obscuration Emitter Token within 6" of this model.',
    }),
    [ORDER_SUPPORT_MINE_DRONE_LAYER]: makeSupportOrder({
        display_name: 'Mine-Drone Layer',
        description: 'When this model performs a SUPPORT Order, it counts as having the Minelayer (SUPPORT) trait. Place one friendly Mine Drone Token within 3" of the Active Model and not within 6" of another friendly Mine Drone Token.',
    }),
};

function makeSupportOrder(obj) {
    obj.display_name = 'Support: ' + obj.display_name;
    return obj;
}