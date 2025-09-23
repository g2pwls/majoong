// test/e2e.sepolia.test.js
require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

const addr = {
  token: process.env.TOKEN_ADDRESS,
  factory: process.env.FACTORY_ADDRESS,
};

describe("E2E on Sepolia (deployed contracts)", function () {
  // 실망 방지: 환경변수 없으면 건너뜀
  if (!addr.token || !addr.factory) {
    console.warn("❗ TOKEN_ADDRESS / FACTORY_ADDRESS not set. Skipping E2E.");
    return;
  }

  let deployer, token, factory, farmer; // ✅ farmer를 전역 변수로

  before(async () => {
    [deployer] = await ethers.getSigners(); // hardhat.config.js의 accounts[0] = DEPLOYER_PRIVATE_KEY
    token = await ethers.getContractAt("MaronToken", addr.token, deployer);
    factory = await ethers.getContractAt("FarmVaultFactory", addr.factory, deployer);

    // ✅ 테스트 시작 시 farmer(=deployer) 잔액 전량 소각해서 초기화
    farmer = await deployer.getAddress();
    const prev = await token.balanceOf(farmer);
    if (prev > 0n) {
      console.log("Farmer balance cleanup, burning:", prev.toString());
      const tx = await token.burnFromFarmer(farmer, prev);
      await tx.wait();
    }
  });

  it("reads basic info", async () => {
    const name = await token.name();
    const symbol = await token.symbol();
    console.log("Token:", name, symbol);
    expect(symbol).to.be.a("string");
  });

  it("creates a new vault and runs a small flow", async () => {
    // 고유한 farmId로 충돌 방지
    const farmId = Math.floor(Date.now() / 1000);

    // 1) 금고 생성
    const tx1 = await factory.createVault(farmId, farmer);
    const rc1 = await tx1.wait();
    console.log("createVault gas used:", rc1.gasUsed.toString());

    const vaultAddr = await factory.vaultOf(farmId);
    const Vault = await ethers.getContractFactory("FarmVault");
    const vault = Vault.attach(vaultAddr);

    // 2) 기부 토큰 민트(금고로)
    const amount = ethers.parseEther("0.1");
    const donor = farmer; // 데모: 배포자 자신을 donor로
    const tx2 = await token.mintToVaultForDonor(donor, vaultAddr, amount);
    const rc2 = await tx2.wait();
    console.log("mintToVaultForDonor gas used:", rc2.gasUsed.toString());

    expect(await token.balanceOf(vaultAddr)).to.equal(amount);

    // 3) 금고에서 출금(농부에게)
    const releaseAmt = ethers.parseEther("0.02");
    const tx3 = await vault.release(releaseAmt);
    const rc3 = await tx3.wait();
    console.log("vault.release gas used:", rc3.gasUsed.toString());

    // ✅ farmer 시작 잔액을 0으로 만들어놨으므로 정확히 releaseAmt여야 함
    expect(await token.balanceOf(farmer)).to.equal(releaseAmt);

    // 4) 소각(농부 지갑에서)
    const burnAmt = ethers.parseEther("0.01");
    const tx4 = await token.burnFromFarmer(farmer, burnAmt);
    const rc4 = await tx4.wait();
    console.log("burnFromFarmer gas used:", rc4.gasUsed.toString());

    expect(await token.balanceOf(farmer)).to.equal(releaseAmt - burnAmt);
  }).timeout(120000); // 실네트는 블록타임 때문에 타임아웃 늘려둠
});
