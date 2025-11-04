import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

export default function GraficoRadar({ porModulo }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    if (porModulo && porModulo.length > 0) {
      setDados({
        labels: porModulo.map(m => m.nome),
        datasets: [
          {
            label: 'Aproveitamento (%)',
            data: porModulo.map(m => parseFloat(m.aproveitamento)),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#667eea'
          }
        ]
      });
    }
  }, [porModulo]);

  if (!dados) return <div>Carregando gráfico...</div>;

  return (
    <div className="grafico-container">
      <h3>🎯 Desempenho por Módulo</h3>
      <Radar data={dados} options={{
        responsive: true,
        scales: {
          r: {
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
