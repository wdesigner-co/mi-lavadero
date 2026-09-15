export default async function handler(req, res) {
  // Solo permitimos solicitudes POST.
  if (req.method !== "POST") {
    return res.status(405).json({
      mensaje: "Método no permitido."
    });
  }

  try {
    // URL de n8n almacenada como variable de entorno en Vercel.
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL no está configurada.");
      
      return res.status(500).json({
        mensaje: "Configuración del servidor incompleta."
      });
    }

    // Reenvía los datos recibidos desde la página hacia n8n.
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    // Intenta obtener la respuesta JSON de n8n.
    const resultado = await response.json();

    // Devuelve a la página exactamente la respuesta generada por n8n.
    return res.status(response.status).json(resultado);

  } catch (error) {
    console.error("Error comunicando con n8n:", error);

    return res.status(500).json({
      mensaje: "No fue posible procesar el registro."
    });
  }
}