export const ORDER_INFANTRY_MUSTER = 'ORDER_INFANTRY_MUSTER';
export const ORDER_INFANTRY_DIG_IN = 'ORDER_INFANTRY_DIG_IN';

export const INFANTRY_ORDERS_DATA = {
    [ORDER_INFANTRY_MUSTER]: {
        display_name: 'Muster',
        description: 'The Garrisoned Unit is placed within 1" of its Garrison. If the Garrisoned Unit has the Squadron Trait, place one model within 1” of the Garrison, then place the other models within 3” of that initial model. This Unit is no longer considered Garrisoned, and is now “Mustered”.',
    },
    [ORDER_INFANTRY_DIG_IN]: {
        display_name: 'Dig In',
        description: 'This unit counts as being in Rough Terrain until the beginning of their next activation.',
    },
};

