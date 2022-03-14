// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 


contract NextNFT is ERC721, Ownable {
    using SafeMath for uint256;

    struct Metadata {
        uint256 mintedTime;
        uint256 cost;
        address baseNFT;
        uint256 baseTokenId;
        string[] words;
    }

    mapping(address => bool) public mintableNFTs;
    mapping(string => bool) public freeWordMap;
    mapping(string => uint256) public payedWord2TokenIdMap;
    uint256 public pricePerWord = 0.005 ether;
    uint256 public pricePerPlusNFT = 0.01 ether;
    uint256 public pricePerMinusNFT = 0.009 ether;
    uint256 public earnedPercentPerPlusNFT = 10;  // 10%
    uint256 public totalEarned;

    mapping(address => mapping(uint256 => bool)) public mintedBaseNFTMap;
    mapping(uint256 => string) public tokenId2HashMap;
    mapping(uint256 => Metadata) public tokenId2MetadataMap;
    string public baseURI = "https://ipfs.moralis.io:2053/ipfs/";
    uint256 public tokenId = 1;
    uint256 public totalSupply;
    
    event Minted(address indexed sender, uint256 indexed tokenId, uint256 totalCost, address baseNFTAddr, uint256 indexed baseTokenId);

    constructor() ERC721("Next NFT", "Next") Ownable() {        
        freeWordMap['Stop War'] = true;
        freeWordMap['Peace'] = true;
        freeWordMap['Love'] = true;
        freeWordMap['Ukraine'] = true;

        mintableNFTs[0x79FCDEF22feeD20eDDacbB2587640e45491b757f] = true;  // mfer  0xd58bb8565fff77e049d11ae0fed0b74569633d7f @geo
        mintableNFTs[0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB] = true;  // cryptoPunk
        mintableNFTs[0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D] = true;  // Bored Ape
        mintableNFTs[0x9401518f4EBBA857BAA879D9f76E1Cc8b31ed197] = true;  // The Weirdo Ghost Gang
    }

    function addMintableNFT(address _nftAddr) external onlyOwner {
        mintableNFTs[_nftAddr] = true;
    }

    function mint(IERC721 mintableBaseNFT, uint256 _baseTokenId, string[] memory _words, string memory ipfsHash) payable external {
        require(msg.sender == tx.origin, "NextNFT: only EOA");
        require(mintableNFTs[address(mintableBaseNFT)], "NextNFT: NOT supported base NFT.");
        require(!mintedBaseNFTMap[address(mintableBaseNFT)][_baseTokenId], "NextNFT: base NFT has been minted.");
        require(mintableBaseNFT.ownerOf(_baseTokenId) == msg.sender, "NextNFT: not the owner of NFT.");
        
        uint256 payedWordCount = 0;
        for (uint256 i; i < _words.length; i++) {
            if(freeWordMap[_words[i]]) continue;
            require(payedWord2TokenIdMap[_words[i]] == 0, "NextNFT: word has been used.");
            payedWordCount++;
            payedWord2TokenIdMap[_words[i]] = tokenId;
        }
        uint256 wordCost = payedWordCount.mul(pricePerWord);

        _mint(msg.sender, tokenId);
        tokenId2HashMap[tokenId] = ipfsHash;
        tokenId++;
        totalSupply++;
        mintedBaseNFTMap[address(mintableBaseNFT)][_baseTokenId] = true;

        uint256 totalCost = totalSupply.mul(pricePerPlusNFT).add(wordCost);   // nft cost + word cost
        uint256 earnedAmount = totalSupply.mul(pricePerPlusNFT).div(earnedPercentPerPlusNFT).add(wordCost);
        totalEarned = totalEarned.add(earnedAmount);
        require(msg.value >= totalCost, "NextNFT: msg.value NOT enough!");
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value.sub(totalCost));
        }
        tokenId2MetadataMap[tokenId - 1] = Metadata(block.timestamp, totalCost, address(mintableBaseNFT), _baseTokenId, _words);
        
        emit Minted(msg.sender, tokenId, totalCost, address(mintableBaseNFT), _baseTokenId);
    }

    function burn(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "NextNFT: not the owner of NFT.");
        uint256 returnValue = totalSupply.mul(pricePerMinusNFT);
        payable(msg.sender).transfer(returnValue);
        Metadata memory metadata = tokenId2MetadataMap[_tokenId];
        for (uint256 i = 0; i < metadata.words.length; i++) {
            payedWord2TokenIdMap[metadata.words[i]] = 0;
        }
        mintedBaseNFTMap[metadata.baseNFT][metadata.baseTokenId] = false;
        tokenId2HashMap[_tokenId] = '';
        _burn(_tokenId);
        totalSupply--;
    }

    function getWords(uint256 _tokenId) view external returns(string[] memory words) {
        require(_exists(_tokenId), "NextNFT: nonexistent token");
        Metadata memory metadata = tokenId2MetadataMap[_tokenId];
        return metadata.words;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "NextNFT: URI query for nonexistent token");

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId2HashMap[_tokenId])) : "";
    }

    function setBaseURI(string memory _baseURI) onlyOwner external {
        baseURI = _baseURI;
    }

    function transferEth(address payable _receiver) onlyOwner external {
        _receiver.transfer(totalEarned);
        totalEarned = 0;
    }
}