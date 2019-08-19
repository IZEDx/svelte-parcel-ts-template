import _modules from "./*.svelte";

exports = _modules as unknown as Record<string, {
    default: SvelteComponent<{}>
}>
