import {ref, watch} from 'vue';

const STORAGE_KEY = 'sr-visual-theme';
const THEME_DEFAULT = 'default';
const THEME_CLEAN = 'clean';

const current = ref(localStorage.getItem(STORAGE_KEY) ?? THEME_DEFAULT);

function apply(theme) {
    if (theme === THEME_CLEAN) {
        document.documentElement.setAttribute('data-sr-theme', 'clean');
    } else {
        document.documentElement.removeAttribute('data-sr-theme');
    }
}

apply(current.value);

watch(current, (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    apply(theme);
});

export function useVisualTheme() {
    const isClean = () => current.value === THEME_CLEAN;

    function toggle() {
        current.value = current.value === THEME_CLEAN ? THEME_DEFAULT : THEME_CLEAN;
    }

    return {current, isClean, toggle};
}
