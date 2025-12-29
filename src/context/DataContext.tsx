import React, { createContext, useContext, ReactNode } from 'react';
import { Client, Sale, Test, SaleTest, Quote, Doctor, Derivado } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { initialTests, initialClients, initialSales } from '@/data/initialData';

interface DataContextType {
  clients: Client[];
  sales: Sale[];
  tests: Test[];
  quotes: Quote[];
  doctors: Doctor[];
  derivados: Derivado[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  deleteQuote: (id: string) => void;
  updateTestStatus: (saleId: string, testId: string, updates: Partial<SaleTest>) => void;
  getClientById: (id: string) => Client | undefined;
  getSaleById: (id: string) => Sale | undefined;
  getAllPendingTests: () => { sale: Sale; test: SaleTest }[];
  addTest: (test: Omit<Test, 'id'>) => void;
  updateTest: (id: string, test: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  addDoctor: (doctor: Omit<Doctor, 'id' | 'createdAt'>) => Doctor;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  updateDoctorEarnings: (doctorId: string, amount: number) => void;
  addDerivado: (derivado: Omit<Derivado, 'id' | 'createdAt' | 'totalEarned'>) => Derivado;
  updateDerivado: (id: string, derivado: Partial<Derivado>) => void;
  deleteDerivado: (id: string) => void;
  updateDerivadoEarnings: (derivadoId: string, amount: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useLocalStorage<Client[]>('lab-clients', initialClients);
  const [sales, setSales] = useLocalStorage<Sale[]>('lab-sales', initialSales);
  const [tests, setTests] = useLocalStorage<Test[]>('lab-tests', initialTests);
  const [quotes, setQuotes] = useLocalStorage<Quote[]>('lab-quotes', []);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('lab-doctors', []);
  const [derivados, setDerivados] = useLocalStorage<Derivado[]>('lab-derivados', []);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `s-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSales([...sales, newSale]);
  };

  const addQuote = (quoteData: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setQuotes([...quotes, newQuote]);
  };

  const deleteQuote = (id: string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const updateTestStatus = (saleId: string, testId: string, updates: Partial<SaleTest>) => {
    setSales(sales.map(sale => {
      if (sale.id !== saleId) return sale;
      
      const updatedTests = sale.tests.map(test => {
        if (test.id !== testId) return test;
        return { ...test, ...updates };
      });
      
      const allCompleted = updatedTests.every(t => t.status === 'completed');
      
      return {
        ...sale,
        tests: updatedTests,
        status: allCompleted ? 'completed' : 'active',
      };
    }));
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);
  const getSaleById = (id: string) => sales.find(s => s.id === id);

  const getAllPendingTests = () => {
    const pending: { sale: Sale; test: SaleTest }[] = [];
    sales.forEach(sale => {
      sale.tests.forEach(test => {
        if (test.status !== 'completed') {
          pending.push({ sale, test });
        }
      });
    });
    return pending;
  };

  const addTest = (testData: Omit<Test, 'id'>) => {
    const newTest: Test = {
      ...testData,
      id: `t-${Date.now()}`,
    };
    setTests([...tests, newTest]);
  };

  const updateTest = (id: string, updates: Partial<Test>) => {
    setTests(tests.map(test => test.id === id ? { ...test, ...updates } : test));
  };

  const deleteTest = (id: string) => {
    setTests(tests.filter(test => test.id !== id));
  };

  const addDoctor = (doctorData: Omit<Doctor, 'id' | 'createdAt'>): Doctor => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDoctors([...doctors, newDoctor]);
    return newDoctor;
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors(doctors.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
  };

  const deleteDoctor = (id: string) => {
    setDoctors(doctors.filter(doc => doc.id !== id));
  };

  const updateDoctorEarnings = (doctorId: string, amount: number) => {
    setDoctors(doctors.map(doc => 
      doc.id === doctorId 
        ? { ...doc, totalEarned: doc.totalEarned + amount } 
        : doc
    ));
  };

  const addDerivado = (derivadoData: Omit<Derivado, 'id' | 'createdAt' | 'totalEarned'>): Derivado => {
    const newDerivado: Derivado = {
      ...derivadoData,
      id: `der-${Date.now()}`,
      totalEarned: 0,
      createdAt: new Date().toISOString(),
    };
    setDerivados([...derivados, newDerivado]);
    return newDerivado;
  };

  const updateDerivado = (id: string, updates: Partial<Derivado>) => {
    setDerivados(derivados.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDerivado = (id: string) => {
    setDerivados(derivados.filter(d => d.id !== id));
  };

  const updateDerivadoEarnings = (derivadoId: string, amount: number) => {
    setDerivados(derivados.map(d => 
      d.id === derivadoId 
        ? { ...d, totalEarned: d.totalEarned + amount } 
        : d
    ));
  };

  return (
    <DataContext.Provider value={{
      clients,
      sales,
      tests,
      quotes,
      doctors,
      derivados,
      addClient,
      addSale,
      addQuote,
      deleteQuote,
      updateTestStatus,
      getClientById,
      getSaleById,
      getAllPendingTests,
      addTest,
      updateTest,
      deleteTest,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      updateDoctorEarnings,
      addDerivado,
      updateDerivado,
      deleteDerivado,
      updateDerivadoEarnings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
