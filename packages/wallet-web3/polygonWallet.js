export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const [address] = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  return address;
}

export async function getPolygonTokenBalance(tokenAddress, userAddress, decimals = 18) {
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  const raw = await contract.balanceOf(userAddress);

  return parseFloat(ethers.utils.formatUnits(raw, decimals));
}
