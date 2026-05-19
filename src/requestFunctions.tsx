import axios from "axios";
import type {pageObj} from "./searchFunctions.tsx";

const urlPrefix = "https://raw.githubusercontent.com/fiibtor/searchHSBC-files/refs/heads/main/";

export async function getUpdateTime(): Promise<string> {
    const response = await axios.get<string>(
        urlPrefix + "updateTime.txt",
        {timeout: 5000}
    );

    return response.data;
}

export async function getDataJson(): Promise<pageObj[]> {
    const response = await axios.get<pageObj[]>(
        urlPrefix + "data.json",
        {timeout: 5000}
    );
    return response.data;
}