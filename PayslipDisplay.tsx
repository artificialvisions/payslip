
import React from 'react';
import { GeneratedPayslip, EmployeeType, HumanEmployeeData, CyborgEmployeeData, CompetenzaItem, TrattenutaItem, BenefitItem } from '../types';
import { BriefcaseIcon, BuildingOffice2Icon, CalendarDaysIcon, CurrencyEuroIcon, FingerPrintIcon, HashtagIcon, UserIcon, IdentificationIcon, CogIcon as SolidCogIcon, CpuChipIcon, ShieldCheckIcon, SparklesIcon } from './Icons';


interface PayslipSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  gridCols?: string;
}

const PayslipSection: React.FC<PayslipSectionProps> = ({ title, icon, children, gridCols = "md:grid-cols-2" }) => (
  <div className="mb-6 p-4 bg-darkInputBg/70 rounded-lg shadow"> {/* Using darkInputBg with opacity */}
    <h3 className="text-xl font-semibold text-lightBlue1 mb-3 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h3>
    <div className={`grid gap-x-4 gap-y-2 text-sm ${gridCols}`}>
      {children}
    </div>
  </div>
);

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  valueClassName?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, valueClassName = "text-gray-200" }) => (
  <div className="py-1">
    <span className="font-medium text-gray-400">{label}:</span>
    <span className={`ml-2 ${valueClassName}`}>{value ?? 'N/A'}</span>
  </div>
);

const MonetaryItem: React.FC<{item: CompetenzaItem | TrattenutaItem | BenefitItem, isTotal?: boolean}> = ({ item, isTotal = false }) => {
  const amount = typeof item.amount === 'number' ? item.amount.toFixed(2) : '-';
  // Use pink for positive amounts, red for explicit negative deductions (that aren't just 'detrazione')
  const textColor = typeof item.amount === 'number' && item.amount < 0 && !item.description.toLowerCase().includes('detrazione') ? 'text-red-400' : 'text-pink';
  const fontWeight = isTotal ? 'font-bold' : 'font-normal';
  const details = (item as BenefitItem).details;
  
  return (
    <div className={`flex justify-between py-1 ${ (item as TrattenutaItem).isSubTotal ? 'border-t border-lightBlue2/50 mt-1 pt-1' : ''} ${fontWeight}`}>
      <span className="text-gray-300">{item.description}{details ? <span className="text-xs text-gray-500 ml-1">{details}</span> : ''}</span>
      <span className={`${textColor} ${fontWeight}`}>
        { (typeof item.amount === 'number' && item.amount < 0 && !item.description.toLowerCase().includes('detrazione')) ? `-${Math.abs(item.amount).toFixed(2)} €` : `${amount} €`}
      </span>
    </div>
  );
};


export const PayslipDisplay: React.FC<{ payslip: GeneratedPayslip }> = ({ payslip }) => {
  const { employeeDetails, companyDetails, period, paymentDate, year, month, giorniLavoroEffettivi, oreLavorateEffettive, currentCompetenze, currentTotaleCompetenze, currentTrattenute, currentTotaleTrattenute, currentBenefitsAndRimborsi, currentNetto, nettoLabel } = payslip;

  const isCyborg = employeeDetails.type === EmployeeType.CYBORG;
  const humanData = !isCyborg ? employeeDetails as HumanEmployeeData : null;
  const cyborgData = isCyborg ? employeeDetails as CyborgEmployeeData : null;

  return (
    <div id="payslip-content" className="p-4 sm:p-6 bg-darkCardBg text-gray-200 rounded-xl shadow-2xl font-['Roboto_Mono',_monospace]">
      <div id="payslip-render-area"> {/* Added for PDF export precise targeting */}
        <header className="text-center mb-6 pb-4 border-b-2 border-pink">
          <h2 className="text-3xl font-bold text-pink">{companyDetails.name}</h2>
          <p className="text-sm text-gray-400">{companyDetails.address}</p>
          <p className="text-sm text-gray-400">Codice Fiscale: {companyDetails.fiscalCode}</p>
        </header>

        <div className="mb-6 flex flex-wrap justify-between items-center text-sm p-3 bg-darkInputBg rounded-md">
            <div className="mr-2 mb-1 sm:mb-0">
                <span className="font-semibold text-lightBlue1">Dipendente:</span> <span className="text-gray-200">{employeeDetails.name}</span>
            </div>
            <div className="mr-2 mb-1 sm:mb-0">
                <span className="font-semibold text-lightBlue1">Periodo:</span> <span className="text-gray-200">{period}</span>
            </div>
            <div>
                <span className="font-semibold text-lightBlue1">Data Pagamento:</span> <span className="text-gray-200">{paymentDate}</span>
            </div>
        </div>

        <PayslipSection title="Dati Anagrafici e Contrattuali" icon={<UserIcon className="h-5 w-5 text-lightBlue1" />}>
          <DetailItem label="Matricola" value={employeeDetails.matricola} />
          {isCyborg && cyborgData && <DetailItem label="Serial Number" value={cyborgData.serialNumber} />}
          {!isCyborg && humanData && <DetailItem label="Codice Fiscale" value={humanData.codiceFiscale} />}
          <DetailItem label="Qualifica" value={employeeDetails.qualifica} />
          <DetailItem label="CCNL" value={isCyborg ? cyborgData?.ccnl : humanData?.ccnl} />
          {isCyborg && cyborgData && <DetailItem label="Uptime" value={`${cyborgData.uptimePercent}%`} />}
          <DetailItem label={isCyborg ? "Ore Operative" : "Ore Lavorate"} value={oreLavorateEffettive.toLocaleString()} />
          {!isCyborg && <DetailItem label="Giorni Lavoro" value={giorniLavoroEffettivi} />}
        </PayslipSection>

        <PayslipSection title={isCyborg ? "Competenze Cyborg" : "Competenze"} icon={<CurrencyEuroIcon className="h-5 w-5 text-lightBlue1" />} gridCols="md:grid-cols-1">
          {currentCompetenze.map((item, index) => <MonetaryItem key={`comp-${index}`} item={item} />)}
          <MonetaryItem item={{ description: 'TOTALE COMPETENZE', amount: currentTotaleCompetenze }} isTotal={true} />
        </PayslipSection>

        <PayslipSection title={isCyborg ? "Trattenute Speciali" : "Trattenute"} icon={<ShieldCheckIcon className="h-5 w-5 text-lightBlue1" />} gridCols="md:grid-cols-1">
          {currentTrattenute.map((item, index) => <MonetaryItem key={`tratt-${index}`} item={item} />)}
          <MonetaryItem item={{ description: 'TOTALE TRATTENUTE', amount: currentTotaleTrattenute }} isTotal={true} />
        </PayslipSection>
        
        <PayslipSection title={isCyborg ? "Benefits Tecnologici" : "Benefits & Rimborsi"} icon={<SparklesIcon className="h-5 w-5 text-lightBlue1" />} gridCols="md:grid-cols-1">
          {currentBenefitsAndRimborsi.map((item, index) => (
            <div key={`ben-${index}`} className="flex justify-between py-1 items-center">
              <span className="text-gray-300">{item.description}{item.details ? <span className="text-xs text-gray-500 ml-1">{item.details}</span> : ''}</span>
              {typeof item.amount === 'number' && <span className="text-pink">{item.amount.toFixed(2)} €</span>}
            </div>
          ))}
        </PayslipSection>

        <div className="mt-8 pt-4 border-t-2 border-pink">
          <div className="flex justify-end items-center p-4 bg-[#060608] rounded-lg shadow-inner"> {/* Even darker for netto summary */}
            <h4 className="text-2xl font-bold text-lightBlue1 mr-4">{nettoLabel}:</h4>
            <span className="text-3xl font-bold text-pink">{currentNetto.toFixed(2)} €</span>
          </div>
        </div>
        
        {isCyborg && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Note Speciali: Contratto sperimentale cyborg. Include protocolli malfunzionamento e aggiornamenti personalità.
          </p>
        )}
      </div>
    </div>
  );
};