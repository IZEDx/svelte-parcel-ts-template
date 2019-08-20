import Route from "route-parser";
import { RecursiveRecord, indexModules } from "./libs/utils";
import _modules from "./pages/**/*.svelte";

interface Page 
{
    path: string;
    route: Route;
    create: (target: HTMLElement) => SvelteComponent<{}>;
}

interface PageProps
{

}

type PageModule = {
    default: SvelteComponent<PageProps>
};

function isPageModule(obj: any): obj is PageModule
{
    return !!obj && !!obj.default && obj.default.name === "Component";
} 

const pageModules = _modules as unknown as RecursiveRecord<PageModule>;



async function main()
{
    const pages = await indexModules(pageModules, isPageModule, (path, module) => [{
        path,
        route: new Route(path),
        create: (target: HTMLElement) => new module.default({target})
    } as Page]);

    const page = pages.find(page => page.route.match(location.pathname));

    if (page) {
        const match = page.route.match(location.pathname);
        page.create(document.body).$set(match);
    } else {
        pages.find(page => page.route.match("/404"))!.create(document.body);
    }

    console.log(pages);
}

main();
