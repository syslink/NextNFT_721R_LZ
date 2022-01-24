import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { InputNumber, Card, Image, Comment, Tooltip, List, Modal, Input, Skeleton, Checkbox, Button, Typography, Select, Badge } from "antd";
import { FileSearchOutlined, SendOutlined, SwapOutlined, EditOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { getEllipsisTxt } from "../helpers/formatters";
import BigNumber from "bignumber.js";
import AddressInput from "./AddressInput";
import Address from "./Address/Address";
import Blockies from "react-blockies";
//import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import TangaNFTInfo from '../asset/abi/tangaNFT.json';
import TangaNFTHelperInfo from '../asset/abi/tangaNFTHelper.json';
import PeopleTokenInfo from '../asset/abi/peopleToken.json';

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
};

function NFTBalance() {
  // const { data: NFTBalances } = useNFTBalances();
  const { Moralis, chainId, account } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [ruleVisible, setRuleVisibility] = useState(false);
  const [bioVisible, setBioVisibility] = useState(false);
  const [mintVisible, setMintVisibility] = useState(false);
  const [batchBurnVisible, setBatchBurnVisibility] = useState(false);
  const [receiverToSend, setReceiver] = useState(null);
  const [amountToSend, setAmount] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [NFTInfos, setNFTInfos] = useState([]);
  const [onlyMe, setOnlyMe] = useState(false);
  const [approved, setApproved] = useState(false);
  const [allowanced, setAllowanced] = useState(0);
  const [nftMessage, setNFTMessage] = useState("");
  const [mintAmount, setMintAmount] = useState(0);
  const [mintPrice, setMintPrice] = useState(0);
  const [burnPrice, setBurnPrice] = useState(0);
  const [minting, setMinting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [tangaNFT, setTangaNFT] = useState(null);
  const [tangaNFTHelper, setTangaNFTHelper] = useState(null);
  const [peopleToken, setPeopleToken] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState(5);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [followedNFT, setFollowedNFT] = useState(0);
  const [batchBurning, setBatchBurning] = useState(false);
  const [messageVisible, setMessageVisibility] = useState(false);
  const [leavedMessageVisible, setLeavedMessageVisibility] = useState(false);
  const [bio, setBio] = useState(false);
  const [leavedMessage, setLeavedMessage] = useState('');
  const [bioPrice, setBioPrice] = useState(0);
  const [messagePrice, setMessagePrice] = useState(0);
  const [messageData, setMessageData] = useState([]);
  const [web3Obj, setWeb3Obj] = useState(null);
  
  var myNFTs = [];
  var otherNFTs = [];

  useEffect(() => {
    const fetchData = () => {
      Moralis.Web3.enableWeb3().then(async (web3) => {
        setWeb3Obj(web3);
        const peopleTokenContract= new web3.eth.Contract(PeopleTokenInfo.abi, PeopleTokenInfo.address);
        const tangaNFTHelperContract = new web3.eth.Contract(TangaNFTHelperInfo.abi, TangaNFTHelperInfo.address);
        const tangaNFTContract = new web3.eth.Contract(TangaNFTInfo.abi, TangaNFTInfo.address);

        setPeopleToken(peopleTokenContract);
        setTangaNFT(tangaNFTContract);
        setTangaNFTHelper(tangaNFTHelperContract);
        
        tangaNFTContract.methods.totalSupply().call().then(nftNumber => {
          setTotalSupply(nftNumber);
          if (nftNumber > 0) {
            tangaNFTHelperContract.methods.getTangaNFTInfos(0, nftNumber).call().then(nftInfos => {
              console.log(nftInfos);
              setIsLoading(false);
              setNFTInfos(nftInfos);                   
            });
          } else {
            setIsLoading(false);
          }
        });

        tangaNFTContract.methods.LeavedMessagePrice().call().then(messagePrice => {
          setMessagePrice(messagePrice);
        });

        tangaNFTContract.methods.ChangeBioPrice().call().then(bioPrice => {
          setBioPrice(bioPrice);
        });
        
        if (account != null) {
          peopleTokenContract.methods.allowance(account, TangaNFTInfo.address).call().then(allowancedAmount => {
            setAllowanced(allowancedAmount);
            if (new BigNumber(allowancedAmount).gt(new BigNumber(1000))) {
              setApproved(true);
            }
          });
        }
      })
    };
    
    fetchData();
  }, [Moralis, account, totalSupply]);

  const showMintNFTDialog = () => {
    setMintVisibility(true);
  }

  const showBatchBurnDialog = () => {
    setBatchBurnVisibility(true);
    setFollowedNFT(0);
  }

  const showRuleOfMintBurn = () => {
    setRuleVisibility(true);
  }

  async function transfer() {
    const options = {
      type: "erc721",
      tokenId: parseInt(nftToSend.tokenId),
      receiver: receiverToSend,
      contractAddress: TangaNFTInfo.address,
    };

    setIsPending(true);
    await Moralis.transfer(options)
      .then((tx) => {
        console.log(tx);
        setIsPending(false);
        setVisibility(false)
      })
      .catch((e) => {
        //alert(e.message);
        setIsPending(false);
      });
  }

  function sendNFTMessage(nft) {
    setIsPending(true);
    tangaNFT.methods.leaveMessage2NFT(nft.tokenId, leavedMessage).send({from: account})
    .on('transactionHash', function(hash){
      console.log(hash);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
      setIsPending(false);
      setMessageVisibility(false);
    })
    .on('error', function(error, receipt) { 
      console.log(error, receipt);
      setIsPending(false);
    });
  }

  const handleTransferClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleModifyBioClick = (nft) => {
    setNftToSend(nft);
    setBioVisibility(true);
  }

  const sendMessage = (nft) => {
    setNftToSend(nft);
    setMessageVisibility(true);
  }

  const approvePeople = () => {
    setApproving(true);
    peopleToken.methods.approve(TangaNFTInfo.address, '0x' + new BigNumber(1).shiftedBy(25).toString(16)).send({from: account})
    .on('transactionHash', function(hash){
      console.log(hash);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
      setApproved(receipt.status);
      setApproving(false);
    })
    .on('error', function(error, receipt) { 
      console.log(error, receipt);
      setApproving(false);
    });
  }

  const mintAmountChange = (e) => {
    if (e.target.value === "") return;
    const value = parseInt(e.target.value);
    setMintAmount(value);
    tangaNFT.methods.getCurrentPriceToMint(value).call().then(mintPrice => {
      setMintPrice(mintPrice);
      if (new BigNumber(mintPrice).lt(new BigNumber(allowanced))) {
        setApproved(true);
      }
    });
  };

  function modifyBio(nft) {
    setIsPending(true);
    tangaNFT.methods.changeNFTBio(nft.tokenId, bio).send({from: account})
    .on('transactionHash', function(hash){
      console.log(hash);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
      setIsPending(false);
      setBioVisibility(false);
    })
    .on('error', function(error, receipt) { 
      console.log(error, receipt);
      setIsPending(false);
    });
  }

  function mintNFT() {
    setIsPending(true);
    tangaNFT.methods.getCurrentPriceToMint(1).call().then(mintPrice => {
      tangaNFT.methods.mint(mintAmount, '0x' + new BigNumber(mintPrice).multipliedBy(new BigNumber(100 + slippageTolerance)).toString(16), nftMessage).send({from: account})
      .on('transactionHash', function(hash){
        console.log(hash);
        var intervalID = setInterval(() =>
          web3Obj.eth.getTransactionReceipt(hash).then(receipt => {
            if (receipt != null) {
              setTotalSupply(totalSupply + 1);
              setIsPending(false);
              setMintVisibility(false);
              clearInterval(intervalID);
            }
          }, 3000));
      })
      .on('receipt', function(receipt){
        console.log(receipt);
        setTotalSupply(totalSupply + 1);
        setIsPending(false);
        setMintVisibility(false);
      })
      .on('error', function(error, receipt) { 
        console.log(error, receipt);
        setIsPending(false);
      });
    });
  }

  function batchBurnNFT() {
    setBatchBurning(true);
    if (followedNFT === 0) {
      tangaNFT.methods.burn(selectedNFTs).send({from: account})
        .on('transactionHash', function(hash){
          console.log(hash);
          var intervalID = setInterval(() =>
            web3Obj.eth.getTransactionReceipt(hash).then(receipt => {
              if (receipt != null) {
                setBatchBurnVisibility(false);
                setBatchBurning(false);
                clearInterval(intervalID);
              }
            }, 3000));
        })
        .on('receipt', function(receipt){
          console.log(receipt);
          setBatchBurnVisibility(false);
          setBatchBurning(false);
        })
        .on('error', function(error, receipt) { 
          console.log(error, receipt);
          setBatchBurning(false);
        });
    } else {
      tangaNFT.methods.burnAndFollow(selectedNFTs, followedNFT).send({from: account})
        .on('transactionHash', function(hash){
          console.log(hash);
          var intervalID = setInterval(() =>
            web3Obj.eth.getTransactionReceipt(hash).then(receipt => {
              if (receipt != null) {
                setBatchBurnVisibility(false);
                setBatchBurning(false);
                clearInterval(intervalID);
              }
            }, 3000));
        })
        .on('receipt', function(receipt){
          console.log(receipt);
          setBatchBurnVisibility(false);
          setBatchBurning(false);
        })
        .on('error', function(error, receipt) { 
          console.log(error, receipt);
          setBatchBurning(false);
        });
    }
  }

  const messageChange = (e) => {
    setNFTMessage(e.target.value);
  };

  const selectNFTsChange = (nftIds) => {
    setSelectedNFTs(nftIds);
    tangaNFT.methods.getCurrentPriceToBurn(nftIds.length).call().then(burnPrice => {
      setBurnPrice(burnPrice);
    });
  };

  const selectFollowedNFTChange = (nftId) => {
    setFollowedNFT(nftId);
  }

  const showMessages = (nftId) => {
    setIsPending(true);
    tangaNFTHelper.methods.getLeavedMessages(nftId).call().then(messages => {
      console.log(messages);
      setMessageData(messages);
      setLeavedMessageVisibility(true);
      setIsPending(false);                  
    });
  }

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>
        🖼 Tanga Volcanic NFTs{' '} 
        <Checkbox checked={onlyMe} onChange={e => setOnlyMe(e.target.checked)}>Only Me</Checkbox>
        <Button type='primary' onClick={() => showMintNFTDialog()}>Mint NFT</Button>
        <Button style={{marginLeft: '10px'}} type='primary' onClick={() => showBatchBurnDialog()}>Burn NFT</Button>
        <Button style={{marginLeft: '10px'}} type='link' onClick={() => showRuleOfMintBurn()}>Rule of Mint/Burn</Button>
      </h1>
      <div style={styles.NFTs}>
        <Skeleton loading={isLoading}>
          {NFTInfos != null && NFTInfos.map((nft, index) => {
              const bMine = nft.owner.toLowerCase() === account.toLowerCase();
              if (onlyMe && !bMine) return ''; 
              
              if (bMine) {
                myNFTs.push(<Option key={nft.tokenId}>#{nft.tokenId}, MintPrice: {new BigNumber(nft.mintPrice).shiftedBy(-18).toString()}, Followers: {nft.followerWeight}/{nft.followersNum}</Option>);
              } else {
                otherNFTs.push(<Option key={nft.tokenId}>#{nft.tokenId}, MintPrice: {new BigNumber(nft.mintPrice).shiftedBy(-18).toString()}, Weight/Followers: {new BigNumber(nft.followerWeight).shiftedBy(-21).toString()}/{nft.followersNum}</Option>);
              }

              const tokenURI = JSON.parse(atob(nft.tokenURI.substr('data:application/json;base64,'.length)));
              return (
                <Card
                  hoverable
                  actions={bMine ? [
                    <Tooltip title="Check Messages">
                      <Badge size="small" count={nft.leavedMessageNum} color={bMine ? "red" : "orange"}>
                        <FileSearchOutlined
                          onClick={() => showMessages(nft.tokenId)}
                        />
                      </Badge>
                    </Tooltip>,
                    <Tooltip title="Transfer NFT">
                      <SwapOutlined onClick={() => handleTransferClick(nft)}/>
                    </Tooltip>,
                    <Tooltip title="Send message To NFT">
                      <SendOutlined onClick={() => sendMessage(nft)} />
                    </Tooltip>,
                    <Tooltip title="Modify Bio">
                      <EditOutlined onClick={() => handleModifyBioClick(nft)}/>
                    </Tooltip>,
                  ] : [
                    <Tooltip title="Check Messages">
                      <Badge size="small" count={nft.leavedMessageNum} color={bMine ? "red" : "orange"}>
                        <FileSearchOutlined
                          onClick={() => showMessages(nft.tokenId)}
                        />
                      </Badge>
                    </Tooltip>,
                    <Tooltip title="Send message To NFT">
                      <SendOutlined onClick={() => sendMessage(nft)} />
                    </Tooltip>, 
                    "",
                  ]}
                  style={{ width: 300, border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={tokenURI.image}
                      fallback="data:image/png;base64,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"
                      alt=""
                      style={{ height: "300px", width: "350px" }}
                    />
                  }
                  key={index}
                >
                  <Meta title={tokenURI.name} description={<Address avatar='left' size={6} copyable style={{ fontSize: "20px" }} address={nft.owner}/>} />
                </Card>
              );
            })}
        </Skeleton>
      </div>
      <Modal
        title={`${messageData.length} Messages`}
        visible={leavedMessageVisible}
        onCancel={() => setLeavedMessageVisibility(false)}
        onOk={() => setLeavedMessageVisibility(false)}
        confirmLoading={isPending}
      >
        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={messageData}
          renderItem={item => (
            <li>
              <Comment
                //actions={item.actions}
                author={getEllipsisTxt(item.sender)}
                avatar={<Blockies seed={item.sender.toLowerCase()} className="identicon" size={7}/>}
                content={item.message}
                datetime={new Date(parseInt(item.time)*1000).toLocaleString()}
              />
            </li>
          )}
        />
      </Modal>
      <Modal
        title={`Transfer ${TangaNFTInfo?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => transfer()}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
      </Modal>
      
      <Modal
        title="Rule of Mint/Burn"
        visible={ruleVisible}
        onCancel={() => setRuleVisibility(false)}
        onOk={() => setRuleVisibility(false)}
        confirmLoading={isPending}
        width='600px'
      >
        <Text>If current the total supply of TangaNFT is N, you wanna:</Text><p/>   
        <Text>1) mint one NFT, will cost <Text strong>1000*(N+1)</Text> PEOPLE</Text><p/>
        <Text>2) burn one NFT, will retrieve <Text strong>1000*N</Text> PEOPLE</Text> <p/>  
        <Text>3) mint M NFT, will cost <Text strong>[1000*(N+1) + 1000*(N+2) + ... + 1000*(N+M)]</Text> PEOPLE</Text><p/>
        <Text>4) burn M NFT, will retrieve <Text strong>[1000*N + 1000*(N - 1) + 1000*(N - M)]</Text> PEOPLE</Text> <p/>  
      </Modal>

      <Modal
        title={`Modify Bio of TangaNFT#${nftToSend?.tokenId || "NFT"}`}
        visible={bioVisible}
        onCancel={() => setBioVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <Button type='primary' loading={approving} onClick={approved ? () => setBioVisibility(false) : () => approvePeople()}>{approved ? 'Cancel' : 'Approve ' + PeopleTokenInfo.name.toUpperCase()}</Button>,
          <Button type='primary' loading={isPending} disabled={!approved} onClick={() => modifyBio(nftToSend)}>Modify Bio</Button>
        ]}
      >
        <Input autoFocus placeholder="<= 50 bytes" onChange={(e) => setBio(e.target.value)} />    
        <Text>Modify Bio will spend you {new BigNumber(bioPrice).shiftedBy(-18).toString()} $PEOPLE which will be tranferred to Dead address.</Text>    
      </Modal>

      <Modal
        title={`Send Message To TangaNFT#${nftToSend?.tokenId || "NFT"}`}
        visible={messageVisible}
        onCancel={() => setMessageVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <Button type='primary' loading={approving} onClick={approved ? () => setMessageVisibility(false) : () => approvePeople()}>{approved ? 'Cancel' : 'Approve ' + PeopleTokenInfo.name.toUpperCase()}</Button>,
          <Button type='primary' loading={isPending} disabled={!approved} onClick={() => sendNFTMessage(nftToSend)}>Send Message</Button>
        ]}
      >
        <TextArea autoFocus showCount maxLength='50' placeholder="<= 200 bytes" onChange={(e) => setLeavedMessage(e.target.value)} />    
        <Text>Send one message will spend you {new BigNumber(messagePrice).shiftedBy(-18).toString()} $PEOPLE which will be tranferred to Dead address.</Text>    
      </Modal>

      <Modal
        title={`Mint ${TangaNFTInfo?.name || "NFT"}`}
        visible={mintVisible}
        onCancel={() => setMintVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <Button type='primary' loading={approving} onClick={approved ? () => setMintVisibility(false) : () => approvePeople()}>{approved ? 'Cancel' : 'Approve ' + PeopleTokenInfo.name.toUpperCase()}</Button>,
          <Button type='primary' loading={isPending} disabled={!approved} onClick={() => mintNFT()}>Mint NFT</Button>
        ]}
      >
        <Input style={{marginBottom: '10px'}} placeholder="amount to mint" onChange={(e) => mintAmountChange(e)}/>
        <TextArea showCount style={{marginBottom: '10px'}} placeholder="bio of NFT, <= 50 bytes" onChange={(e) => messageChange(e)} maxLength='50' defaultValue={nftMessage}/>
        <div style={{width: '100%', marginBottom: '10px'}}>
          <Text>Slippage tolerance: </Text>
          <InputNumber style={{width: '100px'}} min={0} max={100} defaultValue={slippageTolerance}  onChange={(v) => setSlippageTolerance(v)} addonAfter="%"/>
        </div>
        <Text>The mint price is: {new BigNumber(mintPrice).shiftedBy(-18).toString()} $PEOPLE</Text>
      </Modal>
      <Modal
        title={`Burn ${TangaNFTInfo?.name || "NFT"}`}
        visible={batchBurnVisible}
        onCancel={() => setBatchBurnVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <Button type='primary' loading={batchBurning} onClick={() => batchBurnNFT()}>Burn</Button>
        ]}
      >
        <Title level={5}>NFTs you wanna burn:</Title>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Please select burned NFT IDs"
          onChange={selectNFTsChange}
        >
          {myNFTs}
        </Select>
        <Text>Burn {selectedNFTs.length} NFTs, you can retrieve {new BigNumber(burnPrice).shiftedBy(-18).toString()} $PEOPLE</Text>
        
        <Title level={5}>NFT you want to follow (Optional):</Title>
        <Select
          style={{width: '100%'}}
          allowClear
          placeholder="Optional, please select the followed NFT ID"
          onChange={selectFollowedNFTChange}
        >
          {otherNFTs}
        </Select>
        <Text>When select to follow another NFT, your social weight will be added to the NFT.</Text>
      </Modal>
    </div>
  );
}

export default NFTBalance;
