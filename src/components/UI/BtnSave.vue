<script setup>
import fileSaver from 'file-saver';
import {makeSaveFileData} from '../../store/helpers/store-save-load.js';
import {useArmyListStore} from '../../store/army-list-store.js';
import {storeToRefs} from 'pinia';
import {BDropdown, BDropdownItem} from 'bootstrap-vue-next';
import {makeArmyListDataUrl, makeShareCode} from '../../composables/url-data-parser.js';
import {toaster} from '../../toaster.js';

function saveFile(fileName, data) {
  let payload = JSON.stringify(data);
  let blob = new Blob([payload], {type: 'text/plain;charset=utf-8'});
  fileSaver.saveAs(blob, `${fileName}.json`);
}

const {name} = storeToRefs(useArmyListStore());

function saveToFile() {
  saveFile(name.value || 'steel-rift-army-list', makeSaveFileData());
}

function saveToUrl() {
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      toaster().error('Failed to copy text', err.message);
    }
  }

  const data = makeSaveFileData();
  const url = makeArmyListDataUrl(data);

  copyToClipboard(url);

  toaster().info('Data URL Copied to clipboard', 'This URL contains your Army List and can be shared.');
}

async function copyShareCode() {
  try {
    const data = makeSaveFileData();
    const code = await makeShareCode(data);
    await navigator.clipboard.writeText(code);
    toaster().info('Share code copied', `${code.length} characters — paste anywhere to share your list.`);
  } catch (err) {
    toaster().error('Failed to generate share code', err.message);
  }
}
</script>
<template>
  <BDropdown
      variant="secondary"
      size="sm"
      class="d-inline-block"
  >
    <template #button-content>
      Save
    </template>
    <BDropdownItem @click="saveToFile">
      <span class="material-symbols-outlined">docs</span>
      To File
    </BDropdownItem>
    <BDropdownItem @click="saveToUrl">
      <span class="material-symbols-outlined">copy_all</span>
      To Data Url
    </BDropdownItem>
    <BDropdownItem @click="copyShareCode">
      <span class="material-symbols-outlined">content_copy</span>
      Copy Share Code
    </BDropdownItem>
  </BDropdown>
</template>