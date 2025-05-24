
import React, { useState, useCallback, useMemo } from 'react';
import { initialCompanyDetails, initialEmployeeData } from './constants';
import { EmployeeData, GeneratedPayslip, EmployeeType } from './types';
import { generatePayslipData } from './services/payslipService';
import { exportPayslipToPDF } from './services/pdfService';
import { PayslipDisplay } from './components/PayslipDisplay';
import { UserCircleIcon, CalendarDaysIcon, DocumentArrowDownIcon, CogIcon } from './components/Icons';


const App: React.FC = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const currentYear = new Date().getFullYear();
  // const currentMonth = new Date().getMonth() + 1; // Not directly used for default
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // Default to May
  const [generatedPayslip, setGeneratedPayslip] = useState<GeneratedPayslip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const years = useMemo(() => {
    const yearSet = new Set([currentYear - 1, currentYear, currentYear + 1, 2025]);
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [currentYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const handleGeneratePayslip = useCallback(() => {
    if (!selectedEmployeeId) {
      alert('Seleziona un dipendente.');
      return;
    }
    setIsLoading(true);
    const employee = initialEmployeeData.find(emp => emp.id === selectedEmployeeId);
    if (employee) {
      try {
        const payslip = generatePayslipData(employee, selectedYear, selectedMonth, initialCompanyDetails);
        setGeneratedPayslip(payslip);
      } catch (error) {
        console.error("Error generating payslip:", error);
        alert("Errore durante la generazione della busta paga.");
        setGeneratedPayslip(null);
      }
    }
    setIsLoading(false);
  }, [selectedEmployeeId, selectedYear, selectedMonth]);

  const handleExportPDF = useCallback(() => {
    if (generatedPayslip) {
      const payslipElement = document.getElementById('payslip-content');
      if (payslipElement) {
        exportPayslipToPDF(payslipElement, `BustaPaga_${generatedPayslip.employeeDetails.name.replace(' ', '_')}_${generatedPayslip.month}-${generatedPayslip.year}.pdf`);
      }
    }
  }, [generatedPayslip]);

  const selectedEmployee = useMemo(() => {
    return initialEmployeeData.find(emp => emp.id === selectedEmployeeId);
  }, [selectedEmployeeId]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          {/* GlobeAltIcon removed */}
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lightBlue1 to-pink">
            VS Music Studio
          </h1>
        </div>
        {/* Subtitle "Generatore Interattivo Buste Paga" removed */}
      </header>

      <main className="w-full max-w-5xl bg-darkCardBg shadow-2xl rounded-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-lightBlue1 mb-1">
              <UserCircleIcon className="inline h-5 w-5 mr-1" />Dipendente
            </label>
            <select
              id="employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-3 bg-darkInputBg border border-lightBlue2 rounded-md shadow-sm focus:ring-2 focus:ring-pink focus:border-pink text-gray-200 placeholder-gray-500"
            >
              <option value="" disabled className="text-gray-500">Seleziona Dipendente</option>
              {initialEmployeeData.map(emp => (
                <option key={emp.id} value={emp.id} className="text-gray-200">
                  {emp.name} {emp.type === EmployeeType.CYBORG ? '🤖' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-lightBlue1 mb-1">
              <CalendarDaysIcon className="inline h-5 w-5 mr-1" />Anno
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-3 bg-darkInputBg border border-lightBlue2 rounded-md shadow-sm focus:ring-2 focus:ring-pink focus:border-pink text-gray-200"
            >
              {years.map(year => <option key={year} value={year} className="text-gray-200">{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-lightBlue1 mb-1">
              <CalendarDaysIcon className="inline h-5 w-5 mr-1" />Mese
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-3 bg-darkInputBg border border-lightBlue2 rounded-md shadow-sm focus:ring-2 focus:ring-pink focus:border-pink text-gray-200"
            >
              {months.map(month => (
                <option key={month} value={month} className="text-gray-200">
                  {new Date(0, month - 1).toLocaleString('it-IT', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGeneratePayslip}
          disabled={isLoading || !selectedEmployeeId}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-lightBlue1 to-lightBlue2 hover:from-lightBlue2 hover:to-pink text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <CogIcon className="animate-spin h-5 w-5" /> Generazione in corso...
            </>
          ) : (
            <>
              <CogIcon className="h-5 w-5" /> Genera Busta Paga
            </>
          )}
        </button>

        {generatedPayslip && (
          <div className="mt-8">
            <PayslipDisplay payslip={generatedPayslip} />
            <button
              onClick={handleExportPDF}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink to-[#d16fa0] hover:from-[#d16fa0] hover:to-pink text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              <DocumentArrowDownIcon className="h-5 w-5" /> Esporta in PDF
            </button>
          </div>
        )}
         {!generatedPayslip && selectedEmployeeId && !isLoading && (
            <div className="mt-12 text-center p-8 bg-darkInputBg rounded-lg shadow-inner">
                <h3 className="text-2xl font-semibold text-lightBlue1 mb-2">Pronto per iniziare?</h3>
                <p className="text-gray-300">
                    Hai selezionato <span className="font-bold text-pink">{selectedEmployee?.name}</span> per il periodo di <span className="font-bold text-pink">{new Date(0, selectedMonth - 1).toLocaleString('it-IT', { month: 'long' })} {selectedYear}</span>.
                </p>
                <p className="text-gray-300 mt-1">Clicca su "Genera Busta Paga" per visualizzare i dettagli.</p>
            </div>
        )}
        {!generatedPayslip && !selectedEmployeeId && !isLoading && (
            <div className="mt-12 text-center p-8 bg-darkInputBg rounded-lg shadow-inner">
                <UserCircleIcon className="h-16 w-16 text-lightBlue1 mx-auto mb-4"/>
                <h3 className="text-2xl font-semibold text-lightBlue1 mb-2">Nessun dipendente selezionato</h3>
                <p className="text-gray-300">Per favore, seleziona un dipendente e il periodo desiderato, poi clicca su "Genera Busta Paga".</p>
            </div>
        )}

      </main>
      <footer className="w-full max-w-5xl mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} VS Music Studio. Documento Confidenziale - Solo per Uso Interno.</p>
      </footer>
    </div>
  );
};

export default App;