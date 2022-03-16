import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { useMoralis } from "react-moralis";
import { Card, Image, Steps, Tooltip, Slider, Modal, Input, Skeleton, Checkbox, Button, Typography, Select } from "antd";
import { FireOutlined, SendOutlined, ForkOutlined, ShoppingCartOutlined, MehOutlined, SmileTwoTone, FrownOutlined } from "@ant-design/icons";
import { CI } from "helpers/ci_3";
import { getEllipsisTxt } from "../helpers/formatters";
import BigNumber from "bignumber.js";
import AddressInput from "./AddressInput";
import Address from "./Address/Address";
import Blockies from "react-blockies";
import { getExplorer } from "helpers/networks";
import NextNFTInfo from '../asset/abi/nextNFT_v2.json';

const { Text, Title } = Typography;
const { Meta } = Card;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

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
  threshold: {
    display: "flex",
    flexDirection: "row",    
    width: '100%',
    alignItems: 'center'
  },
  desc: {
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: 'center'
  }
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
  const [nftToSend, setNftToSend] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [AllNFTInfos, setAllNFTInfos] = useState([]);
  const [onlyMe, setOnlyMe] = useState(false);
  const [nftMessage, setNFTMessage] = useState("");
  const [totalSupply, setTotalSupply] = useState(0);
  const [selectedNFTType, setSelectedNFTType] = useState('');
  const [generateOver, setGenerateOver] = useState(false);
  const [messageVisible, setMessageVisibility] = useState(false);
  const [mintableNFTs, setMintableNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentImg, setCurrentImg] = useState(null);
  const [currentNewImg, setCurrentNewImg] = useState(null);
  const [ipfsGateWay, setIPFSGateway] = useState('https://gateway.ipfs.io/ipfs/');
  const [ipfsPreStr, setIPFSPreStr] = useState('ipfs://');
  const [nextNFT, setNextNFT] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [pricePerWord, setPricePerWord] = useState(new BigNumber(0));
  const [basePrice, setBasePrice] = useState(new BigNumber(0));
  const [pricePerMinusNFT, setPricePerMinusNFT] = useState(new BigNumber(0));
  const [wordsTotalCost, setWordsTotalCost] = useState(0);
  const [threshold, setShreshold] = useState(50);
  const [shadowOpacity, setShadowOpacity] = useState(20);
  const [buyDialogVisible, setBuyDialogVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [plusPercent, setPlusPercent] = useState(0);
  const [extraMintFee, setExtraMintFee] = useState(new BigNumber(0));

  const canvasRef = React.createRef();
  const canvasRef1 = React.createRef();

  const freeWords = {
    "Stop War": true,
    "Peace": true,
    "Love": true,
    "Ukraine": true
  }
  var OriginalNFTs = [<Option key='0x276C9Db99c4155aA91Bd4535468629cAC1875098'>MFER[0x276C9Db99c4155aA91Bd4535468629cAC1875098]</Option>];
                  // <Option key='0xbEb1Ac15E247f147AE361df4c03fBC09bFa824Af'>Ghost[0xbEb1Ac15E247f147AE361df4c03fBC09bFa824Af]</Option>,
                  // <Option key='0x6FBDA3189F29Ea03db988d3E2C1b76F0126eC9e3'>BAYC[0x6FBDA3189F29Ea03db988d3E2C1b76F0126eC9e3]</Option>,
                  // <Option key='0xD71980f5Babd9c17D1912f7D91bBe0528f84e2a0'>CryptoPunk[0xD71980f5Babd9c17D1912f7D91bBe0528f84e2a0]</Option>];
  var Words = [<Option key='Stop War'>Free word: Stop War</Option>,
                  <Option key='Peace'>Free word: Peace</Option>,
                  <Option key='Love'>Free word: Love</Option>,
                  <Option key='Ukraine'>Free word: Ukraine</Option>];
  useEffect(() => {
    const fetchData = () => {
      Moralis.Web3.enableWeb3().then(async (web3) => {
        const nextNFTContract = new web3.eth.Contract(NextNFTInfo.abi, NextNFTInfo.address);

        setNextNFT(nextNFTContract);
        
        nextNFTContract.methods.totalSupply().call().then(nftNumber => {
          setTotalSupply(parseInt(nftNumber));
        });

        nextNFTContract.methods.pricePerWord().call().then(pricePerWord => {
          setPricePerWord(new BigNumber(pricePerWord));
        });

        nextNFTContract.methods.basePrice().call().then(basePrice => {
          setBasePrice(new BigNumber(basePrice));
        });

        nextNFTContract.methods.plusPercent().call().then(plusPercent => {
          setPlusPercent(parseInt(plusPercent));
        });

        if (chainId != null) {
          setIsLoading(true);
          const options = { chain: chainId, address: NextNFTInfo.address, offset: 0, limit: 20 };
          Moralis.Web3API.token.getNFTOwners(options).then(async (nfts) => {
            console.log(nfts.result);
            setIsLoading(false);
            const nftArr = [];
            for (var i = 0; i < nfts.result.length; i++) {
              const nft = nfts.result[i];
              const metadata = await nextNFTContract.methods.tokenId2MetadataMap(nft.token_id).call();
              nft.metadata = metadata;
              nftArr.push(nft);
            }
            setAllNFTInfos(nftArr);
          });
        }
      })
    };
    
    fetchData();
    // if (currentImg != null) console.log('currentImg', currentImg);
  }, [Moralis, account, totalSupply, chainId]);

  useEffect(() => {
    setCurrentImg(canvasRef.current);
    setCurrentNewImg(canvasRef1.current);
  }, [canvasRef, canvasRef1]);
          
  // setTimeout(() => {
  //   setMintPrice();
  // }, 15000);
  
  const showMintNFTDialog = () => {
    setMintVisibility(true);
  }

  const showBatchBurnDialog = () => {
    setBatchBurnVisibility(true);
  }

  const showRuleOfMintBurn = () => {
    setRuleVisibility(true);
  }

  async function transfer() {
    const options = {
      type: "erc721",
      tokenId: parseInt(nftToSend.token_id),
      receiver: receiverToSend,
      contractAddress: NextNFTInfo.address,
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
 
  const handleTransferClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  }

  const relayoutNFT = () => {
    generateNFT(selectedNFT);
  }
  
  const handleGenerateNFTClick = (nft) => {
    setSelectedNFT(nft);
    generateNFT(nft);
  };

  const generateNFT = (nft) => {
    if (nft == null) return;
    const viewSize = 500;
    setIsPending(true);
    CI.openImgUrl(nft.imageUrl, function(err, img){
      if (err) {
        return alert(err);
      }
      img.crossOrigin = "Anonymous";
      var c = CI.loadImgToCanvas(img, {canvas: currentNewImg, width: img.width, height: img.height, viewWidth: viewSize, viewHeight: viewSize, backgroundColor: "#fff"});  // 
      var o = {
        width: c.width,
        height: c.height,
        img: img,
        canvas: {
          img: c.canvas
        }
      };

      // 加载其他图层
      // o.canvas.bg = CI.createBgCanvas(o.width, o.height, viewSize, viewSize);
      // o.canvas.cover = CI.createCanvas(o.width, o.height, viewSize, viewSize, "cover");
      // o.canvas.cover.className = "js_cover";
      
      CI.createCharImg(currentImg, {
        threshold: threshold/100,
        shadowOpacity: shadowOpacity/100,
        indexTable: [],
        renderTable: [],
        img: img,
        wordList: selectedWords.filter(word => !usedWords.includes(word)),
        onprogress: function() {
          console.log('...')
        },
        onended: function() {
          console.log('end')
          setGenerateOver(true);
          setIsPending(false);
        }
      });
    })
  }

  const handleModifyBioClick = (nft) => {
    setNftToSend(nft);
    setBioVisibility(true);
  }

  const sendMessage = (nft) => {
    setNftToSend(nft);
    setMessageVisibility(true);
  }

  const burnNFT = (nft) => {
    setIsPending(true);
    nextNFT.methods.burn(parseInt(nft.token_id)).send({from: account})
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

  const buyNFT = (nft) => {
    setIsPending(true);
    const buyAmount = '0x' + new BigNumber(nft.metadata.cost).multipliedBy(10000 + plusPercent).div(10000).toString(16);
    nextNFT.methods.buy(parseInt(nft.token_id)).send({from: account, value: buyAmount})
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

  const checkMotherNFT = (nft) => {
    window.open(`${getExplorer(chainId)}nft/${nft.metadata.baseNFT}/${nft.metadata.baseTokenId}`, "_blank");
    // nextNFT.methods.tokenId2MetadataMap(nft.token_id).call().then(metadata => {
    //   if (metadata != null) {
    //     window.open(`${getExplorer(chainId)}nft/${metadata.baseNFT}/${metadata.baseTokenId}`, "_blank");
    //   }
    // });
  }
  const changeExtraMintFee = (v) => {
    setExtraMintFee(new BigNumber(v.target.value).shiftedBy(18));
  }

  async function mintNFT() {
    const addedPayedWords = selectedWords.filter(word => !freeWords[word]).filter(word => !usedWords.includes(word));
    const wordsCost = pricePerWord.multipliedBy(addedPayedWords.length);
    const nftCost = basePrice.plus(extraMintFee);
    const totalCost = '0x' + nftCost.plus(wordsCost).toString(16);
    setIsPending(true);
    let dataUrl = currentImg.toDataURL("image/png");
    const file = new Moralis.File('nft', {base64 : dataUrl});
    await file.saveIPFS();
    console.log(file._hash);    
    nextNFT.methods.mint(selectedNFT.token_address, selectedNFT.token_id, selectedWords, file._hash).send({from: account, value: totalCost})
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

  const selectNFTTypeChange = (nftAddr) => {
    setSelectedNFTType(nftAddr);
    const options = { address: account, chain: chainId, token_address: nftAddr };
    Moralis.Web3API.account.getNFTsForContract(options).then(nfts => {
      console.log(nfts.result);
      setMintableNFTs(nfts.result);
    });
  };

  const selectWordChange = (words) => {
    const addedPayedWords = words.filter(word => !freeWords[word]);
    addedPayedWords.forEach(word => {
      nextNFT.methods.payedWord2TokenIdMap(word).call().then(tokenId => {
        if (tokenId > 0) {
          usedWords.push(word);
          setUsedWords(usedWords);
        }
        const finalPayedWords = addedPayedWords.filter(word => !usedWords.includes(word));
        setWordsTotalCost(pricePerWord.multipliedBy(finalPayedWords.length));
      });
    });
    setSelectedWords(words);
  }

  const changeThreshold = (v) => {
    setShreshold(v);
    generateNFT(selectedNFT);
  }

  const changeShadowOpacity = (v) => {
    setShadowOpacity(v);
    generateNFT(selectedNFT);
  }

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>
        NEXT NFTs{' '} 
        <Checkbox checked={onlyMe} onChange={e => setOnlyMe(e.target.checked)}>Only Me</Checkbox>
        <Button type='primary' onClick={() => showMintNFTDialog()}>Mint NFT</Button>
        <Button style={{marginLeft: '10px'}} type='link' onClick={() => showRuleOfMintBurn()}>Rule of Mint/Burn</Button>
      </h1>
      <div style={styles.NFTs}>
        <Skeleton loading={isLoading}>
          {AllNFTInfos != null && AllNFTInfos.map((nft, index) => {
              const bMine = account != null && nft.owner_of.toLowerCase() === account.toLowerCase();
              if (onlyMe && !bMine) return ''; 
              const latestPrice = nft.metadata != null ? new BigNumber(nft.metadata.cost).shiftedBy(-18).toNumber() : 0;
              return (
                <Card
                  hoverable
                  actions={bMine ? [                    
                    <Tooltip title="Transfer NFT">
                      <SendOutlined onClick={() => handleTransferClick(nft)}/>
                    </Tooltip>,
                    <Tooltip title="Burn">
                      <FireOutlined onClick={() => burnNFT(nft)} />
                    </Tooltip>,           
                    <Tooltip title="Check mother NFT">
                      <ForkOutlined onClick={() => checkMotherNFT(nft)} />
                    </Tooltip>, 
                  ] : [                    
                    <Tooltip title="Check mother NFT">
                      <ForkOutlined onClick={() => checkMotherNFT(nft)} />
                    </Tooltip>,              
                    <Tooltip title="Buy this NFT, latest price+5%">
                      <ShoppingCartOutlined onClick={() => buyNFT(nft)} />
                    </Tooltip>,         
                    <Tooltip title="Check mother NFT">
                      <ForkOutlined onClick={() => checkMotherNFT(nft)} />
                    </Tooltip>, 
                  ]}
                  style={{ width: 300, border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={nft.token_uri}
                      fallback="data:image/png;base64,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"
                      alt=""
                      style={{ height: "300px", width: "300px" }}
                    />
                  }
                  key={index}
                >
                  <Meta title={nft.name + ' #' + nft.token_id} 
                    description={
                    <div style={styles.desc}>
                      <Text>Latest Price: <Text strong>{latestPrice} eth</Text></Text>
                      <Address avatar='left' size={6} copyable style={{ fontSize: "20px" }} address={nft.owner_of}/>
                    </div>
                    } />
                </Card>
              );
            })}
        </Skeleton>
      </div>
      
      <Modal
        title={`Transfer ${NextNFTInfo?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => transfer()}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
      </Modal>
      
      <Modal
        title="Rule of Mint/Buy/Sell"
        visible={ruleVisible}
        onCancel={() => setRuleVisibility(false)}
        onOk={() => setRuleVisibility(false)}
        confirmLoading={isPending}
        width='600px'
      >
        <Text>1) If you mint new NFT with M payment words, it will cost you <Text strong>0.05 + 0.005*M</Text> ETH</Text><p/>
        <Text>2) If somebody pays <Text strong>+5%</Text> of your NFT's price, your NFT will be sold out automatically.</Text> <p/>
        <Text>3) If you don't want your NFT to be bought at a low price, you can specify a suitable price at the time of mint.</Text><p/>
      </Modal>      

      <Modal
        title={`Mint ${NextNFTInfo?.name || "NFT"} `}
        visible={mintVisible}
        onCancel={() => setMintVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <div style={styles.footer}>
            <Text>(Current Mint Price: ${basePrice.plus(extraMintFee).plus(wordsTotalCost).shiftedBy(-18).toNumber()} ETH)</Text>
            <Input style={{width: '40%'}} addonBefore="Extra Mint Fee" addonAfter="eth" defaultValue="0" onChange={(v) => changeExtraMintFee(v)}/>,
            <Button type='primary' loading={isPending} onClick={() => mintNFT()}>Mint NFT</Button>
          </div>
          
        ]}
        width='700px'
      > 
        <div style={{ width: '100%', height: 20, marginButtom: '20px' }}>
          Step 1: select or input your words
        </div>
        <div style={{ width: '100%', height: 20, fontSize: 8, fontStyle: "italic" }}>
          (If not marked free, each word costs {pricePerWord.shiftedBy(-18).toNumber()} eth. And one word only could be merged in one Next NFT.)
        </div>
        <Select mode="tags" 
          tokenSeparators={[',']}
          allowClear
          style={{ width: '100%', marginButtom: '20px' }}
          placeholder="Please select or input your words which will merged with the NFT below"
          onChange={selectWordChange}
        >
          {Words}
        </Select>
        <div style={{ width: '100%', height: 20, marginButtom: '20px' }}>
          {usedWords.length > 0 ? ("'" + usedWords + "' is registered, can't be merged!") : ""}
        </div>
        <div style={{ width: '100%', height: 20, marginButtom: '20px' }}>
          Step 2: select original NFT
        </div>
        <div style={{ width: '100%', height: 20, fontSize: 8, fontStyle: "italic" }}>
          (It will list all NFTs belong to you, then you can select one of them to merge.)
        </div>
        <p/>
        <Select
          allowClear
          style={{ width: '100%', marginButtom: '10px' }}
          placeholder="Please select original NFT merged with the word above"
          onChange={selectNFTTypeChange}
        >
          {OriginalNFTs}
        </Select>
        <div style={{ width: '100%', height: 20, marginTop: '20px' }}>
          Step 3: select the NFT you wanna to merge, then click the Mint button
        </div>
        <div style={styles.NFTs}>
          <Skeleton loading={isLoading}>
            {mintableNFTs != null && mintableNFTs.map((nft, index) => {    
                const imageStr = JSON.parse(nft.metadata).image;
                if (imageStr.indexOf(ipfsPreStr) >= 0) {
                  const image = imageStr.substr(ipfsPreStr.length);
                  const imageUrl = ipfsGateWay + image;   
                  nft.imageUrl = imageUrl;   
                } else {
                  nft.imageUrl = imageStr;
                }
                 
                const titleContent = (selectedNFT == null || selectedNFT.token_id !== nft.token_id) ? 'Please select me, master' : 'Thanks, master';    
                return (
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title={titleContent} style={{ height: 50 }}>
                        {
                          selectedNFT == null ? <MehOutlined onClick={() => handleGenerateNFTClick(nft)}/> : 
                           (selectedNFT.token_id !== nft.token_id) ? 
                            <FrownOutlined onClick={() => handleGenerateNFTClick(nft)}/> :
                            <SmileTwoTone onClick={() => handleGenerateNFTClick(nft)}/>
                        }
                        
                      </Tooltip>,
                    ]}
                    style={{ width: 200, border: "2px solid #e7eaf3" }}
                    cover={<Image 
                            onClick={() => handleGenerateNFTClick(nft)}
                            preview={false} 
                            src={nft.imageUrl} 
                            fallback="data:image/png;base64,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"
                            alt="" 
                            style={{ height: "200px", width: '200px' }} 
                          />}
                    key={index}
                  >
                  </Card>
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.newNFTs}>
          <Skeleton loading={isLoading}>
            <canvas ref={canvasRef} width='1200' height='1200' style={{width: 500, height: 500, marginLeft:"auto", marginRight:"auto"}}></canvas>
          </Skeleton>     
          <div style={styles.threshold}>
            <div style={{width: '20%'}}>Contour Threshold</div>
            <Slider style={{width: '80%'}} range={false} defaultValue={50} tipFormatter={value => `${value}%`} onAfterChange={v => changeThreshold(v)}/>
          </div>     
          <div style={styles.threshold}>
            <div style={{width: '20%'}}>Shadow Opacity</div>
            <Slider style={{width: '80%'}} range={false} defaultValue={20} tipFormatter={value => `${value}%`} onAfterChange={v => changeShadowOpacity(v)}/>
          </div>    
          <Button disabled={!generateOver} type='primary' onClick={() => relayoutNFT()}>Re-layout</Button>
        </div>
      </Modal>
      
    </div>
  );
}

export default NFTBalance;
