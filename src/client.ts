import _components from "./components/*.svelte";
import _pages from "./pages/*.svelte";

const pages = _pages as unknown as Record<string, {
    default: SvelteComponent<{}>
}>;

const app = new pages["index"].default({
    target: document.body
})

for (const key in pages)
{
    console.log(key, pages[key]);
}

export default app;