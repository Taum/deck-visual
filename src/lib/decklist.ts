import { Card } from "./models"
import CardsCore from "./cards_core.json"

interface CardsDB {
  readonly [key: string]: Card;
}
const typedCards = CardsCore as unknown as CardsDB

export class Decklist {
  cards: Array<{ card: Card, quantity: number }>;

  constructor(cards: Array<{ card: Card, quantity: number }>) {
    this.cards = cards
  }
}

export function hydrateDecklist(decklist: string): Decklist {

  let cards: Array<{ card: Card, quantity: number }> = []

  let lines = decklist.split("\n")
  for (let line of lines) {
    let match = line.trim().match(/^(\d+) (\w+)$/)
    if (match) {
      const quantity = Number(match[1])
      const card = typedCards[match[2]]
      if (quantity && card) {
        cards.push({ quantity, card })
      }
    }
  }

  return new Decklist(cards)
}