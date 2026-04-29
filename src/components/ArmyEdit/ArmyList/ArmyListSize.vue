<script setup>
import {BFormFloatingLabel, BFormInput} from 'bootstrap-vue-next';
import {useArmyListStore} from '../../../store/army-list-store.js';
import {storeToRefs} from 'pinia';
import {onMounted, ref, watch} from 'vue';

const store = useArmyListStore();

const {max_tons} = storeToRefs(store);

const disabled = ref(false);
const armyTypeMaxTons = ref(100);
const options = [
  {
    text: 'Recon',
    value: 100,
  },
  {
    text: 'Strike',
    value: 150,
  },
  {
    text: 'Battle',
    value: 200,
  },
  {
    text: 'Custom',
    value: 'custom',
  },
];

watch(armyTypeMaxTons, () => {

  const isCustom = armyTypeMaxTons.value === 'custom';
  disabled.value = !isCustom;

  if (!isCustom) {
    max_tons.value = armyTypeMaxTons.value;
  }
});

function syncArmyType() {
  const result = options.find((option) => option.value === max_tons.value);

  if (result) {
    armyTypeMaxTons.value = result.value;
  }
}

onMounted(() => {
  syncArmyType();
});
</script>
<template>
  <div class="col">
    <BFormFloatingLabel
        label="Tonnage"
        label-for="list-max-tons"
        class="mb-1"
    >
      <BFormInput
          id="list-max-tons"
          v-model="max_tons"
          type="number"
          :disabled="disabled"
          @blur="syncArmyType"
      />
    </BFormFloatingLabel>
  </div>
  <div class="col">
    <div class="form-floating mb-1">
      <BFormSelect
          v-model="armyTypeMaxTons"
          :options="options"
          id="list-army-size-tons"
      />
      <label for="list-army-size-tons">Army Size</label>
    </div>
  </div>
</template>