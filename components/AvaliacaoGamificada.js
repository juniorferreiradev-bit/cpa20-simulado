import { useEffect, useState } from 'react';

export default function AvaliacaoGamificada({ nota }) {
  const [mostrarConfetti, setMostrarConfetti] = useState(false);

  const estrelas = Math.round((nota / 100) * 5);

  useEffect(() => {
    if (estrelas === 5 && !mostrarConfetti) {
      setMostrarConfetti(true);
      launchConfetti();
    }
  }, [estrelas, mostrarConfetti]);

  const launchConfetti = () => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
      script.onload = () => {
        if (window.confetti) {
          window.confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            duration: 3000
          });
        }
      };
      document.body.appendChild(script);
    }
  };

  const mensagens = {
    5: '🎉 Excelente! Você dominou o conteúdo!',
    4: '👏 Muito bom! Continue assim!',
    3: '💪 Bom trabalho! Pode melhorar!',
    2: '📚 Continue estudando!',
    1: '📖 Revise o material!',
    0: '⚠️ Recomendamos revisar todo o conteúdo'
  };

  return (
    <div className="avaliacao-container">
      <div className="estrelas-display">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={`estrela ${num <= estrelas ? 'ativa' : 'inativa'}`}
          >
            {num <= estrelas ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      <div className="nota-valor">{nota}%</div>

      <div className="mensagem">
        {mensagens[estrelas] || mensagens[0]}
      </div>

      {estrelas >= 3 && (
        <div className="status-aprovacao aprovado">
          ✅ APROVADO (≥70%)
        </div>
      )}
      {estrelas < 3 && (
        <div className="status-aprovacao reprovado">
          ❌ REPROVADO (<70%)
        </div>
      )}

      <style jsx>{`
        .avaliacao-container {
          text-align: center;
          padding: 30px;
        }

        .estrelas-display {
          font-size: 48px;
          margin-bottom: 20px;
          animation: fadeIn 1s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        .estrela {
          margin: 0 5px;
          display: inline-block;
          animation: bounce 0.6s ease;
        }

        .estrela.ativa {
          animation: bounce 0.6s ease, glow 1.5s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
        }

        .nota-valor {
          font-size: 64px;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 15px;
        }

        .mensagem {
          font-size: 20px;
          color: #666;
          margin-bottom: 20px;
        }

        .status-aprovacao {
          display: inline-block;
          padding: 12px 30px;
          border-radius: 30px;
          font-weight: bold;
          font-size: 16px;
        }

        .status-aprovacao.aprovado {
          background: #4caf50;
          color: white;
        }

        .status-aprovacao.reprovado {
          background: #f44336;
          color: white;
        }
      `}</style>
    </div>
  );
}