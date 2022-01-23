// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./TangaNFT.sol";

contract TangaNFTHelper is Ownable {
    TangaNFT public tangaNFT;
    
    struct LeavedMessage {
        address sender;
        string message;
        uint256 time;
    }

    struct TangaNFTInfo {
        uint256 tokenId;
        string tokenURI;
        address owner;
        uint256 mintPrice;
        string bio;
        uint256 followersNum;
        uint256 followerWeight;
        uint256 leavedMessageNum;
    }

    constructor(address _tangaNFT) {
        tangaNFT = TangaNFT(_tangaNFT);
    }

    function setTangaNFT(address _tangaNFT) external onlyOwner {
        tangaNFT = TangaNFT(_tangaNFT);
    }

    function getTangaNFTInfos(uint256 _fromIndex, uint256 _toIndex) external view returns(TangaNFTInfo[] memory tangaNFTInfos) {
        uint256 length = tangaNFT.totalSupply();

        if (_toIndex > length) _toIndex = length;
        require(_fromIndex < _toIndex, "TangaNFTHelper: index out of range!");
        
        tangaNFTInfos = new TangaNFTInfo[](_toIndex - _fromIndex);
        uint256 count = 0;
        for (uint256 i = _toIndex - 1; i >= _fromIndex; i--) {
            uint256 tokenId = tangaNFT.tokenByIndex(i);
            string memory tokenURI = tangaNFT.tokenURI(tokenId);
            address owner = tangaNFT.ownerOf(tokenId);
            uint256 mintPrice = tangaNFT.nftPriceMap(tokenId);
            string memory bio = tangaNFT.nftBioMap(tokenId);
            uint256 followersNum = tangaNFT.getNFTFollowersNum(tokenId);
            uint256 followerWeight = tangaNFT.nftFollowedWeightMap(tokenId);
            uint256 leavedMessageNum = tangaNFT.getLeavedMessageNum(tokenId);
            tangaNFTInfos[count] = TangaNFTInfo(tokenId, tokenURI, owner, mintPrice, bio, followersNum, followerWeight, leavedMessageNum);
            count++;
            if (i == 0) break;
        }
    }

    function getLeavedMessages(uint256 _tokenId) external view returns(LeavedMessage[] memory messages) {
        uint256 leavedMessageNum = tangaNFT.getLeavedMessageNum(_tokenId);
        messages = new LeavedMessage[](leavedMessageNum);
        uint256 count = 0;
        for (uint256 i = leavedMessageNum - 1; i >= 0; i--) {
            (address sender, string memory message, uint256 time) = tangaNFT.nftLeavedMessageMap(_tokenId, i);
            messages[count++] = LeavedMessage(sender, message, time);
            if (i == 0) break;
        }
    }
}
