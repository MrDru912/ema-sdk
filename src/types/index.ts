export type DocumentType = 'pil' | 'obal' | 'spc' | 'nr' | 'par';
export type ListType = 'dlpo' | 'scau' | 'scup' | 'sneh' | 'splp' | 'vpois' | 'doprovodne_informace';

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

export interface EMAMedicineSearchResult {
  name: string;
  id: string;
  score: number;
  data: EMAMedicineDetails;
}

export interface EMAMedicineDetails {
  category: string;
  name_of_medicine: string;
  ema_product_number: string;
  medicine_status: string;
  opinion_status: string;
  latest_procedure_affecting_product_information: string;
  international_non_proprietary_name_inn_common_name: string;
  active_substance: string;
  therapeutic_area_mesh: string;
  species_veterinary: string;
  patient_safety: string;
  atc_code_human: string;
  atcvet_code_veterinary: string;
  pharmacotherapeutic_group_human: string;
  pharmacotherapeutic_group_veterinary: string;
  therapeutic_indication: string;
  accelerated_assessment: string;
  additional_monitoring: string;
  advanced_therapy: string;
  biosimilar: string;
  conditional_approval: string;
  exceptional_circumstances: string;
  generic_or_hybrid: string;
  orphan_medicine: string;
  prime_priority_medicine: string;
  marketing_authorisation_developer_applicant_holder: string;
  european_commission_decision_date: string;
  start_of_rolling_review_date: string;
  start_of_evaluation_date: string;
  opinion_adopted_date: string;
  withdrawal_of_application_date: string;
  marketing_authorisation_date: string;
  refusal_of_marketing_authorisation_date: string;
  withdrawal_expiry_revocation_lapse_of_marketing_authorisation_date: string;
  suspension_of_marketing_authorisation_date: string;
  revision_number: string;
  first_published_date: string;
  last_updated_date: string;
  medicine_url: string;
  nameOfMedicalProduct: string;
  qualitativeAndQuantitativeComposition: string;
  pharmaceuticalForm: string;
  therapeuticIndications: string;
  posologyAndAdministration: string;
  contraindications: string;
  specialWarnings: string;
  interactions: string;
  fertilityPregnancyLactation: string;
  effectsOnDriving: string;
  adverseReactions: string;
  overdose: string;
  pharmacologicalProperties: string;
  pharmacokinetics: string;
  preclinicalData: string;
  _cached: boolean;
  _pdfUrl: string;
  _lastExtracted: string;
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
