
import { Decklist } from '../../lib/decklist'

export interface DeckProps {
  deckList: Decklist
}

export default function Deck(props: DeckProps) {
  return (
    <div>
      <ul>
        {props.deckList.cards.map((entry) => {
          return <li>{entry.quantity} {entry.card.name.en}</li>
        })}
      </ul>
    </div>
  )
}