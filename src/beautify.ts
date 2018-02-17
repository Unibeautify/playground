import { BeautifyData } from "Unibeautify";

const apiUrl: string = "https://unibeautify-playground-eijdodv3e08v.runkit.sh/";

export default function beautify(payload: BeautifyData): Promise<BeautifyResponse> {
  return fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json"
    }
  }).then(res => res.json());
}

export interface BeautifyResponse extends BeautifyData {
  beautifiedText: string;
}
