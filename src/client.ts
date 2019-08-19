import _components from "./components/*.svelte";
import _pages from "./pages/*.svelte";

const pages = _pages as unknown as Record<string, {
    default: SvelteComponent<{}>
}>;

const path = location.pathname.split("/");
let pagename = path[1] == "" 
    ? "index" 
    : !!pages[path[1]]
        ? path[1]
        : "404";

console.log(pagename);

const app = new pages[pagename].default({
    target: document.body
})
