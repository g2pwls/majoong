// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title FarmVault (목장 금고)
/// @notice 농부의 토큰을 보관하고, 관리자 권한을 가진 계정만 출금할 수 있음
contract FarmVault is AccessControl {
    /// @notice 금고가 다루는 ERC20 토큰
    IERC20 public immutable token;

    /// @notice 농부(토큰 수령자) 주소
    address public immutable farmer;

    /// @notice 출금 권한
    bytes32 public constant RELEASER_ROLE = keccak256("RELEASER_ROLE");

    event Received(address indexed from, uint256 amount);
    event Released(address indexed to, uint256 amount);

    /// @param _token 금고에서 사용할 ERC20 토큰
    /// @param _farmer 농부(수령자) 주소
    /// @param admin 관리자 주소 (DEFAULT_ADMIN_ROLE, RELEASER_ROLE 부여)
    constructor(IERC20 _token, address _farmer, address admin) {
        token = _token;
        farmer = _farmer;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RELEASER_ROLE, admin);
    }

    /// @notice 현재 금고가 보유한 토큰 잔액 조회
    function tokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice 금고에서 농부에게 토큰 출금
    /// @param amount 출금할 수량
    /// @dev RELEASER_ROLE 보유자만 실행 가능
    function release(uint256 amount) external onlyRole(RELEASER_ROLE) {
        require(token.balanceOf(address(this)) >= amount, "insufficient");
        token.transfer(farmer, amount);
        emit Released(farmer, amount);
    }

    /// @dev 이더(ETH)는 받지 않음
    receive() external payable {
        revert("no native");
    }
}
