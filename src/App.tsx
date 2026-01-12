import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewSale from "./pages/NewSale";
import Sales from "./pages/Sales";
import SaleDetail from "./pages/SaleDetail";
import Clients from "./pages/Clients";
import Tests from "./pages/Tests";
import GestionPruebas from "./pages/GestionPruebas";
import GestionDoctores from "./pages/GestionDoctores";
import GestionDerivados from "./pages/GestionDerivados";
import PreciosLaboratorios from "./pages/PreciosLaboratorios";
import PruebasAEnviar from "./pages/PruebasAEnviar";
import Quotes from "./pages/Quotes";
import ItemInventario from "./pages/ItemInventario";
import Compras from "./pages/Compras";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nueva-venta" element={<NewSale />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/ventas/:id" element={<SaleDetail />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/pruebas" element={<Tests />} />
            <Route path="/gestion-pruebas" element={<GestionPruebas />} />
            <Route path="/gestion-doctores" element={<GestionDoctores />} />
            <Route path="/gestion-derivados" element={<GestionDerivados />} />
            <Route path="/precios-laboratorios" element={<PreciosLaboratorios />} />
            <Route path="/pruebas-a-enviar" element={<PruebasAEnviar />} />
            <Route path="/cotizaciones" element={<Quotes />} />
            <Route path="/item-inventario" element={<ItemInventario />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
