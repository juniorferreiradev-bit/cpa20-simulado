export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, pin } = req.body;

  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

    const emailData = {
      personalizations: [{
        to: [{ email }],
        subject: '🔐 Seu PIN de Acesso - CPA-20 Simulado'
      }],
      from: { email: 'noreply@cpa20.com', name: 'CPA-20 Simulado' },
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
              <h1>🎓 CPA-20 Simulado</h1>
              <p>Sistema de Simulados e Avaliações</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Olá!</h2>
              <p>Seu PIN de acesso:</p>
              
              <div style="background: white; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 10px;">
                  ${pin}
                </div>
              </div>

              <p><strong>Válido por 30 minutos</strong></p>
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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar PIN' });
  }
}