import {MECH_SIZES, SIZE_MEDIUM} from '../data/unit-sizes.js';
import {MECH_BODY_MODS, MOD_STANDARD} from '../data/mech-body.js';
import {MECH_ARMOR_UPGRADES, NO_ARMOR_UPGRADE} from '../data/mech-armor-upgrades.js';
import {updateObject} from '../data/data-helpers.js';
import {cloneDeep, find, map, sortBy, sumBy} from 'es-toolkit/compat';
import {
    TRAIT_LIMITED,
    TRAIT_MELEE,
    TRAIT_SHORT,
    TRAIT_SMART,
    WEAPON_TRAITS,
    weaponTraitDisplayName,
} from '../data/weapon-traits.js';
import {HOWITZER, MECH_WEAPONS, MECH_WEAPONS_BY_TYPE, MISSILES, ROCKET_PACK} from '../data/mech-weapons.js';
import {computed, readonly, ref} from 'vue';
import {
    DIRECTIONAL_THRUSTER,
    ELECTRONIC_COUNTERMEASURES,
    getUpgradeTraits,
    JUMP_JETS,
    MECH_UPGRADES,
    MINEFIELD_DRONE_CARRIER_SYSTEM,
    NITRO_BOOST,
    TARGET_DESIGNATOR,
} from '../data/mech-upgrades.js';
import {deleteItemById, findById, findItemIndex, moveItem} from './helpers/collection-helper.js';
import {useFactionStore} from './faction-store.js';
import {useTeamStore} from './team-store.js';
import {
    TEAM_PERK_0_SLOT_ARMOR_UPGRADES,
    TEAM_PERK_0_SLOT_DIRECTIONAL_THRUSTERS,
    TEAM_PERK_0_SLOT_ECM,
    TEAM_PERK_0_SLOT_TARGET_DESIGNATORS,
    TEAM_PERK_0_TON_ARMOR_UPGRADES,
    TEAM_PERK_0_TON_ECM,
    TEAM_PERK_0_TON_TARGET_DESIGNATORS,
    TEAM_PERK_BARREL_EXTENSIONS,
    TEAM_PERK_EXTRA_MISSILE_AMMO,
    TEAM_PERK_EXTRA_NITRO,
    TEAM_PERK_EXTRA_TONNAGE,
    TEAM_PERK_JUMP_BOOSTER,
    TEAM_PERK_SMART_HOWITZERS,
} from '../data/mech-team-perks.js';
import {TRAIT_COMPACT, TRAIT_UPGRADE_LIMITED, UPGRADE_TRAITS, upgradeTraitDisplayName} from '../data/upgrade-traits.js';
import {DWC_TOP_END_HARDWARE_BONUS_TONS, RD_ADVANCED_HARDPOINT_DESIGN_BONUS_SLOTS} from '../data/factions.js';
import {MECH_MOBILITIES, MOBILITY_BI_PEDAL} from '../data/mech-mobility.js';
import {TYPE_HEV} from '../data/unit-types.js';
import {makeGrantedOrderCollection} from './helpers/helpers.js';
import {toaster} from '../toaster.js';
import {useValidationStore} from './validation-store.js';
import {TEAM_GENERAL, TEAM_SHELF} from '../data/mech-teams.js';
import {defineScopeableStore} from 'pinia-scope';

export const useMechStore = defineScopeableStore('mech', ({scope}) => {
        const teamStore = useTeamStore(scope);
        const validationStore = useValidationStore(scope);
        const factionStore = useFactionStore(scope);

        const mechs = ref([]);
        const mechs_id_increment = ref(1);

        function $reset() {
            mechs.value = [];
            mechs_id_increment.value = 1;
        }

        function addMech({
                             size_id,
                             structure_mod_id,
                             armor_mod_id,
                             armor_upgrade_id,
                             mobility_id,
                             preferred_team_id,
                             name,
                         }) {

            size_id = size_id ?? SIZE_MEDIUM;
            structure_mod_id = structure_mod_id ?? MOD_STANDARD;
            armor_mod_id = armor_mod_id ?? MOD_STANDARD;
            armor_upgrade_id = armor_upgrade_id ?? NO_ARMOR_UPGRADE;
            mobility_id = mobility_id ?? MOBILITY_BI_PEDAL;
            preferred_team_id = teamStore.normalizePreferredTeamId(preferred_team_id ?? TEAM_GENERAL);

            let id = mechs_id_increment.value++;
            let mech = {
                id,
                name,
                size_id,
                structure_mod_id,
                armor_mod_id,
                armor_upgrade_id,
                mobility_id,
                preferred_team_id,
                weapons: [],
                weapons_id_increment: 1,
                upgrades: [],
                upgrades_id_increment: 1,
                display_order: null,
                unit_type_id: TYPE_HEV,
            };

            mechs.value.push(mech);
            mech.display_order = findItemIndex(mechs.value, mech);

            return id;
        }

        function updateMech(mechId, data) {
            let mech = findById(mechs.value, mechId);
            updateObject(mech, data, [
                'name',
                'size_id',
                'structure_mod_id',
                'armor_mod_id',
                'armor_upgrade_id',
                'mobility_id',
                'preferred_team_id',
            ]);

            if (data.size_id) {
                removeInvalidMechAttachments(mechId);
            }
        }

        function duplicateMech(mechId) {

            const mech = getMech(mechId);
            const {
                teamId,
                groupId,
            } = teamStore.getMechTeamAndGroupIds(mechId);

            const newMechId = teamStore.addMechToTeam(teamId, groupId);

            const {
                structure_mod_id,
                armor_mod_id,
                armor_upgrade_id,
                mobility_id,
                size_id,
                weapons,
                upgrades,
            } = mech;

            updateMech(newMechId, {
                structure_mod_id,
                armor_mod_id,
                armor_upgrade_id,
                mobility_id,
                size_id,
            });

            weapons.forEach(weapon => {
                addMechWeaponAttachment(newMechId, weapon.weapon_id);
            });

            upgrades.forEach(upgrade => {
                addMechUpgradeAttachment(newMechId, upgrade.upgrade_id);
            });
        }

        function removeMech(mechId) {
            teamStore.removeMechFromTeam(mechId);
            deleteItemById(mechs.value, mechId);
        }

        function addMechWeaponAttachment(mechId, weaponId) {
            let mech = findById(mechs.value, mechId);
            let id = mech.weapons_id_increment++;
            let weapon = {
                id,
                weapon_id: weaponId,
                display_order: null,
            };
            mech.weapons.push(weapon);
            weapon.display_order = findItemIndex(mech.weapons, weapon);
        }

        function removeMechWeaponAttachment(mechId, mechWeaponAttachmentId) {
            let mech = findById(mechs.value, mechId);
            deleteItemById(mech.weapons, mechWeaponAttachmentId);
        }

        function moveMechWeaponAttachment(mechId, weaponAttachment, toIndex) {
            let mech = findById(mechs.value, mechId);
            moveItem(mech.weapons, weaponAttachment, toIndex);
        }

        function addMechUpgradeAttachment(mechId, upgradeId) {
            let mech = findById(mechs.value, mechId);
            let id = mech.upgrades_id_increment++;
            let upgrade = {
                id,
                upgrade_id: upgradeId,
                display_order: null,
                assigned_weapon_id: null,
            };
            mech.upgrades.push(upgrade);
            upgrade.display_order = findItemIndex(mech.upgrades, upgrade);
        }

        function removeMechUpgradeAttachment(mechId, mechUpgradeAttachmentId) {
            let mech = findById(mechs.value, mechId);
            deleteItemById(mech.upgrades, mechUpgradeAttachmentId);
        }

        function moveMechUpgradeAttachment(mechId, upgradeAttachment, toIndex) {
            let mech = findById(mechs.value, mechId);
            moveItem(mech.upgrades, upgradeAttachment, toIndex);
        }

        function removeInvalidMechAttachments(mechId) {
            let mech = findById(mechs.value, mechId);
            let mechInfo = getMechInfo(mechId);
            mech.upgrades.forEach((upgradeAttachment) => {
                const info = getMechUpgradeAttachmentInfo(mechId, upgradeAttachment.id);
                if (!info.valid) {
                    toaster().info(`${mechInfo.size.display_name} HE-V (${mechInfo.display_name})`,
                        `${info.display_name} removed: (${info.validation_message})`);
                    removeMechUpgradeAttachment(mechId, upgradeAttachment.id);
                }
            });

            mech.weapons.forEach((weaponAttachment) => {
                const info = getMechWeaponAttachmentInfo(mechId, weaponAttachment.id);
                if (!info.valid) {

                    toaster().info(`${mechInfo.size.display_name} HE-V (${mechInfo.display_name})`,
                        `${info.display_name} removed: (${info.validation_message})`);
                    removeMechWeaponAttachment(mechId, weaponAttachment.id);
                }
            });
        }

        function setMechVisible(mechId, visible) {
            const mech = getMech(mechId);
            mech.visible = visible;
        }

        function getMechVisible(mechId) {
            return !!getMech(mechId).visible;
        }

        const totalTons = computed(() => {
            let tons = 0;

            mechs.value.forEach((mech) => {
                const {teamId} = teamStore.getMechTeamAndGroupIds(mech.id);
                if (teamId !== TEAM_SHELF) {
                    const {size} = getMechInfo(mech.id);
                    tons += size.max_tons;
                }
            });
            return tons;
        });

        function getMech(mechId) {
            return findById(mechs.value, mechId);
        }

        function getMechInfo(mechId) {
            let {
                name,
                size_id,
                structure_mod_id,
                armor_mod_id,
                armor_upgrade_id,
                mobility_id,
                weapons,
                upgrades,
                preferred_team_id,
            } = getMech(mechId);

            const placeholder_name = ('HE-V-' + mechId).padStart(1);

            const upgradesInfo = upgrades.map((item) => getMechUpgradeAttachmentInfo(mechId, item.id));
            const weaponsInfo = weapons.map((item) => getMechWeaponAttachmentInfo(mechId, item.id));

            const armorUpgradeInfo = getMechArmorUpgradeInfo(mechId, armor_upgrade_id);

            const size = MECH_SIZES[size_id];
            const structure_mod = MECH_BODY_MODS[structure_mod_id];
            const armor_mod = MECH_BODY_MODS[armor_mod_id];
            const mobility = MECH_MOBILITIES[mobility_id];

            let {
                defense,
                max_tons,
                max_slots,
                smash_damage,
            } = size;

            let armor_stat = size.armor + armor_mod.modifier;
            const structure_stat = size.structure + structure_mod.modifier;

            const weapon_used_slots = sumBy(weaponsInfo, 'slots');
            const weapon_used_tons = sumBy(weaponsInfo, 'cost');

            const upgrade_used_slots = sumBy(upgradesInfo, 'slots');
            const upgrade_used_tons = sumBy(upgradesInfo, 'cost');

            let used_slots = weapon_used_slots +
                upgrade_used_slots +
                armorUpgradeInfo.slots +
                mobility.slots
            ;

            if (factionStore.hasAdvancedHardPoints) {
                used_slots += RD_ADVANCED_HARDPOINT_DESIGN_BONUS_SLOTS;
            }

            let used_tons = weapon_used_tons +
                upgrade_used_tons +
                armor_stat +
                structure_stat +
                armorUpgradeInfo.cost;

            if (factionStore.hasTopEndHardware) {
                used_tons += DWC_TOP_END_HARDWARE_BONUS_TONS;
            }

            let display_name = name || placeholder_name;

            let {move, jump} = MECH_SIZES[size_id];
            const jumpJets = find(upgrades, {upgrade_id: JUMP_JETS});

            if (jumpJets) {
                const hasJumpBooster = teamStore.getMechHasTeamPerkId(mechId, TEAM_PERK_JUMP_BOOSTER);
                if (hasJumpBooster) {
                    jump += 1;
                }
            } else {
                jump = 0;
            }

            if (armorUpgradeInfo.armor_mod) {
                armor_stat += armorUpgradeInfo.armor_mod;
            }

            let tonnage_stat = MECH_SIZES[size_id].max_tons;
            const extraTonnage = teamStore.getMechHasTeamPerkId(mechId, TEAM_PERK_EXTRA_TONNAGE);
            if (extraTonnage) {
                tonnage_stat += 5;
            }

            return readonly({
                display_name,
                placeholder_name,
                size,
                structure_mod,
                armor_mod,
                max_tons,
                used_tons,
                max_slots,
                used_slots,
                armor_stat,
                structure_stat,
                upgrade_used_tons,
                upgrade_used_slots,
                weapon_used_slots,
                weapon_used_tons,
                armor_upgrade_id,
                mobility,
                move,
                jump,
                tonnage_stat,
                defense,
                smash_damage,
                preferred_team_id,
            });
        }

        function getMechGrantedOrdersCollection(mechId) {
            const grantedOrders = makeGrantedOrderCollection();

            const info = getMechInfo(mechId);

            grantedOrders.add(info.mobility);

            const weapons = getMechWeaponsAttachmentInfo(mechId);
            weapons.forEach(weapon => {
                grantedOrders.addMultiple(weapon.traits);
            });

            const upgrades = getMechUpgradesAttachmentInfo(mechId);
            upgrades.forEach(upgrade => {
                grantedOrders.addMultiple(upgrade.traits);
            });

            return grantedOrders;
        }

        function getWeaponInfo(mechId, weaponId) {
            const mech = getMech(mechId);
            const size_id = mech.size_id;
            const size = MECH_SIZES[size_id];
            const weapon = MECH_WEAPONS[weaponId];
            const damage = weapon.damage_by_size[size_id];
            const cost = weapon.cost_by_size[size_id];

            const {
                display_name,
                slots,
                limited_size_ids,
                range,
            } = weapon;

            let {traits, team_perks, faction_perks, range_modifier} = getWeaponTraitsInfo(mechId, weaponId);
            const traitLimited = find(traits, {id: TRAIT_LIMITED});

            let max_uses = null;
            if (traitLimited) {
                max_uses = traitLimited.number;
            }

            let validation_message = null;
            let valid = true;

            const {
                valid: sizeValid,
                validSizeDisplayNames,
            } = validationStore.getMechWeaponSizeValidation(mechId, weaponId);

            if (!sizeValid) {
                valid = false;
                validation_message = `Only available for ${validSizeDisplayNames.join('/')} HE-Vs`;
            }

            if (valid) {
                const prohibited = teamStore.getWeaponTraitIsProhibited(mechId, weaponId, traits);
                valid = prohibited.valid;
                validation_message = prohibited.validation_message;
            }

            let melee_base_damage = null;
            let melee_trait_damage = null;

            const melee = find(traits, {id: TRAIT_MELEE});
            if (melee) {
                melee_base_damage = size.smash_damage + 1;
                melee_trait_damage = melee.number;
            }

            return readonly({
                weapon_id: weaponId,
                display_name,
                damage,
                slots,
                cost,
                range,
                range_modifier,
                range_total: range + range_modifier,
                melee_base_damage,
                melee_trait_damage,
                melee_total_damage: melee_base_damage + melee_trait_damage,
                traits,
                team_perks,
                faction_perks,
                max_uses,
                valid,
                validation_message,

            });
        }

        function getWeaponTraitsInfo(mechId, weaponId) {
            const mech = getMech(mechId);
            const size_id = mech.size_id;
            const weapon = MECH_WEAPONS[weaponId];
            let traits = cloneDeep(weapon.traits_by_size[size_id]);
            const perks = teamStore.getTeamPerksInfoByMech(mechId);

            const faction_perks = [];
            const team_perks = [];

            let range_modifier = null;

            if (weaponId === ROCKET_PACK || weaponId === MISSILES) {
                const perk = find(perks, {id: TEAM_PERK_EXTRA_MISSILE_AMMO});
                const traitLimited = find(traits, {id: TRAIT_LIMITED});

                if (perk) {
                    traitLimited.number += perk.value;
                    team_perks.push(perk);
                }

                const materielPerk = factionStore.hasMaterielStockpilesInfo;
                if (materielPerk) {
                    traitLimited.number += 1;
                    faction_perks.push(materielPerk);
                }
            }

            const perk = find(perks, {id: TEAM_PERK_BARREL_EXTENSIONS});
            if (perk) {
                const match = find(traits, {id: TRAIT_SHORT});
                if (match) {
                    range_modifier = perk.value;
                    team_perks.push(perk);
                }
            }

            if (weaponId === HOWITZER) {
                const perk = find(perks, {id: TEAM_PERK_SMART_HOWITZERS});
                if (perk) {
                    traits.push({id: TRAIT_SMART});
                    team_perks.push(perk);
                }
            }

            traits = traits.map(trait => ({
                ...WEAPON_TRAITS[trait.id],
                ...trait,
                display_name: weaponTraitDisplayName(trait),
            }));

            return {traits, team_perks, faction_perks, range_modifier};
        }

        function getMechWeaponsAttachmentInfo(mechId) {
            const mech = getMech(mechId);

            return mech.weapons.map(({id}) => getMechWeaponAttachmentInfo(mechId, id));
        }

        function getMechWeaponAttachmentInfo(mechId, mechWeaponAttachmentId) {

            const mech = getMech(mechId);
            const weaponAttachment = findById(mech.weapons, mechWeaponAttachmentId);
            const weapon_id = weaponAttachment.weapon_id;
            const weaponInfo = getWeaponInfo(mechId, weapon_id);

            const previousWeaponInstances = mech.weapons.filter((item) => {
                return item.weapon_id === weapon_id && item.display_order < weaponAttachment.display_order;
            }).length;

            let cost = weaponInfo.cost;
            const duplicate_cost = Math.floor(previousWeaponInstances * cost * 0.5);
            const {teamId, groupId} = teamStore.getMechTeamAndGroupIds(mechId);

            let required_by_group = false;
            let required_by_group_reason = false;

            let {
                required,
                required_reason,
            } = teamStore.getWeaponAttachmentIsRequired(teamId, groupId, weaponAttachment, mech);
            if (required) {
                required_by_group = true;
                required_by_group_reason = required_reason;
            }

            return readonly({
                ...weaponInfo,
                base_cost: cost,
                cost: cost + duplicate_cost,
                duplicate_cost,
                required_by_group,
                required_by_group_reason,
                duplicate_percent: previousWeaponInstances * 50,
            });
        }

        function getMechAvailableWeaponsInfo(mechId) {

            const makeList = (weapons) => {
                const result = weapons.map((weaponId) => {
                    const {
                        required,
                        reason,
                    } = teamStore.getMechWeaponIsRequiredInfo(mechId, weaponId);

                    return {
                        ...getWeaponInfo(mechId, weaponId),
                        meets_requirements: required,
                        meets_requirements_reason: reason,
                    };
                });
                return sortBy(result, ['display_name']);
            };

            return {
                melee: makeList(MECH_WEAPONS_BY_TYPE.melee),
                ranged: makeList(MECH_WEAPONS_BY_TYPE.ranged),
            };
        }

        function getUpgradeTraitsInfo(mechId, upgradeId) {
            let {size_id} = getMech(mechId);
            let traits = getUpgradeTraits(upgradeId, size_id);

            const traitLimited = find(traits, {id: TRAIT_UPGRADE_LIMITED});

            const teamPerks = teamStore.getTeamPerksInfoByMech(mechId);

            const used_team_perks = [];
            const faction_perks = [];

            if (upgradeId === NITRO_BOOST) {
                let perk = find(teamPerks, {id: TEAM_PERK_EXTRA_NITRO});
                if (perk) {
                    if (traitLimited) {
                        traitLimited.number += 1;
                        used_team_perks.push(perk);
                    }
                }
            }

            if (upgradeId === MINEFIELD_DRONE_CARRIER_SYSTEM) {
                const materielPerk = factionStore.hasMaterielStockpilesInfo;
                if (materielPerk) {
                    if (traitLimited) {
                        traitLimited.number += 1;
                        faction_perks.push(materielPerk);
                    }
                }
            }

            let max_uses = null;
            if (traitLimited) {
                max_uses = traitLimited.number;
            }

            traits.forEach(trait => {
                trait.display_name = upgradeTraitDisplayName(trait);
            });

            return {
                used_team_perks,
                faction_perks,
                traits,
                max_uses,
            };
        }

        function getUpgradeInfo(mechId, upgradeId) {
            let {size_id, upgrades} = getMech(mechId);
            let {
                slots,
                display_name,
                description,
                cost_by_size,
                limited_size_ids,
            } = MECH_UPGRADES[upgradeId];

            const {
                used_team_perks,
                faction_perks,
                traits,
                max_uses,
            } = getUpgradeTraitsInfo(mechId, upgradeId);

            let cost = cost_by_size[size_id];

            let validation_message = null;
            let valid = true;

            const teamPerks = teamStore.getTeamPerksInfoByMech(mechId);

            const {
                valid: sizeValid,
                validSizeDisplayNames,
                sizeTeamPerk,
            } = validationStore.getMechUpgradeSizeValidation(mechId, upgradeId);

            if (sizeTeamPerk) {
                used_team_perks.push(sizeTeamPerk);
            }

            if (!sizeValid) {
                valid = false;
                validation_message = `Only available for ${validSizeDisplayNames.join('/')} HE-Vs`;
            }

            const traitCompact = find(traits, {id: TRAIT_COMPACT});
            if (traitCompact) {
                const prevCompact = upgrades.find((upgrade) => {
                    if (upgrade.upgrade_id === upgradeId) {
                        return false;
                    }
                    const {traits} = getUpgradeTraitsInfo(mechId, upgrade.upgrade_id);

                    return find(traits, {id: TRAIT_COMPACT});
                });

                if (prevCompact) {
                    valid = false;
                    validation_message = `Only one Upgrade with the ${UPGRADE_TRAITS[TRAIT_COMPACT].display_name} trait may be selected.`;
                }
            }

            if (upgradeId === TARGET_DESIGNATOR) {
                let perk = find(teamPerks, {id: TEAM_PERK_0_SLOT_TARGET_DESIGNATORS});
                if (perk) {
                    slots = 0;
                    used_team_perks.push(perk);
                }

                perk = find(teamPerks, {id: TEAM_PERK_0_TON_TARGET_DESIGNATORS});
                if (perk) {
                    cost = 0;
                    used_team_perks.push(perk);
                }
            }

            if (upgradeId === DIRECTIONAL_THRUSTER) {
                let perk = find(teamPerks, {id: TEAM_PERK_0_SLOT_DIRECTIONAL_THRUSTERS});
                if (perk) {
                    slots = 0;
                    used_team_perks.push(perk);
                }
            }

            if (upgradeId === ELECTRONIC_COUNTERMEASURES) {
                let perk = find(teamPerks, {id: TEAM_PERK_0_SLOT_ECM});
                if (perk) {
                    slots = 0;
                    used_team_perks.push(perk);
                }

                perk = find(teamPerks, {id: TEAM_PERK_0_TON_ECM});
                if (perk) {
                    cost = 0;
                    used_team_perks.push(perk);
                }
            }

            return readonly({
                upgrade_id: upgradeId,
                display_name,
                description,
                valid,
                validation_message,
                slots,
                cost,
                team_perks: used_team_perks,
                faction_perks,
                max_uses,
                traits,
                required_by_group: teamStore.getMechUpgradeIsRequired(mechId, upgradeId),
            });
        }

        function getMechUpgradesAttachmentInfo(mechId) {
            const mech = getMech(mechId);

            return mech.upgrades.map(({id}) => getMechUpgradeAttachmentInfo(mechId, id));
        }

        function getMechUpgradeAttachmentInfo(mechId, mechUpgradeAttachmentId) {
            const mech = getMech(mechId);
            const upgradeAttachment = findById(mech.upgrades, mechUpgradeAttachmentId);

            const upgradeId = upgradeAttachment.upgrade_id;
            const info = getUpgradeInfo(mechId, upgradeId);
            const upgradeData = MECH_UPGRADES[upgradeId];

            return {
                id: mechUpgradeAttachmentId,
                assigned_weapon_id: upgradeAttachment.assigned_weapon_id ?? null,
                requires_weapon_assignment: upgradeData?.requires_weapon_assignment ?? false,
                ...info,
            };
        }

        function setMechUpgradeAssignedWeapon(mechId, upgradeAttachmentId, weaponId) {
            const mech = getMech(mechId);
            const attachment = findById(mech.upgrades, upgradeAttachmentId);
            if (attachment) {
                attachment.assigned_weapon_id = weaponId || null;
            }
        }

        function getMechAvailableUpgradesInfo(mechId) {
            const mech = findById(mechs.value, mechId);
            const existingUpgradeIds = mech.upgrades.map((item) => item.upgrade_id);

            const result = Object.keys(MECH_UPGRADES)
                .filter((upgradeId) => !existingUpgradeIds.includes(upgradeId))
                .map((upgradeId) => getUpgradeInfo(mechId, upgradeId));

            return sortBy(result, ['display_name']);
        }

        function getMechArmorUpgradeAttachmentInfo(mechId) {
            let {
                armor_upgrade_id,
            } = getMech(mechId);

            return getMechArmorUpgradeInfo(mechId, armor_upgrade_id);
        }

        function getMechArmorUpgradeInfo(mechId, armorUpgradeId) {
            let {
                size_id,
            } = getMech(mechId);

            let {
                slots,
                cost_by_size,
                display_name,
                card_upgrade_display_name,
                armor_mod,
                description,
            } = MECH_ARMOR_UPGRADES[armorUpgradeId];

            let cost = cost_by_size[size_id];
            let valid = true;
            let validation_message = null;

            const {
                valid: armorValid,
                teamDisplayName,
                groupDisplayName,
            } = validationStore.getMechTeamGroupArmorUpgradeValidation(mechId, armorUpgradeId);

            if (!armorValid) {
                valid = false;
                validation_message = `Not available to ${teamDisplayName} ${groupDisplayName}`;
            }

            const {
                valid: armorSizeValid,
                validSizeDisplayNames,
            } = validationStore.getMechArmorUpgradeSizeValidation(mechId, armorUpgradeId);

            if (!armorSizeValid) {
                valid = false;
                validation_message = `Only available to HE-V size(s): ${validSizeDisplayNames.join('/')}`;
            }

            const perks = teamStore.getTeamPerksInfoByMech(mechId);
            const team_perks = [];

            if (slots !== 0) {
                const perk = find(perks, {id: TEAM_PERK_0_SLOT_ARMOR_UPGRADES});
                if (perk) {
                    slots = 0;
                    team_perks.push(perk);
                }
            }

            if (cost !== 0) {
                const perk = find(perks, {id: TEAM_PERK_0_TON_ARMOR_UPGRADES});
                if (perk) {
                    cost = 0;
                    team_perks.push(perk);
                }
            }

            return {
                id: armorUpgradeId,
                cost,
                slots,
                display_name,
                card_upgrade_display_name,
                description,
                valid,
                validation_message,
                team_perks,
                armor_mod,
            };
        }

        function getMechAvailableArmorUpgrades(mechId) {
            return Object.keys(MECH_ARMOR_UPGRADES).map(armorUpgradeId => getMechArmorUpgradeInfo(mechId, armorUpgradeId));
        }

        const getUsedWeaponTraitIds = computed(() => {
            const traitIdMap = {};
            mechs.value.forEach(mech => {
                mech.weapons.forEach(weapon => {
                    const traitInfo = getWeaponTraitsInfo(mech.id, weapon.weapon_id);
                    const traitIds = map(traitInfo.traits, 'id');
                    traitIds.forEach(traitId => traitIdMap[traitId] = true);
                });
            });
            return Object.keys(traitIdMap);
        });

        const getUsedUpgradeTraitIds = computed(() => {
            const traitIdMap = {};
            mechs.value.forEach(mech => {
                mech.upgrades.forEach(upgrade => {
                    const traitInfo = getUpgradeTraitsInfo(mech.id, upgrade.upgrade_id);
                    const traitIds = map(traitInfo.traits, 'id');
                    traitIds.forEach(traitId => traitIdMap[traitId] = true);
                });
            });
            return Object.keys(traitIdMap);
        });

        const getUsedUpgradeTraitsInfo = computed(() => {
            const results = getUsedUpgradeTraitIds.value.map(traitId => {
                return {
                    ...UPGRADE_TRAITS[traitId],
                    display_name: upgradeTraitDisplayName({id: traitId, number: 'X'}),
                };
            });

            return sortBy(results, 'display_name');
        });

        const getUsedUpgradeIds = computed(() => {
            const idMap = {};
            mechs.value.forEach(mech => {
                mech.upgrades.forEach(upgrade => {
                    idMap[upgrade.upgrade_id] = true;
                });
            });
            return Object.keys(idMap);
        });

        const getUsedUpgradesInfo = computed(() => {
            const results = getUsedUpgradeIds.value.map(upgradeId => {
                let upgrade = {
                    ...MECH_UPGRADES[upgradeId],
                };

                if (!upgrade.traits) {
                    upgrade.traits = [];
                    if (upgrade.traits_by_size) {
                        const entry = Object.values(upgrade.traits_by_size);
                        upgrade.traits = entry[0];
                    }
                }

                upgrade.traits = upgrade.traits.map(trait => ({
                    ...trait,
                    display_name: upgradeTraitDisplayName({id: trait.id, number: 'X'}),
                }));

                return upgrade;
            });

            return sortBy(results, 'display_name');
        });

        return {
            mechs,
            mechs_id_increment,
            getUsedUpgradeIds,
            getUsedUpgradeTraitIds,
            getUsedUpgradeTraitsInfo,
            getUsedWeaponTraitIds,
            getUpgradeTraitsInfo,
            getUsedUpgradesInfo,
            getMechAvailableArmorUpgrades,
            getMechArmorUpgradeInfo,
            getMechArmorUpgradeAttachmentInfo,
            getMechAvailableUpgradesInfo,
            getUpgradeInfo,
            getMechUpgradeAttachmentInfo,
            getMechUpgradesAttachmentInfo,
            getMechAvailableWeaponsInfo,
            getMechWeaponAttachmentInfo,
            getMechWeaponsAttachmentInfo,
            getWeaponTraitsInfo,
            getWeaponInfo,
            getMechGrantedOrdersCollection,

            updateMech,
            getMech,
            getMechInfo,
            duplicateMech,
            setMechVisible,
            getMechVisible,
            totalTons,
            addMech,
            removeMech,
            removeMechWeaponAttachment,
            removeInvalidMechAttachments,
            removeMechUpgradeAttachment,
            setMechUpgradeAssignedWeapon,
            addMechUpgradeAttachment,
            addMechWeaponAttachment,
            moveMechWeaponAttachment,
            moveMechUpgradeAttachment,
            $reset,
        };
    },
    (scope) => {
        return {
            persist: scope === '',
        };
    },
);