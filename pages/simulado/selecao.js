import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function SelecaoSimulado() {
  const [simuladosDisponiveis, setSimuladosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('usuario_email')) {
      router.push('/');
      return;
    }
    carregarSimulados();
  }, []);

  const carregarSimulados = async () => {
    try {
      const q = query(collection(db, 'questoes'), where('ativa', '==', 'SIM'));
      const snapshot = await getDocs(q);
      
      const simulados = {};
      snapshot.forEach((doc) => {
        const questao = doc.data();
        const simuladoCod = questao.id.match(/^S\d+/)?.[0];
        
        if (simuladoCod) {
          if (!simulados[simuladoCod]) {
            simulados[simuladoCod] = {
              codigo: simuladoCod,
              nome: `Simulado ${simuladoCod.replace('S', '')}`,
              questoes: []
            };
          }
          simulados[simuladoCod].questoes.push(questao.id);
        }
      });

      setSimuladosDisponiveis(Object.values(simulados).sort((a, b) => a.codigo.localeCompare(b.codigo)));
      setLoading(false);
    } catch (err) {
      console.error('Erro:', err);
      setLoading(false);
    }
  };

  const iniciarSimulado = (tipo, codigo = null) => {
    if (tipo === 'especifico' && codigo) {
      router.push(`/simulado/[tipo]?tipo=${tipo}&codigo=${codigo}`);
    } else if (tipo === 'aleatorio') {
      router.push(`/simulado/[tipo]?tipo=aleatorio`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando simulados...</p>
      </div>
    );
  }

  return (
    <div className="selecao-container">
      <div className="header-selecao">
        <h1>📚 Escolha seu Simulado</h1>
        <p>Selecione o tipo de simulado que deseja realizar</p>
        <button className="btn-voltar" onClick={() => router.push('/dashboard')}>
          ← Voltar ao Dashboard
        </button>
      </div>

      <div className="opcoes-grid">
        {/* OPÇÃO 1: ALEATÓRIO */}
        <div className="card-opcao card-aleatorio">
          <div className="card-icon">🎲</div>
          <h2>Questões Aleatórias</h2>
          <p className="card-descricao">
            60 questões selecionadas aleatoriamente de todos os módulos
          </p>
          <button className="btn btn-primary btn-full" onClick={() => iniciarSimulado('aleatorio')}>
            Iniciar Simulado Aleatório
          </button>
        </div>

        {/* OPÇÃO 2: ESPECÍFICOS */}
        <div className="card-opcao card-especifico">
          <div className="card-icon">🎯</div>
          <h2>Simulados Específicos</h2>
          <p className="card-descricao">
            Escolha um simulado completo na ordem original
          </p>
          
          <div className="lista-simulados">
            {simuladosDisponiveis.map((sim) => (
              <div 
                key={sim.codigo} 
                className="item-simulado"
                onClick={() => iniciarSimulado('especifico', sim.codigo)}
              >
                <div className="simulado-info">
                  <h3>{sim.nome}</h3>
                  <p>{sim.questoes.length} questões</p>
                </div>
                <button className="btn btn-secondary">
                  Iniciar →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .selecao-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }

        .header-selecao {
          text-align: center;
          color: white;
          margin-bottom: 40px;
        }

        .header-selecao h1 {
          font-size: 36px;
          margin: 0 0 10px 0;
        }

        .header-selecao p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .btn-voltar {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-voltar:hover {
          background: rgba(255,255,255,0.3);
        }

        .opcoes-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .card-opcao {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          transition: transform 0.3s ease;
        }

        .card-opcao:hover {
          transform: translateY(-10px);
        }

        .card-icon {
          font-size: 64px;
          text-align: center;
          margin-bottom: 20px;
        }

        .card-opcao h2 {
          text-align: center;
          color: #333;
          margin: 0 0 15px 0;
        }

        .card-descricao {
          text-align: center;
          color: #666;
          margin-bottom: 25px;
        }

        .lista-simulados {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
        }

        .item-simulado {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .item-simulado:hover {
          background: #e0e0e0;
        }

        .simulado-info h3 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .simulado-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: scale(1.05);
        }

        .btn-secondary {
          background: #4caf50;
          color: white;
        }

        .btn-full {
          width: 100%;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .opcoes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
