// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "./NextNFT.sol";

struct Metadata {
    uint256 mintedTime;
    uint256 cost;
    address baseNFT;
    uint256 baseTokenId;
}

interface INextNFT is IERC721 {
    function tokenId2MetadataMap(uint256 tokenId) view external returns(Metadata memory);
}

/*
1：每一期选出1~3个NFT，加入NEXT母NFT
2：每一期每个NEXT只能对一个NFT进行投票
3：投票过程中每个NEXT的权重在投票开始前便确定，公式：weight = (startTime - NEXT.mintTime) * NEXT.mintPrice
*/
contract NextDAO is Ownable {
    mapping(uint256 => address[]) public epochElectionNFTsMap;                      // 每一轮参与竞选的NFT
    mapping(uint256 => mapping(address => uint256)) public epochNFTVoteNumMap;      // 每一轮每一个NFT获得的票数
    mapping(uint256 => mapping(uint256 => address)) public epochNextVoteToNFTMap;   // 每一轮Next投向哪个NFT

    INextNFT public nextNFT;
    uint256 public curEpoch;
    uint256 public curEpochStartTime;
    uint256 public curEpochEndTime;

    constructor(address _nextNFT) Ownable() {   
        nextNFT = INextNFT(_nextNFT); 
    }

    function startNextEpoch(address[] memory _electionNFTs, uint256 _startTime, uint256 _endTime) onlyOwner external {
        curEpoch++;
        epochElectionNFTsMap[curEpoch] = _electionNFTs;
        curEpochStartTime = _startTime;
        curEpochEndTime = _endTime;
    }

    function vote2NFT(uint256 _nextTokenId, address _electionNFT) external {
        require(block.timestamp > curEpochStartTime && block.timestamp < curEpochEndTime, "NextDAO: out of time");
        require(nextNFT.ownerOf(_nextTokenId) == msg.sender, "NextDAO: NOT owner");
        require(epochNextVoteToNFTMap[curEpoch][_nextTokenId] == address(0), "NextDAO: can NOT vote more than once");
        address[] memory electionNFTs = epochElectionNFTsMap[curEpoch];
        uint256 i = 0;
        for (; i < electionNFTs.length; i++) {
            if (electionNFTs[i] == _electionNFT) break;
        }
        require(i < electionNFTs.length, "NextDAO: election NFT invalid");
        uint256 weight = getWeight(_nextTokenId);
        epochNFTVoteNumMap[curEpoch][_electionNFT] += weight;
        epochNextVoteToNFTMap[curEpoch][_nextTokenId] = _electionNFT;
    }

    function getWeight(uint256 _nextTokenId) public returns(uint256) {
        Metadata memory metadata = nextNFT.tokenId2MetadataMap(_nextTokenId);
        return metadata.cost * (curEpochStartTime - metadata.mintedTime);
    }
}