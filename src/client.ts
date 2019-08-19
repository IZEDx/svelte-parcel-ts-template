import pageModules, { PageModule, isPageModule } from "./pages";
import Route from "route-parser";
import { RecursiveRecord } from "./libs/utils";

interface Page 
{
    path: string;
    route: Route;
    create: (target: HTMLElement) => SvelteComponent<{}>;
}


async function indexPages([path, page]: [string, PageModule|RecursiveRecord<PageModule>]): Promise<Page[]>
{
    if (isPageModule(page))
    {
        return [{
            path,
            route: new Route(path),
            create: (target: HTMLElement) => new page.default({target})
        } as Page]
    }
    else
    {
        return (await Promise.all(
            Object.entries(page)
                .map(e => [ path + "/" + transformPagename(e[0]), e[1] ] as typeof e)
                .flatMap(async e => await indexPages(e))
        )).flat()
    }
}

function transformPagename(pagename: string): string
{
    if (pagename.startsWith("_") && pagename.endsWith("_"))
    {
        return ":" + pagename.slice(1, pagename.length - 1);
    }

    if (pagename === "index")
    {
        return "";
    }

    return pagename;
}

async function main()
{
    const pages = await indexPages(["", pageModules]);
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
/*

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
*/