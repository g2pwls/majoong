// 'chai'는 자바스크립트용 테스트 라이브러리로, 'expect' 같은 자연스러운 문법으로 테스트를 작성하게 해줍니다.
const { expect } = require("chai");
// 'hardhat' 프레임워크에서 'ethers'를 가져옵니다. ethers.js는 이더리움 블록체인과 상호작용하기 위한 라이브러리입니다.
const { ethers } = require("hardhat");

// 'describe'는 테스트 케이스들을 그룹화하는 역할을 합니다.
// 여기서는 "MaronToken + FarmVault"의 전체 시나리오를 테스트하는 그룹을 만듭니다.
describe("MaronToken + FarmVault", function () {
    // 'it'은 개별 테스트 케이스를 정의합니다. 이 테스트의 목적을 설명하는 문장을 이름으로 사용합니다.
    // "should mint to vault, release to farmer, and burn by admin (with logs)"
    // -> 금고에 토큰을 발행하고, 농부에게 출금하고, 관리자가 소각하는 전체 과정이 로그와 함께 정상적으로 동작해야 한다.
    it("should mint to vault, release to farmer, and burn by admin (with logs)", async function () {
        // 'getSigners'를 통해 테스트에 사용할 가상 계정(지갑)들을 가져옵니다.
        // admin: 관리자, donor: 기부자, farmer: 농부 역할을 맡게 됩니다.
        const [admin, donor, farmer] = await ethers.getSigners();

        // -------------------------------
        // 1. 배포 (Deployment)
        // -------------------------------
        // MaronToken 계약을 배포합니다. (deploy.js 스크립트와 유사한 과정)
        const Token = await ethers.getContractFactory("MaronToken");
        const token = await Token.deploy();
        await token.waitForDeployment();

        // FarmVaultFactory 계약을 배포합니다. 이때 생성자에 MaronToken의 주소를 전달합니다.
        const Factory = await ethers.getContractFactory("FarmVaultFactory");
        const factory = await Factory.deploy(await token.getAddress());
        await factory.waitForDeployment();

        // 테스트 진행 상황을 확인하기 위해 각 주소들을 콘솔에 출력합니다.
        console.log("Admin :", admin.address);
        console.log("Donor :", donor.address);
        console.log("Farmer:", farmer.address);
        console.log("MaronToken:", await token.getAddress());
        console.log("Factory  :", await factory.getAddress());

        // -------------------------------
        // 2. Vault 생성 (Create Vault)
        // -------------------------------
        const farmId = 1; // 농장 ID를 1로 설정합니다.
        // factory 계약의 createVault 함수를 호출하여 farmId=1, 주인이 farmer인 금고를 생성합니다.
        await factory.createVault(farmId, farmer.address);
        // factory에서 farmId=1에 해당하는 금고의 주소를 가져옵니다.
        const vaultAddr = await factory.vaultOf(farmId);
        // FarmVault 계약의 factory를 가져옵니다.
        const Vault = await ethers.getContractFactory("FarmVault");
        // 'attach' 함수를 사용하여 이미 배포된 금고 주소(vaultAddr)에 연결하여 상호작용할 수 있는 객체를 만듭니다.
        const vault = Vault.attach(vaultAddr);

        // 생성된 금고의 주소를 콘솔에 출력합니다.
        console.log("Vault   :", vaultAddr);

        // -------------------------------
        // 3. 기부 (Mint 50 MARON to vault for donor)
        // -------------------------------
        // ethers.parseEther("50")는 50개의 토큰을 올바른 단위(18자리 소수)로 변환해줍니다.
        const amount = ethers.parseEther("50"); // 50 토큰
        // token.mintToVaultForDonor 함수를 호출하여 기부를 실행합니다.
        // 'expect(...).to.emit(token, "DonationRecorded").withArgs(...)' 구문은
        // 함수 실행 시 'token' 계약에서 'DonationRecorded' 이벤트가 발생하고,
        // 그 이벤트의 인자(argument)가 (donor.address, vaultAddr, amount)와 일치하는지 검증합니다.
        await expect(token.mintToVaultForDonor(donor.address, vaultAddr, amount))
            .to.emit(token, "DonationRecorded")
            .withArgs(donor.address, vaultAddr, amount);

        // 토큰 발행 후 각 주소의 잔액을 확인하여 콘솔에 출력합니다.
        console.log("잔액 상태 after Mint");
        console.log("  Donor   :", (await token.balanceOf(donor.address)).toString());
        console.log("  Vault   :", (await token.balanceOf(vaultAddr)).toString());
        console.log("  Farmer  :", (await token.balanceOf(farmer.address)).toString());

        // 'expect(실제값).to.equal(기대값)' 구문은 실제값이 기대값과 같은지 검증합니다.
        // 금고(vault)의 잔액이 방금 발행한 50 토큰(amount)과 같은지 확인합니다.
        expect(await token.balanceOf(vaultAddr)).to.equal(amount);

        // -------------------------------
        // 4. 출금 (Release 10 to Farmer)
        // -------------------------------
        const releaseAmt = ethers.parseEther("10"); // 10 토큰
        // vault.release 함수를 호출하여 10 토큰을 농부에게 출금합니다.
        // 'Released' 이벤트가 (farmer.address, releaseAmt) 인자와 함께 발생하는지 검증합니다.
        await expect(vault.release(releaseAmt))
            .to.emit(vault, "Released")
            .withArgs(farmer.address, releaseAmt);

        // 출금 후 잔액 상태를 다시 확인합니다.
        console.log("잔액 상태 after Release(10)");
        console.log("  Donor   :", (await token.balanceOf(donor.address)).toString());
        console.log("  Vault   :", (await token.balanceOf(vaultAddr)).toString());
        console.log("  Farmer  :", (await token.balanceOf(farmer.address)).toString());

        // 농부(farmer)의 잔액이 출금된 10 토큰(releaseAmt)과 같은지 확인합니다.
        expect(await token.balanceOf(farmer.address)).to.equal(releaseAmt);

        // -------------------------------
        // 5. 소각 (Burn 5 from Farmer)
        // -------------------------------
        const burnAmt = ethers.parseEther("5"); // 5 토큰
        // token.burnFromFarmer 함수를 호출하여 농부의 지갑에서 5 토큰을 소각합니다.
        await token.burnFromFarmer(farmer.address, burnAmt);

        // 소각 후 잔액 상태를 다시 확인합니다.
        console.log("잔액 상태 after Burn(5)");
        console.log("  Donor   :", (await token.balanceOf(donor.address)).toString());
        console.log("  Vault   :", (await token.balanceOf(vaultAddr)).toString());
        console.log("  Farmer  :", (await token.balanceOf(farmer.address)).toString());

        // 농부의 최종 잔액이 (출금액 - 소각액)과 같은지 확인합니다. (10 - 5 = 5)
        expect(await token.balanceOf(farmer.address)).to.equal(releaseAmt - burnAmt);
    });
});