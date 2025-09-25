// scripts/check-key.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("ENV KEY (first 12):", (process.env.DEPLOYER_PRIVATE_KEY || '').slice(0, 12), '...');
  const w = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  console.log("Addr from .env key:", w.address);

  const [signer] = await hre.ethers.getSigners();
  console.log("Signer[0] in Hardhat:", await signer.getAddress());
}
main().catch(console.error);
