interface navBarItem {
    title: string
    url: string
}

export function NavBar() {
    const items: navBarItem[][] = [
        [{title: "fiibtor", url: "https://www.fiibtor.tumblr.com"}],
        [{title: "Search", url: "https://fiibtor.github.io/searchHSBC/"},
            {title: "Map", url: ""}],
        [{title: "caucgen", url: "https://fiibtor.github.io/caucgen/"},
            {title: "ultText", url: "https://fiibtor.github.io/ultText/"}],
        [{title: "HSBC", url: "https://beyondcanon.com"}]
    ]


    const groups = items.map((x, idx) =>
        <div key={idx} className={"navGroup flex flex-row"}>
            {x.map((i, idx) => {
                if (i.url != "") {
                    return <div key={idx} className={"navItem"}>
                        <a href={i.url} className={"navLink"}>{i.title}</a>
                    </div>
                } else {
                    return <div key={idx} className={"navItem"}>
                        <span className={"navEmpty"}>{i.title}</span>
                    </div>
                }
            })}
        </div>
    )
    return <div key={"navBarInner"} className={"flex flex-row justify-center"}>{groups}</div>
}