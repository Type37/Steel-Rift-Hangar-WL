<script setup>
import {useValidationStore} from '../../../store/validation-store.js';
import {useArmyListStore} from '../../../store/army-list-store.js';
import {storeToRefs} from 'pinia';
import {
    GAME_SIZES,
    GAME_SIZE_RECON,
    GAME_SIZE_STRIKE,
    GAME_SIZE_BATTLE,
} from '../../../data/game-sizes.js';
import {TEAM_SIZE_SMALL, TEAM_SIZE_MEDIUM, TEAM_SIZE_LARGE} from '../../../data/mech-teams.js';
import {BPopover} from 'bootstrap-vue-next';

const {team_size_count_validation} = storeToRefs(useValidationStore());
const {game_size_id} = storeToRefs(useArmyListStore());

const rows = [
    {id: GAME_SIZE_RECON, label: 'Recon'},
    {id: GAME_SIZE_STRIKE, label: 'Strike'},
    {id: GAME_SIZE_BATTLE, label: 'Battle'},
];

const cols = [
    {id: TEAM_SIZE_SMALL, label: 'Sm', title: 'Small team (2 HE-Vs)'},
    {id: TEAM_SIZE_MEDIUM, label: 'Md', title: 'Medium team (2–3 HE-Vs)'},
    {id: TEAM_SIZE_LARGE, label: 'Lg', title: 'Large team (3–4 HE-Vs)'},
];

function getCount(sizeId, teamSizeId) {
    const count = GAME_SIZES[sizeId].max_team_sizes[teamSizeId];
    return count > 0 ? count : '–';
}
</script>
<template>
  <div
      :class="{'border-danger': !team_size_count_validation.valid}"
      class="card px-2 py-1 h-100"
  >
    <div class="d-flex align-items-center mb-1">
      <span class="fw-bold small me-auto">Team Limits</span>
      <BPopover placement="right" trigger="click focus">
        <template #target>
          <button class="btn btn-sm p-0 ms-1 text-secondary" style="line-height:1">
            <span class="material-symbols-outlined" style="font-size:0.95rem">shield_question</span>
          </button>
        </template>
        <template #title>Teams</template>
        A <strong>Team</strong> is a group of 2–4 HE-Vs that activate together,
        share special rules, and unlock a Team Secondary Agenda.<br><br>
        This table shows how many teams of each size you can field.
        <strong>Sm</strong> = 2 HE-Vs &nbsp;
        <strong>Md</strong> = 2–3 HE-Vs &nbsp;
        <strong>Lg</strong> = 3–4 HE-Vs.<br><br>
        Your active game size row is shown in bold.
      </BPopover>
    </div>

    <table class="table table-sm table-borderless mb-0" style="font-size: 0.72rem;">
      <thead>
        <tr>
          <th></th>
          <th
              v-for="col in cols"
              :key="col.id"
              class="text-center px-0"
              :title="col.title"
              style="cursor:help"
          >
            {{ col.label }} <Icon name="hev" size="12px"/>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
            v-for="row in rows"
            :key="row.id"
            :class="{'fw-bold': row.id === game_size_id}"
        >
          <td class="ps-0 py-0">{{ row.label }}</td>
          <td
              v-for="col in cols"
              :key="col.id"
              class="text-center px-0 py-0"
          >
            {{ getCount(row.id, col.id) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!team_size_count_validation.valid" class="text-danger small mt-1">
      {{ team_size_count_validation.validation_message }}
    </div>
  </div>
</template>
