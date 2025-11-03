import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const fazerLogin = () => {
    // Senha padrão: admin123 (mude depois!)
    if (senha === 'admin123') {
      localStorage.setItem('admin_logado', 'true');
      router.push('/admin/dashboard');
    } else {
      setErro('❌ Senha incorreta!');
      setSenha('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', background: '#f5f5f5', borderRadius: '10px' }}>
      <h1>🔐 Login Admin</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>CPA-20 Simulado - Painel Administrativo</p>

      <input
        type="password"
        placeholder="Digite a senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && fazerLogin()}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '15px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px'
        }}
      />

      <button
        onClick={fazerLogin}
        style={{
          width: '100%',
          padding: '12px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Entrar
      </button>

      {erro && <p style={{ color: 'red', marginTop: '15px' }}>{erro}</p>}

      <p style={{ marginTop: '30px', color: '#999', fontSize: '12px' }}>
        Senha padrão: <strong>admin123</strong><br/>
        ⚠️ Altere a senha na primeira vez!
      </p>
    </div>
  );
}
