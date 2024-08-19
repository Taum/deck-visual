import { Card, CardRef, CardRefQty, Faction } from './models';
import { BufferedWritable, BitstreamElement, BitstreamReader, BitstreamWriter, Field, ReservedLow } from '@astronautlabs/bitstream';
import { Ref } from 'react';
import "reflect-metadata";

export enum RefFaction {
  // 0 = invalid
  Axiom = "AX",  // 1
  Bravos = "BR", // 2
  Lyra = "LY",   // 3
  Muna = "MU",   // 4
  Ordis = "OR",  // 5
  Yzmir = "YZ",  // 6
  Neutral = "NE",// 7
} 

enum RefRarity {
  Common = "C",   // 0
  Rare = "R1",    // 1
  RareOOF = "R2", // 2
  Unique = "U",   // 3
}

enum RefSetCode {
  // 0 = invalid
  Core = "CORE",     // 1
  CoreKS = "COREKS", // 2
}

class CardRefElements {
  set_code: RefSetCode
  b_p: number
  faction: RefFaction
  num_in_faction: number
  rarity: RefRarity
  uniq_num?: number

  constructor(id: string) {
    const match = id.match(/^ALT_(\w+)_(B|P)_(\w{2})_(\d{2})_(C|R1|R2|U_(\d+))$/)
    if (!match) { throw "unrecognized card id" }

    this.set_code = (match[1] as RefSetCode)
    this.b_p = match[2] == "B" ? 0 : 1
    this.faction = (match[3] as RefFaction)
    this.num_in_faction = parseInt(match[4], 10)
    this.rarity = (match[5] as RefRarity)
    this.uniq_num = (match[6] ? parseInt(match[6]) : undefined)
  }

  get factionId(): number {
    switch (this.faction) {
      case RefFaction.Axiom: return 1;
      case RefFaction.Bravos: return 2;
      case RefFaction.Lyra: return 3;
      case RefFaction.Muna: return 4;
      case RefFaction.Ordis: return 5;
      case RefFaction.Yzmir: return 6;
      case RefFaction.Neutral: return 7;
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
      case RefSetCode.Core: return 1;
      case RefSetCode.CoreKS: return 2;
    }
    throw `Unrecognized SetCode ${this.rarity}`
  }
}

class EncodableCard extends BitstreamElement {
  @Field(3) faction: number;
  @Field(5) num_in_faction: number;
  @Field(2) rarity: number;

  set_code: number;

  onParseFinished(): void {
    this.set_code = (this.parent.parent as EncodableSetGroup).set_code
  }
  // @Field({ initializer: (instance, parent) => instance.set_code = parent.set_code })
  //   set_code: number;
  // // @Field(16, { presentWhen: i => i.rarity == 3 }) unique_num?: number;

  get asCardId(): CardRef {
    let id = "ALT_"
    switch (this.set_code) {
      case 1: id += RefSetCode.Core; break;
      case 2: id += RefSetCode.CoreKS; break;
    }
    id += "_B_"
    switch (this.faction) {
      case 1: id += Faction.Axiom; break;
      case 2: id += Faction.Bravos; break;
      case 3: id += Faction.Lyra; break;
      case 4: id += Faction.Muna; break;
      case 5: id += Faction.Ordis; break;
      case 6: id += Faction.Yzmir; break;
      case 7: id += Faction.Neutral; break;
    }
    id += "_"
    if (this.num_in_faction < 10) {
      id += "0"
    }
    id += this.num_in_faction
    id += "_"
    switch (this.rarity) {
      case 0: id += RefRarity.Common; break;
      case 1: id += RefRarity.Rare; break;
      case 2: id += RefRarity.RareOOF; break;
      case 3: id += RefRarity.Unique; break;
    }
    return { id }
  }

  static fromRef(ref: CardRef): EncodableCard {
    let ec = new EncodableCard()
    let refEls = new CardRefElements(ref.id)
    ec.faction = refEls.factionId
    ec.num_in_faction = refEls.num_in_faction
    ec.rarity = refEls.rarityId
    //ec.unique_num = refEls.uniq_num
    return ec
  }
}

class EncodableCardQty extends BitstreamElement {
  @Field(2) quantity: number;
  // @Field(6, { presentWhen: i => i.quantity == 0 }) extended_quantity?: number;
  @Field() card: EncodableCard;
  
  static from(quantity: number, card: CardRef): EncodableCardQty {
    let ecq = new EncodableCardQty()
    ecq.quantity = quantity
    //ecq.extended_quantity = quantity
    ecq.card = EncodableCard.fromRef(card)
    return ecq
  }

  get asCardRefQty(): CardRefQty {
    return { quantity: this.quantity, card: this.card!.asCardId }
  }
}

class EncodableSetGroup extends BitstreamElement {
  @Field(7) set_code: number;
  @Field(1) has_more_groups: boolean;
  @Field({ array: { type: EncodableCardQty, countFieldLength: 6 }}) cardQty: Array<EncodableCardQty>;

  static from(rqs: CardRefQty[], hasMore: boolean) {
    let esg = new EncodableSetGroup()
    esg.set_code = new CardRefElements(rqs[0].card.id).setId
    esg.cardQty = rqs.map((rq) => EncodableCardQty.from(rq.quantity, rq.card))
    esg.has_more_groups = hasMore
    return esg
  }
}

class EncodableDeck extends BitstreamElement {
  @Field(4) format_version: number;
  @Field({ array: { type: EncodableSetGroup, hasMore: a => a.length > 0 ? a[a.length-1].has_more_groups : true }}) set_groups: Array<EncodableSetGroup>;
  @ReservedLow(i => (8 - (i.measure() % 8))) padding: number;

  static fromList(refQtyList: Array<CardRefQty>): EncodableDeck {
    const groups = EncodableDeck.groupedBySet(refQtyList)
      .map((g, i, a) => EncodableSetGroup.from(g, i < a.length - 1))
    let deck = new EncodableDeck()
    deck.format_version = 1
    deck.set_groups = groups
    return deck
  }

  get asCardRefQty(): Array<CardRefQty> {
    return this.set_groups.reduce((list, groups) => {
      return list.concat(groups.cardQty.map((e_cq) => e_cq.asCardRefQty))
    }, Array<CardRefQty>())
  }

  private static groupedBySet(refQtyList: Array<CardRefQty>): Array<Array<CardRefQty>> {
    let groups = new Map<RefSetCode, Array<CardRefQty>>()
    for (let rq of refQtyList) {
      const code = new CardRefElements(rq.card.id).set_code
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

(globalThis as any).BITSTREAM_TRACE = true

export function encodeList(list: Array<CardRefQty>): string {
  let deck = EncodableDeck.fromList(list)

  const buffer = deck.serialize()

  return Buffer.from(buffer).toString('base64')
}

export function decodeList(encoded: string): string {
  const bytes = Buffer.from(encoded, 'base64');
  console.log("Decoding deck -------------------- ", encoded, bytes)
  
  const deck = EncodableDeck.deserialize(bytes, { allowExhaustion: false })

  const text = deck.asCardRefQty.reduce((str, cq) => str + `${cq.quantity} ${cq.card.id}\n`, "")
  return text
}

// ECMUM0h0o0s1A1FlR1kVolp1w15BRI6tFJONPAA=

/*
1 ALT_CORE_B_BR_03_C
2 ALT_COREKS_B_AX_26_R2
3 ALT_COREKS_B_BR_05_C
3 ALT_CORE_B_BR_08_R1
3 ALT_CORE_B_BR_10_C
3 ALT_CORE_B_BR_11_C
2 ALT_COREKS_B_BR_14_C
3 ALT_COREKS_B_BR_15_C
3 ALT_CORE_B_BR_16_C
3 ALT_CORE_B_BR_17_R1
2 ALT_CORE_B_BR_20_R1
3 ALT_CORE_B_BR_25_C
1 ALT_CORE_B_BR_26_C
2 ALT_CORE_B_BR_26_R1
3 ALT_CORE_B_BR_28_C
3 ALT_CORE_B_BR_30_R1
*/