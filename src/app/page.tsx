
"use client"

import { useState, useRef, useCallback } from "react";
import { toJpeg } from 'html-to-image';

import DeckView from "./deck";
import { hydrateDecklist } from "@/lib/decklist";
import { encodeList, decodeList } from "@/lib/encoder"


export default function Home() {

  const defaultDeckListStr = `
1 ALT_CORE_B_BR_03_C
2 ALT_CORE_B_AX_26_R2
3 ALT_CORE_B_BR_05_C
3 ALT_CORE_B_BR_08_R1
3 ALT_CORE_B_BR_10_C
3 ALT_CORE_B_BR_11_C
2 ALT_CORE_B_BR_14_C
3 ALT_CORE_B_BR_15_C
3 ALT_CORE_B_BR_16_C
3 ALT_CORE_B_BR_17_R1
2 ALT_CORE_B_BR_20_R1
3 ALT_CORE_B_BR_25_C
1 ALT_CORE_B_BR_26_C
2 ALT_CORE_B_BR_26_R1
3 ALT_CORE_B_BR_28_C
3 ALT_CORE_B_BR_30_R1
`.trim()


  const decklistRef = useRef<HTMLDivElement>(null)
  const createImage = useCallback(() => {
    if (decklistRef.current === null) {
      return
    }

    toJpeg(decklistRef.current, { width: 1200, height: 1396, backgroundColor: "#333333", cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'my-decklist.jpg'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [decklistRef])

  const [decklist, setDecklist] = useState(hydrateDecklist(defaultDeckListStr));

  return (
    <main className="flex justify-center min-h-screen">
      <div className="absolute left-10 top-5">
        <textarea
          className="decklist-code-input"
          name="decklistcodeInput"
          defaultValue={encodeList(decklist.referenceList)}
          rows={2}
          cols={40}
          onChange={(event) => console.log(decodeList(event.target.value))}
        />
        <textarea
          className="decklist-input"
          name="decklistInput"
          defaultValue={defaultDeckListStr}
          rows={5}
          cols={20}
          onChange={(event) => setDecklist(hydrateDecklist(event.target.value))}
        />
      </div>
      <div className="absolute left-52 top-32">
        <pre>{encodeList(decklist.referenceList)}</pre>
      </div>
      <div className="absolute right-10 top-10">
        <button onClick={createImage}>Export as image</button>
      </div>
      <div className="visualarea max-w-visualarea min-w-visualarea mt-48">
        <div ref={decklistRef}> 
          <DeckView deckList={decklist} />
        </div>
      </div>
    </main>
  );
}
