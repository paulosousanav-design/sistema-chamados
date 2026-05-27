'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PortalTecnico() {
  const [etapa, setEtapa] = useState<'login' | 'token' | 'painel' | 'os_detalhe'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [token, setToken] = useState('');
  const [tecnicoLogado, setTecnicoLogado] = useState<any>(null);

  const [minhasOrdens, setMinhasOrdens] = useState<any[]>([]);
  const [osSelecionada, setOsSelecionada] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Estados financeiros separados
  const [laudo, setLaudo] = useState('');
  const [valorPecas, setValorPecas] = useState('');
  const [valorMaoDeObra, setValorMaoDeObra] = useState('');
  const [fotosSelecionadas, setFotosSelecionadas] = useState<File[]>([]);

  async function pedirAcesso(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    
    const numeroLimpo = whatsapp.replace(/\D/g, '');
    const { data, error } = await supabase
      .from('parceiros_comerciais')
      .select('*')
      .like('whatsapp', `%${numeroLimpo}%`)
      .single();

    if (error || !data) {
      alert('WhatsApp não encontrado na base. Fale com o Admin.');
      setCarregando(false);
      return;
    }

    setTecnicoLogado(data);
    alert(`Token enviado para o seu WhatsApp! (Para teste, use: 123456)`);
    setEtapa('token');
    setCarregando(false);
  }

  function verificarToken(e: React.FormEvent) {
    e.preventDefault();
    if (token === '123456') {
      setEtapa('painel');
      carregarMinhasOrdens(tecnicoLogado.id);
    } else {
      alert('Código inválido!');
    }
  }

  async function carregarMinhasOrdens(tecId: string) {
    setCarregando(true);
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .eq('tecnico_id', tecId)
      .neq('status_triagem', 'concluido')
      .order('created_at', { ascending: false });

    if (data) setMinhasOrdens(data);
    setCarregando(false);
  }

  function handleSelecionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      if (arquivos.length < 4 || arquivos.length > 8) {
        alert('Atenção: É obrigatório enviar entre 4 e 8 fotos do serviço!');
        e.target.value = ''; // Limpa a seleção
        return;
      }
      setFotosSelecionadas(arquivos);
    }
  }

  async function enviarParaAprovacao(e: React.FormEvent) {
    e.preventDefault();
    if (fotosSelecionadas.length < 4 || fotosSelecionadas.length > 8) {
      return alert('Anexe de 4 a 8 fotos antes de enviar.');
    }
    
    setCarregando(true);
    
    try {
      const urlsFotos: string[] = [];

      // Upload das fotos para o Storage
      for (let i = 0; i < fotosSelecionadas.length; i++) {
        const foto = fotosSelecionadas[i];
        const extensao = foto.name.split('.').pop();
        const nomeArquivo = `${osSelecionada.id}/${Date.now()}-${i}.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from('os-fotos')
          .upload(nomeArquivo, foto, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('os-fotos')
          .getPublicUrl(nomeArquivo);

        if (urlData?.publicUrl) {
          urlsFotos.push(urlData.publicUrl);
        }
      }

      const pecasNum = valorPecas ? parseFloat(valorPecas) : 0;
      const maoDeObraNum = valorMaoDeObra ? parseFloat(valorMaoDeObra) : 0;
      const totalOrcamento = pecasNum + maoDeObraNum;

      // Update na OS com laudo, valores e links das fotos
      const { error } = await supabase
        .from('ordens_servico')
        .update({
          laudo_tecnico: laudo,
          valor_pecas: pecasNum,
          valor_mao_de_obra: maoDeObraNum,
          valor_orcamento: totalOrcamento,
          fotos: urlsFotos,
          status_triagem: 'aguardando_peca'
        })
        .eq('id', osSelecionada.id);

      if (error) throw error;

      alert('Orçamento, laudo e fotos enviados com sucesso para a Central!');
      setEtapa('painel');
      setOsSelecionada(null);
      setLaudo('');
      setValorPecas('');
      setValorMaoDeObra('');
      setFotosSelecionadas([]);
      carregarMinhasOrdens(tecnicoLogado.id);
    } catch (err: any) {
      alert('Erro ao enviar dados e fotos: ' + err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1026] text-[#FFFFFF] font-sans flex flex-col items-center border-t-4 border-[#FF7A00]">
      
      {/* HEADER MOBILE PADRONIZADO */}
      <header className="w-full bg-[#16213E] p-5 border-b border-[#2E3B63] shadow-md text-center sticky top-0 z-10">
        {/* LOGO PADRONIZADO 'chameotécnico' */}
        <h1 className="text-xl font-black uppercase tracking-tight italic">
          <span className="text-[#B8C0CC]">chameo</span><span className="text-[#FF7A00]">técnico</span> <span className="text-white font-light text-xs">| PORTAL</span>
        </h1>
        {tecnicoLogado && etapa !== 'login' && etapa !== 'token' && (
          <p className="text-[10px] text-[#B8C0CC] mt-1">Bem-vindo, {tecnicoLogado.nome_fantasia || tecnicoLogado.nome}</p>
        )}
      </header>

      <main className="w-full max-w-md p-5 flex-1">
        
        {/* ETAPA 1: LOGIN */}
        {etapa === 'login' && (
          <form onSubmit={pedirAcesso} className="bg-[#16213E] p-6 rounded-2xl border border-[#2E3B63] shadow-xl mt-10">
            <h2 className="text-lg font-bold mb-2">Acesso Técnico</h2>
            <p className="text-xs text-[#B8C0CC] mb-6">Digite seu WhatsApp para receber o código.</p>
            
            <input 
              type="tel" 
              required
              placeholder="(DD) 99999-9999" 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full bg-[#0B1026] border border-[#2E3B63] p-4 rounded-xl text-[#FFFFFF] mb-4 focus:outline-none focus:border-[#FF7A00]"
            />
            
            <button 
              type="submit" 
              disabled={carregando}
              className="w-full bg-[#FF7A00] hover:bg-[#FF9200] text-white font-black p-4 rounded-xl uppercase tracking-wider disabled:opacity-50 transition-colors shadow-lg shadow-[#FF7A00]/10"
            >
              {carregando ? 'Buscando cadastro...' : 'Receber Código'}
            </button>
          </form>
        )}

        {/* ETAPA 2: TOKEN */}
        {etapa === 'token' && (
          <form onSubmit={verificarToken} className="bg-[#16213E] p-6 rounded-2xl border border-[#2E3B63] shadow-xl mt-10 text-center">
            <h2 className="text-lg font-bold mb-2">Verificação</h2>
            <p className="text-xs text-[#B8C0CC] mb-6">Digite o código enviado para o seu WhatsApp.</p>
            
            <input 
              type="text" 
              required
              maxLength={6}
              placeholder="000000" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#0B1026] border border-[#2E3B63] p-4 rounded-xl text-[#FFFFFF] mb-4 text-center text-3xl font-black tracking-widest focus:outline-none focus:border-[#FF7A00]"
            />
            
            {/* Botão VERDE para confirmação (Sucesso) */}
            <button type="submit" className="w-full bg-[#22C55E] hover:bg-[#1da84f] text-white font-black p-4 rounded-xl uppercase tracking-wider transition-colors mb-3 shadow-md shadow-[#22C55E]/10">
              Confirmar Acesso
            </button>
            <button type="button" onClick={() => setEtapa('login')} className="text-xs text-[#B8C0CC] underline">
              Voltar / Trocar número
            </button>
          </form>
        )}

        {/* ETAPA 3: PAINEL DE OS */}
        {etapa === 'painel' && (
          <div className="space-y-4 pb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-[#B8C0CC] uppercase tracking-widest">Meus Atendimentos Ativos</h2>
              <button onClick={() => carregarMinhasOrdens(tecnicoLogado.id)} className="text-[#FF7A00] text-xs font-bold">🔄 Atualizar</button>
            </div>
            
            {carregando && <p className="text-center text-[#FF7A00] animate-pulse">Sincronizando Ordens...</p>}
            
            {!carregando && minhasOrdens.length === 0 && (
              <div className="text-center bg-[#16213E] p-8 rounded-2xl border border-[#2E3B63]">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-[#B8C0CC] text-sm">Ótimo trabalho! A sua fila está vazia.</p>
              </div>
            )}

            {minhasOrdens.map(os => (
              <div key={os.id} className="bg-[#16213E] p-5 rounded-2xl border border-[#2E3B63] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF7A00]"></div>
                <div className="flex justify-between items-start mb-2 pl-1">
                  <span className="text-[10px] bg-[#0B1026] text-[#B8C0CC] px-2.5 py-1 rounded border border-[#2E3B63]">OS #{os.id.substring(0,6)}</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold ${
                    os.status_triagem === 'aguardando_peca' ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'bg-blue-900/30 text-blue-400'
                  }`}>{os.status_triagem}</span>
                </div>
                
                <h3 className="font-bold text-lg mb-1 pl-1 text-white">{os.categoria}</h3>
                <p className="text-sm text-[#B8C0CC] mb-3 line-clamp-2 pl-1">Defeito: {os.sintomas}</p>
                <p className="text-xs text-[#B8C0CC] mb-4 pl-1">📍 {os.cliente_endereco}</p>
                
                <button 
                  onClick={() => { setOsSelecionada(os); setEtapa('os_detalhe'); }}
                  className="w-full bg-[#0B1026] border border-[#2E3B63] hover:border-[#FF7A00] text-white p-3.5 rounded-xl font-bold transition-colors text-sm"
                >
                  Abrir para Lançamento ➔
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ETAPA 4: DETALHE E EXECUÇÃO */}
        {etapa === 'os_detalhe' && osSelecionada && (
          <div className="pb-10 space-y-5">
            <button onClick={() => setEtapa('painel')} className="text-[#FF7A00] text-sm font-bold">
              ← Voltar à lista
            </button>

            <div className="bg-[#16213E] p-5 rounded-2xl border border-[#2E3B63] shadow-lg">
              <h2 className="font-bold text-lg text-white">{osSelecionada.categoria}</h2>
              <p className="text-sm text-[#B8C0CC] mb-2">{osSelecionada.marca_modelo || 'Marca/Modelo não informada'}</p>
              
              <div className="bg-[#0B1026] p-3 rounded-xl border border-[#2E3B63] mb-4">
                <p className="text-[10px] text-[#FF7A00] font-bold uppercase mb-1.5 tracking-wider">Defeito Relatado:</p>
                <p className="text-sm text-white">{osSelecionada.sintomas}</p>
              </div>
              
              <p className="text-xs text-[#B8C0CC]"><strong>Cliente:</strong> <span className="text-white">{osSelecionada.cliente_nome}</span></p>
              <p className="text-xs text-[#B8C0CC] mt-1"><strong>Endereço:</strong> <span className="text-white">{osSelecionada.cliente_endereco}</span></p>
            </div>

            <form onSubmit={enviarParaAprovacao} className="space-y-5 bg-[#16213E] p-5 rounded-2xl border border-[#2E3B63]">
              <h3 className="text-sm font-bold text-[#FF7A00] uppercase tracking-widest border-b border-[#2E3B63] pb-2">Área de Lançamento</h3>
              
              {/* Fotos */}
              <div>
                <label className="block text-xs font-bold text-[#B8C0CC] uppercase mb-2">📷 Fotos (Mín: 4, Máx: 8)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  required
                  onChange={handleSelecionarFotos}
                  className="w-full text-xs text-[#B8C0CC] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF7A00] file:text-white"
                />
                {fotosSelecionadas.length > 0 && (
                  <p className="text-xs text-green-400 mt-2 font-bold pl-1">✓ {fotosSelecionadas.length} foto(s) pronta(s) para upload.</p>
                )}
              </div>

              {/* Laudo */}
              <div>
                <label className="block text-xs font-bold text-[#B8C0CC] uppercase mb-2">📝 Laudo / Peças Necessárias</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Descreva a análise técnica e o que precisa ser trocado..."
                  value={laudo}
                  onChange={(e) => setLaudo(e.target.value)}
                  className="w-full bg-[#0B1026] border border-[#2E3B63] p-3.5 rounded-xl text-sm focus:outline-none focus:border-[#FF7A00] text-white"
                />
              </div>

              {/* Valores Separados */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#B8C0CC] uppercase mb-2">💎 Custo Peças (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={valorPecas}
                    onChange={(e) => setValorPecas(e.target.value)}
                    className="w-full bg-[#0B1026] border border-[#2E3B63] p-3.5 rounded-xl text-lg font-bold focus:outline-none focus:border-[#FF7A00] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#B8C0CC] uppercase mb-2">🛠️ Mão de Obra (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={valorMaoDeObra}
                    onChange={(e) => setValorMaoDeObra(e.target.value)}
                    className="w-full bg-[#0B1026] border border-[#2E3B63] p-3.5 rounded-xl text-lg font-bold focus:outline-none focus:border-[#FF7A00] text-white"
                  />
                </div>
              </div>

              {/* Botão VERDE para sucesso */}
              <button 
                type="submit" 
                disabled={carregando}
                className="w-full bg-[#22C55E] hover:bg-[#1da84f] text-white font-black p-4.5 rounded-2xl uppercase tracking-wider transition-colors disabled:opacity-50 mt-4 shadow-md shadow-[#22C55E]/10"
              >
                {carregando ? 'A enviar laudo e carregar fotos...' : '🚀 Enviar Orçamento Completo'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}