"use client";

import React, { useState } from 'react';

export default function Home() {
  return (
    <div className="html body">
      <div className="form-container">
        <h2 style={{ textAlign: 'center', color: '#ea580c', marginBottom: '1.5rem' }}>
          CHAME O TÉCNICO - Ordem de Serviço
        </h2>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Nome do Cliente / Empresa:</label>
          <input type="text" placeholder="Ex: Eletrônica Paulista" required />

          <label>Equipamento / Modelo:</label>
          <input type="text" placeholder="Ex: Nobreak NHS Premium 3000VA" required />

          <label>Descrição do Defeito:</label>
          <textarea rows={4} placeholder="Descreva os sintomas ou componentes avariados..." required></textarea>

          <label>Prioridade:</label>
          <select required>
            <option value="baixa">Baixa (Manutenção Preventiva)</option>
            <option value="media">Média (Equipamento de Bancada)</option>
            <option value="alta">Alta (Equipamento Indisponível / Urgente)</option>
          </select>

          <button type="submit" className="btn-primary">
            Gravar Chamado Técnico
          </button>
        </form>
      </div>
    </div>
  );
}
