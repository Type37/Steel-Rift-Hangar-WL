import {computed} from 'vue';
import {useFactionStore} from './faction-store.js';
import {FACTIONS} from '../data/factions.js';
import {useTeamStore} from './team-store.js';
import {MECH_TEAMS, TEAM_GENERAL, TEAM_SHELF, TEAM_TACTICAL} from '../data/mech-teams.js';
import {
    SA_BRAWLERS,
    SA_ENFORCERS,
    SA_STALKERS,
    SA_TITAN_KILLERS,
    SECONDARY_AGENDAS,
} from '../data/secondary-agendas.js';
import {useArmyListStore} from './army-list-store.js';
import {useMechStore} from './mech-store.js';
import {SIZE_HEAVY, SIZE_LIGHT, SIZE_MEDIUM, SIZE_ULTRA} from '../data/unit-sizes.js';
import {countBy} from 'es-toolkit';
import {defineScopeableStore} from 'pinia-scope';

export const useSecondaryAgendaStore = defineScopeableStore('secondary-agenda', ({scope}) => {

    const factionStore = useFactionStore(scope);
    const teamStore = useTeamStore(scope);
    const armyListStore = useArmyListStore(scope);
    const mechStore = useMechStore(scope);

    function $reset() {}

    const max_secondary_agendas = computed(() => {
        return armyListStore.game_size_info.max_secondary_agendas;
    });

    // All faction agendas — qualified if this faction is selected
    const all_faction_agendas = computed(() => {
        return Object.entries(FACTIONS)
            .filter(([, faction]) => faction.secondary_agenda_id)
            .map(([factionId, faction]) => ({
                ...SECONDARY_AGENDAS[faction.secondary_agenda_id],
                type_display_name: 'Faction',
                subtype_display_name: faction.display_name,
                qualified: factionStore.faction_id === factionId,
            }));
    });

    // All team agendas — qualified if that team has HE-Vs in the list
    const all_team_agendas = computed(() => {
        const activatedTeamIds = new Set(
            teamStore.teams
                .filter(team => teamStore.getTeamMechCount(team.id) > 0)
                .map(team => team.id),
        );

        const skip = new Set([TEAM_SHELF, TEAM_GENERAL, TEAM_TACTICAL]);
        const seen = new Set();
        const result = [];

        Object.entries(MECH_TEAMS).forEach(([teamId, team]) => {
            if (skip.has(teamId) || !team.secondary_agenda_id) return;
            if (seen.has(team.secondary_agenda_id)) return;
            seen.add(team.secondary_agenda_id);

            result.push({
                ...SECONDARY_AGENDAS[team.secondary_agenda_id],
                type_display_name: team.display_name,
                qualified: activatedTeamIds.has(teamId),
            });
        });

        return result;
    });

    // All universal agendas — qualified based on HE-V count requirements
    const all_universal_agendas = computed(() => {
        const sizesByCount = countBy(mechStore.mechs, mech => mech.size_id);

        return Object.values(SECONDARY_AGENDAS)
            .filter(agenda => agenda.is_universal)
            .map(agenda => {
                let qualified = false;
                if (agenda.id === SA_STALKERS) qualified = (sizesByCount[SIZE_LIGHT] || 0) >= 2;
                else if (agenda.id === SA_BRAWLERS) qualified = (sizesByCount[SIZE_MEDIUM] || 0) >= 2;
                else if (agenda.id === SA_ENFORCERS) qualified = (sizesByCount[SIZE_HEAVY] || 0) >= 2;
                else if (agenda.id === SA_TITAN_KILLERS) qualified = (sizesByCount[SIZE_ULTRA] || 0) >= 1 || Object.values(sizesByCount).some((v, i) => i > 0 && v >= 2);
                return {...agenda, qualified};
            });
    });

    // Legacy — kept for any old code that references these
    const secondary_agendas = computed(() => [
        ...all_faction_agendas.value.filter(a => a.qualified),
        ...all_team_agendas.value.filter(a => a.qualified),
    ]);

    const universal_secondary_agendas = computed(() => {
        return Object.values(SECONDARY_AGENDAS).filter(item => item.is_universal);
    });

    return {
        max_secondary_agendas,
        all_faction_agendas,
        all_team_agendas,
        all_universal_agendas,
        secondary_agendas,
        universal_secondary_agendas,
        $reset,
    };
});
