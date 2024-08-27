import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from "react";
import { toJpeg } from 'html-to-image';

import DeckView from "../deck/index";
import { Decklist, hydrateDecklist } from "@/lib/decklist";
import { decodeList } from "altered-deckfmt";

export default function DeckSlug() {
  const router = useRouter()
  const [decklist, setDecklist] = useState<Decklist | undefined>(undefined)

  const decklistRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const deckCode = router.query.deckCode
    if (!deckCode) { return }
    const textDeckList: string = decodeList(deckCode)
    const deck = hydrateDecklist(textDeckList)
    setDecklist(deck)
  }, [router, setDecklist]);

  // const createImage = useCallback(() => {
  //   if (decklistRef.current === null) {
  //     return
  //   }

  //   toJpeg(decklistRef.current, { width: 1200, height: 1396, backgroundColor: "#333333", cacheBust: true, })
  //     .then((dataUrl) => {
  //       const link = document.createElement('a')
  //       link.download = 'my-decklist.jpg'
  //       link.href = dataUrl
  //       link.click()
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }, [decklistRef])

  return (
    <>
      <main className="flex justify-center min-h-screen">
        <div className="visualarea max-w-visualarea min-w-visualarea mt-48">
          <div ref={decklistRef}> 
            {decklist && <DeckView deckList={decklist} />}
          </div>
        </div>
      </main>
    </>
  );
}
