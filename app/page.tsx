'use client';

import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [categoria, setCategoria] = useState('');
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [marcaModelo, setMarcaModelo] = useState('');
  
  // Estados para o endereço inteligente por CEP
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

  // Estados para gerenciamento de fotos do defeito
  const [fotosBase64, setFotosBase64] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const opcoesSintomas: Record<string, string[]> = {
    'Refrigeradores e Freezers': [
      'Não está gelando na parte de baixo',
      'Não está gelando nada (completamente parado)',
      'Fazendo barulho excessivo ou estalos',
      'Vazando água por baixo ou dentro',
      'Formando muito gelo (bloqueio de ar)',
      'Alarme apitando ou piscando painel',
      'Motor tenta ligar mas desliga em seguida'
    ],
    'Máquina de Lavar / Lava e Seca': [
      'Não liga ou painel fica piscando',
      'Não joga a água para fora (bomba)',
      'Não entra água ou demora muito',
      'Não centrifuga (fica rodando devagar)',
      'Fazendo barulho muito forte no ciclo de centrifugação',
      'Vazando água por baixo',
      'Painel mostra código de erro (Ex: IE, OE, dE, UE)'
    ],
    'Ar Condicionado / Circulador de Ar': [
      'Não gela (apenas sopra vento / ar fresco)',
      'Vazando água para dentro do cômodo (pingando)',
      'Não liga ou não responde ao controle remoto',
      'Desliga sozinho depois de alguns minutos',
      'Forte barulho na unidade externa ou trepidação',
      'Congelando a tubulação ou as colmeias',
      'Circulador de ar com hélice travada ou fraca'
    ],
    'Smart TVs': [
      'Tela com som mas sem imagem (escura)',
      'Não liga (nem o LED de standby acende)',
      'Liga e desliga sozinha em loop',
      'Linhas verticais ou horizontais na tela',
      'Imagem piscando ou trêmula',
      'Não conecta no Wi-Fi'
    ],
    'Outros Serviços': [
      'O equipamento não liga',
      'Apresentando mensagem de erro no painel',
      'Peça quebrada ou dano físico visível',
      'Barulho ou cheiro anormal',
      'Outro problema (descreva no campo de Marca/Modelo abaixo)'
    ]
  };

  const styles = {
    main: {
      backgroundColor: '#0B1026',
      color: '#FFFFFF',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      borderTop: '4px solid #FF7A00'
    },
    card: {
      width: '100%',
      maxWidth: '650px',
      backgroundColor: '#16213E',
      border: '1px solid #2E3B63',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    input: {
      width: '100%',
      backgroundColor: '#0B1026',
      border: '1px solid #2E3B63',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      color: '#FFFFFF',
      marginTop: '4px',
      boxSizing: 'border-box' as const,
      outline: 'none'
    },
    label: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#B8C0CC',
      display: 'block'
    },
    btnSubmit: {
      width: '100%',
      backgroundColor: '#FF7A00',
      color: '#FFFFFF',
      fontWeight: '900',
      padding: '16px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginTop: '16px',
      boxShadow: '0 10px 15px -3px rgba(255, 122, 0, 0.2)'
    }
  };
    },
    card: {
      width: '100%',
      maxWidth: '650px',
      backgroundColor: '#16213E',
      border: '1px solid #2E3B63',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
    },
    input: {
      width: '100%',
      backgroundColor: '#0B1026',
      border: '1px solid #2E3B63',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      color: '#FFFFFF',
      marginTop: '4px',
      boxSizing: 'border-box' as const,
      outline: 'none'
    },
    label: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#B8C0CC',
      display: 'block'
    },
    btnSubmit: {
      width: '100%',
      backgroundColor: '#FF7A00',
      color: '#FFFFFF',
      fontWeight: '900',
      padding: '16px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginTop: '16px',
      boxShadow: '0 10px 15px -3px rgba(255, 122, 0, 0.2)'
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); 
    if (input.length > 11) input = input.substring(0, 11); 

    if (input.length > 6) {
      input = `(${input.substring(0, 2)}) ${input.substring(2, 7)}-${input.substring(7)}`;
    } else if (input.length > 2) {
      input = `(${input.substring(0, 2)}) ${input.substring(2)}`;
    } else if (input.length > 0) {
      input = `(${input}`;
    }
    setWhatsapp(input);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 8) value = value.substring(0, 8); 

    let cepFormatado = value;
    if (value.length > 5) {
      cepFormatado = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    setCep(cepFormatado);

    if (value.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await res.json();
        
        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(`${data.localidade} - ${data.uf}`);
        } else {
          alert('CEP não encontrado. Por favor, digite o endereço manualmente.');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (fotosBase64.length + filesArray.length > 3) {
        alert('Você pode enviar no máximo 3 fotos do equipamento.');
        return;
      }
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setFotosBase64((prev) => [...prev, reader.result as string]);
          }
        };
        {/* LOGO, TÍTULO E ATALHOS DE NAVEGAÇÃO */}
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#0B1026', border: '2px solid rgba(255, 122, 0, 0.3)', borderRadius: '24px', padding: '16px', display: 'inline-block', marginBottom: '12px' }}>
            <img src="/logo.jpeg" alt="Chame o Técnico" style={{ height: '112px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FF7A00', textTransform: 'uppercase', fontStyle: 'italic', margin: '8px 0 4px 0' }}>
            Abertura de Chamado
          </h1>
          <p style={{ color: '#B8C0CC', fontSize: '13px', margin: '0 0 16px 0' }}>Triagem profissional para suporte técnico especializado</p>
          
          {/* BARRA DE ATALHOS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <a href="/tecnico" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              👨‍💻 Área do Técnico
            </a>
            <a href="/cadastro-parceiro" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              🤝 Cadastrar Parceiro
            </a>
            <a href="/admin" style={{ backgroundColor: '#0B1026', color: '#FF7A00', border: '1px solid rgba(255, 122, 0, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              ⚙️ Central Admin
            </a>
          </div>
        </header>
  const removerFoto = (indexInput: number) => {
    setFotosBase64(fotosBase64.filter((_, i) => i !== indexInput));
  };

  const handleSintomaToggle = (sintoma: string) => {
    if (sintomas.includes(sintoma)) {
      setSintomas(sintomas.filter(s => s !== sintoma));
    } else {
      setSintomas([...sintomas, sintoma]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoria || sintomas.length === 0 || !nome || !whatsapp || !cep || !rua || !numero || !cidade) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione os sintomas.');
      return;
    }

    setLoading(true);
    const enderecoCompleto = `${rua}, Nº ${numero}${complemento ? ` (${complemento})` : ''} - Bairro: ${bairro} - ${cidade} - CEP: ${cep}`;

    try {
      const { error } = await supabase.from('ordens_servico').insert([
        {
          cliente_nome: nome,
          cliente_whatsapp: whatsapp,
          cliente_endereco: enderecoCompleto,
          categoria: categoria,
          sintomas: sintomas.join(', '), 
          marca_modelo: marcaModelo,     
          status_triagem: 'pendente',
          fotos: fotosBase64
        }
      ]);

      if (error) throw error;
      setSucesso(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar o chamado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        
        {/* LOGO, TÍTULO E ATALHOS DE NAVEGAÇÃO */}
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#0B1026', border: '2px solid rgba(255, 122, 0, 0.3)', borderRadius: '24px', padding: '16px', display: 'inline-block', marginBottom: '12px' }}>
            <img src="/logo.jpeg" alt="Chame o Técnico" style={{ height: '112px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FF7A00', textTransform: 'uppercase', fontStyle: 'italic', margin: '8px 0 4px 0' }}>
            Abertura de Chamado
          </h1>
          <p style={{ color: '#B8C0CC', fontSize: '13px', margin: '0 0 16px 0' }}>Triagem profissional para suporte técnico especializado</p>
          
          {/* BARRA DE ATALHOS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <a href="/tecnico" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              👨‍💻 Área do Técnico
            </a>
            <a href="/cadastro-parceiro" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              🤝 Cadastrar Parceiro
            </a>
            <a href="/admin" style={{ backgroundColor: '#0B1026', color: '#FF7A00', border: '1px solid rgba(255, 122, 0, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              ⚙️ Central Admin
            </a>
          </div>
        </header>

        {sucesso ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF7A00', marginBottom: '8px' }}>Chamado Enviado com Sucesso!</h2>
            <p style={{ color: '#B8C0CC', fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
              Nossa central já recebeu seus dados e sintomas. Um técnico especializado entrará em contato via WhatsApp em instantes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Passo 1: Categoria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={styles.label}>1. Qual equipamento precisa de manutenção?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {Object.keys(opcoesSintomas).map((cat) => {
                  const icones: Record<string, string> = {
                    'Refrigeradores e Freezers': '🧊',
                    'Máquina de Lavar / Lava e Seca': '🧺',
                    'Ar Condicionado / Circulador de Ar': '🌬️',
                    'Smart TVs': '📺',
                    'Outros Serviços': '➕'
                  };
                  const isSelected = categoria === cat;
                  return (
                    <button
                      key={cat;
                      type="button"
                      onClick={() => { setCategoria(cat); setSintomas([]); }}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #FF7A00' : '1px solid #2E3B63',
                        backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.1)' : '#0B1026',
                        color: isSelected ? '#FF7A00' : '#B8C0CC',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{icones[cat]}</span>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passo 2: Sintomas Dinâmicos */}
            {categoria && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={styles.label}>
                    2. O que o equipamento está apresentando? (Selecione todos que se aplicam)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {opcoesSintomas[categoria].map((sintoma) => {
                      const isSelected = sintomas.includes(sintoma);
                      return (
                        <button
                          key={sintoma}
                          type="button"
                          onClick={() => handleSintomaToggle(sintoma)}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid #FF7A00' : '1px solid #2E3B63',
                            backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.1)' : '#0B1026',
                            color: isSelected ? '#FF7A00' : '#B8C0CC',
                            textAlign: 'left',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{sintoma}</span>
                          {isSelected && <span style={{ color: '#FF7A00', fontWeight: 'bold' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campo de Marca/Modelo */}
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#B8C0CC', fontWeight: '500' }}>Marca, Modelo ou Detalhes adicionais (Opcional)</span>
                  <input
                    type="text"
                    value={marcaModelo}
                    onChange={(e) => setMarcaModelo(e.target.value)}
                    style={styles.input}
                    placeholder="Ex: Electrolux Frost Free, Split LG Inverter 12000"
                  />
                </div>

                {/* Campo de Fotos do Defeito */}
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#B8C0CC', fontWeight: '500' }}>Fotos do Equipamento ou Defeito (Opcional - Máx 3)</span>
                  <div style={{ border: '2px dashed #2E3B63', borderRadius: '12px', padding: '16px', backgroundColor: '#0B1026', textAlign: 'center', position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={fotosBase64.length >= 3}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <div>
                      <span style={{ fontSize: '24px', display: 'block' }}>📸</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF', display: 'block', margin: '4px 0' }}>Clique para anexar ou tirar foto</span>
                      <span style={{ fontSize: '12px', color: '#B8C0CC', display: 'block' }}>Formatos: JPG, PNG</span>
                    </div>
                  </div>

                  {/* Listagem das miniaturas */}
                  {fotosBase64.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
                      {fotosBase64.map((foto, index) => (
                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2E3B63', height: '96px' }}>
                          <img src={foto} alt="Defeito" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removerFoto(index)}
                            style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(220, 38, 38, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Passo 3: Dados de Contato e Endereço */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2E3B63', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={styles.label}>3. Seus dados e endereço para a visita</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Nome Completo</span>
                  <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} placeholder="Ex: João Silva" />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>WhatsApp (com DDD)</span>
                  <input type="tel" required value={whatsapp} onChange={handleWhatsappChange} style={styles.input} placeholder="Ex: (67) 99999-9999" />
                </div>
              </div>

              {/* CEP inteligente */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Digite seu CEP</span>
                  <input type="text" required maxLength={9} value={cep} onChange={handleCepChange} style={styles.input} placeholder="Ex: 79950-000" />
                  {loadingCep && <span style={{ fontSize: '12px', color: '#FF7A00', display: 'block', marginTop: '4px' }}>Buscando endereço...</span>}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Cidade / UF</span>
                  <input type="text" disabled value={cidade} style={{ ...styles.input, color: '#B8C0CC', opacity: 0.8 }} placeholder="Preenchido automaticamente" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Rua / Logradouro</span>
                  <input type="text" required value={rua} onChange={(e) => setRua(e.target.value)} style={styles.input} placeholder="Rua, Avenida..." />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Número</span>
                  <input type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} style={styles.input} placeholder="Nº" />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Bairro</span>
                <input type="text" required value={bairro} onChange={(e) => setBairro(e.target.value)} style={styles.input} placeholder="Bairro" />
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#B8C0CC' }}>Complemento / Referência (Opcional)</span>
                <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} style={styles.input} placeholder="Ex: Próximo ao mercado" />
              </div>

            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading || loadingCep}
              style={{ ...styles.btnSubmit, opacity: (loading || loadingCep) ? 0.5 : 1 }}
            >
              {loading ? 'Processando Triagem...' : '🚀 Solicitar Atendimento Técnico'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
