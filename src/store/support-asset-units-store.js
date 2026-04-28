import {computed, readonly, ref} from 'vue';
import {SUPPORT_ASSET_UNITS} from '../data/support-asset-units.js';
import {freshWeaponTrait, TRAIT_LIMITED, TRAIT_SHORT, WEAPON_TRAITS} from '../data/weapon-traits.js';
import {UNIT_WEAPONS} from '../data/unit-weapons.js';
import {each, find, map, sortBy, sumBy} from 'es-toolkit/compat';
import {filterUniqueById, findById, findItemIndexById} from './helpers/collection-helper.js';
import {
    freshUnitTrait,
    TRAIT_GARRISON,
    TRAIT_SQUADRON,
    TRAIT_SUPPORT_MINE_DRONE_LAYER,
    TRAIT_UL_HEV_LAUNCH_GEAR,
    UNIT_TRAITS,
    unitTraitDisplayName,
} from '../data/unit-traits.js';
import {UNIT_SIZES} from '../data/unit-sizes.js';
import {getInfantrySquad, INFANTRY_SQUADS} from '../data/infantry-squads.js';
import {countBy, flatMap} from 'es-toolkit';
import {TYPE_INFANTRY, UNIT_TYPES} from '../data/unit-types.js';
import {INFANTRY_OUTPOST} from '../data/support-assets/infantry-outpost.js';
import {makeGrantedOrderCollection, makeUniqueItemIdCollection} from './helpers/helpers.js';
import {INFANTRY_ORDERS_DATA} from '../data/orders/infantry-orders.js';
import {defineScopeableStore} from 'pinia-scope';

export const useSupportAssetUnitsStore = defineScopeableStore('support-asset-units', ({scope}) => {

        const support_asset_units = ref([]);
        const support_asset_units_id_increment = ref(0);

        function $reset() {
            support_asset_units.value = [];
            support_asset_units_id_increment.value = 0;
        }

        const support_asset_unit_ids = computed(() => {
            return support_asset_units.value.map(item => item.support_asset_unit_id);
        });

        const available_support_asset_unit_ids = computed(() => {
            return Object.keys(SUPPORT_ASSET_UNITS)
                .filter(id => !support_asset_unit_ids.value.includes(id));
        });

        const available_support_asset_units_info = computed(() => {
            let results = available_support_asset_unit_ids.value
                .map((id) => _getUnitInfo(id));

            return sortBy(results, 'display_name');
        });

        const support_asset_units_info = computed(() => {
            let results = support_asset_units.value
                .map(({id}) => getUnitAttachmentInfo(id));

            return sortBy(results, 'display_name');
        });

        const used_tons = computed(() => sumBy(support_asset_units_info.value, 'cost'));
        const used_count = computed(() => support_asset_units.value.length);

        const has_mine_drones = computed(() => {
            const hasOutpost = find(support_asset_units.value, (unit) => unit.support_asset_unit_id === INFANTRY_OUTPOST);
            if (hasOutpost) {
                return true;
            }

            return !!support_asset_units_info.value.find(unit => {
                return unit.vehicles.find(vehicle => {
                    return vehicle.traits.find(trait => trait.id === TRAIT_SUPPORT_MINE_DRONE_LAYER);
                });
            });
        });

        function getUnitAttachmentInfo(unitAttachmentId) {
            let {
                id,
                support_asset_unit_id,
                vehicles,
                upgrade_pod_id,
            } = findById(support_asset_units.value, unitAttachmentId);
            const supportAssetId = getUnitAttachment(unitAttachmentId).support_asset_unit_id;

            let {
                display_name,
                unit_type_id,
                size,
                cost,
                max_armor_tons,
                max_vehicles,
                max_duplicate_vehicles,
                unit_points_description,
                all_vehicle_must_be_the_same,
                traits,
                defense,
            } = _getUnitInfo(supportAssetId);

            vehicles = vehicles.map(vehicleAttachment => getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachment.id));

            let cardIdIncrement = 1;

            vehicles = vehicles.map(vehicle => {
                if (vehicle.garrison_units.length) {
                    vehicle = Object.assign({}, vehicle);
                    vehicle.garrison_units = vehicle.garrison_units.map(garrisonUnit => {
                        return Object.assign({}, garrisonUnit, {card_ref_id: cardIdIncrement++});
                    });
                }

                return vehicle;
            });

            return readonly({
                id,
                support_asset_unit_id,
                unit_type: UNIT_TYPES[unit_type_id],
                display_name,
                size,
                cost,
                max_armor_tons,
                max_vehicles,
                max_duplicate_vehicles,
                unit_points_description,
                upgrade_pod_id,
                vehicles,
                traits,
                defense,
                all_vehicle_must_be_the_same,
            });
        }

        function _getUnitInfo(unitId) {
            let asset = SUPPORT_ASSET_UNITS[unitId];
            asset = Object.assign({}, asset);
            asset.vehicles = Object.assign({}, asset.vehicles);

            Object.keys(asset.vehicles).forEach(vehicleId => {
                asset.vehicles[vehicleId] = _getUnitVehicleInfo(unitId, vehicleId);
            });
            asset.unit_type = UNIT_TYPES[asset.unit_type_id];
            asset.size = UNIT_SIZES[asset.size_id];
            asset.traits = asset.traits || [];
            asset.traits = asset.traits.map(freshUnitTrait);

            return readonly(asset);
        }

        function getUnitVehicleAttachmentRequiredWeaponsInfo(unitAttachmentId, vehicleAttachmentId) {
            const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId);
            if (!vehicleDef.weapon_ids) {
                return [];
            }

            const unitAttachment = getUnitAttachment(unitAttachmentId);
            const unitDef = getUnitAttachmentDef(unitAttachmentId);

            let weapons = [];
            if (vehicleDef.weapon_ids) {
                weapons = vehicleDef.weapon_ids.map(weaponId => _getWeaponInfo(weaponId));
            }

            if (unitDef.upgrade_pods) {
                const pod = unitDef.upgrade_pods[unitAttachment.upgrade_pod_id];

                if (pod.weapon_id) {
                    weapons.push(_getWeaponInfo(pod.weapon_id));
                }
            }

            return weapons;
        }

        function isSquadron(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);
            return info.traits.find(trait => trait.id === TRAIT_SQUADRON);
        }

        function getAllUnitTraits() {
            const traitCollection = makeUniqueItemIdCollection(UNIT_TRAITS);
            support_asset_units.value.forEach(asset => {
                const info = getUnitAttachmentInfo(asset.id);
                traitCollection.addMultiple(info?.traits ?? []);
                info.vehicles.forEach(vehicle => {
                    traitCollection.addMultiple(vehicle.traits);
                });
            });
            traitCollection.all().forEach(trait => {
                traitCollection.addIds(trait?.dependent_trait_ids ?? []);
            });

            return traitCollection.all();
        }

        function getAllWeaponTraitsCollection() {
            const traitCollection = makeUniqueItemIdCollection(WEAPON_TRAITS);
            support_asset_units.value.forEach(asset => {
                const info = getUnitAttachmentInfo(asset.id);
                info.vehicles.forEach(vehicle => {
                    vehicle.weapons.forEach(weapon => {
                        traitCollection.addMultiple(weapon.traits);
                    });
                });
            });
            return traitCollection;
        }

        function getUnitVehicleAttachmentAvailableWeaponChoicesInfo(unitAttachmentId, vehicleAttachmentId) {
            const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId);

            if (!vehicleDef.weapon_choice_ids) {
                return [];
            }

            return Object.keys(vehicleDef.weapon_choice_ids).map(key => {
                const weaponIds = vehicleDef.weapon_choice_ids[key];
                return {
                    id: key,
                    weapons: weaponIds.map(weaponId => {
                        const {display_name, id} = _getWeaponInfo(weaponId);

                        return {display_name, id};
                    }),
                };
            });
        }

        function getUnitAttachmentAllGarrisonChoicesInfo(unitAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);

            let garrisonUnitIds = [];
            each(unitAttachment.vehicles, vehicleAttachment => {
                const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachment.id);
                if (vehicleDef && vehicleDef.garrison_choice_unit_ids) {
                    garrisonUnitIds = garrisonUnitIds.concat(vehicleDef.garrison_choice_unit_ids);
                }
            });

            // Deduplicate — same infantry type can appear across multiple garrison vehicles
            garrisonUnitIds = [...new Set(garrisonUnitIds)];

            return garrisonUnitIds.map(unitId => {
                return _getGarrisonUnitInfo(unitId);
            });
        }

        function getUnitVehicleAttachmentAvailableGarrisonChoicesInfo(unitAttachmentId, vehicleAttachmentId) {
            const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId);

            if (!vehicleDef.garrison_choice_unit_ids) {
                return [];
            }

            return vehicleDef.garrison_choice_unit_ids.map(unitId => {
                return _getGarrisonUnitInfo(unitId);
            });
        }

        function getUnitVehicleAttachmentGarrisonMax(unitAttachmentId, vehicleAttachmentId) {
            const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId);
            const garrisonTrait = find(vehicleDef.traits, {id: TRAIT_GARRISON});

            if (!garrisonTrait) {
                return;
            }

            return garrisonTrait.number;
        }

        function getUnitUpgradePodChoicesInfo(unitAttachmentId) {
            const unitDef = getUnitAttachmentDef(unitAttachmentId);

            if (!unitDef.upgrade_pods) {
                return [];
            }

            return map(unitDef.upgrade_pods, (pod, key) => {
                let description = 'none';

                if (pod.weapon_id) {
                    description = 'Weapon: ' + UNIT_WEAPONS[pod.weapon_id].display_name;
                }
                if (pod.trait) {
                    description = 'Trait: ' + unitTraitDisplayName(pod.trait);
                }

                return {
                    id: key,
                    description,
                };
            });
        }

        function setUnitUpgradePod(unitAttachmentId, upgradePodId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);
            unitAttachment.upgrade_pod_id = upgradePodId;
        }

        function _getUnitTraitsInfo(traits) {
            if (!traits) {
                return [];
            }
            return traits.map(trait => freshUnitTrait(trait));
        }

        function _getUnitVehicleInfo(unitId, vehicleId) {
            const asset = SUPPORT_ASSET_UNITS[unitId];
            let vehicle = asset.vehicles[vehicleId];
            vehicle = Object.assign({}, vehicle);

            if (vehicle.weapon_ids) {
                vehicle.weapons = vehicle.weapon_ids.map(weaponId => _getWeaponInfo(weaponId));
            }

            if (vehicle.weapon_choice_ids) {
                vehicle.weapon_choices = [];
                Object.keys(vehicle.weapon_choice_ids).forEach(key => {
                    const weaponIds = vehicle.weapon_choice_ids[key];
                    vehicle.weapon_choices.push(weaponIds.map(weaponId => _getWeaponInfo(weaponId)));
                });
            }

            vehicle.traits = _getUnitTraitsInfo(vehicle.traits);

            return readonly(vehicle);
        }

        function _getInfantryUnitInfo(infantrySquadId) {
            let garrisonUnit = getInfantrySquad(infantrySquadId);
            garrisonUnit.unit_type = UNIT_TYPES[garrisonUnit.unit_type_id];
            garrisonUnit.size = UNIT_SIZES[garrisonUnit.size_id];
            garrisonUnit.weapons = garrisonUnit.weapon_ids.map(weaponId => _getWeaponInfo(weaponId));
            garrisonUnit.traits = garrisonUnit.traits.map(trait => freshUnitTrait(trait));

            return garrisonUnit;
        }

        function _getWeaponInfo(weaponId) {
            let weapon = UNIT_WEAPONS[weaponId];
            if (!weapon) {
                throw new Error(`unit weapon id: ${weaponId} not found`);
            }
            weapon = Object.assign({}, weapon);

            weapon.traits = weapon?.traits?.map(trait => freshWeaponTrait(trait)).filter(weapon => weapon.id !== TRAIT_SHORT) || [];
            const limitedTrait = findById(weapon.traits, TRAIT_LIMITED);

            if (limitedTrait) {
                weapon.max_uses = limitedTrait.number;
            }

            return readonly(weapon);
        }

        function _getGarrisonUnitInfo(infantrySquadId) {
            let squad = INFANTRY_SQUADS[infantrySquadId];
            squad = Object.assign({}, squad);
            squad.weapons = squad.weapon_ids.map(weaponId => _getWeaponInfo(weaponId));
            squad.traits = squad?.traits?.map(trait => freshUnitTrait(trait)) || [];

            return readonly(squad);
        }

        function getUnitAttachmentGarrisonUnitsInfo(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);
            const units = flatMap(info.vehicles, vehicle => vehicle.garrison_units);

            return readonly(units);
        }

        function getUnitAttachmentGarrisonUnitTraitsCardInfo(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);
            let unitTraits = flatMap(info.vehicles, vehicle => vehicle.garrison_unit_traits || []);
            unitTraits = filterUniqueById(unitTraits);
            return readonly(unitTraits);
        }

        function getUnitAttachmentVehicleInfo(unitAttachmentId, vehicleAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);

            const vehicleAttachment = getUnitVehicleAttachment(unitAttachmentId, vehicleAttachmentId);
            const unitAttachmentDef = getUnitAttachmentDef(unitAttachmentId);
            const vehicleDef = getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId);

            let weapons = [];
            if (vehicleDef.weapon_ids) {
                weapons = vehicleDef.weapon_ids.map(weaponId => _getWeaponInfo(weaponId));
            }
            if (vehicleDef.weapon_choice_ids) {
                Object.keys(vehicleDef.weapon_choice_ids).forEach(key => {
                    const weaponId = vehicleAttachment.weapon_choices[key];
                    weapons.push(_getWeaponInfo(weaponId));
                });
            }
            let garrison_units = vehicleAttachment.garrison_units || [];
            garrison_units = garrison_units.map((infantrySquadId) => _getInfantryUnitInfo(infantrySquadId));
            let garrison_unit_traits = vehicleDef.garrison_unit_traits || [];
            garrison_unit_traits = garrison_unit_traits.map((trait) => freshUnitTrait(trait));

            let traits = [].concat(vehicleDef.traits || []);

            const {
                id,
                support_asset_unit_id,
            } = vehicleAttachment;

            let {
                display_name,
                move,
                jump,
                armor,
                structure,
                garrison_ul_hev,
            } = vehicleDef;

            if (unitAttachmentDef.upgrade_pods) {
                const pod = unitAttachmentDef.upgrade_pods[unitAttachment.upgrade_pod_id];

                if (pod.weapon_id) {
                    weapons.push(_getWeaponInfo(pod.weapon_id));
                }

                if (pod.trait) {
                    traits.push(pod.trait);
                    if (pod.trait.id === TRAIT_UL_HEV_LAUNCH_GEAR) {
                        jump = move + 2;
                    }
                }
            }
            return readonly({
                id,
                vehicle_id: vehicleDef.id,
                support_asset_unit_id,
                weapons,
                display_name,
                move,
                jump,
                armor,
                structure,
                garrison_ul_hev,
                garrison_units,
                garrison_unit_traits,
                traits: _getUnitTraitsInfo(traits),
            });
        }

        function getUnitAttachmentUsedPoints(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);

            if (info.max_armor_tons) {
                return getUnitAttachmentArmorTotal(unitAttachmentId);
            }

            return getUnitVehicleCount(unitAttachmentId);
        }

        function getUnitAttachmentMaxPoints(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);

            if (info.max_armor_tons) {
                return info.max_armor_tons;
            }

            return info.max_vehicles;
        }

        function getUnitAttachmentPointsValid(unitAttachmentId) {
            const used = getUnitAttachmentUsedPoints(unitAttachmentId);
            const max = getUnitAttachmentMaxPoints(unitAttachmentId);
            return used === max;
        }

        const hasUnitId = unitId => support_asset_unit_ids.value.includes(unitId);
        const getUnitVehicleCount = unitAttachmentId => getUnitAttachment(unitAttachmentId).vehicles.length;

        function getUnitAttachmentArmorTotal(unitAttachmentId) {
            return sumBy(getUnitAttachment(unitAttachmentId).vehicles, (vehicle) => getUnitAttachmentVehicleInfo(unitAttachmentId, vehicle.id).armor);
        }

        const getUnitAttachment = (unitAttachmentId) => findById(support_asset_units.value, unitAttachmentId);

        function getUnitAttachmentHasGarrisonUnits(unitAttachmentId) {
            const info = getUnitAttachmentInfo(unitAttachmentId);
            return !!info.vehicles.find((vehicle) => vehicle.garrison_units.length);
        }

        function getUnitHasGarrisonableVehicles(supportAssetUnitId) {
            const unitDef = SUPPORT_ASSET_UNITS[supportAssetUnitId];
            return !!Object.values(unitDef.vehicles).find(vehicleDef => {
                return vehicleDef.garrison_choice_unit_ids?.length || vehicleDef.garrison_ul_hev;
            });
        }

        function getUnitVehicleAttachment(unitAttachmentId, vehicleAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);
            return find(unitAttachment.vehicles, {id: vehicleAttachmentId});
        }

        function getUnitAttachmentVehicleGarrisonWeaponsCardInfo(unitAttachmentId) {
            const unit = getUnitAttachmentInfo(unitAttachmentId);
            const weapons = flatMap(unit.vehicles, vehicle => {
                return flatMap(vehicle.garrison_units, squad => squad.weapons);
            });
            return readonly(filterUniqueById(weapons));
        }

        function getUnitAttachmentVehicleWeaponsCardInfo(unitAttachmentId) {
            const unit = getUnitAttachmentInfo(unitAttachmentId);
            const weapons = flatMap(unit.vehicles, vehicle => vehicle.weapons);
            return readonly(filterUniqueById(weapons));
        }

        function getUnitAttachmentDef(unitAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);
            return SUPPORT_ASSET_UNITS[unitAttachment.support_asset_unit_id];
        }

        function getUnitAttachmentVehicleDef(unitAttachmentId, vehicleAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);
            const vehicleAttachment = find(unitAttachment.vehicles, {id: vehicleAttachmentId});

            return SUPPORT_ASSET_UNITS[unitAttachment.support_asset_unit_id].vehicles[vehicleAttachment.vehicle_id];
        }

        function getUnitAllWeaponsInfo(unitAttachmentId) {
            const unitDef = getUnitAttachmentDef(unitAttachmentId);
            const vehicleDefs = unitDef.vehicles;

            const weaponIdMap = {};
            each(vehicleDefs, (vehicleDef) => {
                vehicleDef.weapon_ids?.forEach(weaponId => {

                    weaponIdMap[weaponId] = true;
                });

                each(vehicleDef.weapon_choice_ids, weaponIds => {
                    weaponIds.forEach(weaponId => weaponIdMap[weaponId] = true);
                });

                if (vehicleDef.garrison_choice_unit_ids) {
                    vehicleDef.garrison_choice_unit_ids.forEach(squadId => {

                        INFANTRY_SQUADS[squadId].weapon_ids.forEach(weaponId => weaponIdMap[weaponId] = true);
                    });
                }
            });

            if (unitDef.upgrade_pods) {
                Object.values(unitDef.upgrade_pods).forEach(pod => {
                    if (pod.weapon_id) {
                        weaponIdMap[pod.weapon_id] = true;
                    }
                });
            }

            return Object.keys(weaponIdMap).map(weaponId => _getWeaponInfo(weaponId));
        }

        const validation_messages = computed(() => {
            let messages = [];
            support_asset_units.value.forEach(unit => {
                const info = getUnitAttachmentInfo(unit.id);

                if (info.max_vehicles) {
                    if (unit.vehicles.length < info.max_vehicles) {
                        messages.push(`${info.display_name} has ${unit.vehicles.length} of ${info.max_vehicles} required ${info.unit_type.display_name}(s)`);
                    }
                }

                if (info.max_armor_tons) {
                    const usedPoints = getUnitAttachmentUsedPoints(unit.id);
                    const maxPoints = getUnitAttachmentMaxPoints(unit.id);

                    if (usedPoints !== maxPoints) {
                        messages.push(`${info.display_name} has used ${usedPoints} armor points of ${maxPoints} required`);
                    }
                }
            });

            return messages;
        });

        function getAvailableVehiclesInfo(unitAttachmentId) {
            const unit = getUnitAttachment(unitAttachmentId);
            const unitInfo = _getUnitInfo(unit.support_asset_unit_id);

            const vehicles = Object.assign({}, unitInfo.vehicles);
            const selectedVehicleIds = unit.vehicles.map(vehicle => vehicle.vehicle_id);
            const vehicleIdsByCount = countBy(selectedVehicleIds, id => id);

            const vehicleIds = Object.keys(vehicles);

            vehicleIds.forEach(vehicleId => {
                let valid = true;
                let validation_message = null;
                const maxDuplicates = unitInfo.max_duplicate_vehicles;
                if (maxDuplicates) {
                    const count = vehicleIdsByCount[vehicleId];
                    if (count >= maxDuplicates) {
                        valid = false;
                        validation_message = `Each vehicle may only be included ${maxDuplicates} times in a ${unitInfo.display_name}`;
                    }
                }

                if (unitInfo.all_vehicle_must_be_the_same) {
                    const existingVehicleId = unit.vehicles[0]?.vehicle_id;
                    if (existingVehicleId && vehicleId !== existingVehicleId) {
                        valid = false;
                        validation_message = `All vehicles must be the same type in a ${unitInfo.display_name}`;
                    }
                }

                vehicles[vehicleId] = Object.assign({}, vehicles[vehicleId], {
                    valid,
                    validation_message,
                });
            });

            return readonly(Object.values(vehicles));
        }

        function getAllGrantedOrdersCollection() {
            const grantedOrders = makeGrantedOrderCollection();

            support_asset_units.value.forEach(unit => {
                const vehicleOrders = getUnitAttachmentGrantedOrdersCollection(unit.id);
                grantedOrders.addIds(vehicleOrders.ids());

                const infantryOrders = getUnitAttachmentGarrisonGrantedOrdersCollection(unit.id);
                grantedOrders.addIds(infantryOrders.ids());
            });

            return grantedOrders;
        }

        function getUnitAttachmentGrantedOrdersCollection(unitAttachmentId) {
            const grantedOrders = makeGrantedOrderCollection();

            const info = getUnitAttachmentInfo(unitAttachmentId);

            grantedOrders.addMultiple(info.traits);

            info.vehicles.forEach(vehicle => {
                grantedOrders.addMultiple(vehicle.traits);

                vehicle.weapons.forEach(weapon => {
                    grantedOrders.addMultiple(weapon.traits);
                });
            });

            return grantedOrders;
        }

        function getUnitAttachmentGarrisonGrantedOrdersCollection(unitAttachmentId) {
            const grantedOrders = makeGrantedOrderCollection();
            const garrisonUnits = getUnitAttachmentGarrisonUnitsInfo(unitAttachmentId);
            if (garrisonUnits.length && garrisonUnits[0].unit_type_id === TYPE_INFANTRY) {
                const infantryOrderIds = Object.keys(INFANTRY_ORDERS_DATA);
                grantedOrders.addIds(infantryOrderIds);
            }

            return grantedOrders;
        }

        function removeSupportAssetId(vehicleAttachmentId) {
            let index = support_asset_units.value.findIndex(item => {
                return item.id === vehicleAttachmentId;
            });
            if (index === false) {
                throw new Error('index not found');
            }
            support_asset_units.value.splice(index, 1);
        }

        function addSupportAsset(unitId) {

            const input = {
                id: support_asset_units_id_increment.value++,
                support_asset_unit_id: unitId,
                vehicles_id_increment: 0,
                vehicles: ref([]),
            };

            if (SUPPORT_ASSET_UNITS[unitId].upgrade_pods) {
                input.upgrade_pod_id = Object.keys(SUPPORT_ASSET_UNITS[unitId].upgrade_pods)[0];
            }
            support_asset_units.value.push(input);
        }

        function addVehicle(unitAttachmentId, vehicleId) {
            const supportAssetUnit = getUnitAttachment(unitAttachmentId);
            const supportAssetUnitId = supportAssetUnit.support_asset_unit_id;
            const unitDef = SUPPORT_ASSET_UNITS[supportAssetUnitId];
            const vehicleDef = unitDef.vehicles[vehicleId];

            let addCount = 1;

            if (unitDef.all_vehicle_must_be_the_same) {
                addCount = unitDef.max_vehicles - supportAssetUnit.vehicles.length;
            }
            Array(addCount).fill(0).forEach(i => {

                const vehicleAttachment = {
                    id: supportAssetUnit.vehicles_id_increment++,
                    vehicle_id: vehicleId,
                };

                if (vehicleDef.weapon_choice_ids) {
                    const weaponChoices = {};
                    Object.keys(vehicleDef.weapon_choice_ids).forEach(key => {
                        weaponChoices[key] = vehicleDef.weapon_choice_ids[key][0];
                    });
                    vehicleAttachment.weapon_choices = weaponChoices;
                }
                if (vehicleDef.garrison_choice_unit_ids) {
                    const garrisonTrait = find(vehicleDef.traits, {id: TRAIT_GARRISON});
                    const garrisonChoices = [];
                    Array(garrisonTrait.number).fill(0).forEach((i, index) => {
                        garrisonChoices[index] = vehicleDef.garrison_choice_unit_ids[0];
                    });
                    vehicleAttachment.garrison_units = garrisonChoices;
                }

                supportAssetUnit.vehicles.push(vehicleAttachment);
            });
        }

        function setUnitVehicleWeaponChoice(unitAttachmentId, vehicleAttachmentId, choiceId, weaponId) {
            const vehicleAttachment = getUnitVehicleAttachment(unitAttachmentId, vehicleAttachmentId);
            vehicleAttachment.weapon_choices[choiceId] = weaponId;
        }

        function setUnitVehicleGarrisonChoice(unitAttachmentId, vehicleAttachmentId, index, squadId) {
            const vehicleAttachment = getUnitVehicleAttachment(unitAttachmentId, vehicleAttachmentId);
            vehicleAttachment.garrison_units[index] = squadId;
        }

        function removeVehicle(unitAttachmentId, vehicleAttachmentId) {
            const unitAttachment = getUnitAttachment(unitAttachmentId);
            const index = findItemIndexById(unitAttachment.vehicles, vehicleAttachmentId);
            unitAttachment.vehicles.splice(index, 1);
        }

        return {
            support_asset_units,
            support_asset_units_id_increment,

            has_mine_drones,
            used_tons,
            used_count,

            available_support_asset_units_info,
            support_asset_units_info,
            validation_messages,

            getAvailableVehiclesInfo,
            getUnitVehicleCount,
            getUnitVehicleAttachment,
            getUnitAllWeaponsInfo,
            getUnitAttachmentInfo,
            getUnitAttachmentVehicleInfo,
            getUnitAttachmentVehicleWeaponsCardInfo,
            getUnitVehicleAttachmentAvailableWeaponChoicesInfo,
            getUnitVehicleAttachmentRequiredWeaponsInfo,
            getUnitUpgradePodChoicesInfo,
            getUnitAttachmentUsedPoints,
            getUnitAttachmentMaxPoints,
            getUnitAttachmentPointsValid,
            getUnitVehicleAttachmentAvailableGarrisonChoicesInfo,
            getUnitVehicleAttachmentGarrisonMax,
            getUnitAttachmentAllGarrisonChoicesInfo,
            getUnitAttachmentGarrisonUnitsInfo,
            getUnitAttachmentGarrisonUnitTraitsCardInfo,
            getUnitAttachmentVehicleGarrisonWeaponsCardInfo,
            getUnitAttachmentHasGarrisonUnits,
            getUnitHasGarrisonableVehicles,
            getUnitAttachmentGrantedOrdersCollection,
            getAllGrantedOrdersCollection,
            getUnitAttachmentGarrisonGrantedOrdersCollection,
            getAllUnitTraits,
            getAllWeaponTraitsCollection,
            isSquadron,

            setUnitVehicleGarrisonChoice,
            setUnitUpgradePod,
            setUnitVehicleWeaponChoice,
            addVehicle,
            removeVehicle,
            removeSupportAssetId,
            addSupportAsset,
            hasUnitId,
            $reset,
        };
    },
    (scope) => {
        return {
            persist: scope === '',
        };
    },
);