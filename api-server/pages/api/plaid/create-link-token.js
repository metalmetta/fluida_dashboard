
// Create Link Token API endpoint
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': '67c19c17f7e3ca0022f7bbb7',
          'PLAID-SECRET': '46ce37a59b27903aa88c135a5adbd7',
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);
    
    // Get user ID from request body
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Fluida Finance',
      products: ['auth', 'transactions'],
      language: 'en',
      country_codes: ['US', 'CA', 'GB', 'EU'],
      webhook: process.env.PLAID_WEBHOOK_URL || 'https://webhook.example.com/plaid',
    };

    const response = await plaidClient.linkTokenCreate(request);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({ error: error.message });
  }
}
