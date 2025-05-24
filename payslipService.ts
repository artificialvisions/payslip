
import { EmployeeData, GeneratedPayslip, CompanyDetails, EmployeeType, HumanEmployeeData, CyborgEmployeeData, BenefitItem } from '../types';
import { calculateWorkingDays, getDaysInMonth } from './dateUtils';

export function generatePayslipData(
  employeeData: EmployeeData,
  year: number,
  month: number, // 1-12
  companyDetails: CompanyDetails
): GeneratedPayslip {
  const daysInSelectedMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month - 1, daysInSelectedMonth);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const yearNum = date.getFullYear();
    return `${day}/${monthNum}/${yearNum}`;
  };

  const period = `${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`;
  const paymentDate = `${String(companyDetails.paymentDateDay).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  let giorniLavoroEffettivi: number;
  let oreLavorateEffettive: number | string;
  let currentNetto: number;
  let currentBenefitsAndRimborsi: BenefitItem[];
  const nettoLabel = employeeData.type === EmployeeType.HUMAN ? "NETTO IN BUSTA" : "NETTO IN CIRCUITI";

  if (employeeData.type === EmployeeType.HUMAN) {
    const humanData = employeeData as HumanEmployeeData;
    giorniLavoroEffettivi = calculateWorkingDays(year, month);
    oreLavorateEffettive = humanData.baseOreLavorateStandard > 0 && humanData.baseGiorniLavoroStandard > 0 
        ? Math.round((giorniLavoroEffettivi / humanData.baseGiorniLavoroStandard) * humanData.baseOreLavorateStandard)
        : humanData.baseOreLavorateStandard; // fallback or if it's fixed monthly hours regardless of days

    const originalTicketValue = (humanData.ticketRestaurantPerDay || 0) * humanData.baseGiorniLavoroStandard;
    const currentTicketValue = (humanData.ticketRestaurantPerDay || 0) * giorniLavoroEffettivi;

    currentNetto = humanData.nettoInBustaOriginal - originalTicketValue + currentTicketValue;
    
    currentBenefitsAndRimborsi = humanData.benefitsAndRimborsiItemsOriginal.map(benefit => {
      if (benefit.description.toLowerCase().includes('ticket restaurant') && humanData.ticketRestaurantPerDay) {
        return {
          ...benefit,
          amount: currentTicketValue,
          details: `€${humanData.ticketRestaurantPerDay}/giorno x ${giorniLavoroEffettivi} giorni`
        };
      }
      return benefit;
    });

  } else { // Cyborg
    const cyborgData = employeeData as CyborgEmployeeData;
    giorniLavoroEffettivi = daysInSelectedMonth; // Operative for all days
    oreLavorateEffettive = daysInSelectedMonth * 24; // Operative 24h
    currentNetto = cyborgData.nettoInCircuitiOriginal;
    currentBenefitsAndRimborsi = cyborgData.benefitsTecnologiciOriginal;
  }

  return {
    employeeDetails: employeeData,
    companyDetails,
    period,
    paymentDate,
    year,
    month,
    giorniLavoroEffettivi,
    oreLavorateEffettive: employeeData.type === EmployeeType.CYBORG ? `${oreLavorateEffettive} (24/7)` : oreLavorateEffettive,
    currentCompetenze: employeeData.competenzeItemsOriginal,
    currentTotaleCompetenze: employeeData.totaleCompetenzeOriginal,
    currentTrattenute: employeeData.trattenuteItemsOriginal,
    currentTotaleTrattenute: employeeData.totaleTrattenuteOriginal,
    currentBenefitsAndRimborsi,
    currentNetto,
    nettoLabel,
  };
}
