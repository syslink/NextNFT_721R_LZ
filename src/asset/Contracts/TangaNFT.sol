// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Base64.sol";

contract TangaNFT is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // this is currently 1%
    uint256 public initMintPrice = 1e10 ether; // 10B
    uint256 public initBurnPrice = 9e9 ether; //  9.9B

    uint256 public constant ChangeMessagePrice = 1e9 ether;
    uint256 public constant LeavedMessagePrice = 1e8 ether;
    address public constant DeadAddr = 0x000000000000000000000000000000000000dEaD;

    address payable public creator;
    uint256 public totalEverMinted = 0;
    uint256 public reserve = 0;
    mapping(address => uint256) public somebodyBurnTVAMap;
    mapping(address => uint256) public somebodyReleaseTVAMap;
    mapping(uint256 => uint256) public nftPriceMap;
    mapping(uint256 => string) public nftMessageMap;
    mapping(uint256 => uint256) public nftFollowedWeightMap;
    mapping(uint256 => EnumerableSet.AddressSet) private nftFollowedUserMap;
    mapping(uint256 => string[]) public nftLeavedMessageMap;
    IERC20 public tangaToken;
    
    event Minted(uint256[] indexed tokenIds, uint256 amount, uint256 indexed pricePaid, uint256 indexed reserveAfterMint);
    event Burned(uint256[] indexed tokenIds, uint256 amount, uint256 indexed priceReceived, uint256 indexed reserveAfterBurn);
    event BurnedAndFollow(uint256[] indexed tokenIds, uint256 indexed peerNFT, uint256 followedUserNumber, uint256 totalFollowedWeight);
    event NFTMessageChanged(uint256 indexed tokenId, string message);
    event NFTMessageLeaved(uint256 indexed tokenId, string message);

    constructor(address _tangaToken) ERC721("Tanga Volcanic NFT", "TangaNFT") Ownable() {
        creator = payable(msg.sender);
        tangaToken = IERC20(_tangaToken);
    }

    function setCreator(address payable _creator) public onlyOwner {
        creator = _creator;
    }

    function getSun(uint256 _nubmer) public view returns (string memory) {
        return pluck("Sun", _nubmer, unicode"🌞");
    }

    function getPeople(uint256 _nubmer) public view returns (string memory) {
        return pluck("People", _nubmer, unicode'👫');
    }
    
    function getSandyBeach(uint256 _nubmer) public view returns (string memory) {
        return pluck("Sandy Beach", _nubmer, unicode'🏖️');
    }
    
    function getVolcanic(uint256 _nubmer) public view returns (string memory) {
        return pluck("Volcanic", _nubmer, unicode'🌋');
    }

    function pluck(string memory keyPrefix, uint256 _number, string memory _emoji) internal view returns (string memory) {        
        string memory output = string(abi.encodePacked(keyPrefix, ": "));
        for (uint256 i = 0; i < _number; i++) {
            output = string(abi.encodePacked(output, _emoji));
        }
        return output;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 mintPrice = nftPriceMap[tokenId].div(1e18);
        uint256 howMany1e13 = mintPrice.div(1e13);           // each 1e13 will get one 🌞
        howMany1e13 = howMany1e13 > 10 ? 10 : howMany1e13;
        uint256 howMany1e12 = (mintPrice % 1e13).div(1e12);  // each 1e12 will get one 👫
        uint256 howMany1e11 = (mintPrice % 1e12).div(1e11);  // each 1e11 will get one 🏖️
        uint256 howMany1e10 = (mintPrice % 1e11).div(1e10);  // each 1e10 will get one 🌋

        string[21] memory parts;
        uint256 i = 0;
        parts[i++] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 425 425"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[i++] = 'For Future of Human';

        parts[i++] = '</text><text x="10" y="40" class="base">';

        parts[i++] = string(abi.encodePacked('My Message: ', nftMessageMap[tokenId]));

        parts[i++] = '</text><text x="10" y="60" class="base">';

        parts[i++] = string(abi.encodePacked('Amount of TVA: ', mintPrice.div(1e9).toString(), 'B'));

        parts[i++] = '</text><text x="10" y="80" class="base">';

        parts[i++] = string(abi.encodePacked('Followers: ', nftFollowedUserMap[tokenId].length().toString()));

        parts[i++] = '</text><text x="10" y="100" class="base">';

        parts[i++] = string(abi.encodePacked('Total Weight of Followers: ', nftFollowedWeightMap[tokenId].div(1e27).toString()));

        parts[i++] = '</text><text x="10" y="120" class="base">';

        parts[i++] = string(abi.encodePacked('Leaved Messages: ', nftLeavedMessageMap[tokenId].length.toString()));

        parts[i++] = '</text><text x="10" y="140" class="base">';

        parts[i++] = getSun(howMany1e13);

        parts[i++] = '</text><text x="10" y="160" class="base">';

        parts[i++] = getPeople(howMany1e12);

        parts[i++] = '</text><text x="10" y="180" class="base">';

        parts[i++] = getSandyBeach(howMany1e11);

        parts[i++] = '</text><text x="10" y="200" class="base">';

        parts[i++] = getVolcanic(howMany1e10);

        parts[i++] = '</text></svg>';

        string memory output = "";
        for (uint j = 0; j < i; j++) {
            output = string(abi.encodePacked(output, parts[j]));
        }
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "TangaNFT #', tokenId.toString(), '", "description": "TangaNFT indicates the amount of volcanic ash consumed by the user when casting this NFT, the more the amount, the more it can protect the environment.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }

    function mint(uint256 _amount, uint256 _maxPriceFirstRobot, string memory _message) external returns (uint256[] memory _tokenIds)  {
        require(msg.sender == tx.origin, "TangaNFT: only EOA");
        require(_amount > 0, "TangaNFT: _amount must be larger than zero.");
        require(bytes(_message).length <= 50, "TangaNFT: message must be less then 50 bytes.");

        uint256 firstPrice = getCurrentPriceToMint(1); 
        require(firstPrice <= _maxPriceFirstRobot, "TangaNFT: Price does NOT match your expected.");

        uint256 totalMintPrice = _amount == 1 ? firstPrice : getCurrentPriceToMint(_amount);
        tangaToken.transferFrom(msg.sender, address(this), totalMintPrice);

        uint256 curSupply = getCurrentSupply();
        _tokenIds = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            bytes32 hashed = keccak256(abi.encodePacked(totalEverMinted, block.timestamp, msg.sender));
            _tokenIds[i] = uint256(uint32(uint256(hashed)));

            _mint(msg.sender, _tokenIds[i]);
            totalEverMinted +=1;    
            uint256 mintPrice = (curSupply + i + 1).mul(initMintPrice);  
            nftPriceMap[_tokenIds[i]] = mintPrice;  
            nftMessageMap[_tokenIds[i]] = _message;   
        }

        // disburse
        uint256 reserveCut = getReserveCut(_amount);
        reserve = reserve.add(reserveCut);
        tangaToken.transfer(creator, totalMintPrice.sub(reserveCut)); // 10%

        somebodyBurnTVAMap[msg.sender] += totalMintPrice;

        emit Minted(_tokenIds, _amount, totalMintPrice, reserve);
    }

    function burn(uint256[] memory _tokenIds) public {
        require(msg.sender == tx.origin, "TangaNFT: only EOA");
        
        uint256 burnPrice = getCurrentPriceToBurn(_tokenIds.length);
        
        // checks if allowed to burn
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(msg.sender == ownerOf(_tokenIds[i]), "TangaNFT: Not the correct owner");
            _burn(_tokenIds[i]);
        }

        reserve = reserve.sub(burnPrice);
        tangaToken.transfer(msg.sender, burnPrice);

        somebodyReleaseTVAMap[msg.sender] += burnPrice;

        emit Burned(_tokenIds, _tokenIds.length, burnPrice, reserve);
    }

    function burnAndFollow(uint256[] memory _myNFTs, uint256 _peerNFT) external {
        require(msg.sender == tx.origin, "TangaNFT: only EOA");
        require(ownerOf(_peerNFT) != msg.sender, "TangaNFT: can NOT follow yourself");
        
        for (uint256 i = 0; i < _myNFTs.length; i++) {
            nftFollowedWeightMap[_peerNFT] = nftFollowedWeightMap[_myNFTs[i]].add(nftPriceMap[_myNFTs[i]]);
        }

        if (!nftFollowedUserMap[_peerNFT].contains(msg.sender)) {
            nftFollowedUserMap[_peerNFT].add(msg.sender);
        }
        
        burn(_myNFTs);

        emit BurnedAndFollow(_myNFTs, _peerNFT, nftFollowedUserMap[_peerNFT].length(), nftFollowedWeightMap[_peerNFT]);
    }

    function changeNFTMessage(uint256 _tokenId, string memory _message) external {
        require(ownerOf(_tokenId) == msg.sender, "TangaNFT: NOT owner");
        require(bytes(_message).length <= 50, "TangaNFT: message must be less then 50 bytes.");
        tangaToken.transferFrom(msg.sender, DeadAddr, ChangeMessagePrice);
        nftMessageMap[_tokenId] = _message;

        emit NFTMessageChanged(_tokenId, _message);
    }

    function leaveMessage2NFT(uint256 _tokenId, string memory _message) external {
        require(bytes(_message).length <= 50, "TangaNFT: message must be less then 50 bytes.");
        tangaToken.transferFrom(msg.sender, DeadAddr, LeavedMessagePrice);
        nftLeavedMessageMap[_tokenId].push(_message);

        emit NFTMessageLeaved(_tokenId, _message);
    }

    function getLeavedMessageNum(uint256 _tokenId) public view returns(uint256) {
        return nftLeavedMessageMap[_tokenId].length;
    }

    function getCurrentPriceToMint(uint256 _amount) public view returns (uint256) {
        uint256 curSupply = getCurrentSupply();
        
        uint256 totalPrice;
        for (uint256 i = 1; i <= _amount; i++) {
            uint256 mintPrice = (curSupply + i).mul(initMintPrice);
            totalPrice = totalPrice.add(mintPrice);
        }
        
        return totalPrice;
    }

    // helper function for legibility
    function getReserveCut(uint256 _amount) public view returns (uint256) {
        return getCurrentPriceToBurn(_amount);
    }

    function getCurrentPriceToBurn(uint256 _amount) public view returns (uint256) {
        uint256 curSupply = getCurrentSupply();
        if (curSupply == 0) return 0;
        
        uint256 totalBurnPrice;
        for (uint256 i = 0; i < _amount; i++) {
            uint256 burnPrice = (curSupply - i).mul(initBurnPrice);
            totalBurnPrice = totalBurnPrice.add(burnPrice);
        }
        
        return totalBurnPrice;
    }

    function getCurrentSupply() public view returns (uint256) {
        return totalSupply();
    }

    function getNFTFollowersNum(uint256 _tokenId) public view returns(uint256) {
        return nftFollowedUserMap[_tokenId].length();
    }

    function getNFTFollowers(uint256 _tokenId, uint256 _fromIndex, uint256 _toIndex) view external returns(address[] memory followers) {
        uint256 length = nftFollowedUserMap[_tokenId].length();
        if (_toIndex > length) _toIndex = length;
        require(_fromIndex < _toIndex, "TangaNFT: index out of range!");
        
        followers = new address[](_toIndex - _fromIndex);
        uint256 count = 0;
        for (uint256 i = _fromIndex; i < _toIndex; i++) {
            address follower = nftFollowedUserMap[_tokenId].at(i);
            followers[count++] = follower;
        }
    }
}