import { Card, Timeline, Typography, Image, Button } from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import BigNumber from "bignumber.js";
import pic1 from '../asset/1.png';
import pic2 from '../asset/2.png';
import pic3 from '../asset/3.png';
import pic4 from '../asset/4.png';
import pic5 from '../asset/5.png';

// import TangaNFTInfo from "../asset/abi/tangaNFT.json";

const { Text } = Typography;

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  textSubTitle: {
    fontSize: "16px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};

export default function QuickStart({ isServerInfo }) {
  const { Moralis, chainId, account } = useMoralis();
  const [fromTime, setFromTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <Card
        style={{...styles.card}}
        title={
          <>
            📝 <Text strong>About NextNFT</Text>
          </>
        }
      >
        <Text style={styles.text}>
        NextNFT is next NFT which can be automatically generated from images and text. Everybody could be an artist in Web3 era by using some favorite elements.<p/>
        Here are some examples for your reference and hopefully become a source of inspiration for your creations.
        </Text><p/>
        <Image src={pic1} width={300}/>
        <Image src={pic2} width={300}/> 
        <Image src={pic3} width={300}/>
        <Image src={pic4} width={300}/>
        <Image src={pic5} width={300}/>
      </Card>
      <Card
        style={{...styles.card}}
        title={
          <>
            🧰 <Text strong>Key Information</Text>
          </>
        }
      >
          <Timeline.Item dot="📝">
            <Text style={styles.textSubTitle}>
            About Mint of NextNFT
            </Text><p/>
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
          </Timeline.Item> 

          <Timeline.Item dot="📝">
            <Text style={styles.textSubTitle}>
            What to do next?
            </Text><p/>
            <Text style={styles.text}>
            (1) Build DAO when the time is right          
            </Text><p/>
            <Text style={styles.text}>
            (2) Build new projects which has usage scenarios for NextNFT      
            </Text>
          </Timeline.Item> 
      </Card>
    </div>
  );
}
