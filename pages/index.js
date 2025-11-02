javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const enviarPIN = async () => {
    if (!email || !email.includes('@')) {
      setError('Email inválido');
      return;
    }
    setLoading(true);
    try {
      // Simular envio de PIN (em produção, usar SendGrid)
      const pinGerado = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`pin_${email}`, pinGerado);
      console.log(`PIN para ${email}: ${pinGerado}`);
      setError('');
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError('Erro ao enviar PIN');
      setLoading(false);
    }
  };

  const validarPIN = async () => {
    const pinSalvo = localStorage.getItem(`pin_${email}`);
    if (pin === pinSalvo) {
      localStorage.setItem('usuario_email', email);
      localStorage.removeItem(`pin_${email}`);
      router.push('/simulado');
    } else {
      setError('PIN inválido');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h1>🎓 Simulado CPA-20</h1>
      
      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="seu.email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button
            onClick={enviarPIN}
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#667eea', color: 'white' }}
          >
            {loading ? 'Enviando...' : 'Enviar PIN'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Digite o PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength="6"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button
            onClick={validarPIN}
            style={{ width: '100%', padding: '10px', background: '#667eea', color: 'white' }}
          >
            Acessar Simulado
          </button>
        </>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}