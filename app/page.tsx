"use client";

import { useState } from 'react'
import { encodeList } from 'altered-deckfmt'
import Link from 'next/link'

export default function Index() {

  const [textList, setTextList] = useState("")

  return (
    <>
      <main className="h-screen max-w-800 flex items-center justify-center">
        <div>
          <h1 className='text-2xl font-montserrat'>Paste your decklist:</h1>
          <div>
            <textarea rows={20} cols={40} value={textList} onChange={(e) => setTextList(e.target.value)}></textarea>
          </div>
          <div className="text-center">
            <Link href={'/d/' + encodeList(textList)}>Generate decklist page</Link>
          </div>
        </div>
      </main>
    </>
  );
}
