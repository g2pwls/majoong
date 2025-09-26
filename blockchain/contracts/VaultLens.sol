// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Interface FarmVault, FarmVaultFactory
interface IFarmVault {
    function token() external view returns (address);
    function farmer() external view returns (address);
    function RELEASER_ROLE() external view returns (bytes32);
    function hasRole(bytes32 role, address account) external view returns (bool);
    function tokenBalance() external view returns (uint256); // vault 내 토큰 잔액
}

interface IFarmVaultFactory {
    function vaultOf(uint256 farmId) external view returns (address); // farmId -> vault
}

/// ───────────────────────────
/// Lens (조회용 컨트랙트)
/// ───────────────────────────
contract VaultLens {
    struct VaultInfo {
        address vault;
        address token;
        address farmer;
        uint256 vaultTokenBalance; // 금고가 보유한 토큰 잔액(wei 단위)
        bool    isReleaser;        // who가 RELEASER_ROLE 보유 여부
    }

    /// factory로부터 farmId의 vault 주소 조회
    function vaultOf(address factory, uint256 farmId) public view returns (address) {
        return IFarmVaultFactory(factory).vaultOf(farmId);
    }

    /// 특정 vault의 요약 정보 + 특정 계정의 출금 권한 여부
    function vaultInfo(address vault, address who) public view returns (VaultInfo memory v) {
        IFarmVault V = IFarmVault(vault);
        v.vault = vault;
        v.token = V.token();
        v.farmer = V.farmer();
        v.vaultTokenBalance = V.tokenBalance();
        v.isReleaser = V.hasRole(V.RELEASER_ROLE(), who);
    }
}
