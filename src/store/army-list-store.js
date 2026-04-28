import {computed, ref} from 'vue';
import {useMechStore} from './mech-store.js';
import {GAME_SIZES, getGameSizeId} from '../data/game-sizes.js';
import {MINEFIELD_DRONE_CARRIER_SYSTEM} from '../data/mech-upgrades.js';
import {MINE_DRONE_BARRAGE} from '../data/support-asset-weapons.js';
import {useSupportAssetWeaponsStore} from './support-asset-weapons-store.js';
import {useSupportAssetCountsStore} from './support-asset-count-store.js';
import {find} from 'es-toolkit/compat';
import {useSupportAssetUnitsStore} from './support-asset-units-store.js';
import {TRAIT_MSOE_LAUNCHER} from '../data/unit-traits.js';
import {ORDER_SUPPORT_MSOE} from '../data/orders/support-orders.js';
import {defineScopeableStore} from 'pinia-scope';

export const useArmyListStore = defineScopeableStore('army-list', ({scope}) => {
        const supportAssetWeaponsStore = useSupportAssetWeaponsStore(scope);
        const supportAssetUnitStore = useSupportAssetUnitsStore(scope);

        const defaultArmyName = '';
        const defaultMaxTons = 150;

        const name = ref(defaultArmyName);
        const max_tons = ref(defaultMaxTons);

        function $reset() {
            name.value = defaultArmyName;
            max_tons.valie = defaultMaxTons;
        }

        const mechStore = useMechStore(scope);
        const supportAssetCounts = useSupportAssetCountsStore(scope);

        const game_size_id = computed(() => getGameSizeId(max_tons.value));
        const game_size_info = computed(() => GAME_SIZES[game_size_id.value]);

        const used_tons = computed(() => {
            return mechStore.totalTons +
                supportAssetCounts.used_tons;
        });

        const includes_mine_drones = computed(() => {

            const match = find(mechStore.mechs, (mech) => {
                return find(mech.upgrades, {upgrade_id: MINEFIELD_DRONE_CARRIER_SYSTEM});
            });

            if (match) {
                return true;
            }

            if (supportAssetUnitStore.has_mine_drones) {
                return true;
            }
            return supportAssetWeaponsStore.hasSupportAssetId(MINE_DRONE_BARRAGE);
        });

        const includes_msoe = computed(() => {
            const hasLauncher = supportAssetUnitStore.support_asset_units.find(unit => {
                const unitInfo = supportAssetUnitStore.getUnitAttachmentInfo(unit.id);
                return unitInfo.vehicles.find(vehicle => {
                    return vehicle.traits.find((trait) => trait.id === TRAIT_MSOE_LAUNCHER);
                });
            });

            return hasLauncher || supportAssetUnitStore.getAllGrantedOrdersCollection().includes(ORDER_SUPPORT_MSOE);
        });

        return {
            name,
            used_tons,
            max_tons,
            game_size_id,
            game_size_info,
            includes_mine_drones,
            includes_msoe,
            $reset,
        };
    },
    (scope) => {
        return {
            persist: scope === '',
        };
    });