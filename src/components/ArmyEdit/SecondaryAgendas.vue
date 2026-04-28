<script setup>
import {storeToRefs} from 'pinia';
import {useSecondaryAgendaStore} from '../../store/secondary-agenda-store.js';
import SecondaryAgendaDefinition from './SecondaryAgendas/SecondaryAgendaDefinition.vue';

const {
  universal_secondary_agendas,
  secondary_agendas,
  max_secondary_agendas,
} = storeToRefs(useSecondaryAgendaStore());
</script>
<template>
  <div class="card">
    <div class="card-header d-flex text-bg-primary">
      <div class="flex-grow-1 py-1 ps-2">
        <span class="fw-bold">
          Secondary Agendas
        </span>
        (Choose {{ max_secondary_agendas }} at game start)
      </div>
    </div>
    <div class="card-body">
      <SecondaryAgendaDefinition
          v-for="item in secondary_agendas"
          :type-display-name="item.type_display_name"
          :subtype-display-name="item.subtype_display_name"
          :display-name="item.display_name"
          :description="item.description"
      />

      <template v-if="universal_secondary_agendas.length">
        <hr class="my-2"/>
        <div class="small fw-bold text-muted mb-2">Universal Agendas</div>
        <SecondaryAgendaDefinition
            v-for="item in universal_secondary_agendas"
            :type-display-name="item.type_display_name"
            :subtype-display-name="item.subtype_display_name"
            :display-name="item.display_name"
            :description="item.description"
        />
      </template>
    </div>
  </div>
</template>
