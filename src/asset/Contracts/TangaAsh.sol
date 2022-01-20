// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; 
import "./Minter.sol";

contract TangaAsh is ERC20, Minter {
    using SafeMath for uint256;
    
    uint256 public constant maxSupply = 1e33;     // the total supply 34 - 18 = 16, 1,000,000,0 00,00 0,000
    uint256 public constant devTotalSupply = 5e31;     // dev 5%
    uint256 public constant devInitSupply = 1e30;      
    uint256 public TotalMintSecondByDev = 3600 * 24 * 512;
    uint256 public mintPerSecondByDev;
    uint256 public startTime;

    constructor() public ERC20("Tanga Volcanic Ash", "TVA") {
        addMinter(msg.sender);
        _mint(msg.sender, devInitSupply); 
        mintPerSecondByDev = devTotalSupply.sub(devInitSupply).div(TotalMintSecondByDev);
        startTime = block.timestamp + 30 * 24 * 3600;
    }

    function mint(address _to, uint256 _amount) public onlyMinter {
        require (_amount.add(totalSupply()) <= maxSupply, "TangaAsh: exceed the max supply");
        _mint(_to, _amount);
    }

    function withdrawByDev() external onlyOwner {
        require (block.timestamp > startTime, "TangaAsh: NOT time yet!");
        uint256 mintableAmount = block.timestamp.sub(startTime).mul(mintPerSecondByDev);
        _mint(msg.sender, mintableAmount);
        startTime = block.timestamp;
    }
}
