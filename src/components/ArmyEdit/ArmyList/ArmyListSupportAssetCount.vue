<script setup>
import {BFormCheckbox, BFormInput, BPopover} from 'bootstrap-vue-next';
import {storeToRefs} from 'pinia';
import {useSupportAssetCountsStore} from '../../../store/support-asset-count-store.js';

const store = useSupportAssetCountsStore();

const {
  max_support_assets,
  custom_max_support_assets,
} = storeToRefs(store);

function setCustomSupportAssetCount(value) {
  custom_max_support_assets.value = value;
}

function updateCheck(value) {
  if (value) {
    custom_max_support_assets.value = max_support_assets.value;
  } else {
    custom_max_support_assets.value = null;
  }
}
</script>
<template>
  <div class="form-floating mb-1">
    <BFormInput
        id="list_max_support_assets"
        @update:model-value="setCustomSupportAssetCount"
        :model-value="max_support_assets"
        type="number"
        :disabled="custom_max_support_assets === null"
    />
    <label for="list_max_support_assets">Support Assets</label>
  </div>
  <BPopover placement="bottom" trigger="click focus">
    <template #target>
      <BFormCheckbox
          :model-value="custom_max_support_assets !== null"
          @update:model-value="updateCheck"
      >
        Custom
        <span class="material-symbols-outlined text-secondary" style="font-size:0.85rem;vertical-align:-.15em">shield_question</span>
      </BFormCheckbox>
    </template>
    <template #title>Custom Support Asset Limit</template>
    Tick <strong>Custom</strong> to set your own support asset limit. Useful for house rules or scenario play.
  </BPopover>
</template>
