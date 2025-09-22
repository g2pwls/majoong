// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title MaronToken
/// @notice 기부 토큰 (ERC20Burnable + AccessControl)
contract MaronToken is ERC20Burnable, AccessControl {
    /// @notice 토큰 발행 권한
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice 기부 이벤트 (도너, 금고, 금액 기록)
    event DonationRecorded(address indexed donor, address indexed vault, uint256 amount);

    /// @dev 배포자에게 관리자/발행자 권한 부여
    constructor() ERC20("Maron Token", "MARON") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice 금고(vault)로 토큰 발행 (기부자 정보 기록)
    /// @param donor 기부자 주소 (로그용)
    /// @param vault 금고 주소 (토큰 수령)
    /// @param amount 발행 수량
    function mintToVaultForDonor(address donor, address vault, uint256 amount)
    external
    onlyRole(MINTER_ROLE)
    {
        _mint(vault, amount);
        emit DonationRecorded(donor, vault, amount);
    }

    /// @notice 농부 지갑에서 토큰 소각
    /// @param farmer 농부 주소
    /// @param amount 소각 수량
    function burnFromFarmer(address farmer, uint256 amount)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _burn(farmer, amount);
    }
}
