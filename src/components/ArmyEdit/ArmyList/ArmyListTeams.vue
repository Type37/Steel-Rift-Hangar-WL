<script setup>
import {useTeamStore} from '../../../store/team-store.js';
import {storeToRefs} from 'pinia';
import {computed} from 'vue';
import {useValidationStore} from '../../../store/validation-store.js';

const {team_size_count_validation} = storeToRefs(useValidationStore());

const {max_team_size_info} = storeToRefs(useTeamStore());

const teamSizeInfo = computed(() => {
  return max_team_size_info.value.filter((item) => item.max_instance_count);
});
</script>
<template>
  <div
      :class="{
        'card px-2 py-1': true,
        'border-danger': !team_size_count_validation.valid,
      }"
  >
    <div class="fw-bold">Team Limits</div>
    <div v-for="(item) in teamSizeInfo">
      Up to {{ item.max_instance_count }}, max {{ item.description }} <Icon name="hev"/>
    </div>

    <div
        v-if="!team_size_count_validation.valid"
        class="text-danger"
    >
      {{ team_size_count_validation.validation_message }}
    </div>

  </div>
</template>
