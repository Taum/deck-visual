import { Card, CardRefQty, Faction } from "./models"
import CardsCore from "./cards_core.json"

interface CardsDB {
  readonly [key: string]: Card;
}
const typedCardDB = CardsCore as unknown as CardsDB

export class CardQty {
  card: Card
  quantity: number

  constructor(card: Card, quantity: number) {
    this.card = card
    this.quantity = quantity
  }

  get repeatedCards(): Array<Card> {
    return Array(this.quantity).fill(this.card)
  }
}

export class CardStack {
  cards: Array<Card>

  constructor() {
    this.cards = []
  }

  push(newCards: Array<Card>) { 
    this.cards = this.cards.concat(newCards)
  }

  get length(): number { return this.cards.length }
}

export class Decklist {
  cards: Array<CardQty>
  hero: Card
  
  get faction(): Faction { return this.hero.mainFaction } 

  constructor(cards: Array<CardQty>) {
    this.cards = cards.filter((cq) => cq.card.type != "HERO")
    this.hero = cards.find((cq) => cq.card.type == "HERO")!.card
  }

  cardStacks(): Array<CardStack> {
    let groups: Array<CardStack> = []
    for (let cardQty of this.cards) {
      let existingStack = groups.find((g) => cardQty.card.name.en == g.cards[0].name.en)
      if (existingStack) {
        existingStack.push(cardQty.repeatedCards)
      } else {
        const newStack = new CardStack()
        newStack.push(cardQty.repeatedCards)
        groups.push(newStack)
      }
    }
    return groups
  }

  get referenceList(): Array<CardRefQty> {
    let ret = [{card: {id: this.hero.id}, quantity: 1}]
    return ret.concat(this.cards.map((cq) => ({card: {id: cq.card.id}, quantity: cq.quantity})))
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
        cards.push(new CardQty(card, quantity))
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