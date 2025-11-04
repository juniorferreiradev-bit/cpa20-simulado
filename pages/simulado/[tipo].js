import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Simulado() {
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [tempo, setTempo] = useState(3600); // 60 minutos
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { tipo, codigo } = router.query;

  useEffect(() => {
    if (!localStorage.getItem('usuario_email')) {
      router.push('/');
      return;
    }
    if (tipo) carregarQuestoes();
  }, [tipo, codigo]);

  const carregarQuestoes = async () => {
    try {
      let q;
      
      if (tipo === 'especifico' && codigo) {
        q = query(
          collection(db, 'questoes'),
          where('id', '>=', codigo + 'Q1'),
          where('id', '<', codigo + 'Z')
        );
      } else {
        q = query(collection(db, 'questoes'));
      }

      const snapshot = await getDocs(q);
      let questoesCarregadas = [];
      snapshot.forEach((doc) => {
        questoesCarregadas.push({ id: doc.id, ...doc.data() });
      });

      // Se aleatório, embaralha e pega 60
      if (tipo === 'aleatorio') {
        questoesCarregadas = questoesCarregadas
          .sort(() => Math.random() - 0.5)
          .slice(0, 60);
      }

      setQuestoes(questoesCarregadas);
      setLoading(false);
    } catch (err) {
      console.error('Erro:', err);
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTempo(t => {
        if (t <= 1) {
          clearInterval(interval);
          finalizarSimulado();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selecionarResposta = (opcao) => {
    setRespostas({
      ...respostas,
      [indiceAtual]: opcao
    });
  };

  const proximaQuestao = () => {
    if (indiceAtual < questoes.length - 1) {
      setIndiceAtual(indiceAtual + 1);
    }
  };

  const questaoAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual(indiceAtual - 1);
    }
  };

  const finalizarSimulado = async () => {
    // Calcular score
    let acertos = 0;
    questoes.forEach((q, idx) => {
      if (respostas[idx] === q.resposta) {
        acertos++;
      }
    });

    const score = Math.round((acertos / questoes.length) * 100);

    // Salvar no Firebase
    const usuario = localStorage.getItem('usuario_email');
    await addDoc(collection(db, 'simulados'), {
      usuario,
      tipo,
      codigo,
      dataRealizacao: Timestamp.now(),
      totalQuestoes: questoes.length,
      acertos,
      score,
      respostas,
      tempo: 3600 - tempo
    });

    router.push(`/simulado/resultado?score=${score}&acertos=${acertos}&total=${questoes.length}`);
  };

  if (loading) {
    return <div className="loading">Carregando simulado...</div>;
  }

  const questaoAtual = questoes[indiceAtual];
  const respostaAtual = respostas[indiceAtual];

  return (
    <div className="simulado-container">
      <div className="simulado-header">
        <div className="info-simulado">
          <h2>Questão {indiceAtual + 1} de {questoes.length}</h2>
          <div className="progresso">
            <div 
              className="barra-progresso" 
              style={{ width: `${((indiceAtual + 1) / questoes.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="timer" style={{ color: tempo < 300 ? '#f44336' : '#333' }}>
          ⏱️ {formatarTempo(tempo)}
        </div>
      </div>

      <div className="simulado-content">
        <div className="questao-box">
          <h3>{questaoAtual.enunciado}</h3>

          {questaoAtual.imagem && (
            <div className="questao-imagem">
              <img src={questaoAtual.imagem} alt="Questão" />
            </div>
          )}

          <div className="opcoes">
            {Object.entries(questaoAtual.opcoes).map(([letra, texto]) => (
              <div
                key={letra}
                className={`opcao ${respostaAtual === letra ? 'selecionada' : ''}`}
                onClick={() => selecionarResposta(letra)}
              >
                <input
                  type="radio"
                  name="resposta"
                  value={letra}
                  checked={respostaAtual === letra}
                  onChange={() => selecionarResposta(letra)}
                />
                <label>
                  <strong>{letra})</strong> {texto}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="navegacao">
          <button
            className="btn btn-nav"
            onClick={questaoAnterior}
            disabled={indiceAtual === 0}
          >
            ← Anterior
          </button>

          <div className="info-navegacao">
            {Object.keys(respostas).length} / {questoes.length} respondidas
          </div>

          {indiceAtual === questoes.length - 1 ? (
            <button className="btn btn-finalizar" onClick={finalizarSimulado}>
              Finalizar Simulado ✓
            </button>
          ) : (
            <button className="btn btn-nav" onClick={proximaQuestao}>
              Próxima →
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .simulado-container {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
        }

        .simulado-header {
          background: white;
          padding: 20px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .timer {
          font-size: 20px;
          font-weight: bold;
        }

        .progresso {
          background: #ddd;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }

        .barra-progresso {
          background: linear-gradient(90deg, #667eea, #764ba2);
          height: 100%;
          transition: width 0.3s ease;
        }

        .simulado-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .questao-box {
          background: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .questao-box h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
          line-height: 1.6;
        }

        .questao-imagem {
          text-align: center;
          margin: 20px 0;
        }

        .questao-imagem img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
        }

        .opcoes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .opcao {
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .opcao:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .opcao.selecionada {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .opcao input {
          cursor: pointer;
        }

        .opcao label {
          cursor: pointer;
          margin: 0;
        }

        .navegacao {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .btn {
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .btn-nav {
          background: #667eea;
          color: white;
        }

        .btn-nav:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn-nav:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-finalizar {
          background: #4caf50;
          color: white;
        }

        .btn-finalizar:hover {
          background: #45a049;
        }

        .info-navegacao {
          color: #666;
          font-weight: bold;
        }

        .loading {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}
```

---

## 📄 ARQUIVO 6: pages/simulado/resultado.js

```javascript
import { useRouter } from 'next/router';
import AvaliacaoGamificada from '../../components/AvaliacaoGamificada';

export default function Resultado() {
  const router = useRouter();
  const { score, acertos, total } = router.query;

  const handleNovoSimulado = () => {
    router.push('/simulado/selecao');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="resultado-container">
      <div className="resultado-card">
        <h1>🎉 Simulado Concluído!</h1>

        {score && (
          <>
            <AvaliacaoGamificada nota={parseInt(score)} />

            <div className="detalhes">
              <div className="detalhe-item">
                <span className="label">Questões Certas:</span>
                <span className="valor">{acertos}/{total}</span>
              </div>
              <div className="detalhe-item">
                <span className="label">Percentual:</span>
                <span className="valor">{Math.round((acertos/total)*100)}%</span>
              </div>
              <div className="detalhe-item">
                <span className="label">Status:</span>
                <span className={`valor status ${parseInt(score) >= 70 ? 'aprovado' : 'reprovado'}`}>
                  {parseInt(score) >= 70 ? '✅ APROVADO' : '❌ REPROVADO'}
                </span>
              </div>
            </div>

            <div className="botoes-acao">
              <button className="btn btn-primario" onClick={handleNovoSimulado}>
                ➕ Novo Simulado
              </button>
              <button className="btn btn-secundario" onClick={handleDashboard}>
                📊 Ir para Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .resultado-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .resultado-card {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }

        .resultado-card h1 {
          color: #333;
          margin: 0 0 30px 0;
        }

        .detalhes {
          background: #f5f5f5;
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
        }

        .detalhe-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #ddd;
        }

        .detalhe-item:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: bold;
          color: #666;
        }

        .valor {
          color: #667eea;
          font-weight: bold;
          font-size: 18px;
        }

        .valor.status {
          border-radius: 5px;
          padding: 5px 12px;
        }

        .valor.status.aprovado {
          background: #4caf50;
          color: white;
        }

        .valor.status.reprovado {
          background: #f44336;
          color: white;
        }

        .botoes-acao {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        .btn {
          flex: 1;
          padding: 15px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primario {
          background: #667eea;
          color: white;
        }

        .btn-primario:hover {
          background: #5568d3;
        }

        .btn-secundario {
          background: #f5f5f5;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secundario:hover {
          background: #f0f0f0;
        }

        @media (max-width: 600px) {
          .resultado-card {
            padding: 30px 20px;
          }

          .botoes-acao {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
