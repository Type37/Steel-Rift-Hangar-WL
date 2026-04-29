<script setup>
import {useValidationStore} from '../../../store/validation-store.js';
import {useArmyListStore} from '../../../store/army-list-store.js';
import {storeToRefs} from 'pinia';
import {
    GAME_SIZES,
    GAME_SIZE_RECON,
    GAME_SIZE_STRIKE,
    GAME_SIZE_BATTLE,
    GAME_SIZE_WAR,
} from '../../../data/game-sizes.js';
import {TEAM_SIZE_SMALL, TEAM_SIZE_MEDIUM, TEAM_SIZE_LARGE} from '../../../data/mech-teams.js';

const {team_size_count_validation} = storeToRefs(useValidationStore());
const {game_size_id} = storeToRefs(useArmyListStore());

const rows = [
    {id: GAME_SIZE_RECON, label: 'Recon'},
    {id: GAME_SIZE_STRIKE, label: 'Strike'},
    {id: GAME_SIZE_BATTLE, label: 'Battle'},
    {id: GAME_SIZE_WAR, label: 'War'},
];

const cols = [TEAM_SIZE_SMALL, TEAM_SIZE_MEDIUM, TEAM_SIZE_LARGE];

function getCount(sizeId, teamSizeId) {
    const count = GAME_SIZES[sizeId].max_team_sizes[teamSizeId];
    return count > 0 ? count : '–';
}
</script>
<template>
  <div
      :class="{
        'border-danger': !team_size_count_validation.valid,
      }"
      class="card px-2 py-1 h-100"
  >
    <div class="fw-bold small mb-1">Team Limits</div>
    <table class="table table-sm table-borderless mb-0" style="font-size: 0.72rem;">
      <thead>
        <tr>
          <th></th>
          <th class="text-center px-0">2 <Icon name="hev" size="12px"/></th>
          <th class="text-center px-0">2–3 <Icon name="hev" size="12px"/></th>
          <th class="text-center px-0">3–4 <Icon name="hev" size="12px"/></th>
        </tr>
      </thead>
      <tbody>
        <tr
            v-for="row in rows"
            :key="row.id"
            :class="{'fw-bold text-primary': row.id === game_size_id}"
        >
          <td class="ps-0 py-0">{{ row.label }}</td>
          <td
              v-for="col in cols"
              :key="col"
              class="text-center px-0 py-0"
          >
            {{ getCount(row.id, col) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!team_size_count_validation.valid" class="text-danger small mt-1">
      {{ team_size_count_validation.validation_message }}
    </div>
  </div>
</template>
