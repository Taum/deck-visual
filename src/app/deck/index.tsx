
import Image from "next/image";
import { Decklist, CardStack } from '../../lib/decklist'
import { Card, Faction } from '../../lib/models'
import clsx from 'clsx';

export interface DeckProps {
  deckList: Decklist
}

function colorForFaction(faction: Faction): string {
  switch (faction) {
    case Faction.Axiom: return "amber"
    case Faction.Bravos: return "red"
    case Faction.Lyra: return "pink"
    case Faction.Muna: return "lime"
    case Faction.Ordis: return "sky"
    case Faction.Yzmir: return "purple"
    case Faction.Neutral: return "grey"
  }
}

export default function DeckView(props: DeckProps) {
  const { deckList } = props
  const baseColor = colorForFaction(deckList.faction)
  return (
    <div className={clsx(`bg-${baseColor}-100`)}>
      <DeckHeaderView deckList={deckList} />
      <div className="grid grid-cols-5 gap-4 p-4">
        {props.deckList.cardStacks().map((stack, index) => {
            return <CardStackView key={index} stack={stack} />
          })}
      </div>
    </div>
  )
}

export interface DeckHeaderProps {
  deckList: Decklist
}

export function DeckHeaderView(props: DeckHeaderProps) {
  const hero = props.deckList.hero
  const heroThumb = hero.assets.HERO_THUMB?.at(0)
  const baseColor = colorForFaction(props.deckList.faction)
  if (!heroThumb) { return null }
  return (
    <div className={clsx(`bg-${baseColor}-800 text-${baseColor}-50`, "flex flex-row")}>
      <Image className="h-48 clip-heroThumb" src={heroThumb} alt={hero.name.en} width={540} height={192} />
      <div className="flex flex-col py-2 px-1">
        <h1 className="font-title font-extrabold text-5xl">Big Bang Boosts</h1>
        <h2 className="font-title font-extrabold text-xl">{hero.name.en}</h2>
      </div>
    </div>
  )
}


export interface CardStackProps {
  stack: CardStack
}
export function CardStackView(props: CardStackProps) {
  const { stack } = props
  let lastIndex = stack.length - 1
  return (
    <div className="">
      {stack.cards.map((card, index) => {
          return (
            <CardView key={index} card={card} trimmed={index < lastIndex} zIndex={index} />
          )
        }
      )}
    </div>
  )
}

export interface CardProps {
  card: Card
  trimmed: boolean
  zIndex: number
}

export function CardView(props: CardProps) {
  const { card, trimmed } = props
  // <Image className="rounded-card" alt={card.name.en} src={card.imagePath.en} width={1200} height={1200} />
  return (
    <div
      className={clsx("rounded-card shadow-card relative", trimmed && "max-h-trimmed")}
      style={{zIndex: props.zIndex}}
      >
      <Image className="rounded-card" alt={card.name.en} src={card.imagePath.en} width={1200} height={1200} />
    </div>
  )
}