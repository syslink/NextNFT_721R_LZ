// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../Base64.sol";

contract TangaNFT is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    // this is currently 1%
    uint256 public initMintPrice = 1000 ether; // 100
    uint256 public initBurnPrice = 900 ether; //  90

    uint256 public constant ChangeBioPrice = 200 ether;
    uint256 public constant LeavedMessagePrice = 50 ether;
    address public constant DeadAddr = 0x000000000000000000000000000000000000dEaD;

    struct LeavedMessage {
        address sender;
        string message;
        uint256 time;
    }

    address payable public creator;
    uint256 public totalEverMinted = 0;
    uint256 public reserve = 0;
    mapping(address => uint256) public somebodyBurnPeopleMap;
    mapping(address => uint256) public somebodyReleasePeopleMap;
    mapping(uint256 => uint256) public nftPriceMap;
    mapping(uint256 => string) public nftBioMap;
    mapping(uint256 => uint256) public nftFollowedWeightMap;
    mapping(uint256 => EnumerableSet.AddressSet) private nftFollowedUserMap;
    mapping(uint256 => LeavedMessage[]) public nftLeavedMessageMap;
    IERC20 public peopleToken;
    
    event Minted(uint256[] indexed tokenIds, uint256 amount, uint256 indexed pricePaid, uint256 indexed reserveAfterMint);
    event Burned(uint256[] indexed tokenIds, uint256 amount, uint256 indexed priceReceived, uint256 indexed reserveAfterBurn);
    event BurnedAndFollow(uint256[] indexed tokenIds, uint256 indexed peerNFT, uint256 followedUserNumber, uint256 totalFollowedWeight);
    event NFTBioChanged(uint256 indexed tokenId, string message);
    event NFTMessageLeaved(uint256 indexed tokenId, string message, uint256 time);

    constructor(address _peopleToken) ERC721("Tanga Volcanic NFT", "TangaNFT") Ownable() {
        creator = payable(msg.sender);
        peopleToken = IERC20(_peopleToken);
    }

    function setCreator(address payable _creator) public onlyOwner {
        creator = _creator;
    }

    function getSun(uint256 _number) public view returns (string memory) {
        return pluck("Sun", _number, unicode"🌞");
    }

    function getPeople(uint256 _number) public view returns (string memory) {
        return pluck("People", _number, unicode'👫');
    }
    
    function getSandyBeach(uint256 _number) public view returns (string memory) {
        return pluck("Sandy Beach", _number, unicode'🏖️');
    }
    
    function getVolcanic(uint256 _number) public view returns (string memory) {
        return pluck("Volcanic", _number, unicode'🌋');
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
        uint256 howMany1e6 = mintPrice.div(1e6);           // each 1000,000 will get one 🌞
        howMany1e6 = howMany1e6 > 10 ? 10 : howMany1e6;
        uint256 howMany1e5 = (mintPrice % 1e6).div(1e5);  // each 100,000 will get one 👫
        uint256 howMany1e4 = (mintPrice % 1e5).div(1e4);  // each 10,000 will get one 🏖️
        uint256 howMany1e3 = (mintPrice % 1e4).div(1e3);  // each 1,000 will get one 🌋

        string[21] memory parts;
        uint256 i = 0;
        parts[i++] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 425 425"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';

        parts[i++] = 'For People, For Future';

        parts[i++] = '</text><text x="10" y="40" class="base">';

        parts[i++] = string(abi.encodePacked('My Message: ', nftBioMap[tokenId]));

        parts[i++] = '</text><text x="10" y="60" class="base">';

        parts[i++] = string(abi.encodePacked('Amount of People: ', mintPrice.toString()));

        parts[i++] = '</text><text x="10" y="80" class="base">';

        parts[i++] = string(abi.encodePacked('Followers: ', nftFollowedUserMap[tokenId].length().toString()));

        parts[i++] = '</text><text x="10" y="100" class="base">';

        parts[i++] = string(abi.encodePacked('Total Weight of Followers: ', nftFollowedWeightMap[tokenId].div(1e21).toString()));

        parts[i++] = '</text><text x="10" y="120" class="base">';

        parts[i++] = string(abi.encodePacked('Leaved Messages: ', nftLeavedMessageMap[tokenId].length.toString()));

        parts[i++] = '</text><text x="10" y="140" class="base">';

        parts[i++] = getSun(howMany1e6);

        parts[i++] = '</text><text x="10" y="160" class="base">';

        parts[i++] = getPeople(howMany1e5);

        parts[i++] = '</text><text x="10" y="180" class="base">';

        parts[i++] = getSandyBeach(howMany1e4);

        parts[i++] = '</text><text x="10" y="200" class="base">';

        parts[i++] = getVolcanic(howMany1e3);

        parts[i++] = '</text></svg>';

        string memory output = "";
        for (uint j = 0; j < i; j++) {
            output = string(abi.encodePacked(output, parts[j]));
        }
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "TangaNFT #', tokenId.toString(), '", "description": "TangaNFT can be minted by consuming People token, it indicates people can be together to save the earth for the future of human.", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
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
        peopleToken.transferFrom(msg.sender, address(this), totalMintPrice);

        uint256 curSupply = getCurrentSupply();
        _tokenIds = new uint256[](_amount);
        for (uint256 i = 0; i < _amount; i++) {
            bytes32 hashed = keccak256(abi.encodePacked(totalEverMinted, block.timestamp, msg.sender));
            _tokenIds[i] = uint256(uint32(uint256(hashed)));

            _mint(msg.sender, _tokenIds[i]);
            totalEverMinted +=1;    
            uint256 mintPrice = (curSupply + i + 1).mul(initMintPrice);  
            nftPriceMap[_tokenIds[i]] = mintPrice;  
            nftBioMap[_tokenIds[i]] = _message;   
        }

        // disburse
        uint256 reserveCut = getReserveCut(_amount);
        reserve = reserve.add(reserveCut);
        peopleToken.transfer(creator, totalMintPrice.sub(reserveCut)); // 10%

        somebodyBurnPeopleMap[msg.sender] += totalMintPrice;

        emit Minted(_tokenIds, _amount, totalMintPrice, reserve);
    }

    function burn(uint256[] memory _tokenIds) public {
        require(msg.sender == tx.origin, "TangaNFT: only EOA");
        require(_tokenIds.length > 0, "TangaNFT: NO tokenId");

        uint256 burnPrice = getCurrentPriceToBurn(_tokenIds.length);
        
        // checks if allowed to burn
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(msg.sender == ownerOf(_tokenIds[i]), "TangaNFT: Not the correct owner");
            _burn(_tokenIds[i]);
        }

        reserve = reserve.sub(burnPrice);
        peopleToken.transfer(msg.sender, burnPrice);

        somebodyReleasePeopleMap[msg.sender] += burnPrice;

        emit Burned(_tokenIds, _tokenIds.length, burnPrice, reserve);
    }

    function burnAndFollow(uint256[] memory _myNFTs, uint256 _peerNFT) external {
        require(msg.sender == tx.origin, "TangaNFT: only EOA");
        require(ownerOf(_peerNFT) != msg.sender, "TangaNFT: can NOT follow yourself");
        
        uint256 totalAddedWeight;
        for (uint256 i = 0; i < _myNFTs.length; i++) {
            totalAddedWeight = totalAddedWeight.add(nftFollowedWeightMap[_myNFTs[i]].add(nftPriceMap[_myNFTs[i]]));
        }
        nftFollowedWeightMap[_peerNFT] = nftFollowedWeightMap[_peerNFT].add(totalAddedWeight);

        if (!nftFollowedUserMap[_peerNFT].contains(msg.sender)) {
            nftFollowedUserMap[_peerNFT].add(msg.sender);
        }
        
        burn(_myNFTs);

        emit BurnedAndFollow(_myNFTs, _peerNFT, nftFollowedUserMap[_peerNFT].length(), nftFollowedWeightMap[_peerNFT]);
    }

    function changeNFTBio(uint256 _tokenId, string memory _bio) external {
        require(ownerOf(_tokenId) == msg.sender, "TangaNFT: NOT owner");
        require(bytes(_bio).length <= 50, "TangaNFT: bio must be less then 50 bytes.");
        peopleToken.transferFrom(msg.sender, DeadAddr, ChangeBioPrice);
        nftBioMap[_tokenId] = _bio;

        emit NFTBioChanged(_tokenId, _bio);
    }

    function leaveMessage2NFT(uint256 _tokenId, string memory _message) external {
        require(bytes(_message).length <= 200, "TangaNFT: message must be less then 200 bytes.");
        peopleToken.transferFrom(msg.sender, DeadAddr, LeavedMessagePrice);
        nftLeavedMessageMap[_tokenId].push(LeavedMessage(msg.sender, _message, block.timestamp));

        emit NFTMessageLeaved(_tokenId, _message, block.timestamp);
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