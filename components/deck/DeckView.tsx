
import Image from "next/image";
import { Decklist, CardStack } from '../../lib/decklist'
import { Rarity, Card, Faction } from '../../lib/models'
import clsx from 'clsx';

import { Montserrat } from 'next/font/google'
import { Nerko_One } from "next/font/google";

const montserrat = Montserrat({
  weight: ['400', '600'],
  subsets: ['latin'],
})
const titleFont = Nerko_One({
  weight: '400',
  subsets: ['latin'],
})

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

class DeckStats {
  public characters: number = 0
  public spells: number = 0
  public permanents: number = 0

  public commons: number = 0
  public rares: number = 0
  public uniques: number = 0
}

function gatherStats(deckList: Decklist): DeckStats {
  let stats = new DeckStats()
  for (let card of deckList.cards) {
    switch (card.card.type) {
      case "CHARACTER":
        stats.characters += card.quantity
        break
      case "SPELL":
        stats.spells += card.quantity
        break
      case "PERMANENT":
        stats.permanents += card.quantity
        break
    }
    switch (card.card.rarity) {
      case "COMMON":
        stats.commons += card.quantity
        break
      case "RARE":
        stats.rares += card.quantity
        break
      case "UNIQUE":
        stats.uniques += card.quantity
        break
    }
  }
  return stats
}

export function DeckHeaderView(props: DeckHeaderProps) {
  const hero = props.deckList.hero
  const heroThumb = hero.assets.HERO_THUMB?.at(0)
  const bannerImage = `/asset/banner_${props.deckList.faction}.png`
  const baseColor = colorForFaction(props.deckList.faction)
  const stats = gatherStats(props.deckList)

  if (!heroThumb) { return null }

  const cardTypesStats = []
  if (stats.characters > 0) {
    cardTypesStats.push(`${stats.characters} Characters`)
  }
  if (stats.spells > 0) {
    cardTypesStats.push(`${stats.spells} Spells`)
  }
  if (stats.permanents > 0) {
    cardTypesStats.push(`${stats.permanents} Permanents`)
  }

  return (
    <div className={clsx(`bg-${baseColor}-800 text-${baseColor}-50`, "flex flex-row h-36")}>
      <Image className="grow-0 shrink-0 h-32 clip-heroThumb aspect-headerthumb" src={heroThumb} alt={hero.name.en} width={640} height={288} style={{ width: 'auto', height: 'auto' }} quality={90} />
      <div className="grow flex flex-col justify-between">
        <div className="flex flex-row justify-between self-stretch">
          <div className="m-4">
            <h2 className={clsx(titleFont.className, "text-6xl")}>{hero.name.en}</h2>
          </div>
          <div className="relative mr-6" style={{top: '-0.5rem', marginBottom: '-2rem'}}>
            <Image src={bannerImage} alt={hero.mainFaction} width={60} height={120} quality={90}
             style={{ width: 'auto', height: '7rem' }} />
          </div>
        </div>
        <div className={clsx(montserrat.className, "self-stretch flex flex-row items-baseline justify-between mr-4 mb-1")}>
          <div className="ml-4">
            {cardTypesStats.join(" \u00a0 / \u00a0 ")}
          </div>
          <div className="flex flex-row items-baseline font-semibold">
            {stats.commons > 0 && <RarityGem rarity={Rarity.COMMON} count={stats.commons} />}
            {stats.rares > 0 && <RarityGem rarity={Rarity.RARE} count={stats.rares} />}
            {stats.uniques > 0 && <RarityGem rarity={Rarity.UNIQUE} count={stats.uniques} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface RarityGemProps {
  count: number
  rarity: Rarity
}
function RarityGem({count, rarity}: RarityGemProps) {
  let image: string
  let altText: string
  switch (rarity) {
    case Rarity.COMMON: image = "/asset/gem_c.png"; altText = "Commons"; break;
    case Rarity.RARE: image = "/asset/gem_r.png"; altText = "Rares"; break;
    case Rarity.UNIQUE: image = "/asset/gem_u.png"; altText = "Uniques"; break;
  }
  return (
    <div className="flex flex-col text-center m-1">
      <div className="text-center" style={{marginBottom: rarity == Rarity.COMMON ? '-0.32rem' : '-0.15rem'}}>{count}</div>
      <Image src={image} width={25} height={20} alt={altText} />
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
      style={{ zIndex: props.zIndex }}
    >
      <Image className="rounded-card" alt={card.name.en} src={card.imagePath.en} width={1200} height={1200} quality={90} />
    </div>
  )
}