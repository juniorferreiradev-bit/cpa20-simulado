import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ModalCreditos({ onClose }) {
  const [config, setConfig] = useState(null);
  const [aceite, setAceite] = useState(false);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    try {
      const docRef = doc(db, 'configuracoes', 'sistema');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        setConfig({
          desenvolvedor: 'Junior Ferreira',
          usouIA: 'Claude 3.7 Sonnet',
          autorConteudo: 'Edgar Abreu',
          direitos: 'Todo o conteúdo das questões é de propriedade intelectual de Edgar Abreu',
          finalidade: 'Sem fins lucrativos - Uso educacional apenas',
          doacoesTexto: 'Doações são bem-vindas e ajudam a manter o projeto',
          pixChave: 'juniorferreira.dev@gmail.com',
          versaoSistema: '9.0',
          dataAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      }
    } catch (err) {
      console.error('Erro ao carregar config:', err);
    }
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(config.pixChave);
    alert('✅ Chave PIX copiada!');
  };

  const continuar = () => {
    if (aceite) {
      localStorage.setItem('termos_aceitos', 'true');
      onClose();
    }
  };

  if (!config) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-creditos">
        <div className="modal-header">
          <h1>🎓 Sistema CPA-20 Simulação</h1>
          <div className="versao">Versão {config.versaoSistema}</div>
        </div>

        <div className="modal-body">
          <div className="secao">
            <h3><span className="icon">👨‍💻</span> Desenvolvimento</h3>
            <p><strong>Desenvolvedor:</strong> {config.desenvolvedor}</p>
            <p><strong>Tecnologias:</strong> Next.js 14 + Firebase</p>
            <p><strong>IA Utilizada:</strong> {config.usouIA}</p>
          </div>

          <div className="secao">
            <h3><span className="icon">📚</span> Créditos do Conteúdo</h3>
            <div className="destaque">
              <p><strong>⚠️ IMPORTANTE:</strong></p>
              <p><strong>Autor das Questões:</strong> {config.autorConteudo}</p>
              <p>{config.direitos}</p>
            </div>
          </div>

          <div className="secao">
            <h3><span className="icon">ℹ️</span> Finalidade</h3>
            <p>{config.finalidade}</p>
          </div>

          <div className="secao">
            <h3><span className="icon">💝</span> Apoie o Projeto</h3>
            <p>{config.doacoesTexto}</p>
            <div className="pix-box">
              <div>☕ Que tal me pagar um café?</div>
              <div className="chave">{config.pixChave}</div>
              <button onClick={copiarPix} className="btn-copiar">
                📋 Copiar Chave PIX
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <label className="checkbox-aceite">
            <input 
              type="checkbox" 
              checked={aceite}
              onChange={(e) => setAceite(e.target.checked)}
            />
            <span>Li e concordo com os termos acima</span>
          </label>
          <button 
            className="btn-continuar" 
            disabled={!aceite}
            onClick={continuar}
          >
            Continuar para o Sistema →
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-creditos {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }

        .modal-header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .versao {
          font-size: 14px;
          opacity: 0.9;
        }

        .modal-body {
          padding: 30px;
        }

        .secao {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .secao:last-child {
          border-bottom: none;
        }

        .secao h3 {
          color: #667eea;
          margin: 0 0 10px 0;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon {
          font-size: 20px;
        }

        .secao p {
          margin: 8px 0;
          line-height: 1.6;
          color: #333;
        }

        .destaque {
          background: #f0f4ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .pix-box {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-top: 15px;
        }

        .chave {
          background: rgba(255,255,255,0.2);
          padding: 12px;
          border-radius: 8px;
          margin: 10px 0;
          font-family: monospace;
          font-size: 16px;
          word-break: break-all;
        }

        .btn-copiar {
          background: white;
          color: #4caf50;
          border: none;
          padding: 10px 25px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .modal-footer {
          padding: 20px 30px;
          background: #f9f9f9;
          display: flex;
          gap: 15px;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .checkbox-aceite {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .btn-continuar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-continuar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}