
"use client"

import Image from "next/image";
import { useState } from "react";

import Deck from "./deck";
import { hydrateDecklist } from "@/lib/decklist";


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

  const [decklist, setDecklist] = useState(hydrateDecklist(defaultDeckListStr));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="absolute left-10 top-10">
        <textarea
          name="decklistInput"
          defaultValue={defaultDeckListStr}
          rows={5}
          cols={20}
        />
      </div>
      <Deck deckList={decklist} />
    </main>
  );
}
