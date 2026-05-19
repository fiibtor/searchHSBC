export interface pageObj {
    html_body: value[]
    page: string
    title: string
}
export interface value {
    class: string[]
    content: unknown[]
    name: string
    type: string
}

export interface result {
    path: string
    value: string
}

export interface fullResult {
    pageContent: value | string[]
    resultContent: result[]
    title: string
    page: string
}

export function isValue(unkVal: value | unknown): unkVal is value{
    return (unkVal as value).content !== undefined
}

function getSearchOperators(searchTerm: string) {
    const operatorMap = new Map();
    const regex = new RegExp("(sort|from|to):(\\S+)", "g");
    const matches = [...searchTerm.matchAll(regex)];
    const extractedSearchTerm = searchTerm.replaceAll(regex, "");
    matches.forEach((match) => {
        operatorMap.set(match[1], match[2]);
    })
    operatorMap.set("searchTerm", extractedSearchTerm.trim());

    return operatorMap;
}

function filterDataByOperators(inputData: pageObj[], operators: Map<string, string>) {
    let returnData = inputData;
    const sort = operators.get("sort");
    const fromValue = operators.get("from");
    const toValue = operators.get("to");
    if (fromValue !== undefined) {
        returnData = returnData.filter((x) =>
            Number.parseInt(x.page, 10) >= Number.parseInt(fromValue, 10)
        )
    }
    if (toValue !== undefined) {
        returnData = returnData.filter((x) =>
            Number.parseInt(x.page, 10) <= Number.parseInt(toValue, 10)
        )
    }
    if (sort !== undefined) {
        if (sort == "desc") {
            returnData.sort(function (a, b) {
                return Number.parseInt(b.page, 10) - Number.parseInt(a.page, 10);
            });
        } else {
            returnData.sort(function (a, b) {
                return Number.parseInt(a.page, 10) - Number.parseInt(b.page, 10);
            });
        }
    }
    return returnData;
}

export function searchJson(data: pageObj[], searchTerm: string, isWholeWords: boolean, isCaseSensitive: boolean) {
    const searchOperatorMap = getSearchOperators(searchTerm)
    searchTerm = searchOperatorMap.get("searchTerm");
    const filteredData = filterDataByOperators(data, searchOperatorMap);

    const parentValue : value = {class: [""], content: [""], name: "", type: ""};
    let results: result[] = [{
        path: "",
        value: "",
    }];
    let fullResults: fullResult[] = [{
        pageContent: parentValue,
        resultContent: [],
        title: "",
        page: ""
    }];
    fullResults = []

    function recursiveSearch(value: value | unknown, path = "") {
        if (Array.isArray(value)){
            value.forEach((item, index) => {
                recursiveSearch(item, `${path}[${index}]`)
            })
        } else if (value !== null && isValue(value)){
            value.content.forEach((inn, idx) => {
                const newPath = path ? `${path}.content[${idx}]` : `content`;
                recursiveSearch(inn, newPath);
            });
        } else {
            if (String(value).toLowerCase().includes(searchTerm.toLowerCase())){
                let passed = true;
                let newValue = String(value);
                let newSearchTerm = searchTerm;

                if (isCaseSensitive && passed) {
                    passed = String(value).includes(searchTerm);
                } else if (!isCaseSensitive) {
                    newSearchTerm = newSearchTerm.toLowerCase();
                    newValue = newValue.toLowerCase();
                }
                if (isWholeWords && passed) {
                    newSearchTerm = RegExp.escape(newSearchTerm);
                    const wholeWordRegex = new RegExp("\\b" + newSearchTerm + "\\b", 'g');
                    passed = wholeWordRegex.test(newValue)
                }
                if (passed) {
                    const stringValue = typeof (value) === "string" ? value.toString() : "";
                    results.push({
                        path: path,
                        value: stringValue
                    });
                }
            }
        }
    }

    filteredData.forEach((page, pindex) => {
        const htmlbody = page.html_body;
        htmlbody.forEach((cnt, index) => {
            results = [];
            recursiveSearch(cnt, `[${pindex}][${index}]`);
            if (results.length > 0){
                fullResults.push(
                    {
                        pageContent: cnt,
                        resultContent: results,
                        title: page.title,
                        page: page.page
                    }  );
            }
        })
    })

    return fullResults;
}


