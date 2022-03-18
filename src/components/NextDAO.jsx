import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { useMoralis } from "react-moralis";
import { Card, Image, Button, Tooltip, List, Modal, Input, Skeleton, message, Typography, Select, Badge } from "antd";
import Icon, { GlobalOutlined, CloseCircleOutlined, LikeOutlined, EditOutlined, MehOutlined, SmileTwoTone, FrownOutlined } from "@ant-design/icons";
import { getEllipsisTxt } from "../helpers/formatters";
import BigNumber from "bignumber.js";
import AddressInput from "./AddressInput";
import Address from "./Address/Address";
import Blockies from "react-blockies";
import { getExplorer } from "helpers/networks";
import NextDAOInfo from '../asset/abi/nextDAO.json';
import NextNFTInfo from '../asset/abi/nextNFT_v2.json';
import OpenSeaLogo from '../asset/opensea.svg';

const { Text, Title } = Typography;
const { Meta } = Card;
const { TextArea } = Input;
const { Option } = Select;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "20 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
  newNFTs: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "center",
    margin: "20 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function NextDAO() {
  // const { data: NFTBalances } = useNFTBalances();
  const { Moralis, chainId, account } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [voteVisible, setVoteVisibility] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [mintVisible, setMintVisibility] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [myNFTInfos, setMyNFTInfos] = useState([]);
  const [electionNFTs, setElectionNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [curEpoch, setCurEpoch] = useState(null);
  const [ipfsGateWay, setIPFSGateway] = useState('https://gateway.ipfs.io/ipfs/');
  const [nextNFT, setNextNFT] = useState(null);
  const [nextDAO, setNextDAO] = useState(null);
  const [electedNFT, setElectedNFT] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      Moralis.Web3.enableWeb3().then(async (web3) => {
        const nextNFTContract = new web3.eth.Contract(NextNFTInfo.abi, NextNFTInfo.address);
        const nextDAOContract = new web3.eth.Contract(NextDAOInfo.abi, NextDAOInfo.address);
        setNextNFT(nextNFTContract);
        setNextDAO(nextDAOContract);
        
        nextDAOContract.methods.curEpoch().call().then(epoch => {
          setCurEpoch(parseInt(epoch));
          nextDAOContract.methods.getAllElectionNFTs(parseInt(epoch)).call().then(async (electionNFTInfos) => {
            console.log('electionNFTInfos', electionNFTInfos);
            setIsLoading(true);
            const nftResult = [];
            for (var i = 0; i < electionNFTInfos.length; i++) {
              const electionNFT = electionNFTInfos[i];
              const options = { address: electionNFT, chain: chainId, offset: 0, limit: 1 };
              const nfts = await Moralis.Web3API.token.getAllTokenIds(options);
              if (nfts.result.length > 0) {
                const nft = nfts.result[0];
                const voteNumber = await nextDAOContract.methods.epochNFTVoteNumMap(parseInt(epoch), nfts.result[0].token_address).call();
                nft.vote_number = voteNumber;
                nftResult.push(nft);
              }
            }
            console.log(nftResult);
            setElectionNFTs(nftResult);
            setIsLoading(false);
          });
        });

        nextDAOContract.methods.curEpochStartTime().call().then(startTime => {
          setStartTime(startTime);
        });

        nextDAOContract.methods.curEpochEndTime().call().then(endTime => {
          setEndTime(endTime);
        });

        const options = { chain: chainId, token_address: NextNFTInfo.address };
        Moralis.Web3API.account.getNFTsForContract(options).then(async (nfts) => {
          console.log('my NEXT NFTs', nfts.result);
          const myNFTs = [];
          for (var i = 0; i < nfts.result.length; i++) {
            const nft = nfts.result[i];
            const voteWeight = await nextDAOContract.methods.getWeight(parseInt(nft.token_id)).call();
            nft.vote_weight = voteWeight;
            myNFTs.push(nft);
          }
          setMyNFTInfos(myNFTs);
        });
      })
    };
    
    fetchData();
    // if (currentImg != null) console.log('currentImg', currentImg);
  }, [Moralis, account, chainId]);

  const voteNFT = async (nft) => {
    setElectedNFT(nft);
    if (myNFTInfos.length === 0) {
      message.warning('You have no NEXT nft to vote.');
      return;
    }
    setVoteVisibility(true);
    const nftInfos = [];
    for (var i = 0; i < myNFTInfos.length; i++) {
      const nftInfo = myNFTInfos[i];
      const votedNFT = await nextDAO.methods.epochNextVoteToNFTMap(curEpoch, nftInfo.token_id).call();
      nftInfo.voted_nft = votedNFT;
      nftInfos.push(nftInfo);
    }
    setMyNFTInfos(nftInfos);
  }

  const vote = () => {
    const now = new Date().getTime() / 1000;
    if (now < startTime) {
      message.warning('Voting has not yet started.');
      return;
    }
    if (now > endTime) {
      message.warning('Voting has been closed.');
      return;
    }
    nextDAO.methods.vote2NFT(selectedNFT.token_id, electedNFT.token_address).send({from: account})
      .on('transactionHash', function(hash){
        console.log(hash);
      })
      .on('receipt', function(receipt){
        console.log(receipt);
        setIsPending(false);
      })
      .on('error', function(error, receipt) { 
        console.log(error, receipt);
        setIsPending(false);
      });
  }

  const handleVoteNFTClick = (nft) => {
    setSelectedNFT(nft);
  };

  const checkNFTMarket = (nftAddress) => {
    window.open("https://opensea.io/assets?search[query]=" + nftAddress, "_blank");
  }

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>
        Vote the NFT [{new Date(parseInt(startTime)*1000).toLocaleString()} ~ {new Date(parseInt(endTime)*1000).toLocaleString()}]
      </h1>
      <div style={styles.NFTs}>
        <Skeleton active loading={isLoading}>
          {electionNFTs != null && electionNFTs.map((nft, index) => {
              const image = JSON.parse(nft.metadata).image.substr('ipfs://'.length);
              const imageUrl = ipfsGateWay + image;   
              nft.imageUrl = imageUrl;  
              
              return (
                <Card
                  hoverable
                  actions={[                    
                    <Tooltip title="Vote this NFT">
                      <LikeOutlined onClick={() => voteNFT(nft)}/>
                    </Tooltip>,          
                    <Tooltip title="Show NFT Market">
                      <GlobalOutlined onClick={() => checkNFTMarket(nft.token_address)} />
                    </Tooltip>, 
                  ]}
                  style={{ width: 300, border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={nft.imageUrl}
                      fallback="data:image/png;base64,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"
                      alt=""
                      style={{ height: "300px", width: "300px" }}
                    />
                  }
                  key={index}
                >
                  <Meta title={nft.symbol + '\'s Votes:' + nft.vote_number} description={<Address avatar='left' size={6} copyable style={{ fontSize: "20px" }} address={nft.token_address}/>} />
                </Card>
              );
            })}
        </Skeleton>
      </div>
      <Modal
        title={`Vote for ${electedNFT?.name || 'NFT'}`}
        visible={voteVisible}
        onCancel={() => setVoteVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <Button type='primary' loading={isPending} onClick={() => vote()}>Vote</Button>
        ]}
        width='700px'
      >
        <div style={styles.NFTs}>
          <Skeleton loading={isLoading}>
            {myNFTInfos != null && myNFTInfos.map((nft, index) => {    
                  
                const titleContent = (selectedNFT == null || selectedNFT.token_id !== nft.token_id) ? 'Please select me, master' : 'Thanks, master';    
                return (
                  <Card
                    hoverable
                    actions={
                      nft.voted_nft === '0x0000000000000000000000000000000000000000' ? [
                        <Tooltip title={titleContent} style={{ height: 50 }}>
                          {
                            selectedNFT == null ? <MehOutlined onClick={() => handleVoteNFTClick(nft)}/> : 
                            (selectedNFT.token_id !== nft.token_id) ? 
                              <FrownOutlined onClick={() => handleVoteNFTClick(nft)}/> :
                              <SmileTwoTone onClick={() => handleVoteNFTClick(nft)}/>
                          }
                          
                        </Tooltip>,
                      ] : [
                        <Tooltip title={'Has been voted to ' + nft.voted_nft} style={{ height: 50 }}>
                          <CloseCircleOutlined onClick={() => checkNFTMarket(nft.voted_nft)}/>
                        </Tooltip>,
                      ]}
                    style={{ width: 200, border: "2px solid #e7eaf3" }}
                    cover={<Image 
                            preview={false} 
                            src={nft.token_uri} 
                            fallback="data:image/png;base64,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"
                            alt="" 
                            style={{ height: "200px", width: '200px' }} 
                          />}
                    key={index}
                  >
                    <Meta title={nft.name + ' #' + nft.token_id} description={'Vote weight:' + nft.vote_weight} />
                  </Card>
                );
              })}
          </Skeleton>
        </div>
      </Modal>
    
    </div>
  );
}

export default NextDAO;
