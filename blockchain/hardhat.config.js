// '@nomicfoundation/hardhat-toolbox'는 Hardhat에서 자주 사용되는 여러 플러그인과 도구들을 한 번에 가져오는 패키지입니다.
// 예를 들어, ethers.js, chai, mocha 등을 포함하고 있어 개발 환경 설정을 간편하게 해줍니다.
require("@nomicfoundation/hardhat-toolbox");

// 'dotenv'는 .env 파일에 저장된 환경 변수들을 'process.env' 객체로 불러오는 라이브러리입니다.
// .env 파일에는 API 키나 개인 키처럼 코드에 직접 노출되면 안 되는 민감한 정보들을 저장합니다.
// .config() 함수를 호출하여 .env 파일을 읽어들입니다.
require("dotenv").config();  
 
// 'module.exports'는 Node.js에서 현재 파일을 다른 파일에서 'require'로 불러올 때
// 어떤 값을 내보낼지 정의하는 객체입니다.
// 여기서는 Hardhat 프레임워크의 설정(configuration)을 정의합니다.
module.exports = {
    // 'solidity'는 사용할 솔리디티 컴파일러의 버전을 지정합니다.
    // 여기에 명시된 버전으로 스마트 계약 코드가 컴파일됩니다.
    solidity: {
      version: "0.8.24",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,              // 기본값: 전체 컨트랙트 공통
        },
      },
      // 특정 파일(컨트랙트)만 runs=1000으로 오버라이드
      overrides: {
        "contracts/MaronToken.sol": {
          version: "0.8.24",
          settings: {
            optimizer: { enabled: true, runs: 1000 },
          },
        },
      },
    },
    // 'networks'는 스마트 계약을 배포하고 테스트할 블록체인 네트워크들을 설정하는 부분입니다.
    networks: {
        // 'sepolia'는 이더리움의 테스트 네트워크 중 하나의 이름입니다.
        // 여기에 'sepolia' 네트워크에 연결하기 위한 정보를 입력합니다.
        sepolia: {
            // 'url'은 Sepolia 테스트넷에 접속하기 위한 RPC(Remote Procedure Call) 서버의 주소입니다.
            // 이 주소는 보통 Infura나 Alchemy와 같은 노드 제공 서비스에서 발급받습니다.
            // 'process.env.SEPOLIA_RPC_URL'는 .env 파일에 정의된 SEPOLIA_RPC_URL 값을 가져와 사용합니다.
            url: process.env.SEPOLIA_RPC_URL,

            // 'accounts'는 배포 시 사용할 계정(지갑)의 개인 키(private key) 목록입니다.
            // 개인 키는 절대로 코드에 직접 노출해서는 안 되며, .env 파일에 저장하여 안전하게 관리해야 합니다.
            // 'process.env.DEPLOYER_PRIVATE_KEY'는 .env 파일에 정의된 DEPLOYER_PRIVATE_KEY 값을 가져옵니다.
            accounts: [process.env.DEPLOYER_PRIVATE_KEY]
        },
    },
    gasReporter: {
      enabled: true,
      currency: "USD",
      coinmarketcap: process.env.CMC_API_KEY || undefined, // 있으면 USD 환산
      showTimeSpent: true,
      excludeContracts: [], // 필요시 제외 목록
      // outputFile: "gas-report.txt", noColors: true // 파일로 저장하고 싶으면
    },
};