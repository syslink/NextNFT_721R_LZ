import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { useMoralis } from "react-moralis";
import { Card, Image, Steps, Tooltip, Slider, Modal, Input, Skeleton, Checkbox, Button, Typography, Select, Pagination, message, InputNumber } from "antd";
import { FireOutlined, SendOutlined, PictureOutlined, UploadOutlined, MehOutlined, SmileTwoTone, FrownOutlined, StopOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { CI } from "helpers/ci_3";
import { getEllipsisTxt } from "../helpers/formatters";
import BigNumber from "bignumber.js";
import {ethers} from 'ethers';
import {MerkleTree} from 'merkletreejs';
import AddressInput from "./AddressInput";
import Address from "./Address/Address";
import Blockies from "react-blockies";
import { getExplorer } from "helpers/networks";
import NextNFTInfo from '../asset/abi/nextNFT_v3.json';
import WhiteList from '../asset/whiteList.json';

const keccak256 = require('keccak256');
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
    justifyContent: "space-between",
    margin: "35 auto",
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
  const [traverseChainVisible, setTraverseChainVisible] = useState(false);
  const [loadNFTVisible, setLoadNFTVisible] = useState(false);
  const [ruleVisible, setRuleVisibility] = useState(false);
  const [addressInputVisible, setAddressInputVisible] = useState(false);
  const [importImgVisible, setImportImgVisible] = useState(false);
  const [mintVisible, setMintVisibility] = useState(false);
  const [batchBurnVisible, setBatchBurnVisibility] = useState(false);
  const [receiverToSend, setReceiver] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [nftToPull, setNftToPull] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [AllNFTInfos, setAllNFTInfos] = useState([]);
  const [onlyMe, setOnlyMe] = useState(false);
  const [nftMessage, setNFTMessage] = useState("");
  const [totalSupply, setTotalSupply] = useState(0);
  const [selectedNFTType, setSelectedNFTType] = useState('');
  const [generateOver, setGenerateOver] = useState(false);
  const [messageVisible, setMessageVisibility] = useState(false);
  const [mintableNFTs, setMintableNFTs] = useState([]);
  const [selfImages, setSelfImages] = useState([]);
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
  const [destChain, setDestChain] = useState(0);
  const [threshold, setShreshold] = useState(50);
  const [shadowOpacity, setShadowOpacity] = useState(20);
  const [buyDialogVisible, setBuyDialogVisible] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1500);
  const [canvasHeight, setCanvasHeight] = useState(1500);
  const [plusPercent, setPlusPercent] = useState(0);
  const [feePercent, setFeePercent] = useState(0);
  const [extraMintFee, setExtraMintFee] = useState(new BigNumber(0));
  const [isGenerating, setIsGenerating] = useState(false);
  const [pullUpFee, setPullUpFee] = useState(new BigNumber(0));
  const [targetPrice, setTargetPrice] = useState(new BigNumber(0));
  const [inputNFTAddress, setInputNFTAddress] = useState('');
  const [localImgs, setLocalImgs] = useState([]);
  const [selectedImgs, setSelectedImgs] = useState({});
  const [nftAddressOnETH, setNFTAddressOnETH] = useState('');
  const [startTokenId, setStartTokenId] = useState(1);
  const [endTokenId, setEndTokenId] = useState(10);
  const [localOrNFTImage, setLocalOrNFTImage] = useState(0);

  const canvasRef = React.createRef();
  const canvasRef1 = React.createRef();
  const imgFile = React.createRef();
  const localImgFiles = React.createRef();

  const IsMainnet = window.location.origin.indexOf("test") < 0 && window.location.origin.indexOf("localhost") < 0;
  var OriginalNFTs = IsMainnet ? 
                     [<Option key='0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'>BAYC[0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D]</Option>,
                      <Option key='0x79FCDEF22feeD20eDDacbB2587640e45491b757f'>MFER[0x79FCDEF22feeD20eDDacbB2587640e45491b757f]</Option>,
                      <Option key='0'>manual input NFT contract address</Option>] 
                      : 
                     [<Option key='0x0771B99CB0680E7E2A31C0524B4e99CfB7e390Ad'>BAYC[0x0771B99CB0680E7E2A31C0524B4e99CfB7e390Ad]</Option>,
                      <Option key='0xC44674eB3cB5A2adc7e9138dDC382f4eBc169F0e'>MFER[0xC44674eB3cB5A2adc7e9138dDC382f4eBc169F0e]</Option>,
                      <Option key='0'>manual input NFT contract address</Option>,
                      <Option key='1'>import image from local file</Option>];
                  // <Option key='0xbEb1Ac15E247f147AE361df4c03fBC09bFa824Af'>Ghost[0xbEb1Ac15E247f147AE361df4c03fBC09bFa824Af]</Option>,
                  // <Option key='0xD71980f5Babd9c17D1912f7D91bBe0528f84e2a0'>CryptoPunk[0xD71980f5Babd9c17D1912f7D91bBe0528f84e2a0]</Option>];
  var Words = [<Option key='Peace'>Peace</Option>,
                  <Option key='Love'>Love</Option>,
                  <Option key='DAO'>DAO</Option>,
                  <Option key='NFT'>NFT</Option>,
                  <Option key='DeFi'>DeFi</Option>];
  
  var TestChains = [<Option key='10001'>Rinkeby</Option>,
                  <Option key='10002'>Binance Smart Chain Testnet</Option>,
                  <Option key='10006'>Fuji (Avalanche testnet)</Option>,
                  <Option key='10009'>Mumbai (Polygon testnet)</Option>,
                  <Option key='10010'>Arbitrum (Rinkeby testnet)</Option>,
                  <Option key='10011'>Optimism (Kovan testnet)</Option>];
                  //<Option key='10012'>Fantom (testnet)</Option>

  var MainChains = [<Option key='1'>Ethereum</Option>,
                  <Option key='2'>Binance Smart Chain</Option>,
                  <Option key='6'>Avalanche</Option>,
                  <Option key='9'>Polygon</Option>,
                  <Option key='10'>Rinkeby</Option>,
                  <Option key='11'>Optimism</Option>];
                  // <Option key='12'>Fantom</Option>];   
  const chainMap = {'0x1':'1',     "0x38":"2",     "0xa86a":"6",     "0x89":"9",
                    '0x4':'10001', "0x61":"10002", "0xa869":"10006", "0x13881":"10009"}    

  const nextNFTAddress = NextNFTInfo.multiAddressess[IsMainnet ? "mainnet" : "testnet"][chainId];   
  NextNFTInfo.address = nextNFTAddress;               


  // const options = { chain: chainId, address: contractAddr, offset, limit };
  // Moralis.Web3API.token.getNFTOwners(options).then(async (nfts) => {
  //   console.log(nfts.result);
  //   const nftArr = [];
  //   for (var i = 0; i < nfts.result.length; i++) {
  //     const nft = nfts.result[i];
  //     const mintedTime = await nextNFT.methods.tokenId2MetadataMap(nft.token_id).call();
  //     const words = await nextNFT.methods.getWords(nft.token_id).call();
  //     nft.metadata = {mintedTime, words};
  //     nftArr.push(nft);
  //   }
  //   setAllNFTInfos(nftArr);
  //   setIsLoadingNext(false);
  // });
  const getDataFromContract = (offset, limit) => {
    setIsLoadingNext(true);
    if (offset - limit < 0) {
      limit = offset;
    }

    const nftArr = [];
    for (var i = offset; i >= offset - limit; i--) {
      nextNFT.methods.tokenByIndex(i).call().then(async (tokenId) => {
        const nft = {token_id: tokenId};
        const tokenURI = await nextNFT.methods.tokenURI(tokenId).call();
        const owner = await nextNFT.methods.ownerOf(tokenId).call();
        const mintedTime = await nextNFT.methods.tokenId2MetadataMap(tokenId).call();
        const words = await nextNFT.methods.getWords(tokenId).call();
        nft.owner_of = owner;
        nft.token_uri = tokenURI;
        nft.metadata = {mintedTime, words};
        nftArr.push(nft)
        if (nftArr.length === limit) {
          setAllNFTInfos(nftArr);
          setIsLoadingNext(false);
        }
      });
    }
  }

  const getMyOwnNFTs = () => {
    setIsLoadingNext(true);
    
    const nftArr = [];
    nextNFT.methods.balanceOf(account).then(balance => {
      balance = parseInt(balance);
      for (var i = 0; i < balance; i++) {
        nextNFT.methods.tokenOfOwnerByIndex(account, i).call().then(async (tokenId) => {
          const nft = {token_id: tokenId};
          const tokenURI = await nextNFT.methods.tokenURI(tokenId).call();
          const owner = await nextNFT.methods.ownerOf(tokenId).call();
          const mintedTime = await nextNFT.methods.tokenId2MetadataMap(tokenId).call();
          const words = await nextNFT.methods.getWords(tokenId).call();
          nft.owner_of = owner;
          nft.token_uri = tokenURI;
          nft.metadata = {mintedTime, words};
          nftArr.push(nft);
          if (nftArr.length === balance) {
            setAllNFTInfos(nftArr);
            setIsLoadingNext(false);
          }
        });
      }
    });
  }

  useEffect(() => {
    const fetchData = () => {
      Moralis.Web3.enableWeb3().then(async (web3) => {
        if (chainId == null) {
          return;
        }
        const nextNFTContract = new web3.eth.Contract(NextNFTInfo.abi, NextNFTInfo.address);

        setNextNFT(nextNFTContract);
        
        if (onlyMe) {
          setIsLoadingNext(true);
    
          const nftArr = [];
          nextNFTContract.methods.balanceOf(account).call().then(balance => {
            balance = parseInt(balance);
            if (balance === 0) {
              setIsLoadingNext(false);
            }
            for (var i = 0; i < balance; i++) {
              nextNFTContract.methods.tokenOfOwnerByIndex(account, i).call().then(async (tokenId) => {
                const nft = {token_id: tokenId};
                const tokenURI = await nextNFTContract.methods.tokenURI(tokenId).call();
                const owner = await nextNFTContract.methods.ownerOf(tokenId).call();
                const mintedTime = await nextNFTContract.methods.tokenId2MetadataMap(tokenId).call();
                const words = await nextNFTContract.methods.getWords(tokenId).call();
                nft.owner_of = owner;
                nft.token_uri = tokenURI;
                nft.metadata = {mintedTime, words};
                nftArr.push(nft);
                if (nftArr.length === balance) {
                  setAllNFTInfos(nftArr);
                  setIsLoadingNext(false);
                }
              });
            }
          });
        } else {
          nextNFTContract.methods.totalSupply().call().then(nftNumber => {
            setTotalSupply(parseInt(nftNumber));
            if (chainId != null) {
              setIsLoadingNext(true);
              const offset = parseInt(nftNumber);
              var limit = 10;
              if (offset - limit < 0) {
                limit = offset;
              }
              if (limit === 0) {
                setIsLoadingNext(false);
              }
              console.log(nftNumber, offset, limit);
              const nftArr = [];
              for (var i = offset - 1; i >= offset - limit; i--) {
                nextNFTContract.methods.tokenByIndex(i).call().then(async (tokenId) => {
                  const nft = {token_id: tokenId};
                  const tokenURI = await nextNFTContract.methods.tokenURI(tokenId).call();
                  const owner = await nextNFTContract.methods.ownerOf(tokenId).call();
                  const mintedTime = await nextNFTContract.methods.tokenId2MetadataMap(tokenId).call();
                  const words = await nextNFTContract.methods.getWords(tokenId).call();
                  nft.owner_of = owner;
                  nft.token_uri = tokenURI;
                  nft.metadata = {mintedTime, words};
                  nftArr.push(nft)
                  if (nftArr.length === limit) {
                    setAllNFTInfos(nftArr);
                    setIsLoadingNext(false);
                  }
                });
              }
            }
          });
        }
        nextNFTContract.methods.basePrice().call().then(basePrice => {
          setBasePrice(new BigNumber(basePrice));
        });
      })
    };
    
    fetchData();
  }, [Moralis, account, totalSupply, chainId, onlyMe]);

  useEffect(() => {
    setCurrentImg(canvasRef.current);
    setCurrentNewImg(canvasRef1.current);    
  }, [canvasRef, canvasRef1]);

  const hashToken = (account) => {
    return Buffer.from(ethers.utils.solidityKeccak256(['address'], [account]).slice(2), 'hex')
  }
  const merkleTree = new MerkleTree(WhiteList.map(wlAccount => hashToken(wlAccount)), keccak256, { sortPairs: true });
  console.log('merkel root', merkleTree.getHexRoot());
  
  const isEthereum = () => {
    return chainId === '0x1' || chainId === '0x4';
  }
  
  const showMintNFTDialog = () => {
    if (isEthereum()) {
      setMintVisibility(true);
    } else {
      message.warning('Only Ethereum network can mint NFT.');
    }
  }

  const showBatchBurnDialog = () => {
    setBatchBurnVisibility(true);
  }

  const showRuleOfMintBurn = () => {
    setRuleVisibility(true);
  }

  const changePage = (page, pageSize) => {
    getDataFromContract(totalSupply - (page - 1) * pageSize, pageSize);
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

  const traverseChains = () => {
    setIsPending(true);
    nextNFT.methods.estimateSendTokensFee(parseInt(destChain), parseInt(nftToSend.token_id), false, ethers.utils.toUtf8Bytes('')).call().then(feeInfo => {
      const endpointFee = new BigNumber(feeInfo.nativeFee).multipliedBy(2);
      nextNFT.methods.traverseChains(parseInt(destChain), parseInt(nftToSend.token_id)).send({from: account, value: '0x' + endpointFee.toString(16)})
      .on('transactionHash', function(hash){
        console.log(hash);
      })
      .on('receipt', function(receipt){
        console.log(receipt);
        setIsPending(false);
        setTraverseChainVisible(false);
      })
      .on('error', function(error, receipt) { 
        console.log(error, receipt);
        setIsPending(false);
      });
    })
    
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

  const getBase64Image = (img) => {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
  
    return dataURL;
  }

  const  btof = (data, fileName) => {
    const dataArr = data.split(",");
    const byteString = atob(dataArr[1]);
  
    const options = {
      type: "image/jpeg",
      endings: "native"
    };
    const u8Arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      u8Arr[i] = byteString.charCodeAt(i);
    }
    return new File([u8Arr], fileName + ".jpg", options);
  }

  const generateNFT = (nft) => {
    if (nft == null) return;
    setIsGenerating(true);
    CI.openImgUrl(nft.imageUrl, function(err, img){
      if (err) {
        return alert(err);
      }
      setCanvasWidth(img.width);
      setCanvasHeight(img.height);
      const filtedImgs = localImgs.filter(img => selectedImgs[img.url]);
      if (localOrNFTImage === 2) {
        var imgCanvas = [];
        filtedImgs.forEach((filtedImg, index) => {
          CI.openImgUrl(filtedImg.url, function(err, imgObj) {
              if (err) {
                return alert("openImgUrl:" + err);
              }
              var base64 = getBase64Image(imgObj);
              var imgFile = btof(base64, index + '');

              CI.openImgFile(imgFile, {orientation: false}, function(err, canvas) {
                if (err) {
                  return alert("openImgFile:" + err);
                }
                imgCanvas = [...imgCanvas, canvas];
                if (imgCanvas.length === filtedImgs.length) {
                  CI.createCharImg(currentImg, {
                    threshold: threshold/100,
                    shadowOpacity: shadowOpacity/100,
                    indexTable: [],
                    renderTable: [],
                    img: img,
                    wordList: [...selectedWords, ...imgCanvas],
                    onprogress: function() {
                    },
                    onended: function() {
                      setGenerateOver(true);
                      setIsGenerating(false);
                    }
                  });
                }
              });
            }
          )
        });
      } else {
        CI.createCharImg(currentImg, {
          threshold: threshold/100,
          shadowOpacity: shadowOpacity/100,
          indexTable: [],
          renderTable: [],
          img: img,
          wordList: [...selectedWords, ...filtedImgs],
          onprogress: function() {
          },
          onended: function() {
            setGenerateOver(true);
            setIsGenerating(false);
          }
        });
      }
    })
  }

  const burnNFTAndRefund = (nft) => {
    setIsPending(true);
    nextNFT.methods.burnAndRefund(parseInt(nft.token_id)).send({from: account})
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
  
  const changeTargetPrice = (v) => {
    const targetPrice = new BigNumber(v.target.value).shiftedBy(18);
    setTargetPrice(targetPrice);
    const gapPrice = targetPrice.minus(new BigNumber(nftToPull.metadata.cost));
    setPullUpFee(gapPrice.multipliedBy(feePercent).div(10000));
  }

  const changeNFTAddressOnEth = (v) => {
    setNFTAddressOnETH(v.target.value);
  }

  const changeStartTokenId = (v) => {
    setStartTokenId(v);
  }
  const changeEndTokenId = (v) => {
    setEndTokenId(v);
  }


  const loadNFTFromEthereum = () => {
    if (endTokenId - startTokenId <= 0) {
      message.error('End token id must larger than start token id');
      return;
    }
    if (endTokenId - startTokenId > 100) {
      message.error('Can NOT load no more than 100 NFTs.');
      return;
    }
    setLocalOrNFTImage(2);
    const options = { chain: '0x1', address: nftAddressOnETH, offset: startTokenId, limit: endTokenId - startTokenId + 1 };
    Moralis.Web3API.token.getNFTOwners(options).then(async (nfts) => {
      console.log(nfts.result);
      var imgCanvas = [];
      const tmpSelectedImgs = JSON.parse(JSON.stringify(selectedImgs));
      nfts.result.forEach(nft => {
        const imageStr = nft.metadata != null ? JSON.parse(nft.metadata).image : nft.token_uri;
        if (imageStr.indexOf(ipfsPreStr) >= 0) {
          const image = imageStr.substr(ipfsPreStr.length);
          const imageUrl = ipfsGateWay + image;   
          nft.url = imageUrl;   
        } else {
          nft.url = imageStr;
        }
        tmpSelectedImgs[nft.url] = true;
        imgCanvas = [...imgCanvas, nft];
        if (imgCanvas.length === nfts.result.length) {
          setLocalImgs(imgCanvas);
          setSelectedImgs(tmpSelectedImgs);
          setLoadNFTVisible(false);
        }
          
        // CI.openImgUrl(nft.url, function(err, img){
        //   if (err) {
        //     return alert(err);
        //   }
        //   if (img.width === 0 || img.height === 0) return;
        //   //img.crossOrigin = "Anonymous";
        //   //const url = window.URL.createObjectURL(img);
        //   tmpSelectedImgs[nft.url] = true;
        //   CI.openImgFile(img, {orientation: false}, function(err, canvas) {
        //     if (err) {
        //       return alert(err);
        //     }
        //     canvas.url = nft.url;
        //     //imgCanvas.push(canvas);
        //     imgCanvas = [...imgCanvas, canvas];
        //     if (imgCanvas.length === nfts.result.length) {
        //       setLocalImgs(imgCanvas);
        //       setSelectedImgs(tmpSelectedImgs);
        //     }
        //   });
        // });
      })
    });
  }

  const cloneNFT2AnotherChain = (nft) => {
    setNftToSend(nft);
    setTraverseChainVisible(true);
  }

  const pullUpNFTValue = () => {
    setIsPending(true);
    nextNFT.methods.pullUp(parseInt(nftToPull.token_id), '0x' + targetPrice.toString(16)).send({from: account, value: '0x' + pullUpFee.toString(16)})
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

  async function mintNFT() {
    const totalCost = '0x' + basePrice.toString(16);
    setIsPending(true);
    let dataUrl = currentImg.toDataURL("image/png");
    const file = new Moralis.File(selectedNFT.token_address + '_' +  selectedNFT.token_id, {base64 : dataUrl});
    try {
      await file.saveIPFS();
    } catch (error) {
      console.log(error);
      message.error('fail to upload image to ipfs network.')
      return;
    }
    console.log(file._hash);        
    const proof = merkleTree.getHexProof(hashToken(account));
    nextNFT.methods.mint(selectedWords, file._hash, proof).send({from: account, value: totalCost})
    .on('transactionHash', function(hash){
      console.log(hash);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
      setIsPending(false);
      setMintVisibility(false);
      nextNFT.methods.totalSupply().call().then(nftNumber => {
        setTotalSupply(parseInt(nftNumber));
        getDataFromContract(totalSupply, 10);
      });
    })
    .on('error', function(error, receipt) { 
      console.log(error, receipt);
      setIsPending(false);
    });
  }

  const selectNFTTypeChange = (nftAddr) => {
    if (nftAddr === '0') {
      setAddressInputVisible(true);
      setImportImgVisible(false);
      if (inputNFTAddress !== '') {
        loadNFTs(inputNFTAddress);
      }
    } else if (nftAddr === '1') {
      setImportImgVisible(true);
      setAddressInputVisible(false);
    } else {
      setAddressInputVisible(false);
      setImportImgVisible(false);
      loadNFTs(nftAddr);
    }
  };

  const changeNFTAddress = (nftAddrEvent) => {
    const nftAddr = nftAddrEvent.target.value;
    if (nftAddr.length === 42) {
      setInputNFTAddress(nftAddr);
      loadNFTs(nftAddr);
    }
  }

  const loadNFTs = (nftAddr) => {
    setSelectedNFTType(nftAddr);
    setIsLoading(true);
    const options = { address: account, chain: IsMainnet ? '0x1' : '0x4', token_address: nftAddr };
    Moralis.Web3API.account.getNFTsForContract(options).then(async (nfts) => {
      console.log(nfts.result);
      if (nfts.result.length === 0) {
        message.warning('You have no NFT in this NFT contract.');
      }
      const nftArr = [];
      for (var i = 0; i < nfts.result.length; i++) {
        const nft = nfts.result[i];
        nft.bMinted = false;
        nftArr.push(nft);
      }
      setMintableNFTs([...selfImages, ...nftArr]);
      setIsLoading(false);
    });
  }

  const selectWordChange = (words) => {    
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

  const changeDestinationChain = (v) => {
    if (chainMap[chainId] === v) {
      message.warning('Can NOT select the same chain to tranverse.');
    } else {
      setDestChain(v);
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only open JPG/PNG file!');
    }
    return isJpgOrPng;
  }

  const openImage = () => {
    imgFile.current.click();
  }
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      console.log(img);
      if (img.type !== 'image/jpeg' && img.type !== 'image/png') {
        message.warning('Please select jpeg/png file');
        return;
      }
      const url = URL.createObjectURL(img);
      const selfImage = {};
      selfImage.token_uri = url;
      selfImage.token_id = 'localImage_' + selfImages.length;
      selfImage.bMinted = false;
      const images = [selfImage, ...selfImages];      
      setSelfImages(images);
      const nfts = [selfImage, ...mintableNFTs];
      setMintableNFTs(nfts);
    }
  }
  const selectImg = (url) => {
    const tmpSelectedImgs = JSON.parse(JSON.stringify(selectedImgs));
    tmpSelectedImgs[url] = !tmpSelectedImgs[url];
    setSelectedImgs(tmpSelectedImgs);
  }
  
  const openLocalImages = () => {
    localImgFiles.current.click();
  }

  const loadImagesFromChain = () => {
    //localImgFiles.current.click();
  }

  const onLocalImagesChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setLocalOrNFTImage(2);
      var imgs = [];
      for (var i = 0; i < event.target.files.length; i++) {
        let img = event.target.files[i];
        if (img.type !== 'image/jpeg' && img.type !== 'image/png') {
          continue;
        }
        imgs = [...imgs, img];
      }
      var imgCanvas = [];
      const tmpSelectedImgs = {};
      imgs.forEach(img => {
        const url = URL.createObjectURL(img);
        tmpSelectedImgs[url] = true;
        CI.openImgFile(img, {orientation: false}, function(err, canvas) {
          canvas.url = url;
          //imgCanvas.push(canvas);
          imgCanvas = [...imgCanvas, canvas];
          if (imgCanvas.length === imgs.length) {
            setLocalImgs(imgCanvas);
            setSelectedImgs(tmpSelectedImgs);
          }
        });
      });
    }
  }
  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>
        NEXT NFTs{' '} 
        <Checkbox checked={onlyMe} onChange={e => setOnlyMe(e.target.checked)}>Only Me</Checkbox>
        <Button type='primary' onClick={() => showMintNFTDialog()}>Mint NFT</Button>
        <Button style={{marginLeft: '10px'}} type='link' onClick={() => showRuleOfMintBurn()}>Rule of Next NFT</Button>
      </h1>
      <div style={styles.NFTs}>
        <Pagination style={{width: '100%', textAlign: 'right'}} defaultCurrent={1} defaultPageSize={10} total={totalSupply} onChange={(pageV, pageSizeV) => changePage(pageV, pageSizeV)}/>
        <Skeleton  active loading={isLoadingNext}>
          {AllNFTInfos != null && AllNFTInfos.map((nft, index) => {
              const bMine = account != null && nft.owner_of.toLowerCase() === account.toLowerCase();
              if (onlyMe && !bMine) return ''; 
              return (
                <Card
                  hoverable
                  actions={bMine ? [                    
                    <Tooltip title="Transfer NFT to another account">
                      <SendOutlined onClick={() => handleTransferClick(nft)}/>
                    </Tooltip>,         
                    <Tooltip title="Clone NFT to another chain">
                      <UsergroupAddOutlined onClick={() => cloneNFT2AnotherChain(nft)} />
                    </Tooltip>, 
                    <Tooltip title="Burn and Refund">
                      <FireOutlined onClick={() => burnNFTAndRefund(nft)} />
                    </Tooltip>, 
                  ] : [      
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
                  <Meta title={'NEXT NFT #' + nft.token_id} 
                    description={
                    <div style={styles.desc}>                      
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
        title={`Traverse ${NextNFTInfo?.name || "NFT"} to another chain`}
        visible={traverseChainVisible}
        onCancel={() => setTraverseChainVisible(false)}
        onOk={() => traverseChains()}
        confirmLoading={isPending}
        okText="Send"
      >
        <div style={{ width: '100%', height: 20, marginButtom: '20px' }}>
          Please select the destination chain
        </div>
        <Select
          allowClear
          style={{ width: '100%', marginButtom: '20px' }}
          onChange={changeDestinationChain}
        >
          {IsMainnet ? MainChains : TestChains}
        </Select>
      </Modal>

      {/* <Modal
        title={`Pull up the value of NFT`}
        visible={pullUpVisible}
        onCancel={() => setPullUpVisible(false)}
        onOk={() => pullUpNFTValue()}
        confirmLoading={isPending}
        okText="Confirm"
      >
        <Input style={{width: '100%'}} addonBefore="Target Price" addonAfter="eth" defaultValue="0" onChange={(v) => changeTargetPrice(v)}/>
        <Text>Actual fees to be paid is {pullUpFee.shiftedBy(-18).toNumber()} eth.</Text><p/>
        <Text>NOTE: Actual fees = (target price - current price) * {feePercent / 100}%.</Text><p/>
      </Modal> */}

      <Modal
        title={`Load NFTs from Ethereum`}
        visible={loadNFTVisible}
        onCancel={() => setLoadNFTVisible(false)}
        onOk={() => loadNFTFromEthereum()}
        confirmLoading={isPending}
        okText="Confirm"
      >
        <Input style={{width: '100%'}} addonBefore="NFT Address" onChange={(v) => changeNFTAddressOnEth(v)}/>
        <div style={{width: '100%', marginTop: '10px'}}>
          <InputNumber style={{width: '40%', marginRight: '10px'}} addonBefore="Start Token Id" onChange={(v) => changeStartTokenId(v)}/>
          ~
          <InputNumber style={{width: '40%', marginLeft: '10px'}} addonBefore="End Token Id" onChange={(v) => changeEndTokenId(v)}/>
        </div>
      </Modal>
      
      <Modal
        title="Rule of NEXT NFT"
        visible={ruleVisible}
        onCancel={() => setRuleVisibility(false)}
        onOk={() => setRuleVisibility(false)}
        confirmLoading={isPending}
        width='600px'
      >
        <Text style={styles.text}>
        (1) <a href="https://github.com">Whitelist</a> Round: MAX number of exist NFT is 3 for each account in whitelist.
        </Text><p/>
        <Text style={styles.text}>
        (2) Only can mint NFT on Ethereum. And in same round, when burn NFT, the costs spent on mint will be refunded.
        </Text><p/>
        <Text style={styles.text}>
        (3) Can clone NFT from <Text strong>Ethereum</Text> to <Text strong>BSC/Polygon/Avalanch</Text>.
        </Text><p/>
        <Text style={styles.text}>
        (4) If an NFT has clone on other chains, it can't be transferred to another EOA, unless all clones are sent back to Ethereum.
        </Text><p/>
        <Text style={styles.text}>
        (5) Total supply of Next NFT is <Text strong>10240</Text>.
        </Text>
      </Modal>      

      <Modal
        title={`Mint ${NextNFTInfo?.name || "NFT"} (Current mint price: ${basePrice.shiftedBy(-18).toString()} ETH)`}
        visible={mintVisible}
        onCancel={() => setMintVisibility(false)}
        confirmLoading={isPending}
        footer={[
          <div style={styles.footer}>
            <Button type='primary' loading={isPending} onClick={() => mintNFT()}>Mint NFT</Button>
          </div>
          
        ]}
        width='700px'
      > 
        <div style={{ width: '100%', height: 20, marginButtom: '20px' }}>
          Step 1: import image from your NFT or local file, and select one
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
        {
          addressInputVisible ? <Input defaultValue={inputNFTAddress} style={{width: '100%', marginTop: '10px'}} addonBefore="NFT Address" onChange={(v) => changeNFTAddress(v)}/> : ''
        }
        {
          importImgVisible ? <div style={{ marginTop: '10px' }}>
                              <input type="file" ref={imgFile} style={{ display: 'none' }} onChange={(e) => onImageChange(e)} />  
                              <Button type='primary' icon={<PictureOutlined />} onClick={() => openImage()}>Open Image</Button>
                            </div> : ''
        }
        <div style={styles.NFTs}>
          <Skeleton active loading={isLoading}>
            {mintableNFTs != null && mintableNFTs.map((nft, index) => {    
                const imageStr = nft.metadata != null ? JSON.parse(nft.metadata).image : nft.token_uri;
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
                      <Tooltip title={nft.bMinted ? "Has been minted" : titleContent} style={{ height: 50 }}>
                        {
                          nft.bMinted ? <StopOutlined /> : (
                          selectedNFT == null ? <MehOutlined onClick={() => handleGenerateNFTClick(nft)}/> : 
                           (selectedNFT.token_id !== nft.token_id) ? 
                            <FrownOutlined onClick={() => handleGenerateNFTClick(nft)}/> :
                            <SmileTwoTone onClick={() => handleGenerateNFTClick(nft)}/>)
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
        <div style={{ width: '100%', height: 20, marginTop: '20px' }}>
          Step 2: select or input your favorite words which will be merged with the selected image above
        </div>
        <Select mode="tags" 
          tokenSeparators={[',']}
          allowClear
          style={{ width: '100%', marginButtom: '20px' }}
          onChange={selectWordChange}
        >
          {Words}
        </Select>
        <div style={{ width: '100%', height: 20, marginTop: '20px' }}>
          Step 3: import local images or load NFT images which will be merged with the selected image above
        </div>
        <div style={{ marginTop: '10px', marginButtom: '10px' }}>
          <input type="file" multiple ref={localImgFiles} style={{ display: 'none' }} onChange={(e) => onLocalImagesChange(e)} />  
          <Button type='primary' icon={<PictureOutlined />} onClick={() => openLocalImages()}>Open Local Images</Button>
          <Button type='primary' style={{marginLeft: '20px'}} icon={<PictureOutlined />} onClick={() => setLoadNFTVisible(true)}>Load NFT from Ethereum</Button>
        </div>
        <div style={styles.NFTs}>
          <Skeleton active loading={isLoading}>
            {localImgs.map((img, index) => {   
                return (
                  <Image 
                    preview={false} 
                    src={img.url} 
                    style={{ height: "100px", width: '100px', border: (selectedImgs[img.url] === true) ? '2mm ridge rgba(31, 191, 150, .6)' : '' }}
                    onClick={() => selectImg(img.url)}
                  />
                );
              })}
          </Skeleton>
        </div>
        <div style={styles.newNFTs}>
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{width: 500, height: 500 * (canvasHeight/canvasWidth), marginLeft:"auto", marginRight:"auto"}}></canvas>    
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
