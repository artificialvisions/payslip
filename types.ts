
export enum EmployeeType {
  HUMAN = 'HUMAN',
  CYBORG = 'CYBORG',
}

export interface CompanyDetails {
  name: string;
  address: string;
  fiscalCode: string;
  paymentDateDay: number; 
}

export interface BaseEmployee {
  id: string;
  matricola: string;
  name: string;
  qualifica: string;
  type: EmployeeType;
}

export interface CompetenzaItem {
  description: string;
  amount: number;
}

export interface TrattenutaItem {
  description: string;
  amount: number;
  isSubTotal?: boolean;
}

export interface BenefitItem {
  description: string;
  amount?: number;
  details?: string;
}

export interface HumanEmployeeData extends BaseEmployee {
  type: EmployeeType.HUMAN;
  codiceFiscale: string;
  ccnl: string;
  baseOreLavorateStandard: number; 
  baseGiorniLavoroStandard: number; 
  ticketRestaurantPerDay?: number;
  
  competenzeItemsOriginal: CompetenzaItem[];
  totaleCompetenzeOriginal: number;

  trattenuteItemsOriginal: TrattenutaItem[];
  totaleTrattenuteOriginal: number;
  
  benefitsAndRimborsiItemsOriginal: BenefitItem[];
  nettoInBustaOriginal: number;
}

export interface CyborgEmployeeData extends BaseEmployee {
  type: EmployeeType.CYBORG;
  serialNumber: string;
  ccnl: string;
  uptimePercent: number;

  competenzeItemsOriginal: CompetenzaItem[];
  totaleCompetenzeOriginal: number;

  trattenuteItemsOriginal: TrattenutaItem[];
  totaleTrattenuteOriginal: number;

  benefitsTecnologiciOriginal: BenefitItem[];
  nettoInCircuitiOriginal: number;
}

export type EmployeeData = HumanEmployeeData | CyborgEmployeeData;

export interface GeneratedPayslip {
  employeeDetails: EmployeeData; // Contains original structured data for reference
  companyDetails: CompanyDetails;
  period: string; 
  paymentDate: string;
  year: number;
  month: number; // 1-12
  
  giorniLavoroEffettivi: number;
  oreLavorateEffettive: number | string; // string for Cyborg (e.g. "24/7")

  // Calculated/adjusted values for the selected period
  currentCompetenze: CompetenzaItem[];
  currentTotaleCompetenze: number;

  currentTrattenute: TrattenutaItem[];
  currentTotaleTrattenute: number;

  currentBenefitsAndRimborsi: BenefitItem[];
  
  currentNetto: number;
  nettoLabel: string; // "NETTO IN BUSTA" or "NETTO IN CIRCUITI"
}
