<script setup>
import Faction from './ArmyList/Faction.vue';
import ArmyListSize from './ArmyList/ArmyListSize.vue';
import ArmyListSupportAssetCount from './ArmyList/ArmyListSupportAssetCount.vue';
import SupportAssetWeapons from './ArmyList/ArmyListSupportAssets/SupportAssetWeapons.vue';
import ArmyListTeams from './ArmyList/ArmyListTeams.vue';
import SupportAssetUnits from './ArmyList/ArmyListSupportAssets/SupportAssetUnits.vue';
</script>
<template>
  <div class="card body-bg card-army-list">
    <div class="card-body">
      <div class="row">
        <div class="col-md-3">
          <div class="row g-1 row-cols-2">
            <ArmyListSize/>
            <div class="col">
              <ArmyListSupportAssetCount/>
            </div>
            <div class="col">
              <ArmyListTeams/>
            </div>
          </div>
        </div>
        <div class="col-md-7">
          <SupportAssetWeapons/>
          <SupportAssetUnits/>
        </div>
        <div class="col-md-2">
          <Faction/>
        </div>
      </div>
    </div>
  </div>
</template>
