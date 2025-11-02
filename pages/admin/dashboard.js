javascript
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [questoes, setQuestoes] = useState([]);
  const [novaQuestao, setNovaQuestao] = useState({
    enunciado: '',
    opcoes: { A: '', B: '', C: '', D: '', E: '' },
    resposta: 'A',
    modulo: '1'
  });

  useEffect(() => {
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    const q = [];
    const querySnapshot = await getDocs(collection(db, 'questoes'));
    querySnapshot.forEach((doc) => {
      q.push({ id: doc.id, ...doc.data() });
    });
    setQuestoes(q);
  };

  const adicionarQuestao = async () => {
    if (!novaQuestao.enunciado) {
      alert('Preencha o enunciado');
      return;
    }
    try {
      await addDoc(collection(db, 'questoes'), novaQuestao);
      setNovaQuestao({
        enunciado: '',
        opcoes: { A: '', B: '', C: '', D: '', E: '' },
        resposta: 'A',
        modulo: '1'
      });
      carregarQuestoes();
      alert('Questão adicionada!');
    } catch (err) {
      alert('Erro ao adicionar: ' + err.message);
    }
  };

  const deletarQuestao = async (id) => {
    if (confirm('Tem certeza?')) {
      await deleteDoc(doc(db, 'questoes', id));
      carregarQuestoes();
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <h1>🔧 Painel Admin - CPA-20</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>➕ Adicionar Nova Questão</h2>
        <input
          type="text"
          placeholder="Enunciado"
          value={novaQuestao.enunciado}
          onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        {Object.entries(novaQuestao.opcoes).map(([letra, texto]) => (
          <div key={letra}>
            <label>{letra}:</label>
            <input
              type="text"
              value={texto}
              onChange={(e) =>
                setNovaQuestao({
                  ...novaQuestao,
                  opcoes: { ...novaQuestao.opcoes, [letra]: e.target.value }
                })
              }
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label>Resposta Correta:</label>
            <select
              value={novaQuestao.resposta}
              onChange={(e) => setNovaQuestao({ ...novaQuestao, resposta: e.target.value })}
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>E</option>
            </select>
          </div>

          <div>
            <label>Módulo:</label>
            <select
              value={novaQuestao.modulo}
              onChange={(e) => setNovaQuestao({ ...novaQuestao, modulo: e.target.value })}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Módulo {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={adicionarQuestao}
          style={{ width: '100%', padding: '10px', background: '#4caf50', color: 'white' }}
        >
          Adicionar Questão
        </button>
      </div>

      <h2>📋 Questões ({questoes.length})</h2>
      {questoes.map((q) => (
        <div
          key={q.id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '5px'
          }}
        >
          <p><strong>{q.enunciado}</strong></p>
          <p>Resposta: <strong>{q.resposta}</strong> | Módulo: {q.modulo}</p>
          <button
            onClick={() => deletarQuestao(q.id)}
            style={{ background: '#f44336', color: 'white', padding: '5px 10px' }}
          >
            🗑️ Deletar
          </button>
        </div>
      ))}
    </div>
  );
}