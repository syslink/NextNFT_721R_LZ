// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PeaceToken is ERC20 {
    address public minter;
    address public owner;

    constructor() ERC20("Peace Token", "Peace") {
        owner = msg.sender;
    }

    function setMinter(address _minter) public {
        require(msg.sender == owner, "PeaceToken: Not owner");
        minter = _minter;
    }

    // mint with max supply
    function mint(address _to, uint256 _amount) public returns (bool) {
        require(msg.sender == minter, "PeaceToken: Not minter");
        _mint(_to, _amount);
        return true;
    }
}