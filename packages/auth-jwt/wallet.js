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
