/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Settings, Lock, Database, Globe, ArrowLeft, ExternalLink, ShieldCheck, Printer, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


export default function App() {
  const formRef = useRef<HTMLFormElement>(null);
  const [view, setView] = useState<'form' | 'login' | 'admin'>('form');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [adminForms, setAdminForms] = useState<any[]>([]);
  const [adminPosts, setAdminPosts] = useState<any[]>([]);
  const [neoConfig, setNeoConfig] = useState({
    apiKey: 'postgresql://neondb_owner:npg_XsEZ1lTGtKO2@ep-falling-firefly-ai6dlr3t-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    endpoint: 'https://ais-pre-zz47w7ss726okqsjxvcd4x-16027451891.us-east1.run.app',
    status: 'connecting'
  });
  const [uniqueCode, setUniqueCode] = useState('PENDIENTE_DE_GENERAR');
  const [isPrinting, setIsPrinting] = useState(false);
  const [validationModal, setValidationModal] = useState<string[]>([]);
  const [sha256Modal, setSha256Modal] = useState<string | null>(null);

  // Placeholder hints (shown in inputs when empty — NOT pre-filled values)
  const PLACEHOLDERS = {
    nombre: 'Ej: Juan Alberto Pérez García',
    cedula: '12.345.678',
    cedulaPrefix: 'V',
    ciudad: 'Ej: Caracas, Distrito Capital',
    telefono: '0000000',
    telefonoCarrier: '0414',
    direccion: 'Av. Principal, Edif. Centro, Piso 2, Apto 24',
    marca: 'Ej: Samsung, Apple, Xiaomi',
    modelo: 'Ej: Galaxy S23, iPhone 15 Pro',
    color: 'Ej: Negro, Azul, Plata',
    serial: 'Número de serie del fabricante',
    imei1: '15 dígitos',
    imei2: '15 dígitos (opcional)',
    numTelefónico: 'Ej: 0412-1234567 (Movistar)',
    codigoDesbloqueo: "Ej: 1234 o 'Patrón en L'",
    contactoEspecifico: 'Ej: 0424-0000000',
  };

  const REQUIRED_FIELD_LABELS: Record<string, string> = {
    nombre: 'Nombre Completo',
    cedula: 'Cédula / Identificación',
    ciudad: 'Ciudad',
    telefono: 'Teléfono',
    direccion: 'Dirección Completa',
    marca: 'Marca del Dispositivo',
    modelo: 'Modelo del Dispositivo',
    color: 'Color',
    serial: 'Serial de Fábrica',
    imei1: 'IMEI 1',
    numTelefónico: 'Nº Telefónico / Operadora',
    codigoDesbloqueo: 'Código de Desbloqueo',
    contactoEspecifico: 'Contacto Específico',
    fechaDesde: 'Fecha Desde',
    fechaHasta: 'Fecha Hasta',
  };

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    cedulaPrefix: 'V',
    ciudad: '',
    telefono: '',
    telefonoCarrier: '0414',
    direccion: '',
    marca: '',
    modelo: '',
    color: '',
    serial: '',
    imei1: '',
    imei2: '',
    numTelefónico: '',
    codigoDesbloqueo: '',
    estadoFisico: 'Optimo',
    aplicacionObjeto: 'WhatsApp',
    contactoEspecifico: '',
    fechaDesde: '',
    fechaHasta: '',
    aislamiento: true,
    calculoHash: true,
  });

  // Returns styling based on whether the field has been filled in
  const getInputClass = (name: keyof typeof formData) => {
    if (typeof formData[name] === 'boolean') return '';
    const val = formData[name] as string;
    if (!val) return 'border-slate-700';  // empty — neutral
    return 'text-emerald-400 border-emerald-500/30'; // filled — green
  };


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
    // Validate ALL required fields
    const missing = Object.entries(REQUIRED_FIELD_LABELS)
      .filter(([key]) => {
        const val = formData[key as keyof typeof formData];
        return typeof val === 'string' && val.trim() === '';
      })
      .map(([, label]) => label);

    if (missing.length > 0) {
      setValidationModal(missing);
      return;
    }

    setIsPrinting(true);
    try {
      // 1. Save to DB first so we have the SHA256 before printing
      const id = await saveForm();
      // If saving failed, uniqueCode stays as-is but we still print
      if (id) {
        // Let React re-render with the new uniqueCode
        await new Promise(r => setTimeout(r, 200));
      }
    } catch {
      // Don't block printing if save fails
    }
    window.print();
    setIsPrinting(false);
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
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block">Contraseña</label>
              <input
                type="password"
                className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
      <>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
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
                        onChange={(e) => setNeoConfig({ ...neoConfig, apiKey: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 mb-1 block">Vercel Deployment URL</label>
                      <input
                        type="text"
                        placeholder="https://tu-app.vercel.app"
                        className="w-full bg-[#1a202e] border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
                        value={neoConfig.endpoint}
                        onChange={(e) => setNeoConfig({ ...neoConfig, endpoint: e.target.value })}
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
                        onClick={neoConfig.status === 'connected'
                          ? () => setNeoConfig(prev => ({ ...prev, status: 'disconnected' }))
                          : saveNeoConfig}
                        className={`text-xs font-bold px-4 py-2 rounded-md transition-all active:scale-95 ${neoConfig.status === 'connected'
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                          }`}
                      >
                        {neoConfig.status === 'connected' ? 'Desconectar' : 'Conectar'}
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
                            <td
                              className="px-6 py-4 font-mono text-emerald-500/70 text-[10px] cursor-pointer hover:text-emerald-400 transition-colors select-none"
                              title="Clic para ver SHA256 completo"
                              onClick={() => setSha256Modal(form.sha256 ?? null)}
                            >
                              {form.sha256 ? form.sha256.substring(0, 16) + '...' : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button className="p-2 hover:text-emerald-400 transition-colors" title="Ver detalles">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 hover:text-red-400 transition-colors text-slate-500"
                                  title="Eliminar planilla"
                                  onClick={async () => {
                                    if (!confirm(`¿Eliminar la planilla de ${form.nombre} (${form.cedula})?`)) return;
                                    try {
                                      const res = await fetch(`/api/forms/${form.sha256}`, { method: 'DELETE' });
                                      if (res.ok) {
                                        fetchAdminData(); // Refresh from DB to stay synced with Neon
                                      } else {
                                        alert('Error al eliminar la planilla.');
                                      }
                                    } catch {
                                      alert('Error de conexión al eliminar.');
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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

        {/* ── SHA256 Full Hash Popup ─────────────────────── */}
        {sha256Modal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSha256Modal(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(145deg,#0f172a,#111827)',
                border: '1px solid rgba(16,185,129,0.35)',
                borderRadius: '16px',
                maxWidth: '560px',
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))', borderBottom: '1px solid rgba(16,185,129,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <div>
                    <p style={{ color: '#34d399', fontWeight: 700, fontSize: '13px', margin: 0 }}>Hash SHA-256 Completo</p>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>Identificador único del documento forense</p>
                  </div>
                </div>
                <button onClick={() => setSha256Modal(null)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}>✕</button>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '14px 16px', wordBreak: 'break-all', fontFamily: '"JetBrains Mono",monospace', fontSize: '12px', color: '#34d399', letterSpacing: '0.04em', lineHeight: '1.7' }}>
                  {sha256Modal}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(sha256Modal ?? ''); }}
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '8px 16px', color: '#34d399', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >Copiar</button>
                  <button
                    onClick={() => setSha256Modal(null)}
                    style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 16px', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-300 font-sans selection:bg-emerald-500/30" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body { font-family: 'Inter', sans-serif; }

        /* ── PRINT ─────────────────────────────────── */
        @media print {
          @page { size: legal portrait; margin: 1.5cm; }

          /* Make everything invisible */
          body { visibility: hidden !important; background: white !important; margin: 0; padding: 0; }

          /* Reveal the print sheet */
          #print-sheet {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 99999 !important;
            background: white !important;
            color: black !important;
            font-family: 'Inter', Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          #print-sheet * {
            visibility: visible !important;
            background: white !important;
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
            border-color: #ccc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        /* ── SCROLLBAR ─────────────────────────────── */
        .custom-scrollbar::-webkit-scrollbar { width:4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background:#1a202e; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background:#2d3748; border-radius:10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#10b981; }

        /* ── INPUT FIELD ───────────────────────────── */
        .input-field {
          background: rgba(15,23,42,0.8);
          border: 1px solid #2d3748;
          border-radius: 8px;
          padding: 10px 14px;
          width: 100%;
          color: white;
          font-size: 13px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          -webkit-appearance: none;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.18);
          font-weight: 300;
          letter-spacing:0.02em;
        }
        .input-field:focus {
          outline: none;
          border-color: #10b981;
          background: rgba(15,23,42,1);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12), 0 0 12px rgba(16,185,129,0.06);
        }
        .input-field:hover:not(:focus) { border-color: #3d4f63; }

        /* ── LABEL ─────────────────────────────────── */
        .label-text {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
          display: block;
        }

        /* ── SECTION CARD ──────────────────────────── */
        .form-card {
          background: rgba(22,27,42,0.7);
          border: 1px solid rgba(45,55,72,0.8);
          border-radius: 14px;
          padding: 24px;
          backdrop-filter: blur(8px);
          transition: border-color 0.25s;
        }
        .form-card:hover { border-color: rgba(16,185,129,0.18); }

        /* ── SECTION BADGE ─────────────────────────── */
        .section-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          font-size: 10px;
          font-weight: 700;
          color: #34d399;
          flex-shrink:0;
        }

        /* ── DATE INPUTS ───────────────────────────── */
        input[type='date']::-webkit-calendar-picker-indicator {
          filter: invert(0.5) sepia(1) hue-rotate(120deg);
          cursor: pointer;
          opacity: 0.7;
        }

        /* ── CHECKBOX ──────────────────────────────── */
        .check-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(15,23,42,0.6);
          border: 1px solid #2d3748;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .check-card:hover { border-color: rgba(16,185,129,0.45); background: rgba(16,185,129,0.04); }
        .check-card input[type='checkbox'] { accent-color: #10b981; width:16px; height:16px; margin-top:2px; flex-shrink:0; }

        /* ── PRINT BTN ─────────────────────────────── */
        .btn-print {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #0a0f1c;
          font-weight: 700;
          font-size: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35);
          letter-spacing: 0.02em;
        }
        .btn-print:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.4); }
        .btn-print:active { transform: translateY(0); }

        /* ── RESPONSIVE HELPERS ────────────────────── */
        @media (max-width: 639px) {
          .form-card { padding: 16px; }
          .date-range-wrap { flex-direction: column; }
          .date-range-wrap span { text-align:center; }
        }
      `}} />

      <div className="max-w-4xl mx-auto print-container px-4 py-6 md:px-6 md:py-10">

        {/* ── TOP BAR: ID + Logo ── */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          {/* SHA256 Badge */}
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">ID Planilla</span>
            </div>
            <p className="font-mono text-[10px] text-slate-500 unique-code-print pl-1">
              SHA256: <span className="text-emerald-400 font-bold">{uniqueCode}</span>
            </p>
          </div>
          {/* Logo + Admin btn */}
          <div className="flex flex-col items-end gap-2">
            <div className="logo-container border border-slate-700/80 bg-[#161b2a] px-5 py-3 rounded-xl text-right" style={{ boxShadow: '0 0 30px rgba(16,185,129,0.06)' }}>
              <h1 className="text-2xl font-bold tracking-tighter logo-text">
                <span className="text-emerald-400">SHA</span><span className="text-white">256</span><span className="text-slate-400">.US</span>
              </h1>
              <p className="text-[9px] text-emerald-500/70 uppercase tracking-widest font-semibold">Forensic Laboratory Operations</p>
            </div>
            <button
              onClick={() => setView('login')}
              className="no-print flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors px-1"
            >
              <Settings className="w-3 h-3" />
              <span>Panel de Control</span>
            </button>
          </div>
        </div>

        <form ref={formRef} className="space-y-5">
          {/* Section I */}
          <section className="form-card space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
              <span className="section-badge">I</span>
              <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title uppercase">Datos del Solicitante y Autorización</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Nombre Completo</label>
                <input type="text" name="nombre" placeholder="Ej: Juan Alberto Pérez García" value={formData.nombre} onChange={handleInputChange} className={`input-field ${getInputClass('nombre')}`} />
              </div>
              <div>
                <label className="label-text">Cédula / Identificación</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <select
                    name="cedulaPrefix"
                    value={formData.cedulaPrefix}
                    onChange={handleInputChange}
                    style={{ width: '60px', flexShrink: 0 }}
                    className={`input-field text-center font-bold text-base ${getInputClass('cedulaPrefix')}`}
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="J">J</option>
                    <option value="G">G</option>
                    <option value="P">P</option>
                  </select>
                  <input
                    type="text"
                    name="cedula"
                    placeholder="12.345.678"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    style={{ flex: 1, minWidth: 0 }}
                    className={`input-field font-bold tracking-wider ${getInputClass('cedula')}`}
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Ciudad</label>
                <input type="text" name="ciudad" placeholder="Ej: Caracas, Distrito Capital" value={formData.ciudad} onChange={handleInputChange} className={`input-field ${getInputClass('ciudad')}`} />
              </div>
              <div>
                <label className="label-text">Teléfono</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                  <select
                    name="telefonoCarrier"
                    value={formData.telefonoCarrier}
                    onChange={handleInputChange}
                    style={{ width: '76px', flexShrink: 0 }}
                    className={`input-field text-center font-bold ${getInputClass('telefonoCarrier')}`}
                  >
                    <option value="0414">0414</option>
                    <option value="0424">0424</option>
                    <option value="0412">0412</option>
                    <option value="0416">0416</option>
                    <option value="0426">0426</option>
                    <option value="0212">0212</option>
                  </select>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="0000000"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    style={{ flex: 1, minWidth: 0 }}
                    className={`input-field font-bold tracking-wider ${getInputClass('telefono')}`}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">Dirección Completa</label>
                <input type="text" name="direccion" placeholder="Av. Principal, Edif. Centro, Piso 2, Apto 24" value={formData.direccion} onChange={handleInputChange} className={`input-field ${getInputClass('direccion')}`} />
              </div>
            </div>

            <div className="bg-emerald-500/5 border-l-2 border-emerald-500 p-4 rounded-r-lg text-xs leading-relaxed italic text-slate-400">
              "Yo, el arriba identificado, en pleno uso de mis facultades mentales <span className="text-emerald-400 font-semibold not-italic accent-text">AUTORIZO EXPRESA Y VOLUNTARIAMENTE</span> su acceso, exploración y extracción forense de datos. Para ello, renuncio temporalmente a mi derecho al secreto de las comunicaciones <span className="text-emerald-500/70">(Arts. 48 y 60 de la Constitución de la República Bolivariana de Venezuela)</span>, única y exclusivamente a favor de los expertos designados y para los fines técnicos aquí descritos."
            </div>
          </section>

          {/* Section II */}
          <section className="form-card space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
              <span className="section-badge">II</span>
              <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title uppercase">Descripción del Dispositivo (Dispositivo Matriz)</h2>
            </div>
            <p className="text-[11px] font-medium text-slate-300 flex items-center gap-2"><span className="text-emerald-500">›</span> Hago entrega material voluntaria del siguiente equipo bajo la figura de Obtención por Consignación.</p>

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
          <section className="form-card space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
              <span className="section-badge">III</span>
              <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title uppercase">Alcance de la Extracción y Análisis</h2>
            </div>
            <p className="text-[11px] font-medium text-slate-300 flex items-center gap-2"><span className="text-emerald-500">›</span> Solicito la aplicación de herramientas forenses para la extracción lógica/física de "Mensajes de Datos", delimitado estrictamente a:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label-text">Aplicación Objeto</label>
                <select name="aplicacionObjeto" value={formData.aplicacionObjeto} onChange={handleInputChange} className="input-field text-emerald-400 font-bold">
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
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="label-text">Rango de Fechas (Desde – Hasta)</label>
                <div className="date-range-wrap flex items-center gap-2">
                  <input type="date" name="fechaDesde" value={formData.fechaDesde} onChange={handleInputChange} className={`input-field text-xs flex-1 min-w-0 ${getInputClass('fechaDesde')}`} />
                  <span className="text-slate-500 text-xs shrink-0">al</span>
                  <input type="date" name="fechaHasta" value={formData.fechaHasta} onChange={handleInputChange} className={`input-field text-xs flex-1 min-w-0 ${getInputClass('fechaHasta')}`} />
                </div>
              </div>
            </div>
          </section>

          {/* Section IV */}
          <section className="form-card space-y-5">
            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
              <span className="section-badge">IV</span>
              <h2 className="text-emerald-400 font-bold text-sm tracking-wide section-title uppercase">Requerimientos Técnicos y de Preservación</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="check-card">
                <input type="checkbox" name="aislamiento" checked={formData.aislamiento} onChange={handleInputChange} />
                <div>
                  <p className="text-xs font-bold text-slate-100 mb-0.5">Aislamiento de Señal</p>
                  <p className="text-[10px] text-slate-400">Modo Avión / Bolsa Faraday. Impide recepción remota durante el análisis.</p>
                </div>
              </label>
              <label className="check-card">
                <input type="checkbox" name="calculoHash" checked={formData.calculoHash} onChange={handleInputChange} />
                <div>
                  <p className="text-xs font-bold text-slate-100 mb-0.5">Cálculo de Hash de Integridad</p>
                  <p className="text-[10px] text-slate-400">Algoritmo SHA-256 / MD5 para cadena de custodia forense.</p>
                </div>
              </label>
            </div>
          </section>

          {/* Signatures */}
          <div className="form-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center space-y-3">
                <div className="signature-box border border-dashed border-slate-600/70 h-28 rounded-xl bg-slate-900/30 flex items-center justify-center">
                  <span className="text-[10px] text-slate-600 uppercase tracking-widest">Firma y Huella Dactilar</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">El Solicitante</p>
                  <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">{formData.nombre}</p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="signature-box border border-dashed border-slate-600/70 h-28 rounded-xl bg-slate-900/30 flex items-center justify-center">
                  <span className="text-[10px] text-slate-600 uppercase tracking-widest">Sello y Firma Institucional</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expertos Forenses</p>
                  <p className="text-xs text-slate-300 uppercase font-medium mt-0.5">Área de Análisis de Telefonía Móvil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-1 pt-2">
            <p className="text-[10px] text-slate-600 italic footer-note">
              Nota: Este documento tiene validez legal al ser consignado ante el Ministerio Público o Tribunales competentes.
            </p>
          </div>
        </form>

        {/* ── Validation Modal ─────────────────────────────────── */}
        <AnimatePresence>
          {validationModal.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="no-print fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
              onClick={() => setValidationModal([])}
            >
              <motion.div
                initial={{ scale: 0.92, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(145deg, #0f172a, #111827)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '16px',
                  maxWidth: '440px',
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                }}
              >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#ef4444" /></svg>
                  </div>
                  <div>
                    <p style={{ color: '#f87171', fontWeight: 700, fontSize: '14px', margin: 0 }}>Campos incompletos</p>
                    <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0' }}>Completa los siguientes campos antes de descargar</p>
                  </div>
                </div>
                {/* Field list */}
                <div style={{ padding: '16px 20px', maxHeight: '280px', overflowY: 'auto' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationModal.map(label => (
                      <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ color: '#ef4444', fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>✕</span>
                        <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 500 }}>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(45,55,72,0.8)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setValidationModal([])}
                    style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}
                  >
                    Entendido, completar datos
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-800/60">
          <p className="text-[11px] text-slate-500">Abre el gestor de impresión y guarda la acción en la base de datos.</p>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="btn-print w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPrinting ? (
              <>
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                Generando...
              </>
            ) : (
              <>
                <Printer size={16} strokeWidth={2.5} />
                Generar
              </>
            )}
          </button>
        </div>

        {/* Static print document — hidden on screen, shown only when printing */}
        <div
          id="print-sheet"
          style={{
            display: 'none',
            background: '#ffffff',
            color: '#000000',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '11px',
            lineHeight: '1.5',
            padding: '0',
          }}
        >
          {/* Logo row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: '4px' }}>ID PLANILLA</div>
              <div style={{ fontFamily: 'monospace', fontSize: '8px', color: '#333' }}>SHA256: <strong>{uniqueCode}</strong></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.04em' }}>SHA256.US</div>
              <div style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>Forensic Laboratory Operations</div>
            </div>
          </div>

          {/* Section helper */}
          {([
            ['I. DATOS DEL SOLICITANTE Y AUTORIZACIÓN', [
              ['NOMBRE COMPLETO', formData.nombre],
              ['CÉDULA', `${formData.cedulaPrefix}-${formData.cedula}`],
              ['CIUDAD', formData.ciudad],
              ['TELÉFONO', `${formData.telefonoCarrier}-${formData.telefono}`],
              ['DIRECCIÓN', formData.direccion],
            ]],
            ['II. DESCRIPCIÓN DEL DISPOSITIVO (DISPOSITIVO MATRIZ)', [
              ['MARCA', formData.marca],
              ['MODELO', formData.modelo],
              ['COLOR', formData.color],
              ['SERIAL DE FÁBRICA', formData.serial],
              ['IMEI 1', formData.imei1],
              ['IMEI 2', formData.imei2],
              ['Nº TELEFÓNICO / OPERADORA', formData.numTelefónico],
              ['CÓDIGO DE DESBLOQUEO', formData.codigoDesbloqueo],
              ['ESTADO FÍSICO', formData.estadoFisico],
            ]],
            ['III. ALCANCE DE LA EXTRACCIÓN Y ANÁLISIS', [
              ['APLICACIÓN OBJETO', formData.aplicacionObjeto],
              ['CONTACTO ESPECÍFICO', formData.contactoEspecifico],
              ['RANGO DE FECHAS', `${formData.fechaDesde} — ${formData.fechaHasta}`],
            ]],
            ['IV. REQUERIMIENTOS TÉCNICOS Y DE PRESERVACIÓN', [
              ['AISLAMIENTO DE SEÑAL (MODO AVIÓN/FARADAY)', formData.aislamiento ? 'SÍ' : 'NO'],
              ['CÁLCULO DE HASH (SHA-256/MD5)', formData.calculoHash ? 'SÍ' : 'NO'],
            ]],
          ] as [string, [string, string][]][]).map(([title, fields]) => (
            <div key={title} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
              <div style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #999', paddingBottom: '4px', marginBottom: '8px', color: '#111' }}>{title}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                {fields.map(([label, val]) => (
                  <div key={label} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                    <div style={{ fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontWeight: 600, color: '#000', wordBreak: 'break-word' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Authorization quote */}
          <div style={{ borderLeft: '3px solid #10b981', padding: '8px 12px', background: '#f0fdf4', marginBottom: '16px', color: '#333', fontStyle: 'italic', fontSize: '9.5px', lineHeight: '1.5' }}>
            "Yo, el arriba identificado, en pleno uso de mis facultades mentales <strong style={{ fontStyle: 'normal' }}>AUTORIZO EXPRESA Y VOLUNTARIAMENTE</strong> su acceso, exploración y extracción forense de datos. Para ello, renuncio temporalmente a mi derecho al secreto de las comunicaciones (Arts. 48 y 60 de la Constitución de la República Bolivariana de Venezuela), única y exclusivamente a favor de los expertos designados y para los fines técnicos aquí descritos."
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
            {[['El Solicitante', formData.nombre], ['Expertos Forenses', 'Área de Análisis de Telefonía Móvil']].map(([role, name]) => (
              <div key={role} style={{ textAlign: 'center' }}>
                <div style={{ border: '1px dashed #999', height: '80px', background: '#fafafa', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '8px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role === 'El Solicitante' ? 'Firma y Huella Dactilar' : 'Sello y Firma Institucional'}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', color: '#333' }}>{role}</div>
                <div style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', marginTop: '2px' }}>{name}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            <p style={{ fontSize: '8px', color: '#888', fontStyle: 'italic' }}>Nota: Este documento tiene validez legal al ser consignado ante el Ministerio Público o Tribunales competentes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
