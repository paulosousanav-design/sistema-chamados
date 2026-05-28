// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Interfaces para tipagem dos dados
interface OrdenServico {
  id: string; 
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_endereco: string;
  categoria: string;
  sintomas: string;
  marca_modelo: string;
  status_triagem: string; 
  tecnico_id?: string | null;
  created_at?: string; 
  laudo_tecnico?: string;
  valor_pecas?: number;
  valor_mao_de_obra?: number;
  valor_orcamento?: number;
  fotos?: string[]; 
}

interface TecnicoParceiro {
  id: string; 
  nome_fantasia: string;
  nome: string;
  whatsapp: string;
  cep?: string; 
}

export default function PainelAdminCompleto() {
  const [chamados, setChamados] = useState<OrdenServico[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoParceiro[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Autenticação (A Mágica do Login)
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [filtroEquipamento, setFiltroEquipamento] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Verifica se você já está logado ao abrir a página
  useEffect(() => {
    async function verificarSessao() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAutenticado(true);
        fetchDados();
      } else {
        setLoading(false); // Libera para mostrar a tela de login
      }
    }
    verificarSessao();

    // Escuta mudanças no banco em tempo real (Realtime)
    const canalRealtime = supabase
      .channel('mudancas_os')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordens_servico' },
        () => {
          if (autenticado) fetchDadosSilencioso();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, [autenticado]);

  // Função de Login Seguro
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingLogin(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) throw error;

      setAutenticado(true);
      fetchDados();
    } catch (err: any) {
      alert(`Erro de Acesso: E-mail ou senha incorretos.`);
    } finally {
      setLoadingLogin(false);
    }
  }

  // Função para Sair (Logout)
  async function handleLogout() {
    await supabase.auth.signOut();
    setAutenticado(false);
    setChamados([]);
  }

  async function fetchDados() {
    try {
      setLoading(true);
      const { data: dataOS, error: errorOS } = await supabase.from('ordens_servico').select('*');
      if (errorOS) throw errorOS;
      
      setChamados((dataOS || []).map(os => ({
        ...os,
        id: String(os.id),
        tecnico_id: os.tecnico_id ? String(os.tecnico_id) : null
      })));

      let { data: dataTecnicos, error: errorTecnicos } = await supabase
        .from('parceiros_comerciais')
        .select('id, nome_fantasia, nome, whatsapp, cep');

      if (errorTecnicos) {
        const { data: dataVelha } = await supabase
        .from('tecnicos_parceiros')
        .select('id, nome_fantasia, nome, whatsapp, cep');
        dataTecnicos = dataVelha;
      }
      
      setTecnicos((dataTecnicos || []).map(tec => ({ ...tec, id: String(tec.id) })));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDadosSilencioso() {
    const { data: dataOS } = await supabase.from('ordens_servico').select('*');
    if (dataOS) {
      setChamados(dataOS.map(os => ({
        ...os,
        id: String(os.id),
        tecnico_id: os.tecnico_id ? String(os.tecnico_id) : null
      })));
    }
  }

  const handleVincularTecnico = async (osId: string, tecnicoId: string) => {
    const valorId = (tecnicoId === '' || !tecnicoId) ? null : tecnicoId;
    try {
      const { error } = await supabase.from('ordens_servico').update({ tecnico_id: valorId }).eq('id', osId); 
      if (error) throw error;
      setChamados(prev => prev.map(os => os.id === osId ? { ...os, tecnico_id: valorId } : os));
      alert('Técnico designado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao vincular: ${err.message}`);
    }
  };

  const handleAtualizarStatus = async (osId: string, novoStatus: string) => {
    try {
      const { error } = await supabase.from('ordens_servico').update({ status_triagem: novoStatus }).eq('id', osId);
      if (error) throw error;
      setChamados(prev => prev.map(os => os.id === osId ? { ...os, status_triagem: novoStatus } : os));
    } catch (err: any) {
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  const handleEncaminharWhats = (os: OrdenServico) => {
    const tecnico = tecnicos.find(t => t.id === os.tecnico_id);
    if (!tecnico) return alert('Selecione um técnico antes de enviar.');
    
    const foneTecnico = tecnico.whatsapp.replace(/\D/g, '');
    const linkRotaMaps = `http://googleusercontent.com/maps.google.com/dir/?api=1&origin=${encodeURIComponent(tecnico.cep || '')}&destination=${encodeURIComponent(os.cliente_endereco)}`;
    
    const msgWhatsApp = encodeURIComponent(
      `⚡ *NOVA ORDEM DE SERVIÇO*\n\n` +
      `Olá *${tecnico.nome_fantasia || tecnico.nome}*,\n` +
      `🛠️ *Categoria:* ${os.categoria}\n` +
      `🏷️ *Marca/Modelo:* ${os.marca_modelo || 'Não informada'}\n` +
      `📝 *Defeito:* ${os.sintomas}\n\n` +
      `📍 *ENDEREÇO DE VISITA:*\n${os.cliente_endereco}\n\n` +
      `🗺️ *ROTA MAPS:* ${linkRotaMaps}\n\n` +
      `👤 *CLIENTE:*\n${os.cliente_nome} - https://wa.me/${os.cliente_whatsapp.replace(/\D/g, '')}`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${foneTecnico}&text=${msgWhatsApp}`, '_blank');
  };

  const handleImprimir = (os: OrdenServico) => {
    const janela = window.open('', '_blank');
    if (!janela) return;
    janela.document.write(`
      <html>
        <head><title>OS #${os.id.substring(0,8)}</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2 style="text-align:center;">CHAME O TÉCNICO - COMPROVANTE</h2>
          <hr>
          <p><strong>Cliente:</strong> ${os.cliente_nome}</p>
          <p><strong>Endereço:</strong> ${os.cliente_endereco}</p>
          <p><strong>Equipamento:</strong> ${os.categoria} (${os.marca_modelo || 'N/A'})</p>
          <p><strong>Defeito Relatado:</strong> ${os.sintomas}</p>
          <hr>
          <p><strong>Laudo:</strong> ${os.laudo_tecnico || 'Pendente'}</p>
          <h3>VALOR TOTAL: R$ ${os.valor_orcamento ? os.valor_orcamento.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'A definir'}</h3>
          <script>setTimeout(() => { window.print(); window.close(); }, 300);</script>
        </body>
      </html>
    `);
    janela.document.close();
  };

  const obterDiasNumérico = (dataCriacao?: string): number => {
    if (!dataCriacao) return 0;
    return Math.floor((new Date().getTime() - new Date(dataCriacao).getTime()) / (1000 * 60 * 60 * 24));
  };

  // ============================================================================
  // TELA 1: BLOQUEIO DE LOGIN (Se não estiver autenticado)
  // ============================================================================
  if (!autenticado && !loading) {
    return (
      <div className="min-h-screen bg-[#0B1026] flex flex-col items-center justify-center p-4 font-sans border-t-4 border-[#FF7A00]">
        
        {/* LOGO EM DESTAQUE */}
        <header className="flex flex-col items-center justify-center mb-8 space-y-3 text-center">
          <div className="bg-[#0B1026] border-2 border-[#FF7A00]/30 rounded-3xl p-5 shadow-2xl shadow-[#FF7A00]/15 mb-2 transition-all">
            <img src="/logo.jpeg" alt="Chame o Técnico" className="h-28 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-[#FF7A00] uppercase tracking-wider italic">
            Central Administrativa
          </h1>
          <p className="text-[#B8C0CC] text-xs sm:text-sm font-medium">Acesso restrito a gestores autorizados</p>
        </header>

        <main className="w-full max-w-md bg-[#16213E] border border-[#2E3B63] rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[#B8C0CC] uppercase mb-1.5">E-mail do Gestor</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@chameotecnico.com" className="w-full bg-[#0B1026] border border-[#2E3B63] p-4 rounded-xl text-sm focus:outline-none focus:border-[#FF7A00] text-white" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#B8C0CC] uppercase mb-1.5">Senha de Acesso</label>
              <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" className="w-full bg-[#0B1026] border border-[#2E3B63] p-4 rounded-xl text-sm focus:outline-none focus:border-[#FF7A00] text-white tracking-widest" />
            </div>

            <button type="submit" disabled={loadingLogin} className="w-full bg-[#FF7A00] hover:bg-[#FF9200] text-white font-black p-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-[#FF7A00]/20 disabled:opacity-50 mt-2">
              {loadingLogin ? 'Autenticando...' : 'Entrar no Painel ➔'}
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Tela de Carregamento Transição
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1026] text-[#FFFFFF] flex items-center justify-center font-sans border-t-4 border-[#FF7A00]">
        <div className="text-center">
          <img src="/logo.jpeg" className="h-16 mb-4 animate-pulse mx-auto opacity-50" />
          <p className="text-xs font-bold tracking-widest text-[#FF7A00] uppercase">Sincronizando Central...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TELA 2: PAINEL ADMIN (SÓ APARECE DEPOIS DE LOGAR)
  // ============================================================================
  const chamadosOrdenados = [...chamados].sort((a, b) => {
    if (a.status_triagem === 'concluido' && b.status_triagem !== 'concluido') return 1;
    if (a.status_triagem !== 'concluido' && b.status_triagem === 'concluido') return -1;
    return obterDiasNumérico(b.created_at) - obterDiasNumérico(a.created_at);
  });

  return (
    <main className="min-h-screen bg-[#0B1026] p-6 font-sans text-[#FFFFFF]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabeçalho do Painel Logado */}
        <header className="flex flex-col gap-4 border-b border-[#2E3B63] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.jpeg" alt="Logo" className="h-12 rounded bg-[#16213E] p-1 border border-[#2E3B63]" />
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight italic text-[#FF7A00]">
                  Painel Central
                </h1>
                <p className="text-[#B8C0CC] text-[10px] uppercase font-bold mt-0.5">Sessão Segura Ativa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={fetchDados} className="bg-[#16213E] border border-[#2E3B63] hover:border-[#FF7A00] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
                🔄 Sincronizar
              </button>
              <button onClick={handleLogout} className="bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase">
                🚪 Sair
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Todas', 'Refrigeradores e Freezers', 'Máquina de Lavar / Lava e Seca', 'Ar Condicionado / Circuladores', 'Smart TVs', 'Outros Serviços'].map((cat) => (
              <button key={cat} onClick={() => setFiltroEquipamento(cat)} className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border-2 ${filtroEquipamento === cat ? 'bg-[#FF7A00] text-[#FFFFFF] border-[#FF7A00]' : 'bg-[#16213E] border-[#2E3B63] text-[#B8C0CC]'}`}>
                {cat === 'Todas' ? 'Ver Todas' : cat}
              </button>
            ))}
          </div>
        </header>

        {/* Lista de Ordens de Serviço */}
        <div className="grid grid-cols-1 gap-5">
          {chamadosOrdenados.filter(os => filtroEquipamento === 'Todas' || os.categoria === filtroEquipamento).map((os) => {
            const tecnicoAtual = tecnicos.find(t => t.id === os.tecnico_id);
            const diasAberto = obterDiasNumérico(os.created_at);

            return (
              <div key={os.id} className="bg-[#16213E] border border-[#2E3B63] rounded-2xl p-6 shadow-xl flex flex-col gap-5 transition-all hover:border-[#FF7A00]/30">
                
                {/* Infos do Chamado */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-[#0B1026] text-[#B8C0CC] text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-[#2E3B63]">OS #{os.id.substring(0, 8)}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border bg-[#0B1026] ${diasAberto === 0 ? 'text-emerald-400 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'}`}>
                      ⏱️ {diasAberto === 0 ? 'Aberta hoje' : `${diasAberto} dias aberta`}
                    </span>
                    <span className="bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">{os.status_triagem}</span>
                  </div>

                  <h2 className="text-lg font-bold text-white">{os.categoria} <span className="text-sm font-normal text-[#B8C0CC]">({os.marca_modelo || 'Modelo N/A'})</span></h2>
                  
                  <div className="text-xs text-[#B8C0CC] space-y-1">
                    <p>📍 <strong>Endereço:</strong> {os.cliente_endereco}</p>
                    <p>👤 <strong>Cliente:</strong> {os.cliente_nome} • {os.cliente_whatsapp}</p>
                  </div>

                  <p className="text-sm bg-[#0B1026] p-3 rounded-xl border border-[#2E3B63] text-white">
                    <span className="text-[#FF7A00] font-bold text-xs uppercase block mb-1">Defeito Relatado:</span> {os.sintomas}
                  </p>

                  {/* Orçamento e Fotos do Técnico */}
                  {os.laudo_tecnico && (
                    <div className="bg-[#0B1026] border border-[#FF7A00]/40 rounded-xl p-4 mt-4">
                      <p className="text-sm text-[#B8C0CC] mb-3"><strong className="text-white uppercase text-[10px]">Laudo do Técnico:</strong><br/>{os.laudo_tecnico}</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#16213E] p-2 rounded-lg border border-[#2E3B63]">
                          <p className="text-[9px] text-[#B8C0CC] uppercase font-bold">Peças</p>
                          <p className="text-sm font-bold text-white">R$ {os.valor_pecas}</p>
                        </div>
                        <div className="bg-[#16213E] p-2 rounded-lg border border-[#2E3B63]">
                          <p className="text-[9px] text-[#B8C0CC] uppercase font-bold">Serviço</p>
                          <p className="text-sm font-bold text-white">R$ {os.valor_mao_de_obra}</p>
                        </div>
                        <div className="bg-[#FF7A00]/20 p-2 rounded-lg border border-[#FF7A00]/40">
                          <p className="text-[9px] text-[#FF7A00] uppercase font-bold">Total</p>
                          <p className="text-sm font-black text-[#FF7A00]">R$ {os.valor_orcamento}</p>
                        </div>
                      </div>
                      
                      {/* Galeria de Evidências */}
                      {os.fotos && os.fotos.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3 pt-3 border-t border-[#2E3B63]">
                          {os.fotos.map((url, idx) => (
                            <img key={idx} src={url} onClick={() => window.open(url, '_blank')} className="w-full h-16 object-cover rounded-lg border border-[#2E3B63] hover:border-[#FF7A00] cursor-pointer shadow-sm" title="Ver foto em tamanho real" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Controles: Status, Técnico e Botões */}
                <div className="border-t border-[#2E3B63] pt-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <select value={os.status_triagem} onChange={(e) => handleAtualizarStatus(os.id, e.target.value)} className="bg-[#0B1026] border border-[#2E3B63] p-3 rounded-xl text-xs text-white font-bold cursor-pointer focus:border-[#FF7A00] outline-none">
                      <option value="pendente">⏳ Pendente</option>
                      <option value="em atendimento">👨‍💻 Em Atendimento</option>
                      <option value="aguardando_peca">📦 Aguardando Peça</option>
                      <option value="concluido">✅ Concluído</option>
                    </select>
                    <select value={os.tecnico_id || ''} onChange={(e) => handleVincularTecnico(os.id, e.target.value)} className="bg-[#0B1026] border border-[#2E3B63] p-3 rounded-xl text-xs text-white cursor-pointer focus:border-[#FF7A00] outline-none flex-1">
                      <option value="">-- Designar Técnico --</option>
                      {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome_fantasia || t.nome}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => handleEncaminharWhats(os)} className="bg-[#22C55E] hover:bg-[#1da84f] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md uppercase tracking-wider whitespace-nowrap transition-colors">
                      📲 Enviar OS
                    </button>
                    <button onClick={() => handleImprimir(os)} className="bg-[#16213E] border border-[#2E3B63] hover:border-[#FF7A00] text-white text-xs px-4 py-3 rounded-xl transition-colors">
                      🖨️
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
