<script setup>
import {BDropdown, BDropdownItem} from 'bootstrap-vue-next';
import {useTeamStore} from '../../store/team-store.js';
import {storeToRefs} from 'pinia';

const teamStore = useTeamStore();
const {addable_teams} = storeToRefs(teamStore);
</script>
<template>
  <BDropdown
      toggle-class="add-team-cta"
      size="lg"
      class="d-inline-block"
  >
    <template #button-content>
      <span class="material-symbols-outlined me-2" style="font-size:2.1rem;vertical-align:-.35em">groups</span>
      Add Team
    </template>
    <BDropdownItem
        v-for="item in addable_teams"
        @click="teamStore.addTeamWithDefaultMechs(item.id)"
    >
      <Icon :name="item.icon"/>
      {{ item.display_name }}
    </BDropdownItem>
  </BDropdown>
</template>
