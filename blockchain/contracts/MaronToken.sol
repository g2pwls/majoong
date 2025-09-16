// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin 라이브러리에서 필요한 스마트 계약들을 가져옵니다.
// ERC20Burnable: 토큰을 소각(제거)할 수 있는 기능을 가진 표준 토큰(ERC20)입니다.
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// AccessControl: 특정 주소에 특정 역할(권한)을 부여하고 관리하는 기능을 제공합니다.
import "@openzeppelin/contracts/access/AccessControl.sol";

// 'MaronToken'이라는 이름의 새로운 스마트 계약을 정의합니다.
// 이 계약은 ERC20Burnable과 AccessControl의 모든 기능을 상속받습니다.
contract MaronToken is ERC20Burnable, AccessControl {
    // 'MINTER_ROLE'이라는 특별한 권한을 정의합니다. 이 권한을 가진 사람만 토큰을 새로 발행할 수 있습니다.
    // keccak256("MINTER_ROLE")는 "MINTER_ROLE"이라는 문자열을 암호화하여 고유한 값으로 만듭니다.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // 'DonationRecorded'라는 이벤트를 정의합니다.
    // 이벤트는 블록체인에 특정 활동이 발생했음을 기록하고, 나중에 쉽게 찾아볼 수 있게 해줍니다.
    // 여기서는 기부자(donor), 기부금이 들어간 금고(vault), 그리고 금액(amount)을 기록합니다.
    event DonationRecorded(address indexed donor, address indexed vault, uint256 amount);

    // 'constructor'는 스마트 계약이 처음 배포될 때 딱 한 번 실행되는 특별한 함수입니다.
    // ERC20("Maron Token", "MARON")는 토큰의 전체 이름(Maron Token)과 심볼(MARON)을 설정합니다.
    constructor() ERC20("Maron Token", "MARON") {
        // _grantRole 함수를 사용해 권한을 부여합니다.
        // DEFAULT_ADMIN_ROLE: 계약의 최고 관리자 권한입니다.
        // MINTER_ROLE: 토큰 발행 권한입니다.
        // msg.sender는 이 계약을 배포하는 사람(주소)을 의미합니다.
        // 즉, 계약을 배포한 사람이 처음에는 최고 관리자이자 토큰 발행자가 됩니다.
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    // 'mintToVaultForDonor' 함수는 새로운 토큰을 발행하여 특정 금고(vault) 주소로 보내는 역할을 합니다.
    // 이 함수는 관리자(MINTER_ROLE)만 호출할 수 있습니다.
    // donor(기부자) 주소는 누가 기부했는지 기록하기 위한 용도이며, 실제 토큰은 vault 주소로 발행됩니다.
    // external: 이 함수는 계약 외부에서만 호출될 수 있습니다.
    // onlyRole(MINTER_ROLE): 이 함수는 MINTER_ROLE 권한을 가진 주소만 실행할 수 있다는 제약 조건입니다.
    function mintToVaultForDonor(address donor, address vault, uint256 amount)
    external onlyRole(MINTER_ROLE)
    {
        // _mint 함수는 실제로 토큰을 발행하는 내부 함수입니다.
        // vault 주소에 amount 만큼의 토큰을 새로 만들어줍니다.
        _mint(vault, amount);
        // emit DonationRecorded: 위에서 정의한 'DonationRecorded' 이벤트를 발생시켜 블록체인에 기록을 남깁니다.
        emit DonationRecorded(donor, vault, amount);
    }

    // 'burnFromFarmer' 함수는 특정 주소(farmer)가 가진 토큰을 소각(제거)하는 역할을 합니다.
    // 이 함수는 최고 관리자(DEFAULT_ADMIN_ROLE)만 호출할 수 있습니다. (선택적 기능)
    // external: 이 함수는 계약 외부에서만 호출될 수 있습니다.
    // onlyRole(DEFAULT_ADMIN_ROLE): 이 함수는 DEFAULT_ADMIN_ROLE 권한을 가진 주소만 실행할 수 있습니다.
    function burnFromFarmer(address farmer, uint256 amount)
    external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        // _burn 함수는 실제로 토큰을 소각하는 내부 함수입니다.
        // farmer 주소에서 amount 만큼의 토큰을 영구적으로 제거합니다.
        _burn(farmer, amount);
    }
}