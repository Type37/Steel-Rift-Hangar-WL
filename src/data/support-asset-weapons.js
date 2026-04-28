import {TRAIT_AP, TRAIT_BLAST, TRAIT_KINETIC, TRAIT_LIMITED, TRAIT_MINE_TOKENS} from './weapon-traits.js';
import {makeFrozenStaticListIds, trait} from './data-helpers.js';

export const ARTILLERY_BARRAGE = 'ARTILLERY_BARRAGE';
export const MASS_DRIVER = 'MASS_DRIVER';
export const MINE_DRONE_BARRAGE = 'MINE_DRONE_BARRAGE';
export const ORBITAL_LASER = 'ORBITAL_LASER';

export const SUPPORT_ASSET_WEAPONS = makeFrozenStaticListIds({
    [ARTILLERY_BARRAGE]: {
        display_name: 'Artillery Barrage',
        description: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the friendly Unit\'s Marker. Perform an ENGAGE Order Targeting the enemy Unit. Do not apply modifiers for Side or Rear Arc, Covered, Blocking, Secondary Target or Bypassing Shot. LoS is drawn from the top of the Target Model\'s Silhouette for any other purposes.',
        cost: 10,
        off_table_weapon: {
            damage: 4,
            traits: [
                trait(TRAIT_BLAST, 6),
                trait(TRAIT_LIMITED, 3),
            ],
        },
    },
    [MASS_DRIVER]: {
        display_name: 'Mass Driver',
        description: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the friendly Unit\'s Marker. Perform an ENGAGE Order Targeting the enemy Unit. Do not apply modifiers for Bypassing Shot or Secondary Target. LoS is drawn from any point on the Active Commander\'s Deployment Edge or Corner, but is not blocked by Blocking Terrain. The Weapon counts as Ultraheavy for the purposes of Kinetic.',
        cost: 10,
        off_table_weapon: {
            damage: 7,
            traits: [
                trait(TRAIT_KINETIC),
                trait(TRAIT_LIMITED, 3),
            ],
        },
    },
    [MINE_DRONE_BARRAGE]: {
        display_name: 'Mine Drone Barrage',
        description: 'Select 3 points on the table within LoS of one friendly Unit with a Target Designator Marker, and remove the friendly Unit\'s Marker. Place a Mine Drone Token on each point. No Mine Drone Token may be placed within 6\" of an existing Mine Drone Token. This Support Asset has the Limited (3) trait (i.e. a total of 9 Mine Drone Tokens placed during the game).',
        cost: 10,
        off_table_weapon: {
            traits: [
                trait(TRAIT_MINE_TOKENS, 3),
                trait(TRAIT_LIMITED, 3),
            ],
        },
    },
    [ORBITAL_LASER]: {
        display_name: 'Orbital Laser',
        description: 'Select an enemy Unit within LoS of a friendly Unit with a Target Designator Marker, and remove the friendly Unit\'s Marker. Perform an ENGAGE Order Targeting the enemy Unit. Do not apply modifiers for Side or Rear Arc, Covered, Blocking, Secondary Target or Bypassing Shot. LoS is drawn from the top of the Target Model\'s Silhouette for any other purposes.',
        cost: 10,
        off_table_weapon: {
            damage: 3,
            traits: [
                trait(TRAIT_AP, 3),
                trait(TRAIT_LIMITED, 3),
            ],
        },
    },
});
