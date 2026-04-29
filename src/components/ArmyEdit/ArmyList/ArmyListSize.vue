<script setup>
import {BFormFloatingLabel, BFormInput, BPopover} from 'bootstrap-vue-next';
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
        title="Your total points budget. Every HE-V, weapon, upgrade, and support asset costs tons. You can't exceed this limit."
        style="cursor:help"
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
    <BPopover placement="bottom" trigger="click focus">
      <template #target>
        <button class="btn btn-sm p-0 text-secondary" style="line-height:1;font-size:0.75rem">
          <span class="material-symbols-outlined" style="font-size:0.95rem">shield_question</span> What's this?
        </button>
      </template>
      <template #title>Army Size</template>
      Sets your tonnage budget, support asset limit, and team limits.<br><br>
      <strong>Recon</strong> — 100 tons, 1 support asset, 1 team<br>
      <strong>Strike</strong> — 150 tons, 2 support assets, 2 teams<br>
      <strong>Battle</strong> — 200 tons, 3 support assets, 3 teams<br>
      <strong>War</strong> — 350 tons, 4 support assets, 4 teams<br><br>
      Choose <strong>Custom</strong> to set tonnage manually.
    </BPopover>
  </div>
</template>