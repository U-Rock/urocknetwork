// File: packages/auth-jwt/auth.js

const users = [
  { id: 1, email: 'admin@urock.network', password: 'password123', role: 'master' },
  { id: 2, email: 'affiliate1@urock.network', password: 'urock123', role: 'affiliate' }
];

function authenticate(email, password) {
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error('Invalid credentials');
  return { id: user.id, email: user.email, role: user.role };
}

module.exports = { authenticate };


// File: packages/wallet-web3/wallet.js

const Web3 = require('web3');

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];
    return walletAddress;
  } else {
    throw new Error('MetaMask not installed');
  }
}

module.exports = { connectWallet };


// File: packages/auth-jwt/auth-guard.js

function checkAccess(user, requiredRole) {
  if (!user) throw new Error('Not logged in');
  if (user.role !== requiredRole) throw new Error('Unauthorized');
  return true;
}

module.exports = { checkAccess };
