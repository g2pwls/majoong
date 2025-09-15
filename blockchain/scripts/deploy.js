// 'hardhat'은 이더리움 스마트 계약을 개발하고 테스트하기 위한 프레임워크입니다.
// 이 스크립트에서 hardhat의 기능들을 사용하기 위해 가져옵니다.
const hre = require("hardhat");

// 'main'이라는 비동기(async) 함수를 정의합니다.
// 비동기 함수는 특정 작업이 완료될 때까지 기다렸다가 다음 코드를 실행할 수 있게 해줍니다. (예: 블록체인과의 통신)
async function main() {
    // 'getSigners' 함수를 호출하여 현재 hardhat 네트워크에 연결된 계정(지갑) 목록을 가져옵니다.
    // 보통 첫 번째 계정([deployer])을 계약을 배포하는 데 사용합니다.
    const [deployer] = await hre.ethers.getSigners();
    // 배포자의 주소를 콘솔에 출력하여 확인합니다.
    console.log("Deployer:", deployer.address);

    // 'getContractFactory' 함수를 사용하여 "MaronToken" 스마트 계약의 '공장(factory)'을 만듭니다.
    // 이 공장은 MaronToken 계약의 인스턴스(복제품)를 생성하는 데 사용됩니다.
    const Token = await hre.ethers.getContractFactory("MaronToken");
    // 'deploy' 함수를 호출하여 MaronToken 계약을 블록체인에 실제로 배포합니다.
    const token = await Token.deploy();
    // 'waitForDeployment' 함수는 계약이 블록체인 네트워크에 완전히 배포되고 기록될 때까지 기다립니다.
    await token.waitForDeployment();
    // 배포된 MaronToken 계약의 주소를 콘솔에 출력합니다. 이 주소는 나중에 이 토큰과 상호작용할 때 필요합니다.
    console.log("MaronToken:", await token.getAddress());

    // 위와 동일하게 "FarmVaultFactory" 스마트 계약의 공장을 만듭니다.
    const Factory = await hre.ethers.getContractFactory("FarmVaultFactory");
    // FarmVaultFactory 계약을 배포합니다.
    // 이때, constructor에서 요구하는 'token'의 주소를 인자로 전달해야 합니다.
    // 위에서 배포한 MaronToken의 주소(await token.getAddress())를 넣어줍니다.
    const factory = await Factory.deploy(await token.getAddress());
    // FarmVaultFactory 계약이 완전히 배포될 때까지 기다립니다.
    await factory.waitForDeployment();
    // 배포된 FarmVaultFactory 계약의 주소를 콘솔에 출력합니다.
    console.log("FarmVaultFactory:", await factory.getAddress());
}

// 위에서 정의한 'main' 함수를 실행합니다.
main().catch((e) => { console.error(e); process.exit(1); });