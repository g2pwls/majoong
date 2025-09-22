// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// ───────────────────────────
/// Minimal interfaces (read-only)
/// ───────────────────────────
interface IERC20Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function balanceOf(address account) external view returns (uint256);
}

interface IFarmVault {
    function token() external view returns (address);
    function farmer() external view returns (address);
    function RELEASER_ROLE() external view returns (bytes32);
    function hasRole(bytes32 role, address account) external view returns (bool);
    function tokenBalance() external view returns (uint256); // our vault has this helper
}

interface IFarmVaultFactory {
    function token() external view returns (address);
    function vaultOf(uint256 farmId) external view returns (address); // farmId -> vault
}

/// ───────────────────────────
/// Lens (read-only aggregator)
/// ───────────────────────────
contract VaultLens {
    struct TokenMeta {
        string name_;
        string symbol_;
        uint8  decimals_;
    }

    struct VaultInfo {
        address vault;
        address token;
        address farmer;
        uint256 vaultTokenBalance; // token balance held by vault
        bool    isReleaser;        // for the given `who`
    }

    /// factory로부터 farmId의 vault 주소 조회
    function vaultOf(address factory, uint256 farmId) public view returns (address) {
        return IFarmVaultFactory(factory).vaultOf(farmId);
    }

    /// 특정 vault의 요약 정보 + 특정 계정의 출금 권한 여부
    function vaultInfo(address vault, address who) public view returns (VaultInfo memory v) {
        IFarmVault V = IFarmVault(vault);
        address t = V.token();
        v.vault = vault;
        v.token = t;
        v.farmer = V.farmer();
        // 우리 Vault는 tokenBalance() 제공. 없을 경우 IERC20(t).balanceOf(vault) 사용 가능.
        v.vaultTokenBalance = V.tokenBalance();
        v.isReleaser = V.hasRole(V.RELEASER_ROLE(), who);
    }

    /// 여러 farmId를 한 번에 조회 (배치)
    function batchVaultInfo(
        address factory,
        uint256[] calldata farmIds,
        address who
    ) external view returns (VaultInfo[] memory out) {
        out = new VaultInfo[](farmIds.length);
        for (uint256 i = 0; i < farmIds.length; i++) {
            address vault = IFarmVaultFactory(factory).vaultOf(farmIds[i]);
            out[i] = vaultInfo(vault, who);
        }
    }

    /// 토큰 메타데이터(표시용)
    function tokenMeta(address token) external view returns (TokenMeta memory m) {
        IERC20Metadata t = IERC20Metadata(token);
        m.name_ = t.name();
        m.symbol_ = t.symbol();
        m.decimals_ = t.decimals();
    }

    /// 임의 계정의 토큰 잔액
    function tokenBalanceOf(address token, address account) external view returns (uint256) {
        return IERC20Metadata(token).balanceOf(account);
    }

    /// 여러 계정의 토큰 잔액 배치 조회
    function tokenBalancesOf(
        address token,
        address[] calldata accounts
    ) external view returns (uint256[] memory balances) {
        IERC20Metadata t = IERC20Metadata(token);
        balances = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            balances[i] = t.balanceOf(accounts[i]);
        }
    }
}
