export const templates = {
  PIN: (email, pin) => ({
    subject: '🔐 Seu PIN de Acesso - CPA-20 Simulado',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
          <h1>🎓 CPA-20 Simulado</h1>
          <p>Sistema de Simulados e Avaliações</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Olá!</h2>
          <p>Solicitamos seu PIN de acesso. Use o código abaixo para entrar no sistema:</p>
          
          <div style="background: white; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 10px;">
              ${pin}
            </div>
          </div>

          <p><strong>Válido por 30 minutos</strong></p>
          
          <p style="color: #999; font-size: 12px;">
            Se você não solicitou este PIN, ignore este email.
          </p>
        </div>

        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Sistema CPA-20 | Simulados e Avaliações</p>
        </div>
      </div>
    `
  }),

  REVISAO_RESPOSTA: (nomeAluno, questao, resposta) => ({
    subject: '✅ Sua Solicitação de Revisão foi Respondida',
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white;">
          <h1>📝 Resposta da Revisão</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Olá ${nomeAluno}!</h2>
          
          <p>Sua solicitação de revisão foi respondida. Veja a resposta abaixo:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Questão:</strong> ${questao}</p>
            <p><strong>Resposta do Admin:</strong></p>
            <div style="background: #f0f4ff; padding: 15px; border-radius: 5px;">
              ${resposta}
            </div>
          </div>

          <p>Acesse sua conta para mais detalhes: 
            <a href="https://cpa20-simulado.vercel.app/dashboard" style="color: #667eea;">Dashboard</a>
          </p>
        </div>

        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>Sistema CPA-20 | Simulados e Avaliações</p>
        </div>
      </div>
    `
  })
};