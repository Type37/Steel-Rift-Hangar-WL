<script setup>

import BtnLoad from './UI/BtnLoad.vue';
import BtnSave from './UI/BtnSave.vue';
import {useArmyListStore} from '../store/army-list-store.js';
import {storeToRefs} from 'pinia';
import {useTeamStore} from '../store/team-store.js';
import {useSupportAssetCountsStore} from '../store/support-asset-count-store.js';
import {ref} from 'vue';
import {ROUTE_HOME, ROUTE_PRINT} from '../router.js';
import Navbar from './Navbar.vue';
import Fraction from './functional/fraction.vue';
import {resetStores} from '../store/helpers/store-save-load.js';
import {BButton, BModal} from 'bootstrap-vue-next';
import BtnArmyListValidation from './ArmyEdit/ArmyList/BtnArmyListValidation.vue';
import {useVisualTheme} from '../composables/use-visual-theme.js';

const {used_teams_count, max_teams_count} = storeToRefs(useTeamStore());
const {used_support_assets, max_support_assets} = storeToRefs(useSupportAssetCountsStore());
const {used_tons, max_tons, name} = storeToRefs(useArmyListStore());

const resetModal = ref(false);
const {isClean, toggle: toggleTheme} = useVisualTheme();

</script>
<template>
  <div class="sticky-top bg-body text-body border-bottom shadow app-header">
    <Navbar/>
    <div class="container-lg">
      <div class="pt-2 px-3 pb-2">
        <div class="row">
          <div class="col-md-3">
            <div class="d-flex">
              <label class="col-form-label form-control-sm fw-bold me-2" for="list-name">
                Army&nbsp;Name:
              </label>
              <input
                  type="text"
                  v-model="name"
                  id="list-name"
                  class="form-control form-control-sm"
              />
            </div>
          </div>

          <div class="col-md-6">
            <div class="col-form-label form-control-sm d-inline-block text-end">
              <strong><span class="material-symbols-outlined">groups</span> Teams: </strong>
              <fraction
                  :a="used_teams_count"
                  :b="max_teams_count"
                  success-class="fw-bold"
              />

              <span class="ms-2">
                <strong><span class="material-symbols-outlined">military_tech</span> Support Assets: </strong>
                <fraction
                    :a="used_support_assets"
                    :b="max_support_assets"
                    success-class="fw-bold"
                />
              </span>
              <span class="ms-2">
                <strong><span class="material-symbols-outlined">scale</span> Tonnage: </strong>
                <fraction
                    :a="used_tons"
                    :b="max_tons"
                    success-class="fw-bold"
                />
              </span>
            </div>
            <BtnArmyListValidation/>
          </div>
          <div class="col-md-3 text-md-end header-btns">
            <BtnSave/>
            <BtnLoad/>
            <BButton
                @click="resetModal = !resetModal"
                size="sm"
                variant="danger"
                class="ms-1"
            >
              New List
            </BButton>
            <BButton
                @click="toggleTheme"
                size="sm"
                variant="secondary"
                class="ms-1"
                :title="isClean() ? 'Switch to default theme' : 'Switch to clean theme'"
            >
              <span class="material-symbols-outlined">{{ isClean() ? 'brightness_alert' : 'brightness_high' }}</span>
            </BButton>
            <div class="btn-group d-inline-block ms-1 mt-2 mt-xl-0" role="group">
              <router-link
                  :to="{ name: ROUTE_HOME }"
                  class="btn btn-sm btn-default"
                  activeClass="active"
              >
                Edit
              </router-link>
              <router-link
                  :to="{ name: ROUTE_PRINT }"
                  class="btn btn-sm btn-default"
                  activeClass="active"
              >
                Print
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <BModal
      v-model="resetModal"
      centered
      @ok="resetStores()"
      ok-variant="danger"
      title="Start New List?"
  >
    <div class="lead">
      Start a new blank list? Any unsaved changes will be lost.
    </div>
  </BModal>
</template>