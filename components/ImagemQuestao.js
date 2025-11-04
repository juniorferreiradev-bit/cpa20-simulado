export default function ImagemQuestao({ url, alt = 'Questão' }) {
  const converterUrlDrive = (url) => {
    // Converter URL do Google Drive em URL de imagem direta
    const match = url.match(/\/d\/(.*?)(\/|$)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?id=${match[1]}&export=download`;
    }
    return url;
  };

  if (!url) return null;

  const urlConvertida = converterUrlDrive(url);

  return (
    <div className="imagem-container">
      <img src={urlConvertida} alt={alt} />
      <style jsx>{`
        .imagem-container {
          text-align: center;
          margin: 20px 0;
        }

        img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
```

---

## 📄 ARQUIVO 9: components/GraficoEvolucao.js

```javascript
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function GraficoEvolucao({ simulados }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    if (simulados && simulados.length > 0) {
      const labels = simulados.map((_, i) => `Simulado ${i + 1}`);
      const scores = simulados.map(s => s.score);

      setDados({
        labels,
        datasets: [
          {
            label: 'Pontuação (%)',
            data: scores,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      });
    }
  }, [simulados]);

  if (!dados) return <div>Carregando gráfico...</div>;

  return (
    <div className="grafico-container">
      <h3>📈 Evolução de Desempenho</h3>
      <Line data={dados} options={{
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100
          }
        }
      }} />
      <style jsx>{`
        .grafico-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        h3 {
          margin: 0 0 15px 0;
          color: #333;
        }
      `}</style>
    </div>
  );
}
