<script setup>
import {ref, useTemplateRef} from 'vue';
import {BDropdown, BDropdownHeader, BDropdownItem} from 'bootstrap-vue-next';
import ModalImportMechs from './Modal/ModalImportMechs.vue';
import {loadSaveFileData} from '../../store/helpers/store-save-load.js';
import {jsonFileParser} from '../../composables/file-upload.js';
import ModalDataUrlImport from './Modal/ModalDataUrlImport.vue';
import ModalShareCodeLoad from './Modal/ModalShareCodeLoad.vue';
import {HEV_PACKS} from '../../data/hev-packs.js';
import {useMechStore} from '../../store/mech-store.js';
import {useTeamStore} from '../../store/team-store.js';
import {disposeOfPiniaScope} from 'pinia-scope';

const fileUpload = useTemplateRef('file-upload');
const fileImport = useTemplateRef('file-import');
const modalImportMechs = useTemplateRef('modal-import-mechs');

const importModalVisible = ref(false);
const dataUrlModalVisible = ref(false);
const shareCodeModalVisible = ref(false);

const fileUploadChange = jsonFileParser((jsonData) => {
  loadSaveFileData(jsonData);
  fileUpload.value.value = null;
});

const fileImportChange = jsonFileParser((jsonData) => {
  modalImportMechs.value.importJsonData(jsonData);
  fileImport.value.value = null;
});

const onImportFromUrlData = (jsonData) => {
  modalImportMechs.value.importJsonData(jsonData);
};

function importHevPack(quickBuild) {
  const SCOPE = 'quick-build';
  const mechStore = useMechStore(SCOPE);
  loadSaveFileData(quickBuild.data, SCOPE);

  const appTeamStore = useTeamStore();
  mechStore.mechs.forEach(({id}) => {
    const mech = mechStore.getMech(id);
    appTeamStore.addMechToTeamFromLoadedFile(mech, quickBuild.team_id);
  });

  disposeOfPiniaScope(SCOPE)
}

</script>
<template>
  <input ref="file-upload" type="file" @change="fileUploadChange" accept="application/json" hidden>
  <input ref="file-import" type="file" @change="fileImportChange" accept="application/json" hidden>

  <BDropdown
      variant="secondary"
      size="sm"
      class="d-inline-block ms-1"
  >
    <template #button-content>
      Load
    </template>
    <BDropdownItem @click="() => fileUpload.click()">
      <span class="material-symbols-outlined">file_open</span>
      Load File
    </BDropdownItem>
    <BDropdownItem @click="shareCodeModalVisible = true">
      <span class="material-symbols-outlined">input</span>
      Load Share Code
    </BDropdownItem>
    <BDropdownItem @click="() => fileImport.click()">
      <span class="material-symbols-outlined">place_item</span>
      Import HE-Vs from File
    </BDropdownItem>
    <BDropdownItem @click="dataUrlModalVisible = true">
      <span class="material-symbols-outlined">place_item</span>
      Import HE-Vs from Data URL
    </BDropdownItem>
    <BDropdownHeader>
      Import Quick Builds
    </BDropdownHeader>
    <BDropdownItem v-for="item in HEV_PACKS" @click="importHevPack(item)">
      <span class="material-symbols-outlined">place_item</span>
      {{ item.name }}
    </BDropdownItem>
  </BDropdown>

  <ModalShareCodeLoad v-model="shareCodeModalVisible"/>

  <ModalDataUrlImport
      v-model="dataUrlModalVisible"
      @data-url-success="onImportFromUrlData"
  />
  <ModalImportMechs
      ref="modal-import-mechs"
      v-model="importModalVisible"
  />
</template>