import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [questoes, setQuestoes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [aba, setAba] = useState('dashboard'); // dashboard, questoes, criar, importar
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form para criar/editar
  const [novaQuestao, setNovaQuestao] = useState({
    enunciado: '',
    opcoes: { A: '', B: '', C: '', D: '', E: '' },
    resposta: 'A',
    modulo: '1'
  });
  const [editandoId, setEditandoId] = useState(null);

  // Importação CSV
  const [csvFile, setCsvFile] = useState(null);
  const [csvQuestoes, setCsvQuestoes] = useState([]);
  const [csvErros, setCsvErros] = useState([]);
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('admin_logado')) {
      router.push('/admin');
      return;
    }
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'questoes'));
      const q = [];
      querySnapshot.forEach((doc) => {
        q.push({ id: doc.id, ...doc.data() });
      });
      setQuestoes(q);
      setLoading(false);
    } catch (err) {
      console.error('Erro:', err);
      setLoading(false);
    }
  };

  const adicionarQuestao = async () => {
    if (!novaQuestao.enunciado) {
      alert('Preencha o enunciado');
      return;
    }

    try {
      if (editandoId) {
        await updateDoc(doc(db, 'questoes', editandoId), novaQuestao);
        alert('✅ Questão atualizada!');
        setEditandoId(null);
      } else {
        await addDoc(collection(db, 'questoes'), novaQuestao);
        alert('✅ Questão criada!');
      }

      setNovaQuestao({
        enunciado: '',
        opcoes: { A: '', B: '', C: '', D: '', E: '' },
        resposta: 'A',
        modulo: '1'
      });

      carregarQuestoes();
      setAba('questoes');
    } catch (err) {
      alert('❌ Erro: ' + err.message);
    }
  };

  const editarQuestao = (q) => {
    setNovaQuestao(q);
    setEditandoId(q.id);
    setAba('criar');
  };

  const deletarQuestao = async (id) => {
    if (confirm('Tem certeza que deseja deletar?')) {
      try {
        await deleteDoc(doc(db, 'questoes', id));
        alert('✅ Questão deletada!');
        carregarQuestoes();
      } catch (err) {
        alert('❌ Erro: ' + err.message);
      }
    }
  };

  // NOVA FUNÇÃO: Processar CSV
  const processarCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const linhas = text.split('\n');
      
      const questoesProcessadas = [];
      const erros = [];

      // Pular cabeçalho
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        try {
          // Parse CSV (considerando vírgulas dentro de aspas)
          const colunas = parseCSVLine(linha);
          
          if (colunas.length < 6) {
            erros.push(`Linha ${i + 1}: Colunas insuficientes (mínimo 6)`);
            continue;
          }

          const questao = {
            id: colunas[0] || `Q${i}`,
            enunciado: colunas[1] || '',
            opcoes: {
              A: colunas[2] || '',
              B: colunas[3] || '',
              C: colunas[4] || '',
              D: colunas[5] || ''
            },
            resposta: colunas[6] || 'A',
            modulo: colunas[7] || '1',
            imagemURL: colunas[9] || ''
          };

          // Validação
          if (!questao.enunciado) {
            erros.push(`Linha ${i + 1}: Enunciado vazio`);
            continue;
          }

          if (!['A', 'B', 'C', 'D'].includes(questao.resposta)) {
            erros.push(`Linha ${i + 1}: Resposta inválida (${questao.resposta}) - deve ser A, B, C ou D`);
            continue;
          }

          questoesProcessadas.push(questao);
        } catch (err) {
          erros.push(`Linha ${i + 1}: Erro ao processar - ${err.message}`);
        }
      }

      setCsvQuestoes(questoesProcessadas);
      setCsvErros(erros);
    };

    reader.readAsText(file);
  };

  // Helper: Parse CSV line (suporta aspas)
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  // NOVA FUNÇÃO: Importar para Firebase
  const importarCSV = async () => {
    if (csvQuestoes.length === 0) {
      alert('Nenhuma questão para importar');
      return;
    }

    if (!confirm(`Importar ${csvQuestoes.length} questões?`)) return;

    setImportando(true);

    try {
      const batch = writeBatch(db);
      let sucessos = 0;
      let falhas = 0;

      for (const questao of csvQuestoes) {
        try {
          const docRef = doc(collection(db, 'questoes'));
          batch.set(docRef, {
            enunciado: questao.enunciado,
            opcoes: questao.opcoes,
            resposta: questao.resposta,
            modulo: questao.modulo,
            imagemURL: questao.imagemURL || null
          });
          sucessos++;
        } catch (err) {
          falhas++;
          console.error('Erro ao adicionar:', err);
        }
      }

      await batch.commit();

      alert(`✅ Importação concluída!\n\nSucessos: ${sucessos}\nFalhas: ${falhas}`);
      
      setCsvFile(null);
      setCsvQuestoes([]);
      setCsvErros([]);
      carregarQuestoes();
      setAba('questoes');
    } catch (err) {
      alert('❌ Erro ao importar: ' + err.message);
    } finally {
      setImportando(false);
    }
  };

  const sair = () => {
    localStorage.removeItem('admin_logado');
    router.push('/admin');
  };

  // Estatísticas
  const totalQuestoes = questoes.length;
  const porModulo = {};
  questoes.forEach(q => {
    porModulo[q.modulo] = (porModulo[q.modulo] || 0) + 1;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎓 Admin - CPA-20 Simulado</h1>
        <button onClick={sair} style={{ background: 'white', color: '#667eea', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          🚪 Sair
        </button>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '10px', padding: '20px', background: 'white', borderBottom: '2px solid #ddd' }}>
        <button onClick={() => setAba('dashboard')} style={{ padding: '10px 20px', background: aba === 'dashboard' ? '#667eea' : '#ddd', color: aba === 'dashboard' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          📊 Dashboard
        </button>
        <button onClick={() => setAba('questoes')} style={{ padding: '10px 20px', background: aba === 'questoes' ? '#667eea' : '#ddd', color: aba === 'questoes' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          📋 Questões ({totalQuestoes})
        </button>
        <button onClick={() => setAba('criar')} style={{ padding: '10px 20px', background: aba === 'criar' ? '#667eea' : '#ddd', color: aba === 'criar' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ {editandoId ? 'Editando' : 'Criar'}
        </button>
        <button onClick={() => setAba('importar')} style={{ padding: '10px 20px', background: aba === 'importar' ? '#667eea' : '#ddd', color: aba === 'importar' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          📤 Importar CSV
        </button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* DASHBOARD */}
        {aba === 'dashboard' && (
          <div>
            <h2>📊 Estatísticas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#667eea' }}>📝 Total de Questões</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{totalQuestoes}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#667eea' }}>📚 Módulos</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{Object.keys(porModulo).length}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#667eea' }}>⚡ Status</h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>✅ Sistema Operacional</p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3>Questões por Módulo</h3>
              {Object.entries(porModulo).map(([modulo, qtd]) => (
                <div key={modulo} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                  <span>Módulo {modulo}</span>
                  <strong>{qtd} questões</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUESTÕES */}
        {aba === 'questoes' && (
          <div>
            <h2>📋 Gerenciar Questões</h2>
            <input type="text" placeholder="🔍 Filtrar por enunciado..." value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '2px solid #ddd', borderRadius: '5px' }} />

            <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              {questoes.filter(q => q.enunciado.toLowerCase().includes(filtro.toLowerCase())).map((q, idx) => (
                <div key={q.id} style={{ padding: '15px', borderBottom: idx < questoes.length - 1 ? '1px solid #eee' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p><strong>{q.enunciado.substring(0, 100)}...</strong></p>
                    <p style={{ color: '#999', fontSize: '12px' }}>ID: {q.id} | Módulo: {q.modulo} | Resposta: {q.resposta}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => editarQuestao(q)} style={{ padding: '8px 15px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={() => deletarQuestao(q.id)} style={{ padding: '8px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Deletar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRIAR/EDITAR */}
        {aba === 'criar' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>{editandoId ? '✏️ Editar Questão' : '➕ Criar Nova Questão'}</h2>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Enunciado:</label>
              <textarea value={novaQuestao.enunciado} onChange={(e) => setNovaQuestao({ ...novaQuestao, enunciado: e.target.value })} style={{ width: '100%', height: '100px', padding: '10px', border: '2px solid #ddd', borderRadius: '5px', fontFamily: 'Arial', fontSize: '14px' }} />
            </div>

            {['A', 'B', 'C', 'D', 'E'].map(letra => (
              <div key={letra} style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Opção {letra}:</label>
                <input type="text" value={novaQuestao.opcoes[letra]} onChange={(e) => setNovaQuestao({ ...novaQuestao, opcoes: { ...novaQuestao.opcoes, [letra]: e.target.value } })} style={{ width: '100%', padding: '10px', border: '2px solid #ddd', borderRadius: '5px' }} />
              </div>
            ))}

            <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Resposta Correta:</label>
                <select value={novaQuestao.resposta} onChange={(e) => setNovaQuestao({ ...novaQuestao, resposta: e.target.value })} style={{ width: '100%', padding: '10px', border: '2px solid #ddd', borderRadius: '5px' }}>
                  <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Módulo:</label>
                <select value={novaQuestao.modulo} onChange={(e) => setNovaQuestao({ ...novaQuestao, modulo: e.target.value })} style={{ width: '100%', padding: '10px', border: '2px solid #ddd', borderRadius: '5px' }}>
                  {Array.from({ length: 6 }, (_, i) => (<option key={i + 1} value={i + 1}>Módulo {i + 1}</option>))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
              <button onClick={adicionarQuestao} style={{ flex: 1, padding: '15px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                {editandoId ? '💾 Salvar Alterações' : '➕ Criar Questão'}
              </button>
              {editandoId && (
                <button onClick={() => { setEditandoId(null); setNovaQuestao({ enunciado: '', opcoes: { A: '', B: '', C: '', D: '', E: '' }, resposta: 'A', modulo: '1' }); }} style={{ flex: 1, padding: '15px', background: '#999', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ❌ Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {/* NOVA ABA: IMPORTAR CSV */}
        {aba === 'importar' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>📤 Importar Questões via CSV</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Formato esperado: <strong>ID,Enunciado,Opcao_A,Opcao_B,Opcao_C,Opcao_D,Resposta_Correta,Modulo,Ativa,Imagem_URL</strong>
            </p>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '20px' }}>
              ℹ️ Opção E não é obrigatória | Imagem_URL é opcional
            </p>

            <div style={{ border: '2px dashed #ddd', padding: '40px', textAlign: 'center', borderRadius: '10px', marginBottom: '20px' }}>
              <input type="file" accept=".csv" onChange={processarCSV} style={{ display: 'none' }} id="csvInput" />
              <label htmlFor="csvInput" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>Clique para selecionar arquivo CSV</p>
                <p style={{ fontSize: '14px', color: '#999' }}>ou arraste o arquivo aqui</p>
              </label>
            </div>

            {csvFile && (
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Arquivo:</strong> {csvFile.name}</p>
                <p><strong>Questões válidas:</strong> {csvQuestoes.length}</p>
                <p><strong>Erros:</strong> {csvErros.length}</p>
              </div>
            )}

            {csvErros.length > 0 && (
              <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                <h4 style={{ color: '#f44336', marginBottom: '10px' }}>❌ Erros Encontrados:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {csvErros.slice(0, 10).map((erro, idx) => (
                    <li key={idx} style={{ color: '#c62828', fontSize: '14px' }}>{erro}</li>
                  ))}
                  {csvErros.length > 10 && <li style={{ color: '#999' }}>...e mais {csvErros.length - 10} erros</li>}
                </ul>
              </div>
            )}

            {csvQuestoes.length > 0 && (
              <div>
                <h3>Preview das Questões</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '20px' }}>
                  {csvQuestoes.slice(0, 5).map((q, idx) => (
                    <div key={idx} style={{ padding: '10px', background: '#f5f5f5', marginBottom: '10px', borderRadius: '5px' }}>
                      <p><strong>{q.id}:</strong> {q.enunciado.substring(0, 80)}...</p>
                      <p style={{ fontSize: '12px', color: '#666' }}>Resposta: {q.resposta} | Módulo: {q.modulo}</p>
                    </div>
                  ))}
                  {csvQuestoes.length > 5 && <p style={{ color: '#999', textAlign: 'center' }}>...e mais {csvQuestoes.length - 5} questões</p>}
                </div>

                <button onClick={importarCSV} disabled={importando} style={{ width: '100%', padding: '15px', background: importando ? '#999' : '#4caf50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: importando ? 'not-allowed' : 'pointer' }}>
                  {importando ? '⏳ Importando...' : `✅ Importar ${csvQuestoes.length} Questões`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}