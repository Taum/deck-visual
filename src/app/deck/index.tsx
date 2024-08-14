
import { Decklist } from '../../lib/decklist'
import { Card } from '../../lib/models'
import clsx from 'clsx';

export interface DeckProps {
  deckList: Decklist
}

function repeat<T>(n: number, item: T): Array<T> {
  return Array(n).fill(item)
}

export default function DeckView(props: DeckProps) {
  const { deckList } = props
  return (
    <div className="grid grid-cols-6 gap-4">
      {props.deckList.groupedByName().map((group) => {
          const cards = group.reduce((accum, cardQty) =>
            accum.concat(repeat(cardQty.quantity, cardQty.card))
          , Array<Card>())
          return <CardStackView cards={cards} />
        })}
    </div>
  )
}

export interface CardStackProps {
  cards: Array<Card>
}
export function CardStackView(props: CardStackProps) {
  const { cards } = props
  let lastIndex = cards.length - 1
  return (
    <div className="">
      {cards.map((card, index) => {
          return (
            <div>
              <CardView card={card} trimmed={index < lastIndex} zIndex={index} />
            </div>
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
  return (
    <div
      className={clsx("rounded rounded-lg shadow-card relative", trimmed && "max-h-8")}
      style={{zIndex: props.zIndex}}>
      <img className="rounded rounded-lg" src={card.imagePath.en} />
    </div>
  )
}