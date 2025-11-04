import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminRevisoes() {
  const [revisoes, setRevisoes] = useState([]);
  const [filtro, setFiltro] = useState('pendente');
  const [loading, setLoading] = useState(true);
  const [respondendo, setRespondendo] = useState(null);
  const [resposta, setResposta] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('admin_logado')) {
      router.push('/admin');
      return;
    }
    carregarRevisoes();
  }, [filtro]);

  const carregarRevisoes = async () => {
    try {
      const q = query(
        collection(db, 'revisoes'),
        where('status', '==', filtro)
      );
      const snapshot = await getDocs(q);
      const revs = [];
      snapshot.forEach((docSnap) => {
        revs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRevisoes(revs);
      setLoading(false);
    } catch (err) {
      console.error('Erro:', err);
      setLoading(false);
    }
  };

  const responderRevisao = async (revisaoId) => {
    if (!resposta.trim()) {
      alert('Digite uma resposta');
      return;
    }

    try {
      await updateDoc(doc(db, 'revisoes', revisaoId), {
        status: 'respondida',
        resposta,
        dataResposta: new Date()
      });

      alert('✅ Revisão respondida!');
      setResposta('');
      setRespondendo(null);
      carregarRevisoes();

      // TODO: Enviar email com resposta
    } catch (err) {
      alert('❌ Erro ao responder: ' + err.message);
    }
  };

  const sair = () => {
    localStorage.removeItem('admin_logado');
    router.push('/admin');
  };

  if (loading) {
    return <div className="loading">Carregando revisões...</div>;
  }

  return (
    <div className="revisoes-container">
      <div className="header">
        <h1>📝 Painel de Revisões</h1>
        <button className="btn-sair" onClick={sair}>🚪 Sair</button>
      </div>

      <div className="filtros">
        {['pendente', 'respondida'].map((f) => (
          <button
            key={f}
            className={`btn-filtro ${filtro === f ? 'ativo' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'pendente' ? '⏳ Pendentes' : '✅ Respondidas'}
            ({revisoes.length})
          </button>
        ))}
      </div>

      <div className="lista-revisoes">
        {revisoes.length === 0 ? (
          <div className="vazio">
            <p>Nenhuma revisão {filtro} no momento</p>
          </div>
        ) : (
          revisoes.map((rev) => (
            <div key={rev.id} className="revisao-card">
              <div className="revisao-header">
                <strong>Email:</strong> {rev.usuario}
              </div>
              <div className="revisao-body">
                <p><strong>Questão:</strong> {rev.questaoId}</p>
                <p><strong>Resposta do Aluno:</strong> {rev.respostaAluno}</p>
                <p><strong>Resposta Correta:</strong> {rev.respostaCorreta}</p>
                
                <div className="justificativa">
                  <strong>Justificativa:</strong>
                  <div className="texto">{rev.justificativa}</div>
                </div>

                {rev.status === 'respondida' && (
                  <div className="resposta-admin">
                    <strong>Resposta do Admin:</strong>
                    <div className="texto">{rev.resposta}</div>
                  </div>
                )}

                {rev.status === 'pendente' && respondendo === rev.id ? (
                  <div className="formulario-resposta">
                    <textarea
                      placeholder="Digite sua resposta aqui..."
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                      rows="4"
                    />
                    <div className="botoes">
                      <button 
                        className="btn btn-enviar"
                        onClick={() => responderRevisao(rev.id)}
                      >
                        ✅ Enviar Resposta
                      </button>
                      <button 
                        className="btn btn-cancelar"
                        onClick={() => { setRespondendo(null); setResposta(''); }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : rev.status === 'pendente' ? (
                  <button 
                    className="btn btn-responder"
                    onClick={() => setRespondendo(rev.id)}
                  >
                    📝 Responder
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .revisoes-container {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
          margin: 0;
          color: #333;
        }

        .btn-sair {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .filtros {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn-filtro {
          padding: 10px 20px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .btn-filtro.ativo {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .lista-revisoes {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .revisao-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .revisao-header {
          background: #f5f5f5;
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }

        .revisao-body {
          padding: 20px;
        }

        .revisao-body p {
          margin: 10px 0;
        }

        .justificativa,
        .resposta-admin {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .texto {
          background: white;
          padding: 10px;
          border-left: 4px solid #667eea;
          margin-top: 8px;
        }

        .formulario-resposta {
          margin-top: 15px;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-family: Arial;
          font-size: 14px;
        }

        .botoes {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-responder {
          background: #4caf50;
          color: white;
        }

        .btn-enviar {
          background: #4caf50;
          color: white;
        }

        .btn-cancelar {
          background: #999;
          color: white;
        }

        .vazio {
          background: white;
          padding: 40px;
          text-align: center;
          border-radius: 10px;
          color: #999;
        }

        .loading {
          padding: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}