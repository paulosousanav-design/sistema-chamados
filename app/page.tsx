{/* LOGO, TÍTULO E ATALHOS DE NAVEGAÇÃO */}
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#0B1026', border: '2px solid rgba(255, 122, 0, 0.3)', borderRadius: '24px', padding: '16px', display: 'inline-block', marginBottom: '12px' }}>
            <img src="/logo.jpeg" alt="Chame o Técnico" style={{ height: '112px', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FF7A00', textTransform: 'uppercase', fontStyle: 'italic', margin: '8px 0 4px 0' }}>
            Abertura de Chamado
          </h1>
          <p style={{ color: '#B8C0CC', fontSize: '13px', margin: '0 0 16px 0' }}>Triagem profissional para suporte técnico especializado</p>
          
          {/* BARRA DE ATALHOS DAS OUTRAS PÁGINAS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <a href="/tecnico" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF7A00'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2E3B63'}>
              👨‍💻 Área do Técnico
            </a>
            <a href="/cadastro-parceiro" style={{ backgroundColor: '#0B1026', color: '#B8C0CC', border: '1px solid #2E3B63', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF7A00'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2E3B63'}>
              🤝 Cadastrar Parceiro
            </a>
            <a href="/admin" style={{ backgroundColor: '#0B1026', color: '#FF7A00', border: '1px solid rgba(255, 122, 0, 0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
              ⚙️ Central Admin
            </a>
          </div>
        </header>
