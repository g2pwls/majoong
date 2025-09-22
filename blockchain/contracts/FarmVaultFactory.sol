// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FarmVault.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title FarmVaultFactory (농장 금고 공장)
/// @notice farmId별로 FarmVault를 생성하고 관리
contract FarmVaultFactory is AccessControl {
    /// @notice 모든 금고가 사용하는 토큰 (예: MaronToken)
    IERC20 public immutable token;

    /// @notice farmId → vault 주소 매핑
    mapping(uint256 => address) public vaultOf;

    /// @notice 금고 생성 이벤트
    event VaultCreated(uint256 indexed farmId, address vault, address farmer);

    /// @param _token 금고에서 사용할 ERC20 토큰
    constructor(IERC20 _token) {
        token = _token;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice 새로운 목장 금고 생성
    /// @param farmId 목장 ID
    /// @param farmer 농부 주소
    /// @return vault 새로 생성된 금고 주소
    function createVault(uint256 farmId, address farmer)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    returns (address vault)
    {
        require(vaultOf[farmId] == address(0), "exists");

        FarmVault newVault = new FarmVault(token, farmer, msg.sender);
        vault = address(newVault);

        vaultOf[farmId] = vault;
        emit VaultCreated(farmId, vault, farmer);

        return vault;
    }
}
