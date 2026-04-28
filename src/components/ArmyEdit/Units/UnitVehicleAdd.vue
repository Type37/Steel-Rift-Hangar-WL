<script setup>
import VehicleWeaponToolTip from '../../UI/VehicleWeaponToolTip.vue';
import IconNotAvailable from '../../UI/IconNotAvailable.vue';
import TraitList from '../../UI/TraitList.vue';
import {BDropdown} from 'bootstrap-vue-next';
import FormatInches from '../../functional/format-inches.vue';
import {ref} from 'vue';

const {disabled} = defineProps({
  disabled: {
    type: Boolean,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['selected']);
const hoveredId = ref(null);

function select(id, valid) {
  if (!valid) return;
  emit('selected', id);
}
</script>

<template>
  <BDropdown
      class="dropdown-table d-inline-block"
      size="sm"
      variant="secondary"
      placement="bottom-end"
      :disabled="disabled"
  >
    <template #button-content>
      <slot></slot>
    </template>
    <div class="position-relative">
      <table class="table table-borderless table-striped vehicle-add-table mb-0">
        <thead class="sticky-top top-0 shadow">
        <tr>
          <td>Type</td>
          <td class="text-end">Move</td>
          <td class="text-end">Arm</td>
          <td class="text-end">Str</td>
          <td></td>
        </tr>
        </thead>
        <tbody>
        <template v-for="item in options" :key="item.id">
          <tr
              :class="{
                'dropdown-row': true,
                'disabled': !item.valid,
                'vehicle-row-active': hoveredId === item.id,
              }"
              @mouseenter="hoveredId = item.id"
              @mouseleave="hoveredId = null"
              @click="select(item.id, item.valid)"
          >
            <td class="text-nowrap fw-medium">{{ item.display_name }}</td>
            <td class="text-end"><format-inches :value="item.move"/></td>
            <td class="text-end">{{ item.armor }}</td>
            <td class="text-end">{{ item.structure }}</td>
            <td class="text-end pe-2">
              <IconNotAvailable
                  :valid="item.valid !== false"
                  :validation-message="item.validation_message"
              />
            </td>
          </tr>
          <tr
              v-if="hoveredId === item.id"
              class="vehicle-detail-row"
              @mouseenter="hoveredId = item.id"
              @mouseleave="hoveredId = null"
              @click="select(item.id, item.valid)"
          >
            <td colspan="5" class="px-3 pb-2 pt-0">
              <div class="vehicle-detail-inner">
                <div v-if="item.weapons || item.weapon_choices" class="mb-1">
                  <span class="vehicle-detail-label">Weapons</span>
                  <template v-if="item.weapons">
                    <span v-for="(weapon, index) in item.weapons" :key="index">
                      <VehicleWeaponToolTip :weapon="weapon"/>
                      <template v-if="index !== item.weapons.length - 1">, </template>
                    </span>
                  </template>
                  <template v-if="item.weapons && item.weapon_choices">, </template>
                  <template v-if="item.weapon_choices">
                    <span v-for="(choices, i1) in item.weapon_choices" :key="i1">
                      <span v-for="(weapon, i2) in choices" :key="i2" class="text-nowrap">
                        <VehicleWeaponToolTip :weapon="weapon"/>
                        <template v-if="i2 !== choices.length - 1"> or </template>
                      </span>
                      <span v-if="i1 !== item.weapon_choices.length - 1">, </span>
                    </span>
                  </template>
                </div>
                <div v-if="item.traits && item.traits.length">
                  <span class="vehicle-detail-label">Traits</span>
                  <TraitList :traits="item.traits"/>
                </div>
              </div>
            </td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>
  </BDropdown>
</template>

<style scoped>
.vehicle-add-table tr.vehicle-row-active > td {
  background-color: var(--bs-table-hover-bg);
}

.vehicle-detail-row {
  cursor: pointer;
}

.vehicle-detail-row:hover {
  background-color: var(--bs-table-hover-bg);
}

.vehicle-detail-inner {
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
  border-left: 2px solid var(--bs-border-color);
  padding-left: 8px;
}

.vehicle-detail-label {
  font-weight: 600;
  color: var(--bs-body-color);
  margin-right: 4px;
}
</style>
