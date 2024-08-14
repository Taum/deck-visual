import { Card } from "./models"
import CardsCore from "./cards_core.json"

interface CardsDB {
  readonly [key: string]: Card;
}
const typedCardDB = CardsCore as unknown as CardsDB

export interface CardQty {
  card: Card
  quantity: number
}

export class Decklist {
  cards: Array<CardQty>;

  constructor(cards: Array<CardQty>) {
    this.cards = cards
  }

  groupedByName(): Array<Array<CardQty>> {
    let groups: Array<Array<CardQty>> = []
    for (let cardQty of this.cards) {
      let existingGroup = groups.find((g) => cardQty.card.name.en == g[0].card.name.en)
      if (existingGroup) {
        existingGroup.push(cardQty)
      } else {
        groups.push([cardQty])
      }
    }
    return groups
  }
}

export function hydrateDecklist(decklist: string): Decklist {

  let cards: Array<CardQty> = []

  let lines = decklist.split("\n")
  for (let line of lines) {
    let match = line.trim().match(/^(\d+) (\w+)$/)
    if (match) {
      const quantity = Number(match[1])
      const cardId = fixCardId(match[2])
      const card = typedCardDB[cardId]
      if (quantity && card) {
        cards.push({ quantity, card })
      }
    }
  }

  return new Decklist(cards)
}

function fixCardId(id: string) {
  // We don't have Promos in the DB, so replace them with regular versions
  let ret = id
  ret = ret.replace(/ALT_CORE_P_/, "ALT_CORE_B_")
  return ret
}