/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';

export default function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    nombre: 'JUAN PÉREZ GARCÍA',
    cedula: 'V-20.123.456',
    ciudad: 'CARACAS - DISTRITO CAPITAL',
    telefono: '0414-1234567',
    direccion: 'Av. Francisco de Miranda, Edif. Centro, Apto 4B',
    marca: 'Samsung',
    modelo: 'Galaxy S23 Ultra',
    color: 'Phantom Black',
    serial: 'RF8W1234567X',
    imei1: '351234567890123',
    imei2: '351234567890124',
    numTelefónico: '0412-7654321 / Movistar',
    codigoDesbloqueo: 'PIN: 1234 / Patrón en forma de L',
    estadoFisico: 'Optimo',
    aplicacionObjeto: 'WhatsApp',
    contactoEspecifico: '0424-9876543',
    fechaDesde: '2024-01-01',
    fechaHasta: '2024-12-31',
    aislamiento: true,
    calculoHash: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        :root {
          --accent: #00ff88;
          --bg-dark: #0a0f1c;
          --card-bg: #161b2a;
          --border: #2d3748;
        }

        body {
          font-family: 'Inter', sans-serif;
        }

        @media print {
          @page {
            size: legal;
            margin: 1.5cm;
          }
          
          body {
            background: white !important;
            color: black !important;
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          .section-title {
            color: black !important;
            border-bottom: 1px solid #000 !important;
            margin-top: 15px !important;
          }

          input, select, textarea {
            border: 1px solid #ccc !important;
            background: transparent !important;
            color: black !important;
            padding: 4px !important;
          }

          .accent-text {
            color: black !important;
            font-weight: bold !important;
          }

          .signature-box {
            border: 1px dashed black !important;
            background: #f9f9f9 !important;
          }

          .logo-container {
            border: 1px solid black !important;
            background: white !important;
          }

          .logo-text {
            color: black !important;
          }
          
          .footer-note {
            color: #555 !important;
          }
        }

        .input-field {
          background: #1a202e;
          border: 1px solid #2d3748;
          border-radius: 4px;
          padding: 10px;
          width: 100%;
          color: white;
          transition: border-color 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--accent);
        }

        .label-text {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #718096;
          margin-bottom: 4px;
          display: block;
        }
      `}} />

      <div className="max-w-4xl mx-auto print-container">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <div className="logo-container border border-slate-700 bg-[#161b2a] p-4 rounded-lg text-right w-64">
            <h1 className="text-2xl font-bold tracking-tighter logo-text">
              <span className="text-emerald-400">SHA</span>256<span className="text-slate-100">.US</span>
            </h1>
            <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-semibold">
              forensic laboratory operations
            </p>
          </div>
        </div>

        <form ref={formRef} className="space-y-8">
          {/* Section I */}
          <section className="space-y-4">
            <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title border-b border-emerald-500/30 pb-1 uppercase">
              I. Datos del Solicitante y Autorización
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Nombre Completo</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Cédula / Identificación</label>
                <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Ciudad</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" />
              </div>
            </div>
            
            <div>
              <label className="label-text">Dirección Completa</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="input-field" />
            </div>

            <div className="bg-emerald-500/5 border-l-2 border-emerald-500 p-4 rounded-r-md text-xs leading-relaxed italic text-slate-400">
              "Yo, el arriba identificado, en pleno uso de mis facultades mentales <span className="text-emerald-400 font-bold accent-text">AUTORIZO EXPRESA Y VOLUNTARIAMENTE</span> su acceso, exploración y extracción forense de datos. Para ello, renuncio temporalmente a mi derecho al secreto de las comunicaciones <span className="text-emerald-500/80">(Arts. 48 y 60 de la Constitución de la República Bolivariana de Venezuela)</span>, única y exclusivamente a favor de los expertos designados y para los fines técnicos aquí descritos."
            </div>
          </section>

          {/* Section II */}
          <section className="space-y-4">
            <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title border-b border-emerald-500/30 pb-1 uppercase">
              II. Descripción del Dispositivo (Dispositivo Matriz)
            </h2>
            <p className="text-[11px] font-semibold text-slate-100">• Hago entrega material voluntaria del siguiente equipo bajo la figura de Obtención por Consignación.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Marca</label>
                <input type="text" name="marca" value={formData.marca} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Modelo</label>
                <input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Serial de Fábrica</label>
                <input type="text" name="serial" value={formData.serial} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">IMEI 1</label>
                <input type="text" name="imei1" value={formData.imei1} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">IMEI 2</label>
                <input type="text" name="imei2" value={formData.imei2} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Nº Telefónico / Operadora</label>
                <input type="text" name="numTelefónico" value={formData.numTelefónico} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Código de Desbloqueo (PIN/Patrón)</label>
                <input type="text" name="codigoDesbloqueo" placeholder="Ej: 1234 o descripción" value={formData.codigoDesbloqueo} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Estado Físico</label>
                <select name="estadoFisico" value={formData.estadoFisico} onChange={handleInputChange} className="input-field appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23718096%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat">
                  <option value="Optimo">Optimo</option>
                  <option value="Regular">Regular</option>
                  <option value="Dañado">Dañado</option>
                  <option value="Pantalla Rota">Pantalla Rota</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section III */}
          <section className="space-y-4">
            <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title border-b border-emerald-500/30 pb-1 uppercase">
              III. Alcance de la Extracción y Análisis
            </h2>
            <p className="text-[11px] font-semibold text-slate-100">• Solicito la aplicación de herramientas forenses para la extracción lógica/física de "Mensajes de Datos", delimitado estrictamente a:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="label-text">Aplicación Objeto</label>
                <select 
                  name="aplicacionObjeto" 
                  value={formData.aplicacionObjeto} 
                  onChange={handleInputChange} 
                  className="input-field text-emerald-400 font-bold appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23718096%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Cámara">Cámara</option>
                  <option value="Documentos">Documentos</option>
                  <option value="Copia Total">Copia Total</option>
                </select>
              </div>
              <div>
                <label className="label-text">Número de Contacto Específico</label>
                <input type="text" name="contactoEspecifico" value={formData.contactoEspecifico} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Rango de Fechas (Desde - Hasta)</label>
                <div className="flex items-center space-x-2">
                  <input type="date" name="fechaDesde" value={formData.fechaDesde} onChange={handleInputChange} className="input-field text-xs" />
                  <span className="text-xs">al</span>
                  <input type="date" name="fechaHasta" value={formData.fechaHasta} onChange={handleInputChange} className="input-field text-xs" />
                </div>
              </div>
            </div>
          </section>

          {/* Section IV */}
          <section className="space-y-4">
            <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title border-b border-emerald-500/30 pb-1 uppercase">
              IV. Requerimientos Técnicos y de Preservación
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start space-x-3 bg-[#161b2a] p-4 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input type="checkbox" name="aislamiento" checked={formData.aislamiento} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-100">Aislamiento de Señal (Modo Avión/Bolsa Faraday)</p>
                  <p className="text-[10px] text-slate-400">Asegura que el dispositivo no reciba datos remotos durante el análisis.</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 bg-[#161b2a] p-4 rounded-lg border border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input type="checkbox" name="calculoHash" checked={formData.calculoHash} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-100">Cálculo de Algoritmos de Integridad (HASH)</p>
                  <p className="text-[10px] text-slate-400">Generación de huella digital SHA-256 o MD5 para cadena de custodia.</p>
                </div>
              </label>
            </div>
          </section>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="text-center space-y-4">
              <div className="signature-box border border-dashed border-slate-600 h-32 rounded-lg bg-slate-800/20 flex items-center justify-center">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Firma y Huella (Dactilar)</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 uppercase">El Solicitante</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{formData.nombre}</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="signature-box border border-dashed border-slate-600 h-32 rounded-lg bg-slate-800/20 flex items-center justify-center">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Sello y Firma Institucional</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 uppercase">Expertos Forenses</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Área de Análisis de Telefonía Móvil</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-8 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 italic footer-note">
              Nota: Este documento tiene validez legal al ser consignado ante el Ministerio Público o Tribunales competentes.
            </p>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4 mt-12 no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-all border border-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Descargar Legal/PDF</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 px-12 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
