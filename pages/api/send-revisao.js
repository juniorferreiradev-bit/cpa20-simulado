import { Timestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { questaoId, usuario, justificativa, respostaAluno, respostaCorreta } = req.body;

  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const EMAIL_ADMIN = process.env.EMAIL_ADMIN || 'admin@cpa20.com';

    const emailData = {
      personalizations: [{
        to: [{ email: EMAIL_ADMIN }],
        subject: `📝 Nova Solicitação de Revisão - CPA-20`
      }],
      from: { email: 'noreply@cpa20.com', name: 'Sistema CPA-20' },
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white;">
              <h1>📝 Nova Solicitação de Revisão</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Detalhes da Solicitação</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Usuário:</strong> ${usuario}</p>
                <p><strong>Questão:</strong> ${questaoId}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3>Justificativa do Aluno:</h3>
                <p style="background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea;">
                  ${justificativa}
                </p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px;">
                <p><strong>Resposta do Aluno:</strong> <span style="color: #f44336;">${respostaAluno}</span></p>
                <p><strong>Resposta Correta:</strong> <span style="color: #4caf50;">${respostaCorreta}</span></p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://cpa20-simulado.vercel.app/admin/revisoes" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Responder Revisão
                </a>
              </div>
            </div>

            <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
              <p>Sistema CPA-20 | Simulados e Avaliações</p>
            </div>
          </div>
        `
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar email');
    }

    // Salvar no Firestore
    const { initializeApp, getApps } = require('firebase/app');
    const { getFirestore, addDoc, collection: fsCollection } = require('firebase/firestore');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const firestore = getFirestore(app);

    await addDoc(fsCollection(firestore, 'revisoes'), {
      questaoId,
      usuario,
      justificativa,
      respostaAluno,
      respostaCorreta,
      status: 'pendente',
      dataSolicitacao: Timestamp.now(),
      resposta: null
    });

    res.status(200).json({ success: true, message: 'Revisão enviada com sucesso!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar revisão' });
  }
}