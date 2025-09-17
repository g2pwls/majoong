// SPDX-License-Identifier: MIT
// 이 코드는 MIT 라이선스 하에 배포됩니다.
pragma solidity ^0.8.24;
// 솔리디티 컴파일러 버전을 0.8.24 이상으로 지정합니다.

// './FarmVault.sol' 파일을 가져옵니다. 이 파일에는 FarmVault 계약의 코드가 들어있습니다.
import "./FarmVault.sol";
// OpenZeppelin 라이브러리에서 AccessControl 계약을 가져옵니다. 권한 관리에 사용됩니다.
import "@openzeppelin/contracts/access/AccessControl.sol";
 
// 'FarmVaultFactory'라는 새로운 스마트 계약을 정의합니다. '농장 금고 공장'이라는 뜻입니다.
// 이 계약은 AccessControl의 기능을 상속받아 권한 관리를 할 수 있습니다.
contract FarmVaultFactory is AccessControl {
    // 'token'이라는 변수를 선언합니다. 이 변수에는 우리가 사용할 토큰(예: MaronToken)의 계약 주소가 저장됩니다.
    // IERC20은 토큰이 따라야 하는 표준 인터페이스(규칙)입니다.
    // immutable: 이 변수는 계약이 처음 생성될 때만 값을 설정할 수 있고, 그 이후에는 절대 변경할 수 없습니다.
    IERC20 public immutable token;

    // 'vaultOf'라는 매핑(mapping)을 선언합니다. 매핑은 '키(key)'와 '값(value)'을 연결해주는 사전과 같습니다.
    // 여기서는 목장 ID(farmId)를 키로 사용하여 해당 목장의 금고(vault) 주소를 값으로 저장합니다.
    // public: 누구나 특정 목장 ID에 해당하는 금고 주소를 조회할 수 있습니다.
    mapping(uint256 => address) public vaultOf;  // farmId -> vault

    // 'VaultCreated'라는 이벤트를 정의합니다. 새로운 금고가 생성될 때마다 이 이벤트가 발생하여 기록을 남깁니다.
    // farmId: 생성된 금고가 속한 목장의 ID
    // vault: 새로 생성된 금고의 주소
    // farmer: 해당 목장의 주인 주소
    event VaultCreated(uint256 indexed farmId, address vault, address farmer);

    // 'constructor'는 계약이 처음 배포될 때 한 번만 실행되는 함수입니다.
    // _token: 배포 시 사용할 토큰(MaronToken)의 주소를 입력받습니다.
    constructor(IERC20 _token) {
        token = _token;
        // _grantRole 함수를 사용하여 이 계약을 배포한 사람(msg.sender)에게 최고 관리자(DEFAULT_ADMIN_ROLE) 권한을 부여합니다.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // 'createVault' 함수는 새로운 목장 금고(FarmVault)를 생성하는 역할을 합니다.
    // onlyRole(DEFAULT_ADMIN_ROLE): 최고 관리자 권한을 가진 사람만 이 함수를 호출할 수 있습니다.
    // returns (address): 함수가 실행된 후 새로 생성된 금고의 주소를 반환합니다.
    function createVault(uint256 farmId, address farmer)
    external onlyRole(DEFAULT_ADMIN_ROLE) returns (address)
    {
        // require 함수는 특정 조건이 참인지 확인하고, 거짓이면 실행을 중단시킵니다.
        // vaultOf[farmId] == address(0) : 해당 farmId로 이미 만들어진 금고가 없는지 확인합니다.
        // address(0)은 '0x000...000'과 같은 비어있는 주소를 의미합니다.
        // 만약 이미 금고가 있다면 "exists"라는 오류 메시지와 함께 실행을 멈춥니다.
        require(vaultOf[farmId] == address(0), "exists");

        // 'new FarmVault(...)' 코드는 FarmVault.sol에 정의된 FarmVault 계약의 새 인스턴스(복제품)을 생성합니다.
        // 생성 시 필요한 값들(토큰 주소, 농부 주소, 관리자 주소)을 전달해줍니다.
        FarmVault vault = new FarmVault(token, farmer, msg.sender);

        // 새로 생성된 금고(vault)의 주소를 farmId에 연결하여 vaultOf 매핑에 저장합니다.
        vaultOf[farmId] = address(vault);

        // 'VaultCreated' 이벤트를 발생시켜 블록체인에 새로운 금고가 생성되었음을 기록합니다.
        emit VaultCreated(farmId, address(vault), farmer);

        // 함수 호출자에게 새로 생성된 금고의 주소를 반환합니다.
        return address(vault);
    }
}