export type DocumentType = 'pil' | 'obal' | 'spc' | 'nr' | 'par';
export type ListType = 'dlpo' | 'scau' | 'scup' | 'sneh' | 'splp' | 'vpois' | 'doprovodne_informace';

/**
 * Enum for dependency/addiction types (ZAV)
 * Contains the code and the readable name
 */
export enum ZavType {
  CATEGORY_2_AUXILIARY = 'Pomocné látky zařazené do kategorie 2 (příloha I k Nařízení Evropského parlamentu a Rady (ES) č. 273/2004)',
  CATEGORY_3_AUXILIARY = 'Pomocné látky zařazené do kategorie 3 (příloha I k Nařízení Evropského parlamentu a Rady (ES) č. 273/2004)',
  EPHEDRINE_PSEUDOEPHEDRINE = 'Přípravky obsahující efedrin nebo více než 30 mg pseudoefedrinu',
  CATEGORY_1_PRECURSORS = 'Prekursory - látky zařazené do kategorie 1 (příloha I k Nařízení Evropského parlamentu a Rady (ES) č. 273/2004)',
  PSYCHOACTIVE_SUBSTANCES = 'Zařazené psychoaktivní látky (Nařízení vlády č. 11/2025 Sb.)',
  NARCOTIC_LIST_1 = 'Omamné látky zařazené do seznamu č. 1 (příloha č. 1 k Nařízení vlády č. 463/2013 Sb.) - recept s modrým pruhem',
  NARCOTIC_LIST_2 = 'Omamné látky zařazené do seznamu č. 2 (příloha č. 2 k Nařízení vlády č. 463/2013 Sb.)',
  NARCOTIC_LIST_3 = 'Omamné látky zařazené do seznamu č. 3 (příloha č. 3 k Nařízení vlády č. 463/2013 Sb.)',
  PSYCHOTROPIC_LIST_4 = 'Psychotropní látky zařazené do seznamu č. 4 (příloha č. 4 k Nařízení vlády č. 463/2013 Sb.)',
  PSYCHOTROPIC_LIST_5 = 'Psychotropní látky zařazené do seznamu č. 5 (příloha č. 5 k Nařízení vlády č. 463/2013 Sb.) - recept s modrým pruhem',
  PSYCHOTROPIC_LIST_6 = 'Psychotropní látky zařazené do seznamu č. 6 (příloha č. 6 k Nařízení vlády č. 463/2013 Sb.)',
  PSYCHOTROPIC_LIST_7 = 'Psychotropní látky zařazené do seznamu č. 7 (příloha č. 7 k Nařízení vlády č. 463/2013 Sb.)',
  SELECTED_PREPARATIONS_LIST_8 = 'Vybrané přípravky zařazené do seznamu č. 8 (příloha č. 8 k Nařízení vlády č. 463/2013 Sb.)'
}

/**
 * Mapping of zav codes to ZavType enum keys
 */
export const zavCodeMap: Record<string, keyof typeof ZavType> = {
  'A': 'CATEGORY_2_AUXILIARY',
  'B': 'CATEGORY_3_AUXILIARY',
  'E': 'EPHEDRINE_PSEUDOEPHEDRINE',
  'P': 'CATEGORY_1_PRECURSORS',
  'Z': 'PSYCHOACTIVE_SUBSTANCES',
  '1': 'NARCOTIC_LIST_1',
  '2': 'NARCOTIC_LIST_2',
  '3': 'NARCOTIC_LIST_3',
  '4': 'PSYCHOTROPIC_LIST_4',
  '5': 'PSYCHOTROPIC_LIST_5',
  '6': 'PSYCHOTROPIC_LIST_6',
  '7': 'PSYCHOTROPIC_LIST_7',
  '8': 'SELECTED_PREPARATIONS_LIST_8'
};

/**
 * Enum for dispensing types (VYDEJ)
 * Contains the code and the readable name
 */
export enum VydejType {
  // Výdej na lékařský předpis s omezením (omezení podle § 39 odst. 4 písm. c) ZoL)
  PRESCRIPTION_RESTRICTED_C = 'Výdej na lékařský předpis s omezením (§ 39 odst. 4 písm. c)',
  
  // Volně prodejné léčivé přípravky
  OVER_THE_COUNTER = 'Volně prodejný léčivý přípravek',
  
  // Výdej na lékařský předpis s omezením (omezení podle § 39 odst. 4 písm. a) ZoL)
  PRESCRIPTION_RESTRICTED_L = 'Výdej na lékařský předpis s omezením (§ 39 odst. 4 písm. a)',
  
  // Bez lékařského předpisu s omezením
  WITHOUT_PRESCRIPTION_RESTRICTED = 'Bez lékařského předpisu s omezením',
  
  // Bez lékařského předpisu s omezením (RLPO)
  WITHOUT_PRESCRIPTION_RESTRICTED_RLPO = 'Bez lékařského předpisu s omezením (RLPO)',
  
  // Na lékařský předpis
  PRESCRIPTION = 'Na lékařský předpis',
  
  // Vyhrazená léčiva
  RESERVED = 'Vyhrazené léčivo'
}

/**
 * Mapping of vydej codes to VydejType enum keys
 */
export const vydejCodeMap: Record<string, keyof typeof VydejType> = {
  'C': 'PRESCRIPTION_RESTRICTED_C',
  'F': 'OVER_THE_COUNTER',
  'L': 'PRESCRIPTION_RESTRICTED_L',
  'O': 'WITHOUT_PRESCRIPTION_RESTRICTED',
  'P': 'WITHOUT_PRESCRIPTION_RESTRICTED_RLPO',
  'R': 'PRESCRIPTION',
  'V': 'RESERVED'
};

/**
 * Enum for drug types (TYP_LP)
 */
export enum DrugType {
  ATMP_GENE_THERAPY = 'ATMP - Genová terapie',
  ATMP_GENE_THERAPY_WITH_CELLS = 'ATMP - Genová terapie (s buňkami/tkáněmi)',
  ATMP_GENE_THERAPY_WITH_CELLS_GMO = 'ATMP - Genová terapie (s buňkami/tkáněmi) obsahující GMO',
  ATMP_GENE_THERAPY_GMO = 'ATMP - Genová terapie obsahující GMO',
  ATMP_SOMATIC_CELL_THERAPY = 'ATMP - Somato-buněčná terapie',
  ATMP_SOMATIC_CELL_THERAPY_GMO = 'ATMP - Somato-buněčná terapie obsahující GMO',
  ATMP_TISSUE_ENGINEERING = 'ATMP - Tkáňové inženýrství',
  ATMP_TISSUE_ENGINEERING_GMO = 'ATMP - Tkáňové inženýrství obsahující GMO',
  BIOLOGICAL_OTHER = 'Biologické léčivé přípravky - ostatní',
  BIOTECHNOLOGICAL = 'Biotechnologické léčivé přípravky',
  CHEMICAL = 'Chemické léčivé přípravky',
  GENE_THERAPY = 'genová terapie',
  GENE_THERAPY_WITH_CELLS = 'genová terapie (s buňkami/tkáněmi)',
  GENE_THERAPY_WITH_CELLS_GMO = 'genová terapie (s buňkami/tkáněmi) obsahující GMO',
  GENE_THERAPY_GMO = 'genová terapie obsahující GMO',
  HERBAL = 'Rostlinné léčivé přípravky',
  HOMEOPATHIC = 'Homeopatické léčivé přípravky',
  IMMUNOLOGICAL = 'Imunologické léčivé přípravky',
  IMMUNOLOGICAL_BIOLOGICAL = 'Imunologické léčivé přípravky/Biologické léčivé přípravky',
  IMMUNOLOGICAL_BIOTECHNOLOGICAL = 'Imunologické léčivé přípravky/Biotechnologické léčivé přípravky',
  IMMUNOLOGICAL_CHEMICAL = 'Imunologické léčivé přípravky/Chemické léčivé přípravky',
  IMMUNOLOGICAL_GMO = 'Imunologické léčivé přípravky obsahující GMO',
  IMMUNOLOGICAL_GMO_BIOTECHNOLOGICAL = 'Imunologické léčivé přípravky obsahující GMO/Biotechnologické léčivé přípravky',
  BLOOD_DERIVATIVE_ALBUMIN = 'krevní derivát - albumin',
  BLOOD_DERIVATIVE_IMMUNOGLOBULIN = 'krevní derivát - imunoglobulin (iv/im/sc)',
  BLOOD_DERIVATIVE_COAGULATION_FACTOR = 'krevní derivát - koagulační faktor',
  BLOOD_DERIVATIVE_COAGULATION_INHIBITOR = 'krevní derivát - koagulační inhibitor',
  BLOOD_DERIVATIVE_FIBRIN_GLUE = 'krevní derivát - fibrinové lepidlo',
  BLOOD_DERIVATIVE_OTHER = 'krevní derivát - ostatní',
  BLOOD_DERIVATIVE_ALBUMIN_ALT = 'Krevní derivát-albumin',
  BLOOD_DERIVATIVE_IMMUNOGLOBULIN_ALT = 'Krevní derivát-immunoglobulin (iv/im/sc)',
  BLOOD_DERIVATIVE_COAGULATION_FACTOR_ALT = 'Krevní derivát-koagulační faktor',
  BLOOD_DERIVATIVE_COAGULATION_INHIBITOR_ALT = 'Krevní derivát-koagulační inhibitor',
  BLOOD_DERIVATIVE_FIBRIN_GLUE_ALT = 'Krevní derivát-fibrinové lepidlo',
  BLOOD_DERIVATIVE_OTHER_ALT = 'Krevní derivát-ostatní',
  GMO = 'LP obsahující GMO',
  RADIOPHARMACEUTICALS = 'Radiofarmaka',
  SOMATIC_CELL_THERAPY = 'somato-buněčná terapie',
  SOMATIC_CELL_THERAPY_GMO = 'somato-buněčná terapie obsahující GMO',
  TISSUE_ENGINEERING = 'tkáňové inženýrství',
  TISSUE_ENGINEERING_GMO = 'tkáňové inženýrství obsahující GMO',
  TRADITIONAL_HERBAL = 'Tradiční rostlinné léčivé přípravky'
}

/**
 * Mapping of typ_lp codes to DrugType enum keys
 */
export const drugTypeCodeMap: Record<string, keyof typeof DrugType> = {
  'AD/G': 'ATMP_GENE_THERAPY',
  'AD/GC': 'ATMP_GENE_THERAPY_WITH_CELLS',
  'AD/GCM': 'ATMP_GENE_THERAPY_WITH_CELLS_GMO',
  'AD/GM': 'ATMP_GENE_THERAPY_GMO',
  'AD/S': 'ATMP_SOMATIC_CELL_THERAPY',
  'AD/SM': 'ATMP_SOMATIC_CELL_THERAPY_GMO',
  'AD/T': 'ATMP_TISSUE_ENGINEERING',
  'AD/TM': 'ATMP_TISSUE_ENGINEERING_GMO',
  'BI': 'BIOLOGICAL_OTHER',
  'BT': 'BIOTECHNOLOGICAL',
  'CH': 'CHEMICAL',
  'G': 'GENE_THERAPY',
  'GB': 'GENE_THERAPY_WITH_CELLS',
  'GBM': 'GENE_THERAPY_WITH_CELLS_GMO',
  'GM': 'GENE_THERAPY_GMO',
  'HE': 'HERBAL',
  'HO': 'HOMEOPATHIC',
  'IM': 'IMMUNOLOGICAL',
  'IM/BI': 'IMMUNOLOGICAL_BIOLOGICAL',
  'IM/BT': 'IMMUNOLOGICAL_BIOTECHNOLOGICAL',
  'IM/CH': 'IMMUNOLOGICAL_CHEMICAL',
  'IM/M': 'IMMUNOLOGICAL_GMO',
  'IM/M/BT': 'IMMUNOLOGICAL_GMO_BIOTECHNOLOGICAL',
  'KA': 'BLOOD_DERIVATIVE_ALBUMIN',
  'KB': 'BLOOD_DERIVATIVE_IMMUNOGLOBULIN',
  'KF': 'BLOOD_DERIVATIVE_COAGULATION_FACTOR',
  'KI': 'BLOOD_DERIVATIVE_COAGULATION_INHIBITOR',
  'KL': 'BLOOD_DERIVATIVE_FIBRIN_GLUE',
  'KO': 'BLOOD_DERIVATIVE_OTHER',
  'KR/A': 'BLOOD_DERIVATIVE_ALBUMIN_ALT',
  'KR/B': 'BLOOD_DERIVATIVE_IMMUNOGLOBULIN_ALT',
  'KR/F': 'BLOOD_DERIVATIVE_COAGULATION_FACTOR_ALT',
  'KR/I': 'BLOOD_DERIVATIVE_COAGULATION_INHIBITOR_ALT',
  'KR/L': 'BLOOD_DERIVATIVE_FIBRIN_GLUE_ALT',
  'KR/O': 'BLOOD_DERIVATIVE_OTHER_ALT',
  'M': 'GMO',
  'RA': 'RADIOPHARMACEUTICALS',
  'S': 'SOMATIC_CELL_THERAPY',
  'SM': 'SOMATIC_CELL_THERAPY_GMO',
  'T': 'TISSUE_ENGINEERING',
  'TM': 'TISSUE_ENGINEERING_GMO',
  'TR': 'TRADITIONAL_HERBAL'
};

/**
 * Generic interface for paginated results
 */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Represents a variant of a drug (different strength, package size, etc.)
 */
export interface DrugVariant {
  /** Kód léčivého přípravku přidělený SÚKL */
  id: string;
  
  /** Název léčivého přípravku nebo PZLÚ */
  name: string;
  
  /** Síla léčivého přípravku - obsah léčivých látek vyjádřený kvantitativně */
  strength: string;
  
  /** Léková forma (čitelný název) */
  forma: string;
  
  /** Velikost balení */
  package: string;
  
  /** Cesta podání */
  route: string;
  
  /** Vnitřní obal LP, který je v bezprostředním kontaktu s LP */
  container: string;
  
  /** Držitel rozhodnutí o registraci */
  holder: string;
  
  /** Registrační číslo */
  registration_number?: string;
  
  /** Seznam léčivých látek v čitelném formátu */
  ll: string[];
  
  /** Typ výdeje léčiva (čitelný název) */
  vydej: string;
  
  /** Typ léčivého přípravku (čitelný název) */
  typ_lp?: string;
}

export interface EMAMedicineSearchResult {
  name: string;
  id: string;
  score: number;
  data: EMAMedicineDetails;
}

export interface EMAMedicineDetails {
  product_name: string;
  active_substance: string;
  route_of_administration: string;
  country: string;
  marketing_authorisation_holder: string;
  psmf_country: string;
  atc_code: string;
  pharmacotherapeutic_group: string;
  url: string;
  [key: string]: any;
}

/**
 * Detailed information about a drug from the SÚKL database
 */
export interface DrugDetails {
  /** Kód léčivého přípravku přidělený SÚKL */
  kod_sukl: string;
  
  /** Označení LP, který podléhá povinnému hlášení */
  h: string;
  
  /** Název léčivého přípravku nebo PZLÚ */
  nazev: string;
  
  /** Síla léčivého přípravku - obsah léčivých látek vyjádřený kvantitativně */
  sila: string;
  
  /** Léková forma (čitelný název) */
  forma: string;
  
  /** Velikost balení */
  baleni: string;
  
  /** Cesta podání */
  cesta_podani: string;
  
  /** Doplněk názvu LP, který jednoznačně určuje variantu LP */
  doplnek: string;
  
  /** Vnitřní obal LP, který je v bezprostředním kontaktu s LP */
  obal: string;
  
  /** Držitel rozhodnutí o registraci */
  drzitel: string;
  
  /** Země sídla držitele rozhodnutí o registraci */
  zeme_drzitele: string;
  
  /** Aktuální držitel registračního rozhodnutí (uvádí se jen u registrací B) */
  akt_drz: string;
  
  /** Země aktuálního držitele rozhodnutí o registraci */
  akt_zem: string;
  
  /** Stav registrace */
  reg: string;
  
  /** Platnost registrace do (uvádí se jen u registrací B, C, Y, F) */
  v_platdo: string;
  
  /** Neomezená platnost registrace (X = neomezená platnost) */
  neomez: string;
  
  /** Uvádění na trh do (uvádí se jen u registrací B, C, Y) */
  uvadenido: string;
  
  /** Indikační skupina */
  is_: string;
  
  /** Anatomicko-terapeuticko-chemická skupina (WHO Index) */
  atc_who: string;
  
  /** Registrační číslo */
  registracni_cislo: string;
  
  /** Identifikační číslo souběžného dovozu (zpravidla ve tvaru PI/xxx/yyyy) */
  sdov: string;
  
  /** Zkratka dovozce u souběžného dovozu */
  sdov_dod: string;
  
  /** Země dovozce u souběžného dovozu */
  sdov_zem: string;
  
  /** Registrační procedura */
  reg_proc: string;
  
  /** Množství léčivé látky v definované denní dávce (DDD) */
  dddamnt_who: string;
  
  /** Jednotka množství léčivé látky v DDD */
  dddun_who: string;
  
  /** Počet DDD v balení (na 4 desetinná místa) */
  dddp_who: string;
  
  /** WHO Index */
  zdroj_who: string;
  
  /** Seznam léčivých látek v čitelném formátu */
  ll: string[];
  
  /** Klasifikace typu výdeje léčivého přípravku (čitelný název) */
  vydej: string;
  
  /** Závislost - skupina omamných nebo psychotropních látek (návykové látky) */
  zav: string;
  
  /** Doping */
  doping: string;
  
  /** Označení látky s anabolickým a jiným hormonálním účinkem podle nařízení vlády 454/2009 Sb. */
  narvla: string;
  
  /** Přípravek byl dodáván do lékáren a zdravotnických zařízení v posledních 6 měsících */
  dodavky: string;
  
  /** EAN kód (pole je prázdné, údaje již nejsou k dispozici) */
  ean: string;
  
  /** Braillovo písmo: schváleno (S), výjimka (V), nežádáno (mezera) */
  braillovo_pismo: string;
  
  /** Expirace */
  exp: string;
  
  /** Expirace typ: hodiny (H), dny (D), týdny (W), měsíce (M) */
  exp_t: string;
  
  /** Registrovaný název léčivého přípravku nebo PZLÚ */
  nazev_reg: string;
  
  /** MRP Číslo */
  mrp_cislo: string;
  
  /** Právní základ registrace */
  pravni_zaklad_registrace: string;
  
  /** Ochranný prvek, hodnota A - léčivý přípravek musí mít ochranný prvek */
  ochranny_prvek: string;
  
  /** Omezení používání dle SmPC, hodnota A - léčivý přípravek má omezení používání */
  omezeni_preskripce_smp: string;
  
  /** Typ léčivého přípravku (čitelný název) */
  typ_lp: string;
  
  /** Pro případné další pole, která mohou být v CSV souboru */
  [key: string]: any;
}



/**
 * Extracted data structure from PDF
 * This is what gets stored in PDFCache.extractedData
 * Contains only the fields that are extracted from PDF documents
 */
export interface ExtractedPDFData {
  // ===================================
  // BASIC PRODUCT INFO (from PDF header)
  // ===================================

  nameOfMedicalProduct?: string;
  
    /** 2. Qualitative and quantitative composition */
  qualitativeAndQuantitativeComposition?: string;

  /** Pharmaceutical form (e.g., "Solution for injection", "Film-coated tablet") */
  pharmaceuticalForm?: string;
  
  /** Section 4.1 - Therapeutic indications */
  therapeuticIndications?: string;
  
  /** Section 4.2 - Posology and method of administration */
  posologyAndAdministration?: string;
  
  /** Section 4.3 - Contraindications */
  contraindications?: string;
  
  /** Section 4.4 - Special warnings and precautions for use */
  specialWarnings?: string;
  
  /** Section 4.5 - Interaction with other medicinal products and other forms of interaction */
  interactions?: string;

  /** Section 4.6 - Fertility, pregnancy and lactation */
  fertilityPregnancyLactation?: string;
  
  /** Section 4.7 - Effects on ability to drive and use machines */
  effectsOnDriving?: string;

  /** Section 4.8 - Undesirable effects (adverse reactions) */
  adverseReactions?: string;
  
  /** Section 4.9 - Overdose */
  overdose?: string;
  
  /** Section 5.1 - Pharmacodynamic properties */
  pharmacologicalProperties?: string;
  
  /** Section 5.2 - Pharmacokinetic properties */
  pharmacokinetics?: string;
  
  /** Section 5.3 - Preclinical safety data */
  preclinicalData?: string;
  }
