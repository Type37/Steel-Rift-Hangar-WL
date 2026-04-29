<script setup>
import {storeToRefs} from 'pinia';
import {computed} from 'vue';
import {useSecondaryAgendaStore} from '../../../store/secondary-agenda-store.js';
import SecondaryAgendaDefinition from '../../ArmyEdit/SecondaryAgendas/SecondaryAgendaDefinition.vue';

const {secondary_agendas, all_universal_agendas, max_secondary_agendas} = storeToRefs(useSecondaryAgendaStore());

const qualified_universals = computed(() => all_universal_agendas.value.filter(a => a.qualified));

const hasAny = computed(() => secondary_agendas.value.length || qualified_universals.value.length);
</script>
<template>
  <div v-if="hasAny">
    <div class="divider"></div>

    <div class="ref-heading">
      <span>Secondary Agendas</span>
      <small> (Choose {{ max_secondary_agendas }} at game start)</small>
    </div>

    <SecondaryAgendaDefinition
        v-for="item in secondary_agendas"
        :key="item.id"
        :type-display-name="item.type_display_name"
        :subtype-display-name="item.subtype_display_name"
        :display-name="item.display_name"
        :description="item.description"
    />

    <template v-if="qualified_universals.length">
      <div class="fw-bold small mt-2 mb-1">Universal</div>
      <SecondaryAgendaDefinition
          v-for="item in qualified_universals"
          :key="item.id"
          :type-display-name="'Universal'"
          :subtype-display-name="null"
          :display-name="item.display_name"
          :description="item.description"
      />
    </template>
  </div>
</template>
