<script setup>
import {BFormInput} from 'bootstrap-vue-next';
import {useMechStore} from '../../../store/mech-store.js';
import {useFactionStore} from '../../../store/faction-store.js';
import MechFactionPerkRow from './MechStats/MechFactionPerkRow.vue';
import Fraction from '../../functional/fraction.vue';
import MechWeapons from './MechWeapons.vue';
import MechUpgrades from './MechUpgrades.vue';
import {computed} from 'vue';
import {storeToRefs} from 'pinia';
import {useTeamStore} from '../../../store/team-store.js';
import MechArmorUpgrades from './MechStats/MechArmorUpgrades.vue';
import MechBodyMods from './MechStats/MechBodyMods.vue';
import MechSizes from './MechStats/MechSizes.vue';
import MechMobilities from './MechStats/MechMobilities.vue';
import {useValidationStore} from '../../../store/validation-store.js';

const mechStore = useMechStore();
const factionStore = useFactionStore();
const teamStore = useTeamStore();
const validationStore = useValidationStore();

const {mechId} = defineProps({
  mechId: {
    type: Number,
  },
});

const mech = computed(() => mechStore.getMech(mechId));
const info = computed(() => mechStore.getMechInfo(mechId));

const {
  hasAdvancedHardPoints,
  advancedHardPointsInfo,
  advancedHardPointsBonusSlots,

  topEndHardwareBonusTons,
  hasTopEndHardware,
  topEndHardwareInfo,

} = storeToRefs(factionStore);

const structureModOptions = computed(() => teamStore.getMechStructureModOptions(mechId));
const armorModOptions = computed(() => teamStore.getMechArmorModOptions(mechId));
const structureModValid = computed(() => !validationStore.teamGroupMechStructureInvalid(mechId));
const armorModValid = computed(() => !validationStore.teamGroupMechArmorInvalid(mechId));
const notAvailableMessage = computed(() => validationStore.getNotAvailableToTeamGroupMessage(mechId));

</script>
<template>
  <div class="mech-stats px-2 table-responsive">
    <table class="table w-auto">
      <thead class="thead-compact">
      <tr>
        <td></td>
        <td>
          <label class="col-form-label" :for="'mech-input-name-' + mechId">Name</label>
        </td>
        <td colspan="3">
          <BFormInput :id="'mech-input-name-' + mechId" v-model="mech.name" :placeholder="info.placeholder_name"/>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Armor</div>
          <small>Stat</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Structure</div>
          <small>Stat</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Slots</div>
          <small>Used</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Tons</div>
          <small>Used</small>
        </td>
        <td></td>
      </tr>
      </thead>
      <tbody class="tbody-compact">
      <MechSizes
          :mech-id="mechId"
      />
      <MechBodyMods
          label="Armor Type"
          modifier-label="Armor Stat"
          v-model="mech.armor_mod_id"
          :form-id="'mech-input-armor-mod-' + mechId"
          :tonnage="info.armor_mod.modifier"
          :armor="info.armor_mod.modifier"
          :structure="null"
          :options="armorModOptions"
          :valid="armorModValid"
          :validation-message="notAvailableMessage"

      />
      <MechBodyMods
          label="Structure Type"
          modifier-label="Structure Stat"
          v-model="mech.structure_mod_id"
          :form-id="'mech-input-structure-mod-' + mechId"
          :tonnage="info.structure_mod.modifier"
          :armor="null"
          :structure="info.structure_mod.modifier"
          :options="structureModOptions"
          :valid="structureModValid"
          :validation-message="notAvailableMessage"
      />
      <MechArmorUpgrades
          label="Defensive Config"
          v-model="mech.armor_upgrade_id"
          :mech-id="mech.id"
      />
      <MechMobilities
          label="Mobility"
          v-model="mech.mobility_id"
          :mech-id="mech.id"
      />
      <MechFactionPerkRow
          v-if="hasTopEndHardware"
          :text="topEndHardwareInfo.display_name"
          :description="topEndHardwareInfo.description"
          :usedTons="topEndHardwareBonusTons"
      />
      <MechFactionPerkRow
          v-if="hasAdvancedHardPoints"
          :text="advancedHardPointsInfo.display_name"
          :description="advancedHardPointsInfo.description"
          :usedSlots="advancedHardPointsBonusSlots"
      />
      </tbody>
      <MechUpgrades :mech-id="mech.id"/>
      <MechWeapons :mech-id="mech.id"/>
      <tfoot>
      <tr>
        <td></td>
        <td></td>
        <td colspan="3" class="text-end"></td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Armor</div>
          <small>Stat</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Structure</div>
          <small>Stat</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Slots</div>
          <small>Used</small>
        </td>
        <td class="text-end pe-1 border-bottom">
          <div class="fw-bold">Tons</div>
          <small>Used</small>
        </td>
        <td></td>
      </tr>
      <tr class="table-tinted">
        <td></td>
        <td></td>
        <th colspan="3" class="text-end">
          Totals
        </th>
        <td class="text-end">
          {{ info.armor_stat }}
        </td>
        <td class="text-end">
          {{ info.structure_stat }}
        </td>
        <td class="text-end">
          <strong>
            <fraction :a="info.used_slots" :b="info.max_slots"/>
          </strong>
        </td>
        <td class="text-end">
          <strong>
            <fraction :a="info.used_tons" :b="info.max_tons"/>
          </strong>
        </td>
        <td></td>
      </tr>
      </tfoot>
    </table>
  </div>
</template>