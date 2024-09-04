export interface LocalizedString {
  en: string
  fr: string
}

export interface CardRef {
  id: string
}
export interface CardRefQty {
  card: CardRef
  quantity: number
}

export interface Card {
  id: string
  name: LocalizedString
  imagePath: LocalizedString
  collectorNumberFormatted: LocalizedString
  mainFaction: Faction
  elements: CardElements
  assets: CardAssets
  rarity: "COMMON" | "RARE" | "UNIQUE"
  type: "SPELL" | "CHARACTER" | "PERMANENT" | "HERO" | "TOKEN"
}

export enum Faction {
  Axiom = "AX",
  Bravos = "BR",
  Lyra = "LY",
  Muna = "MU",
  Ordis = "OR",
  Yzmir = "YZ",
  Neutral = "NE",
} 

export interface CardElements {
  MAIN_COST: string | null
  RECALL_COST: string | null
  MOUNTAIN_POWER: string | null
  OCEAN_POWER: string | null
  FOREST_POWER: string | null
  MAIN_EFFECT?: LocalizedString
  ECHO_EFFECT?: LocalizedString
  PERMANENT?: number
  RESERVE?: number
}

export interface CardAssets {
  WEB: Array<string>
  HERO_THUMB?: Array<string>
}