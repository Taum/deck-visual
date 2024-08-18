import { Card, CardRef, CardRefQty, Faction } from './models';
import { BufferedWritable, BitstreamElement, BitstreamReader, BitstreamWriter, Field } from '@astronautlabs/bitstream';
import { Ref } from 'react';
import "reflect-metadata";

enum RefRarity {
  Common = "C",   // 0
  Rare = "R1",    // 1
  RareOOF = "R2", // 2
  Unique = "U",   // 3
}

enum SetCode {
  Core = "CORE",
  CoreKS = "COREKS",
}

class CardRefElements {
  ref: CardRef

  set_code: SetCode
  b_p: number
  faction: Faction
  num_in_faction: number
  rarity: RefRarity
  uniq_num?: number

  constructor(ref: CardRef) {
    this.ref = ref

    const match = ref.id.match(/^ALT_(\w+)_(B|P)_(\w{2})_(\d{2})_(C|R1|R2|U_(\d+))$/)
    if (!match) { throw "unrecognized card id" }

    this.set_code = (match[1] as SetCode)
    this.b_p = match[2] == "B" ? 0 : 1
    this.faction = (match[3] as Faction)
    this.num_in_faction = parseInt(match[4])
    this.rarity = (match[5] as RefRarity)
    this.uniq_num = (match[6] ? parseInt(match[6]) : undefined)
  }

  get factionId(): number {
    switch (this.faction) {
      case Faction.Axiom: return 1;
      case Faction.Bravos: return 2;
      case Faction.Lyra: return 3;
      case Faction.Muna: return 4;
      case Faction.Ordis: return 5;
      case Faction.Yzmir: return 6;
      case Faction.Neutral: return 7;
    }
    throw `Unrecognized Faction ${this.faction}`
  }
  get rarityId(): number {
    switch (this.rarity) {
      case RefRarity.Common: return 0;
      case RefRarity.Rare: return 1;
      case RefRarity.RareOOF: return 2;
      case RefRarity.Unique: return 3;
    }
    throw `Unrecognized Rarity ${this.rarity}`
  }
  get setId(): number {
    switch (this.set_code) {
      case SetCode.Core: return 1;
      case SetCode.CoreKS: return 2;
    }
    throw `Unrecognized SetCode ${this.rarity}`
  }
}

class EncodableCard extends BitstreamElement {
  @Field(3) faction: number;
  @Field(5) num_in_faction: number;
  @Field(2) rarity: number;
  @Field(16, { presentWhen: i => i.rarity == 3 }) unique_num: number | undefined;

  refEls: CardRefElements

  constructor(ref: CardRef) {
    super()
    this.refEls = new CardRefElements(ref)
    this.faction = this.refEls.factionId
    this.num_in_faction = this.refEls.num_in_faction
    this.rarity = this.refEls.rarityId
    this.unique_num = this.refEls.uniq_num
  }

  get setId() { return this.refEls.setId }

  get asRefId(): CardRef {
    return { id: "ABC" }
  }
}

class EncodableCardQty extends BitstreamElement {
  @Field(2) quantity: number;
  @Field(6, { presentWhen: i => i.quantity == 0 }) extended_quantity: number;
  @Field() card: EncodableCard;
  constructor(quantity: number, card: EncodableCard | CardRef) {
    super()
    this.quantity = (quantity > 3 ? 0 : quantity)
    this.extended_quantity = quantity
    if (card instanceof EncodableCard) {
      this.card = card
    } else {
      this.card = new EncodableCard(card)
    }
  }

  get asCardRefQty(): CardRefQty {
    return { quantity: this.quantity, card: this.card.asRefId }
  }
}

class EncodableSetGroup extends BitstreamElement {
  @Field(8) set_code: number;
  @Field({ array: { type: EncodableCardQty, countFieldLength: 6 }}) cardQty: Array<EncodableCardQty>;

  constructor(refQty: Array<CardRefQty>) {
    super()
    this.set_code = new EncodableCard(refQty[0].card).setId
    this.cardQty = refQty.map((rq) => new EncodableCardQty(rq.quantity, rq.card))
  }
}

class EncodableDeck extends BitstreamElement {
  @Field(4) format_version: number;
  @Field({ array: { type: EncodableSetGroup }}) set_groups: Array<EncodableSetGroup>;

  constructor(format_version: number, set_groups: Array<EncodableSetGroup>) {
    super()
    this.format_version = format_version
    this.set_groups = set_groups
  }

  static fromList(refQtyList: Array<CardRefQty>): EncodableDeck {
    const groups = EncodableDeck.groupedBySet(refQtyList).map((g) => new EncodableSetGroup(g))
    return new EncodableDeck(1, groups)
  }

  get asCardRefQty(): Array<CardRefQty> {
    return this.set_groups.reduce((list, groups) => {
      return list.concat(groups.cardQty.map((e_cq) => e_cq.asCardRefQty))
    }, Array<CardRefQty>())
  }

  private static groupedBySet(refQtyList: Array<CardRefQty>): Array<Array<CardRefQty>> {
    let groups = new Map<SetCode, Array<CardRefQty>>()
    for (let rq of refQtyList) {
      const code = new CardRefElements(rq.card).set_code
      let g = groups.get(code)
      if (!g) {
        g = []
        groups.set(code, g)
      }
      g.push(rq)
    }
    return Array.from(groups, ([_, v]) => v)
  }
}

export function encodeList(list: Array<CardRefQty>): string {
  let deck = EncodableDeck.fromList(list)

  const buffer = deck.serialize(undefined, undefined, true)

  return Buffer.from(buffer).toString('base64')
}

export function decodeList(encoded: string): Array<CardRefQty> {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  const deck = EncodableDeck.deserialize(bytes)
  return deck.asCardRefQty
}