export const ORDER_CLEAR_MINEFIELD = 'ORDER_CLEAR_MINEFIELD';
export const ORDER_DASH = 'ORDER_DASH';

export const SPECIAL_ORDERS_DATA = {
    [ORDER_CLEAR_MINEFIELD]: {
        display_name: 'Clear Minefield',
        description: 'This Unit may ENGAGE Mine Drone Tokens as if it had the Mine Drone Tracking Munitions Upgrade.',
    },
    [ORDER_DASH]: {
        display_name: 'Dash',
        description: 'This Unit may move up to (X)", ignoring Rough Terrain. At the end of this DASH Order, this Unit may immediately resolve a SMASH Order or ENGAGE Order. This secondary Order does not count towards the normal 2 Orders a Unit can perform during its Activation. DASH Orders count as a MOVE Order for the purposes of determining movement based bonuses for SMASH Orders.',
    },
};
