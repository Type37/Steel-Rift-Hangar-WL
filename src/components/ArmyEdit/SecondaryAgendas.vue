<script setup>
import {storeToRefs} from 'pinia';
import {useSecondaryAgendaStore} from '../../store/secondary-agenda-store.js';
import {BCollapse} from 'bootstrap-vue-next';
import {ref} from 'vue';
import SecondaryAgendaDefinition from './SecondaryAgendas/SecondaryAgendaDefinition.vue';

const {
  universal_secondary_agendas,
  secondary_agendas,
  max_secondary_agendas,
} = storeToRefs(useSecondaryAgendaStore());

const universalOpen = ref(false);
const agendaOpen = ref(false);
</script>
<template>
  <div class="card">
    <div
        class="card-header d-flex text-bg-primary"
        style="cursor:pointer"
        @click="agendaOpen = !agendaOpen"
    >
      <div class="flex-grow-1 py-1 ps-2">
        <span class="fw-bold">Secondary Agendas</span>
        <span class="ms-1 text-white-50">(Choose {{ max_secondary_agendas }} at game start)</span>
      </div>
      <div class="py-1 pe-1">
        <span class="material-symbols-outlined" style="font-size:1.1rem; vertical-align:middle">
          {{ agendaOpen ? 'expand_less' : 'expand_more' }}
        </span>
      </div>
    </div>

    <BCollapse v-model="agendaOpen">
      <div class="card-body">
        <SecondaryAgendaDefinition
            v-for="item in secondary_agendas"
            :key="item.display_name"
            :type-display-name="item.type_display_name"
            :subtype-display-name="item.subtype_display_name"
            :display-name="item.display_name"
            :description="item.description"
        />

        <div class="mt-2">
          <button
              class="btn btn-sm btn-outline-secondary w-100 text-start"
              @click.stop="universalOpen = !universalOpen"
          >
            <span class="material-symbols-outlined" style="font-size:0.9rem; vertical-align:middle">
              {{ universalOpen ? 'expand_less' : 'expand_more' }}
            </span>
            Universal Agendas
          </button>
          <BCollapse v-model="universalOpen">
            <div class="mt-2">
              <SecondaryAgendaDefinition
                  v-for="item in universal_secondary_agendas"
                  :key="item.display_name"
                  :type-display-name="item.type_display_name"
                  :subtype-display-name="item.subtype_display_name"
                  :display-name="item.display_name"
                  :description="item.description"
              />
            </div>
          </BCollapse>
        </div>
      </div>
    </BCollapse>
  </div>
</template>
