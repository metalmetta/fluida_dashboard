
// Exchange Public Token for Access Token API endpoint
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
    
    // Get public token from request body
    const { publicToken } = req.body;
    
    if (!publicToken) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return res.status(200).json({
      access_token: accessToken,
      item_id: itemId,
      accounts: accountsResponse.data.accounts,
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return res.status(500).json({ error: error.message });
  }
}
