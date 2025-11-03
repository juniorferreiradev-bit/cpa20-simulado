import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [simulados, setSimulados] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    aprovados: 0,
    reprovados: 0,
    mediaGeral: 0,
    ultimaRealizacao: null,
    melhorNota: 0,
    tendencia: 'estavel'
  });
  const [statsPorModulo, setStatsPorModulo] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('usuario_email');
    if (!email) {
      router.push('/');
      return;
    }
    setUsuario(email);
    carregarDados(email);
  }, []);

  const carregarDados = async (email) => {
    try {
      const q = query(
        collection(db, 'simulados'),
        where('usuario', '==', email),
        orderBy('dataRealizacao', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const sims = [];
      snapshot.forEach((doc) => {
        sims.push({ id: doc.id, ...doc.data() });
      });

      setSimulados(sims);
      calcularEstatisticas(sims);
      calcularPorModulo(sims);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setLoading(false);
    }
  };

  const calcularEstatisticas = (sims) => {
    if (sims.length === 0) {
      setLoading(false);
      return;
    }

    const total = sims.length;
    const aprovados = sims.filter(s => s.score >= 70).length;
    const reprovados = total - aprovados;
    const mediaGeral = (sims.reduce((sum, s) => sum + s.score, 0) / total).toFixed(1);
    const melhorNota = Math.max(...sims.map(s => s.score));
    const ultimaRealizacao = sims[0]?.dataRealizacao;

    let tendencia = 'estavel';
    if (sims.length >= 6) {
      const ultimos3 = sims.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / 3;
      const primeiros3 = sims.slice(-3).reduce((sum, s) => sum + s.score, 0) / 3;
      
      if (ultimos3 > primeiros3 + 5) tendencia = 'subindo';
      else if (ultimos3 < primeiros3 - 5) tendencia = 'descendo';
    }

    setStats({
      total,
      aprovados,
      reprovados,
      mediaGeral,
      ultimaRealizacao,
      melhorNota,
      tendencia
    });
  };

  const calcularPorModulo = (sims) => {
    const modulos = {
      1: { acertos: 0, total: 0, nome: 'Sistema Financeiro' },
      2: { acertos: 0, total: 0, nome: 'Compliance' },
      3: { acertos: 0, total: 0, nome: 'Ética' },
      4: { acertos: 0, total: 0, nome: 'Fundos de Investimento' },
      5: { acertos: 0, total: 0, nome: 'Instrumentos' },
      6: { acertos: 0, total: 0, nome: 'Tributação' }
    };

    sims.forEach(sim => {
      if (sim.respostasPorModulo) {
        Object.entries(sim.respostasPorModulo).forEach(([mod, dados]) => {
          if (modulos[mod]) {
            modulos[mod].acertos += dados.acertos || 0;
            modulos[mod].total += dados.total || 0;
          }
        });
      }
    });

    const statsModulo = Object.entries(modulos).map(([num, dados]) => ({
      numero: num,
      nome: dados.nome,
      aproveitamento: dados.total > 0 ? ((dados.acertos / dados.total) * 100).toFixed(1) : 0,
      acertos: dados.acertos,
      total: dados.total
    }));

    setStatsPorModulo(statsModulo);
  };

  const novoSimulado = () => {
    router.push('/simulado/selecao');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>📊 Meu Dashboard</h1>
            <p className="usuario-email">{usuario}</p>
          </div>
          <button className="btn-novo-simulado" onClick={novoSimulado}>
            ➕ Novo Simulado
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card-total">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-label">Total de Simulados</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card card-aprovados">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Aprovados (≥70%)</div>
            <div className="stat-value">{stats.aprovados}</div>
          </div>
        </div>

        <div className="stat-card card-reprovados">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-label">Reprovados (<70%)</div>
            <div className="stat-value">{stats.reprovados}</div>
          </div>
        </div>

        <div className="stat-card card-media">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Média Geral</div>
            <div className="stat-value">{stats.mediaGeral}%</div>
            <div className="stat-tendencia">
              {stats.tendencia === 'subindo' && '📈 Melhorando'}
              {stats.tendencia === 'descendo' && '📉 Atenção'}
              {stats.tendencia === 'estavel' && '➡️ Estável'}
            </div>
          </div>
        </div>

        <div className="stat-card card-melhor">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-label">Melhor Nota</div>
            <div className="stat-value">{stats.melhorNota}%</div>
          </div>
        </div>
      </div>

      {/* Continua com gráficos e histórico... */}
      
      <style jsx>{`/* Estilos completos do dashboard */`}</style>
    </div>
  );
}