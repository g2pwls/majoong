// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin 라이브러리에서 IERC20과 AccessControl을 가져옵니다.
// IERC20: ERC20 토큰 표준의 인터페이스(규칙 모음)입니다. 토큰과 상호작용하기 위해 필요합니다.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// AccessControl: 역할 기반으로 접근을 제어하는 기능을 제공합니다.
import "@openzeppelin/contracts/access/AccessControl.sol";

// 'FarmVault'라는 스마트 계약을 정의합니다. '목장 금고'라는 뜻입니다.
// 이 계약은 AccessControl의 기능을 상속받습니다.
contract FarmVault is AccessControl {
    // 'token' 변수는 이 금고가 다룰 토큰(예: MaronToken)의 계약 주소를 저장합니다.
    // immutable: 계약 생성 시 한 번만 값을 설정할 수 있고, 이후에는 변경할 수 없습니다.
    IERC20 public immutable token;

    // 'farmer' 변수는 목장 주인의 이더리움 지갑 주소를 저장합니다.
    // immutable: 이 주소 역시 계약 생성 후에는 변경할 수 없습니다.
    address public immutable farmer; // 목장주 지갑

    // 'RELEASER_ROLE'이라는 특별한 권한을 정의합니다. 이 권한을 가진 사람만 금고에서 토큰을 출금할 수 있습니다.
    bytes32 public constant RELEASER_ROLE = keccak256("RELEASER_ROLE");

    // 'Received' 이벤트는 이 금고에 토큰이 입금되었을 때 기록을 남기기 위해 정의합니다. (실제 사용은 주석 참고)
    event Received(address indexed from, uint256 amount);
    // 'Released' 이벤트는 금고에서 농장 주인에게 토큰이 출금되었을 때 기록을 남깁니다.
    event Released(address indexed to, uint256 amount);

    // 'constructor'는 계약이 처음 생성될 때 한 번만 실행되는 함수입니다.
    // _token: 금고가 사용할 토큰의 주소
    // _farmer: 목장주의 주소
    // admin: 관리자 역할을 할 주소
    constructor(IERC20 _token, address _farmer, address admin) {
        token = _token;
        farmer = _farmer;
        // _grantRole 함수를 사용하여 admin 주소에 두 가지 권한을 부여합니다.
        // DEFAULT_ADMIN_ROLE: 최고 관리자 권한
        // RELEASER_ROLE: 토큰 출금 권한
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RELEASER_ROLE, admin);
    }

    // 'tokenBalance' 함수는 이 금고 계약이 현재 보유하고 있는 토큰의 양을 알려줍니다.
    // external: 계약 외부에서만 호출할 수 있습니다.
    // view: 블록체인의 상태를 변경하지 않고 데이터만 읽는 함수입니다. (가스비가 들지 않음)
    // returns (uint256): 함수가 토큰 잔액(숫자)을 반환함을 의미합니다.
    function tokenBalance() external view returns (uint256) {
        // token.balanceOf(address(this)): token 계약을 호출하여 이 금고 계약(address(this))의 잔액을 조회합니다.
        return token.balanceOf(address(this));
    }

    // 'release' 함수는 금고에 쌓인 토큰을 목장 주인에게 출금하는 역할을 합니다.
    // 이 함수는 주로 백엔드 서버의 관리자가 OCR(광학 문자 인식) 같은 검증 절차를 통과한 후 호출합니다.
    // external: 계약 외부에서만 호출할 수 있습니다.
    // onlyRole(RELEASER_ROLE): RELEASER_ROLE 권한을 가진 주소만 이 함수를 실행할 수 있습니다.
    function release(uint256 amount) external onlyRole(RELEASER_ROLE) {
        // require 함수로 금고의 잔액이 출금하려는 금액(amount)보다 크거나 같은지 확인합니다.
        // 만약 잔액이 부족하면 "insufficient" 오류 메시지와 함께 실행을 중단합니다.
        require(token.balanceOf(address(this)) >= amount, "insufficient");
        // token.transfer(farmer, amount): 토큰 계약을 호출하여 'amount' 만큼의 토큰을 'farmer' 주소로 전송합니다.
        token.transfer(farmer, amount);
        // 'Released' 이벤트를 발생시켜 블록체인에 출금 기록을 남깁니다.
        emit Released(farmer, amount);
    }

    // 'receive' 함수는 이 계약 주소로 직접 이더(ETH)가 보내졌을 때 실행되는 특별한 함수입니다.
    // 여기서는 revert("no native")를 통해 이 계약은 이더를 받지 않는다고 명시하고, 이더를 보내려는 거래를 강제로 실패시킵니다.
    // "native"는 블록체인의 기본 통화(예: 이더리움의 ETH)를 의미합니다.
    // 참고: ERC20 토큰 전송(transfer)은 이 함수를 실행시키지 않습니다. 토큰은 계약에 그냥 쌓입니다.
    // 오프체인(블록체인 외부)의 인덱서는 보통 토큰 계약의 Transfer 이벤트를 추적하여 입금 기록을 확인합니다.
    receive() external payable { revert("no native"); }
}