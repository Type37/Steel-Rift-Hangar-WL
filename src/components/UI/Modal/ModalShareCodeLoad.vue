<script setup>
import {BFormTextarea, BModal} from 'bootstrap-vue-next';
import {ref} from 'vue';
import {shareCodeToJson} from '../../../composables/url-data-parser.js';
import {loadSaveFileData} from '../../../store/helpers/store-save-load.js';
import {toaster} from '../../../toaster.js';

const visible = defineModel();
const input = ref('');

async function submit() {
  const raw = input.value.trim();
  if (!raw) return;

  try {
    const json = await shareCodeToJson(raw);
    loadSaveFileData(json);
    input.value = '';
    visible.value = false;
    toaster().info('List loaded', 'Share code imported successfully.');
  } catch (err) {
    toaster().validationError('Invalid share code', err.message);
  }
}
</script>
<template>
  <BModal
      lazy
      v-model="visible"
      size="lg"
      ok-variant="primary"
      ok-title="Load List"
      @ok="submit"
  >
    <template #title>
      <strong>Load from Share Code</strong>
    </template>
    <p class="text-muted small mb-2">
      Paste an <code>SR:</code> share code. This will replace your current list.
    </p>
    <BFormTextarea
        v-model="input"
        placeholder="SR:H4sIAAAAA..."
        rows="4"
        class="font-monospace"
    />
  </BModal>
</template>
