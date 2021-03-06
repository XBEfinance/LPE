// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.6 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function mintSender(uint256 _amount) external {
      _mint(msg.sender, _amount);
    }
}
