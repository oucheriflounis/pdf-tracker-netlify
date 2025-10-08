// functions/track.js
exports.handler = async (event, context) => {
  // Headers CORS pour permettre les requêtes cross-origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extraire les informations de la requête
    const timestamp = new Date().toISOString();
    const ip = event.headers['x-forwarded-for'] || 
               event.headers['client-ip'] || 
               'IP non disponible';
    
    const userAgent = event.headers['user-agent'] || 'User-Agent non disponible';
    const referer = event.headers['referer'] || event.headers['referrer'] || 'Direct';
    
    // Parser les paramètres de query
    const queryParams = event.queryStringParameters || {};
    
    // Créer l'objet de tracking
    const trackingData = {
      timestamp,
      ip,
      userAgent,
      referer,
      method: event.httpMethod,
      path: event.path,
      params: queryParams,
      doc: queryParams.doc || 'Document non spécifié',
      type: queryParams.type || 'unknown',
      headers: {
        'x-forwarded-for': event.headers['x-forwarded-for'],
        'cf-connecting-ip': event.headers['cf-connecting-ip'],
        'x-real-ip': event.headers['x-real-ip']
      }
    };

    // Log côté serveur (visible dans les logs Netlify)
    console.log('📊 PDF Tracking Event:', JSON.stringify(trackingData, null, 2));

    // Retourner une réponse de succès avec les données
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Tracking enregistré avec succès',
        data: trackingData,
        timestamp: timestamp
      })
    };

  } catch (error) {
    console.error('❌ Erreur dans la fonction de tracking:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erreur serveur lors de l\'enregistrement du tracking',
        timestamp: new Date().toISOString()
      })
    };
  }
};