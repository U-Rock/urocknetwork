export async function getHiveBalance(username, symbol = 'UROCK') {
  const response = await fetch('https://api.hive-engine.com/rpc/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'find',
      params: {
        contract: 'tokens',
        table: 'balances',
        query: { account: username, symbol }
      }
    })
  });

  const result = await response.json();
  const balance = result.result?.[0]?.balance || '0.000';
  return balance;
}
