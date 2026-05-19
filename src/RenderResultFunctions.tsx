import {createElement, type ReactNode} from "react";
import {type fullResult, isValue} from "./searchFunctions.tsx";

function classNames(classes: string[]) {
    return classes.join(" ");
}

function renderWholeNode(node: unknown): ReactNode {
    if (Array.isArray(node)) {
        return node.map((child, index) =>
            createElement("span", { key: index }, renderWholeNode(child))
        );
    }

    if (isValue(node)) {
        return createElement(
            node.name || "div",
            {
                className: classNames(node.class),
            },
            node.content.map((child, index) =>
                createElement("span", { key: index }, renderWholeNode(child))
            )
        );
    }

    return String(node);
}

function renderSelectedTree(node: unknown, tree: PathTree, index: number = 0): ReactNode {
    if (tree.terminal) {
        return renderWholeNode(node);
    }

    if (isValue(node)) {
        const children = [...tree.children.entries()].map(([index, childTree]) =>
            renderSelectedTree(node.content[index], childTree, index)
        );

        return createElement(
            node.name || "div",
            {
                className: classNames(node.class),
                key: index
            },
            children
        );
    }

    if (Array.isArray(node)) {
        return [...tree.children.entries()].map(([index, childTree]) =>
            renderSelectedTree(node[index], childTree, index)
        );
    }

    return String(node);
}

export function fullResultToElements(fullResult: fullResult): ReactNode {
    const tree = createPathTree();

    fullResult.resultContent.forEach((result) => {
        const indexes = pathToIndexes(result.path);
        addPathToTree(tree, indexes);
    });

    return renderSelectedTree(fullResult.pageContent, tree);
}

type PathTree = {
    terminal: boolean;
    children: Map<number, PathTree>;
};

function createPathTree(): PathTree {
    return {
        terminal: false,
        children: new Map(),
    };
}

function pathToIndexes(path: string): number[] {
    const reKey = /(?:content)?\[(\d+)]/g;

    return [...path.matchAll(reKey)]
        .slice(2) // remove [pageIndex][htmlBodyIndex]
        .map((match) => Number.parseInt(match[1], 10));
}
function addPathToTree(tree: PathTree, indexes: number[]) {
    let current = tree;

    for (const index of indexes) {
        let child = current.children.get(index);

        if (!child) {
            child = createPathTree();
            current.children.set(index, child);
        }

        current = child;
    }

    current.terminal = true;
}

export function resultToElement(resultContent: fullResult, idx: number) {
    if (resultContent.resultContent.length != 0){
        const resElements = fullResultToElements(resultContent);
        return (
            <div key={idx} className={"flex flex-col gap-1 my-2 pt-2 pb-4 bg-[#eee] justify-center px-10"}>
                <a href={"https://beyondcanon.com/story/" + resultContent.page}
                   className={"text-center pb-2 mb-2 border-b-2 border-[#D7D7D7]"}
                >Page {resultContent.page}<br/><b>{resultContent.title}</b></a>
                <div className={"search_result"}>
                    {resElements}
                </div>
            </div>
        )
    }
}
