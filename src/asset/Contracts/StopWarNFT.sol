// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IPeaceToken {
    function mint(address _receiver, uint256 _amount) external;
}

contract StopWarNFT is ERC721, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    address[] public mintableNFTs = [0x79FCDEF22feeD20eDDacbB2587640e45491b757f,
                                     0x59468516a8259058baD1cA5F8f4BFF190d30E066,
                                     0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D,
                                     0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB];
    mapping(string => bool) public supportedWordMap;
    bool public openAllWords = false;
    uint256 public maxWordNum = 1;

    uint256 public ukraineTotalAmount;
    uint256 public daoTotalAmount;
    uint256 public devTotalAmount;

    uint256 public BasePercent = 100;
    uint256 public UkrainePercent = 60;
    uint256 public DaoPercent = 30;
    uint256 public DevPercent = 10;

    mapping(address => mapping(uint256 => bool)) public mintedBaseNFTMap;
    mapping(uint256 => string) public tokenId2HashMap;
    string public baseURI = '';
    uint256 public tokenId = 1;
    IPeaceToken public peaceToken;
    uint256 public totalSupply = 1e26;  // 100000000
    uint256 public totalMintedAmount;
    uint256 public startTime;
    uint256 public OneWeek = 7 * 24 * 3600;
    uint256 public MaxPeaceAmountPerETH = 1e24;  // 1 000 000
    uint256 public MinusAmountPerWeek = 2e23; // 200 000
    uint256 public MinAmountPerETH = 1e23; // 100 000
    
    event Minted(address indexed sender, uint256 indexed value, uint256 indexed tokenId, uint256 peaceAmount);

    constructor(address _peaceToken, string memory _baseURI) ERC721("Stop War NFT", "StopWar") Ownable() {
        peaceToken = IPeaceToken(_peaceToken);
        baseURI = _baseURI;
        startTime = block.timestamp;
        supportedWordMap['Stop War'] = true;
        supportedWordMap['Peace'] = true;
        supportedWordMap['Love'] = true;

    }

    function mint(IERC721 mintableBaseNFT, uint256 _tokenId, string[] memory _words, string memory ipfsHash) payable external {
        require(msg.sender == tx.origin, "StopWarNFT: only EOA");
        require(!mintedBaseNFTMap[address(mintableBaseNFT)][_tokenId], "StopWarNFT: base NFT has been minted.");
        require(mintableBaseNFT.ownerOf(_tokenId) == msg.sender, "StopWarNFT: not the owner of NFT.");
        require(_words.length <= maxWordNum, "StopWarNFT: too many words");
        if (!openAllWords) {
            for (uint256 i; i < _words.length; i++) {
                require(supportedWordMap[_words[i]], "StopWarNFT: word not allowed");
            }
        }

        _mint(msg.sender, tokenId);
        tokenId2HashMap[tokenId] = ipfsHash;
        tokenId++;
        mintedBaseNFTMap[address(mintableBaseNFT)][_tokenId] = true;

        uint256 receivedPeaceAmount;
        if (msg.value > 0) {
            uint256 ukraineAmount = msg.value.mul(UkrainePercent).div(BasePercent);
            uint256 daoAmount = msg.value.mul(DaoPercent).div(BasePercent);
            uint256 devAmount = msg.value.sub(ukraineAmount).sub(daoAmount);

            ukraineTotalAmount = ukraineTotalAmount.add(ukraineAmount);
            daoTotalAmount = daoTotalAmount.add(daoAmount);
            devTotalAmount = devTotalAmount.add(devAmount);

            if (totalMintedAmount < totalSupply) {
                uint256 howManyWeek = (block.timestamp - startTime).div(OneWeek);
                uint256 peaceAmountPerETH = MaxPeaceAmountPerETH.sub(howManyWeek.mul(MinusAmountPerWeek));
                if (peaceAmountPerETH < MinAmountPerETH) peaceAmountPerETH = MinAmountPerETH;
                receivedPeaceAmount = peaceAmountPerETH.mul(msg.value).div(1 ether);
                if (totalMintedAmount.add(receivedPeaceAmount) > totalSupply) {
                    receivedPeaceAmount = totalSupply.sub(totalMintedAmount);
                }
                peaceToken.mint(msg.sender, receivedPeaceAmount);
                totalMintedAmount = totalMintedAmount.add(receivedPeaceAmount);
            }
        }
        emit Minted(msg.sender, msg.value, tokenId, receivedPeaceAmount);
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "StopWarNFT: URI query for nonexistent token");

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId2HashMap[_tokenId])) : "";
    }

    function setBaseURI(string memory _baseURI) onlyOwner external {
        baseURI = _baseURI;
    }

    function transferEth(address payable _receiver, uint256 _ukraineOrDaoOrDev) onlyOwner external {
        if (_ukraineOrDaoOrDev == 0) {
            _receiver.transfer(ukraineTotalAmount);
            ukraineTotalAmount = 0;
        } else if (_ukraineOrDaoOrDev == 1) {
            _receiver.transfer(daoTotalAmount);
            daoTotalAmount = 0;
        } else if (_ukraineOrDaoOrDev == 2) {
            _receiver.transfer(devTotalAmount);
            devTotalAmount = 0;
        }
    }
}