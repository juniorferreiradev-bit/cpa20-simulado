javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Simulado() {
  const [questoes, setQuestoes] = useState([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [timer, setTimer] = useState('02:30:00');
  const [fase, setFase] = useState('simulado'); // simulado, resultado
  const [resultado, setResultado] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('usuario_email');
    if (!email) router.push('/');
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'questoes'));
      const q = [];
      querySnapshot.forEach((doc) => {
        q.push({ id: doc.id, ...doc.data() });
      });
      setQuestoes(q.sort(() => Math.random() - 0.5).slice(0, 60));
    } catch (err) {
      console.error('Erro ao carregar:', err);
      // Se falhar, usar questões de exemplo
      const exemplo = Array.from({ length: 60 }, (_, i) => ({
        id: `Q${i + 1}`,
        enunciado: `Questão ${i + 1}: Qual é a função do CVM?`,
        opcoes: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
        resposta: 'B',
        modulo: (i % 6) + 1
      }));
      setQuestoes(exemplo);
    }
  };

  useEffect(() => {
    if (fase !== 'simulado') return;
    const intervalo = setInterval(() => {
      setTimer(t => {
        const [h, m, s] = t.split(':').map(Number);
        let total = h * 3600 + m * 60 + s - 1;
        if (total <= 0) {
          setFase('resultado');
          return '00:00:00';
        }
        const nh = Math.floor(total / 3600);
        const nm = Math.floor((total % 3600) / 60);
        const ns = total % 60;
        return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [fase]);

  const finalizarSimulado = () => {
    let acertos = 0;
    questoes.forEach((q, i) => {
      if (respostas[i] === q.resposta) acertos++;
    });
    const score = ((acertos / questoes.length) * 100).toFixed(1);
    setResultado({ acertos, total: questoes.length, score, aprovado: score >= 70 });
    setFase('resultado');
  };

  if (questoes.length === 0) return <p>Carregando...</p>;

  if (fase === 'resultado') {
    return (
      <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <h1>📊 Resultado: {resultado.score}%</h1>
        <p>Acertos: {resultado.acertos}/{resultado.total}</p>
        {resultado.aprovado ? (
          <h2 style={{ color: 'green' }}>✓ Parabéns! Você passou!</h2>
        ) : (
          <h2 style={{ color: 'red' }}>✗ Pratique mais</h2>
        )}

        <h3>📋 Revisão Detalhada:</h3>
        {questoes.map((q, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              margin: '10px 0',
              textAlign: 'left',
              background: respostas[i] === q.resposta ? '#e8f5e9' : '#ffebee'
            }}
          >
            <p><strong>Q{i + 1}: {q.enunciado}</strong></p>
            <p>Sua resposta: <strong>{respostas[i] || 'Não respondida'}</strong></p>
            <p>Resposta correta: <strong>{q.resposta}</strong></p>
            <button style={{ marginTop: '10px' }}>🚩 Solicitar Revisão</button>
          </div>
        ))}

        <button
          onClick={() => {
            localStorage.removeItem('usuario_email');
            router.push('/');
          }}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#667eea', color: 'white' }}
        >
          Fazer Novo Simulado
        </button>
      </div>
    );
  }

  const q = questoes[questaoAtual];
  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#667eea', marginBottom: '20px' }}>
        ⏱️ {timer}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
        Questão {questaoAtual + 1} de {questoes.length}
      </div>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>{q.enunciado}</h3>
        <div style={{ marginTop: '15px' }}>
          {Object.entries(q.opcoes).map(([letra, texto]) => (
            <div
              key={letra}
              onClick={() => setRespostas({ ...respostas, [questaoAtual]: letra })}
              style={{
                padding: '10px',
                margin: '10px 0',
                border: respostas[questaoAtual] === letra ? '2px solid #667eea' : '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
                background: respostas[questaoAtual] === letra ? '#f0f4ff' : 'white'
              }}
            >
              <input type="radio" checked={respostas[questaoAtual] === letra} /> {letra}) {texto}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
          disabled={questaoAtual === 0}
          style={{ flex: 1, padding: '10px', background: '#667eea', color: 'white' }}
        >
          ← Anterior
        </button>
        <button
          onClick={() => setQuestaoAtual(Math.min(questoes.length - 1, questaoAtual + 1))}
          disabled={questaoAtual === questoes.length - 1}
          style={{ flex: 1, padding: '10px', background: '#667eea', color: 'white' }}
        >
          Próxima →
        </button>
      </div>

      {questaoAtual === questoes.length - 1 && (
        <button
          onClick={finalizarSimulado}
          style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#4caf50', color: 'white', fontSize: '16px' }}
        >
          ✓ Finalizar Simulado
        </button>
      )}
    </div>
  );
}