/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Lock, Database, Globe, ArrowLeft, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [view, setView] = useState<'form' | 'login' | 'admin'>('form');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [adminForms, setAdminForms] = useState<any[]>([]);
  const [adminPosts, setAdminPosts] = useState<any[]>([]);
  const [neoConfig, setNeoConfig] = useState({ 
    apiKey: 'postgresql://neondb_owner:npg_XsEZ1lTGtKO2@ep-falling-firefly-ai6dlr3t-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require', 
    endpoint: 'https://ais-pre-zz47w7ss726okqsjxvcd4x-16027451891.us-east1.run.app', 
    status: 'connecting' 
  });
  const [uniqueCode, setUniqueCode] = useState('PENDIENTE_DE_GENERAR');
  const [isPrinting, setIsPrinting] = useState(false);

  const DEFAULT_VALUES = {
    nombre: 'JUAN PÉREZ GARCÍA',
    cedula: '20.123.456',
    cedulaPrefix: 'V',
    ciudad: 'CARACAS - DISTRITO CAPITAL',
    telefono: '1234567',
    telefonoCarrier: '0414',
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
  };

  const [formData, setFormData] = useState({
    ...DEFAULT_VALUES,
    aislamiento: true,
    calculoHash: true
  });

  const getInputClass = (name: keyof typeof formData) => {
    if (typeof formData[name] === 'boolean') return '';
    const isDefault = formData[name] === DEFAULT_VALUES[name as keyof typeof DEFAULT_VALUES];
    return `${isDefault ? 'text-slate-500 border-slate-600 italic' : 'text-emerald-400 border-emerald-500/30'}`;
  };

  useEffect(() => {
    if (isPrinting && uniqueCode !== 'PENDIENTE_DE_GENERAR') {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, uniqueCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const saveForm = async () => {
    try {
      const dataToSave = {
        ...formData,
        cedula: `${formData.cedulaPrefix}-${formData.cedula}`,
        telefono: `${formData.telefonoCarrier}-${formData.telefono}`
      };
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      const result = await response.json();
      if (result.success) {
        setUniqueCode(result.id);
        return result.id;
      } else {
        console.error('Server error saving form:', result.error);
        alert(`Error del servidor: ${result.error || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Network error saving form:', error);
      // Try to get more info if it's a fetch error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error de red al intentar guardar la planilla: ${errorMessage}`);
    }
    return null;
  };

  const handlePrint = async () => {
    console.log("Print requested...");
    // Basic validation
    const requiredFields = ['nombre', 'cedula', 'ciudad', 'telefono', 'marca', 'modelo', 'serial'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      console.warn("Missing fields:", missingFields);
      alert("Por favor rellene todos los campos obligatorios antes de imprimir.");
      return;
    }

    console.log("Saving form...");
    const id = await saveForm();
    if (id) {
      console.log("Form saved with ID:", id);
      setUniqueCode(id);
      setIsPrinting(true);
    } else {
      console.error("Form save failed, print aborted.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await res.json();
      if (result.success) {
        setIsLoggedIn(true);
        setView('admin');
        fetchAdminData();
      } else {
        alert('Credenciales inválidas. Verifique usuario y contraseña.');
      }
    } catch {
      alert('Error de conexión con el servidor.');
    }
  };

  const fetchAdminData = async () => {
    const [formsRes, postsRes, neoRes, statusRes] = await Promise.all([
      fetch('/api/forms'),
      fetch('/api/posts'),
      fetch('/api/settings/neo'),
      fetch('/api/settings/neo/status')
    ]);
    const forms = await formsRes.json();
    const posts = await postsRes.json();
    const neo = await neoRes.json();
    const status = await statusRes.json();
    setAdminForms(forms);
    setAdminPosts(posts);
    if (neo.config) {
      setNeoConfig({ ...neo.config, status: status.status });
    } else {
      setNeoConfig(prev => ({ ...prev, status: status.status }));
    }
  };

  const saveNeoConfig = async () => {
    if (!neoConfig.apiKey.startsWith('postgres')) {
      alert('La URL de conexión debe empezar con "postgresql://"');
      return;
    }
    try {
      const response = await fetch('/api/settings/neo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { ...neoConfig, status: 'connecting' } })
      });
      const result = await response.json();
      if (result.success) {
        setNeoConfig({ ...neoConfig, status: result.status });
        if (result.status === 'connected') {
          alert('Conexión con Neon DB exitosa');
          fetchAdminData();
        } else {
          alert('Error al conectar con Neon DB. Verifique que la URL sea correcta y tenga permisos de acceso.');
        }
      }
    } catch (error) {
      alert('Error al guardar la configuración');
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161b2a] p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
              <Lock className="text-emerald-400 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Panel de Control</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Usuario</label>
              <input 
                type="text" 
                className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Contraseña</label>
              <input 
                type="password" 
                className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-lg transition-all">
              Acceder
            </button>
            <button 
              type="button"
              onClick={() => setView('form')}
              className="w-full text-slate-400 text-sm hover:text-white transition-colors"
            >
              Volver al Formulario
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={() => setView('form')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">Administración Forense</h1>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <ShieldCheck className="text-emerald-400 w-5 h-5" />
              <span className="text-emerald-400 text-sm font-semibold">Sesión Activa</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Neon Connection */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#161b2a] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Globe className="text-emerald-400 w-6 h-6" />
                    <h3 className="font-bold text-white">Conexión Neon DB</h3>
                  </div>
                  <div className="group relative">
                    <div className="cursor-help text-slate-500 hover:text-emerald-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <div className="absolute right-0 top-8 w-64 bg-[#1a202e] border border-slate-700 p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <p className="text-[10px] text-white font-bold mb-2 uppercase tracking-widest">Instrucciones Neon</p>
                      <ol className="text-[10px] text-slate-400 space-y-2 list-decimal ml-3">
                        <li>Crea un proyecto en <span className="text-emerald-400">neon.tech</span></li>
                        <li>Ve a "Dashboard" y copia la <span className="text-white">Connection String</span></li>
                        <li>Asegúrate de incluir el usuario y contraseña en la URL</li>
                        <li>Pega la URL en el campo "Connection String" de abajo</li>
                        <li>Haz clic en "Conectar" para validar</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 mb-1 block">Connection String (Postgres)</label>
                    <input 
                      type="password" 
                      placeholder="postgres://user:pass@ep-host.region.aws.neon.tech/neondb"
                      className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
                      value={neoConfig.apiKey}
                      onChange={(e) => setNeoConfig({...neoConfig, apiKey: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 mb-1 block">Vercel Deployment URL</label>
                    <input 
                      type="text" 
                      placeholder="https://tu-app.vercel.app"
                      className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
                      value={neoConfig.endpoint}
                      onChange={(e) => setNeoConfig({...neoConfig, endpoint: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${neoConfig.status === 'connected' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : neoConfig.status === 'failed' || neoConfig.status === 'disconnected' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                      <span className={`text-[10px] font-bold uppercase ${neoConfig.status === 'connected' ? 'text-emerald-400' : neoConfig.status === 'failed' || neoConfig.status === 'disconnected' ? 'text-red-500' : 'text-amber-400'}`}>
                        {neoConfig.status === 'connected' ? 'Conexión Activa' : neoConfig.status === 'failed' ? 'Error de Conexión' : neoConfig.status === 'disconnected' ? 'Desconectada' : 'Conectando...'}
                      </span>
                    </div>
                    <button 
                      onClick={saveNeoConfig}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-md transition-all active:scale-95"
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#161b2a] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="text-emerald-400 w-6 h-6" />
                  <h3 className="font-bold text-white">Estadísticas</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a202e] p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase">Total Planillas</p>
                    <p className="text-2xl font-bold text-white">{adminForms.length}</p>
                  </div>
                  <div className="bg-[#1a202e] p-4 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase">Hoy</p>
                    <p className="text-2xl font-bold text-white">
                      {adminForms.filter(f => new Date(f.created_at).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Noticias Section */}
              <div className="bg-[#161b2a] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="text-emerald-400 w-6 h-6" />
                    <h3 className="font-bold text-white">Noticias / Comunicados</h3>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {adminPosts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No hay comunicados recientes.</p>
                  ) : (
                    adminPosts.map((post, index) => (
                      <div key={index} className="bg-[#1a202e] p-4 rounded-xl border border-slate-700 hover:border-emerald-500/30 transition-colors">
                        <h4 className="font-bold text-white text-sm mb-1">{post.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{post.content}</p>
                        <p className="text-[9px] text-slate-600 mt-2 uppercase font-bold">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Simple Post Form */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Nuevo Comunicado</p>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Título del comunicado"
                      className="input-field text-xs"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          const title = input.value;
                          const content = prompt("Contenido del comunicado:");
                          if (title && content) {
                            await fetch('/api/posts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title, content })
                            });
                            input.value = '';
                            fetchAdminData();
                          }
                        }
                      }}
                    />
                    <p className="text-[9px] text-slate-600 italic">Presiona Enter para guardar el título y luego ingresa el contenido.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms List */}
            <div className="lg:col-span-2">
              <div className="bg-[#161b2a] rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="font-bold text-white">Planillas Generadas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#1a202e] text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Cédula (ID)</th>
                        <th className="px-6 py-4">Nombre</th>
                        <th className="px-6 py-4">Teléfono</th>
                        <th className="px-6 py-4">SHA256</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminForms.map((form) => (
                        <tr key={form.cedula} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-emerald-400 text-xs">{form.cedula}</td>
                          <td className="px-6 py-4 text-sm text-white">{form.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{form.telefono}</td>
                          <td className="px-6 py-4 font-mono text-emerald-500/70 text-[10px]" title={form.sha256}>
                            {form.sha256?.substring(0, 16)}...
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:text-emerald-400 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
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

          .unique-code-print {
            display: block !important;
            color: black !important;
            font-family: 'JetBrains Mono', monospace !important;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a202e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10b981;
        }

        .input-field {
          background: #1a202e;
          border: 1px solid #2d3748;
          border-radius: 6px;
          padding: 10px 12px;
          width: 100%;
          color: white;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.2);
          font-style: normal;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        .input-field:focus {
          outline: none;
          border-color: #10b981;
          background: #1f2937;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
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

      <div className="max-w-4xl mx-auto print-container relative">
        {/* Unique Code Display (Top Left) */}
        <div className="absolute top-0 left-0 flex flex-col items-start">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md mb-1">
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">ID Planilla</span>
          </div>
          <p className="font-mono text-[10px] font-bold text-white unique-code-print opacity-80">
            SHA256; <span className="text-emerald-400">{uniqueCode}</span>
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col items-end mb-8">
          <div className="logo-container border border-slate-700 bg-[#161b2a] p-4 rounded-lg text-right w-64">
            <h1 className="text-2xl font-bold tracking-tighter logo-text">
              <span className="text-emerald-400">SHA</span>256<span className="text-slate-100">.US</span>
            </h1>
            <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-semibold">
              forensic laboratory operations
            </p>
          </div>
          
          {/* Admin Button (Below Logo) */}
          <button 
            onClick={() => setView('login')}
            className="mt-4 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors no-print"
          >
            <Settings className="w-3 h-3" />
            <span>Panel de Control</span>
          </button>
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
                <input type="text" name="nombre" placeholder="Ej: Juan Alberto Pérez García" value={formData.nombre} onChange={handleInputChange} className={`input-field ${getInputClass('nombre')}`} />
              </div>
              <div>
                <label className="label-text">Cédula / Identificación</label>
                <div className="flex space-x-1">
                  <select name="cedulaPrefix" value={formData.cedulaPrefix} onChange={handleInputChange} className={`input-field w-16 shrink-0 px-1 text-center font-bold ${getInputClass('cedulaPrefix')}`}>
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="J">J</option>
                    <option value="G">G</option>
                    <option value="P">P</option>
                  </select>
                  <input type="text" name="cedula" placeholder="12.345.678" value={formData.cedula} onChange={handleInputChange} className={`input-field flex-1 text-xl font-bold tracking-widest ${getInputClass('cedula')}`} />
                </div>
              </div>
              <div>
                <label className="label-text">Ciudad</label>
                <input type="text" name="ciudad" placeholder="Ej: Caracas, Distrito Capital" value={formData.ciudad} onChange={handleInputChange} className={`input-field ${getInputClass('ciudad')}`} />
              </div>
              <div>
                <label className="label-text">Teléfono</label>
                <div className="flex space-x-1">
                  <select name="telefonoCarrier" value={formData.telefonoCarrier} onChange={handleInputChange} className={`input-field w-22 shrink-0 px-1 text-center font-bold ${getInputClass('telefonoCarrier')}`}>
                    <option value="0414">0414</option>
                    <option value="0424">0424</option>
                    <option value="0412">0412</option>
                    <option value="0416">0416</option>
                    <option value="0426">0426</option>
                    <option value="0212">0212</option>
                  </select>
                  <input type="text" name="telefono" placeholder="0000000" value={formData.telefono} onChange={handleInputChange} className={`input-field flex-1 text-xl font-bold tracking-widest ${getInputClass('telefono')}`} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="label-text">Dirección Completa</label>
              <input type="text" name="direccion" placeholder="Av. Principal, Edif. Centro, Piso 2, Apto 24" value={formData.direccion} onChange={handleInputChange} className={`input-field ${getInputClass('direccion')}`} />
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
                <input type="text" name="marca" placeholder="Ej: Samsung, Apple, Xiaomi" value={formData.marca} onChange={handleInputChange} className={`input-field ${getInputClass('marca')}`} />
              </div>
              <div>
                <label className="label-text">Modelo</label>
                <input type="text" name="modelo" placeholder="Ej: Galaxy S23, iPhone 15 Pro" value={formData.modelo} onChange={handleInputChange} className={`input-field ${getInputClass('modelo')}`} />
              </div>
              <div>
                <label className="label-text">Color</label>
                <input type="text" name="color" placeholder="Ej: Negro, Azul, Plata" value={formData.color} onChange={handleInputChange} className={`input-field ${getInputClass('color')}`} />
              </div>
              <div>
                <label className="label-text">Serial de Fábrica</label>
                <input type="text" name="serial" placeholder="Nº de serie del fabricante" value={formData.serial} onChange={handleInputChange} className={`input-field ${getInputClass('serial')}`} />
              </div>
              <div>
                <label className="label-text">IMEI 1</label>
                <input type="text" name="imei1" placeholder="15 dígitos" value={formData.imei1} onChange={handleInputChange} className={`input-field ${getInputClass('imei1')}`} />
              </div>
              <div>
                <label className="label-text">IMEI 2</label>
                <input type="text" name="imei2" placeholder="15 dígitos (opcional)" value={formData.imei2} onChange={handleInputChange} className={`input-field ${getInputClass('imei2')}`} />
              </div>
              <div>
                <label className="label-text">Nº Telefónico / Operadora</label>
                <input type="text" name="numTelefónico" placeholder="Ej: 0412-1234567 (Movistar)" value={formData.numTelefónico} onChange={handleInputChange} className={`input-field ${getInputClass('numTelefónico')}`} />
              </div>
              <div>
                <label className="label-text">Código de Desbloqueo (PIN/Patrón)</label>
                <input type="text" name="codigoDesbloqueo" placeholder="Ej: 1234 o 'Patrón en L'" value={formData.codigoDesbloqueo} onChange={handleInputChange} className={`input-field ${getInputClass('codigoDesbloqueo')}`} />
              </div>
              <div>
                <label className="label-text">Estado Físico</label>
                <select name="estadoFisico" value={formData.estadoFisico} onChange={handleInputChange} className="input-field appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%22%20fill%3D%22none%22%20stroke%3D%22%23718096%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.2em] bg-[right_0.5rem_center] bg-no-repeat">
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
                <input type="text" name="contactoEspecifico" placeholder="Ej: 0424-0000000" value={formData.contactoEspecifico} onChange={handleInputChange} className={`input-field ${getInputClass('contactoEspecifico')}`} />
              </div>
              <div>
                <label className="label-text">Rango de Fechas (Desde - Hasta)</label>
                <div className="flex items-center space-x-2">
                  <input type="date" name="fechaDesde" value={formData.fechaDesde} onChange={handleInputChange} className={`input-field text-xs ${getInputClass('fechaDesde')}`} />
                  <span className="text-xs">al</span>
                  <input type="date" name="fechaHasta" value={formData.fechaHasta} onChange={handleInputChange} className={`input-field text-xs ${getInputClass('fechaHasta')}`} />
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
