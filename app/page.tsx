"use client";

import React from 'react';

export default function Home() {
  // Estilos embutidos para garantir que o Next.js compile sem arquivos externos
  const containerStyle = {
    maxWidth: '600px',
    margin: '3rem auto',
    padding: '2rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    fontFamily: 'Arial, sans-serif',
    color: '#f8fafc'
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    marginTop: '0.5rem',
    marginBottom: '1.25rem',
    boxSizing: 'border-box' as const,
    fontSize: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    padding: '0.85rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontWeight: 'bold' as const,
    fontSize: '1rem',
    cursor: 'pointer'
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '1px', color: '#f8fafc' }}>
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center', color: '#ea580c', marginBottom: '1.5rem' }}>
          CHAME O TÉCNICO - Ordem de Serviço
        </h2>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <label style={{ fontWeight: 'bold' }}>Nome do Cliente / Empresa:</label>
          <input type="text" style={inputStyle} placeholder="Ex: Eletrônica Paulista" required />

          <label style={{ fontWeight: 'bold' }}>Equipamento / Modelo:</label>
          <input type="text" style={inputStyle} placeholder="Ex: Nobreak NHS Premium 3000VA" required />

          <label style={{ fontWeight: 'bold' }}>Descrição do Defeito:</label>
          <textarea rows={4} style={inputStyle} placeholder="Descreva os sintomas ou componentes avariados..." required></textarea>

          <label style={{ fontWeight: 'bold' }}>Prioridade:</label>
          <select style={inputStyle} required>
            <option value="baixa">Baixa (Manutenção Preventiva)</option>
            <option value="media">Média (Equipamento de Bancada)</option>
            <option value="alta">Alta (Equipamento Indisponível / Urgente)</option>
          </select>

          <button type="submit" style={buttonStyle}>
            Gravar Chamado Técnico
          </button>
        </form>
      </div>
    </div>
  );
}
