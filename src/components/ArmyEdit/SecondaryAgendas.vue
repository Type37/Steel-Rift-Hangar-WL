<script setup>
import {storeToRefs} from 'pinia';
import {useSecondaryAgendaStore} from '../../store/secondary-agenda-store.js';

const {
  all_faction_agendas,
  all_team_agendas,
  all_universal_agendas,
  max_secondary_agendas,
} = storeToRefs(useSecondaryAgendaStore());
</script>
<template>
  <div class="card">
    <div class="card-header text-bg-primary py-2 ps-3">
      <span class="fw-bold">Secondary Agendas</span>
      <span class="ms-1 text-white-50">(Choose {{ max_secondary_agendas }} at game start)</span>
    </div>

    <div class="card-body pb-2">

      <!-- Faction -->
      <div class="agenda-section-heading">Faction</div>
      <div
          v-for="item in all_faction_agendas"
          :key="item.id"
          :class="['agenda-entry', { 'agenda-unqualified': !item.qualified }]"
      >
        <div class="agenda-name">
          {{ item.display_name }}
          <span class="agenda-source">({{ item.subtype_display_name }})</span>
        </div>
        <div class="agenda-desc">{{ item.description }}</div>
      </div>

      <!-- Team -->
      <div class="agenda-section-heading mt-3">Team</div>
      <div
          v-for="item in all_team_agendas"
          :key="item.id"
          :class="['agenda-entry', { 'agenda-unqualified': !item.qualified }]"
      >
        <div class="agenda-name">
          {{ item.display_name }}
          <span class="agenda-source">({{ item.type_display_name }})</span>
        </div>
        <div class="agenda-desc">{{ item.description }}</div>
      </div>

      <!-- Universal -->
      <div class="agenda-section-heading mt-3">Universal</div>
      <div
          v-for="item in all_universal_agendas"
          :key="item.id"
          :class="['agenda-entry', { 'agenda-unqualified': !item.qualified }]"
      >
        <div class="agenda-name">{{ item.display_name }}</div>
        <div class="agenda-desc">{{ item.description }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.agenda-section-heading {
  font-family: 'Chakra Petch', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  border-bottom: 1px solid var(--bs-border-color);
  padding-bottom: 2px;
  margin-bottom: 6px;
}

.agenda-entry {
  margin-bottom: 8px;
}

.agenda-unqualified {
  opacity: 0.38;
}

.agenda-name {
  font-weight: 600;
  font-size: 0.85rem;
  line-height: 1.3;
}

.agenda-source {
  font-weight: 400;
  color: var(--bs-secondary-color);
}

.agenda-desc {
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
  line-height: 1.4;
}
</style>
