import {TEAM_SIZE_LARGE, TEAM_SIZE_MEDIUM, TEAM_SIZE_SMALL} from './mech-teams.js';
import {makeFrozenStaticListIds} from './data-helpers.js';

export const GAME_SIZE_DUEL = 'GAME_SIZE_DUEL';
export const GAME_SIZE_RECON = 'GAME_SIZE_RECON';
export const GAME_SIZE_STRIKE = 'GAME_SIZE_STRIKE';
export const GAME_SIZE_BATTLE = 'GAME_SIZE_BATTLE';
export const GAME_SIZE_WAR = 'GAME_SIZE_WAR';

export const GAME_SIZES = makeFrozenStaticListIds({
    [GAME_SIZE_DUEL]: {
        min_tons: 0,
        max_support_assets: 0,
        max_teams: 0,
        max_secondary_agendas: 0,
        max_team_sizes: {
            [TEAM_SIZE_SMALL]: 0,
            [TEAM_SIZE_MEDIUM]: 0,
            [TEAM_SIZE_LARGE]: 0,
        },
    },
    [GAME_SIZE_RECON]: {
        min_tons: 100,
        max_support_assets: 1,
        max_teams: 1,
        max_secondary_agendas: 1,
        max_team_sizes: {
            [TEAM_SIZE_SMALL]: 1,
            [TEAM_SIZE_MEDIUM]: 0,
            [TEAM_SIZE_LARGE]: 0,
        },
    },
    [GAME_SIZE_STRIKE]: {
        min_tons: 150,
        max_support_assets: 2,
        max_teams: 2,
        max_secondary_agendas: 2,
        max_team_sizes: {
            [TEAM_SIZE_SMALL]: 0,
            [TEAM_SIZE_MEDIUM]: 2,
            [TEAM_SIZE_LARGE]: 0,
        },
    },
    [GAME_SIZE_BATTLE]: {
        min_tons: 200,
        max_support_assets: 3,
        max_teams: 3,
        max_secondary_agendas: 3,
        max_team_sizes: {
            [TEAM_SIZE_SMALL]: 0,
            [TEAM_SIZE_MEDIUM]: 2,
            [TEAM_SIZE_LARGE]: 1,
        },
    },
    [GAME_SIZE_WAR]: {
        min_tons: 350,
        max_support_assets: 4,
        max_teams: 4,
        max_secondary_agendas: 4,
        max_team_sizes: {
            [TEAM_SIZE_SMALL]: 0,
            [TEAM_SIZE_MEDIUM]: 2,
            [TEAM_SIZE_LARGE]: 2,
        },
    },
});

export function getGameSizeId(maxTons) {
    const sizes = [
        GAME_SIZE_WAR,
        GAME_SIZE_BATTLE,
        GAME_SIZE_STRIKE,
        GAME_SIZE_RECON,
        GAME_SIZE_DUEL,
    ];

    return sizes.find((sizeId) => {
        return maxTons >= GAME_SIZES[sizeId].min_tons;
    });
}
