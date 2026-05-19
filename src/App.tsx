import './characters.css'
import {
    type DetailedHTMLProps,
    type Dispatch,
    type InputHTMLAttributes,
    type JSX,
    type SetStateAction,
    useEffect,
    useState
} from "react";
import {resultToElement} from "./RenderResultFunctions.tsx";
import {getDataJson, getUpdateTime} from "./requestFunctions.tsx";
import {NavBar} from "./searchComponents.tsx";
import {type pageObj, searchJson} from "./searchFunctions.tsx";

function handleSearch(data: pageObj[], input: string, isWholeWords: boolean, isCaseSensitive: boolean, setResultElements: Dispatch<SetStateAction<JSX.Element>>) {
    if (input.trim() != "") {
        try {
            const result = searchJson(data, input, isWholeWords, isCaseSensitive);
            const resultElements = result.map((e, idx) => resultToElement(e, idx));
            setResultElements(
                <div className={"flex flex-col"}>
                    <h1 className={"text-xl font-bold italic"}>
                        {resultElements.length} Result{(resultElements.length != 1) ? "s" : ""}.
                    </h1>
                    <div>{resultElements}</div>
                </div>)
        } catch (error) {
            let message;
            if (error instanceof Error) message = error.message;
            else message = String(error);
            setResultElements(<div>{message}</div>)
        }
    }
}

function App() {
    const [input, setInput] = useState("");
    const [isWholeWords, setIsWholeWords] = useState(false);
    const [isCaseSensitive, setIsCaseSensitive] = useState(false);
    const [resultElements, setResultElements] = useState(<div></div>);
    const [updateTime, setUpdateTime] = useState<string>("????-??-??T??:??:??");
    const [data, setData] = useState<pageObj[]>([]);

    useEffect(() => {
        async function loadUpdateTime() {
            try {
                const time = await getUpdateTime();
                setUpdateTime(time);
                const dataVal = await getDataJson();
                setData(dataVal);
            } catch (error) {
                console.error("Failed to load update time:", error);
            }
        }

        loadUpdateTime();
    }, []);


    function handleTextAreaChange(e: { target: { value: SetStateAction<string>; }; }) {
        setInput(e.target.value)
    }

    const handleKeyDown = (event:
                           DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch(data, input, isWholeWords, isCaseSensitive, setResultElements)
        }
    }
    return (
        <>
            <NavBar/>
            <div className={"flex flex-col justify-center content-center text-center gap-2 max-w-[1050px] mx-auto py-10 bg-[#c6c6c6]"}>
                <h1 className={"text-4xl"}>Search</h1>
                <p>Operators: sort:(asc/desc), from:(page), to:(page)</p>
                <input type="text" className={"w-md border-2 border-blue-100 bg-white self-center text-2xl"}
                   onChange={handleTextAreaChange} value={input}
                   onKeyDown={handleKeyDown}/>
                <div className={"flex flex-row self-center gap-6"}>
                    <label>
                        Whole Words: <input onChange={() => {
                        setIsWholeWords(!isWholeWords)
                    }} checked={isWholeWords} type="checkbox" name="wholeWords"/>
                    </label>
                    <label>
                        Case Sensitive: <input onChange={() => {
                        setIsCaseSensitive(!isCaseSensitive)
                    }} checked={isCaseSensitive} type="checkbox" name="caseSensitive"/>
                    </label>
                </div>
            <div className={"flex justify-center max-w-4xl self-center"}>
                    {resultElements}
            </div>
            </div>
            <div className={"text-center my-3 text-white/40"}>
                Last Indexed: {updateTime.substring(0, 10)}
            </div>
            <div className={"text-char-auguryaside my-3 text-center"}>
                "I created nothing; credit to the makers."
            </div>
        </>
    )
}

export default App
