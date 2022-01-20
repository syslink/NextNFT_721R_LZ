import { Card, Timeline, Typography, Image, Button } from "antd";
import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import BigNumber from "_bignumber.js@9.0.2@bignumber.js";
import pic1 from '../asset/1.png';
import pic2 from '../asset/2.png';
import pic3 from '../asset/3.png';

import TangaNFTInfo from "../asset/abi/tangaNFT.json";

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
  const { Moralis } = useMoralis();
  const [ MintPrice, setMintPrice ] = useState(0);
  const [ BurnPrice, setBurnPrice ] = useState(0);
  //const [ TangaNFT, setTangaNFT ] = useState(null);

  Moralis.Web3.enableWeb3().then(web3 => {
    const tangaNFTContract = new web3.eth.Contract(TangaNFTInfo.abi, TangaNFTInfo.address);
    //setTangaNFT(tangaNFTContract);
    tangaNFTContract.methods.getCurrentPriceToMint(1).call().then(mintPrice => {
      setMintPrice(new BigNumber(mintPrice).shiftedBy(-18).shiftedBy(-9).toString());
    });
    tangaNFTContract.methods.getCurrentPriceToBurn(1).call().then(burnPrice => {
      setBurnPrice(new BigNumber(burnPrice).shiftedBy(-18).shiftedBy(-9).toString());
    });
  });

  const buyTVA = () => {

  }
  const mintNFT = () => {
  }
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card
        style={{...styles.card, width: '60%'}}
        title={
          <>
            📝 <Text strong>About Tanga Volcanic</Text>
          </>
        }
      >
        <Timeline mode="left" style={styles.timeline}>
          <Timeline.Item dot="📄">
            <Text style={styles.text}>
            On the afternoon of January 15, a violent eruption of a submarine volcano (Hunga Tonga-Hunga Ha'apai) occurred in the Kingdom of Tonga, 
            an island nation located in the South Pacific, accompanied by a 7.6 magnitude severe earthquake and tsunami.
            </Text><p/>
            <Image src={pic1} style={{width: '300px', marginRight: '5px'}} alt=""/>
            <Image src={pic2} style={{width: '300px', marginRight: '5px'}} alt=""/>
            <Image src={pic3} style={{width: '300px'}} alt=""/>
          </Timeline.Item>

          <Timeline.Item dot="💿">
            <Text style={styles.textSubTitle}>
              General Science
            </Text><p/>
            <Text style={styles.text}>
            (1) Whether this Tonga volcanic eruption led to a global climate impact is not directly related to the magnitude of the earthquake or the damage caused, 
            but the key indicator is still the sulfur dioxide entering the stratosphere.
            </Text><p/>
            <Text style={styles.text}>
            (2) To have an observable global climate impact, volcanic activity would need to emit at least 2 million tons of sulfur dioxide. 
            About 400,000 tons of sulfur dioxide has already entered the stratosphere
            </Text>
          </Timeline.Item>

          <Timeline.Item dot="🧰">
            <Text style={styles.textSubTitle}>
            Impact on global economy and politics
            </Text><p/>
            <Text style={styles.text}>
            (1) In the short term, volcanic eruptions could trigger negative sentiment and speculation on global agricultural markets.
            </Text><p/>
            <Text style={styles.text}>
            (2) In the medium term, volcanic eruptions will exacerbate the divergence of global weather extremes and may lead to an escalation of future El Niño events.
            </Text><p/>
            <Text style={styles.text}>
            (3) In the long term, once volcanic eruptions continue and the sulfur dioxide delivered to the stratosphere breaks the threshold, there is the potential for observable effects on global climate, leading to profound changes in global economics and politics.
            </Text>
          </Timeline.Item>        
        </Timeline>
      </Card>
      <div>
        <Card
          style={styles.card}
          title={
            <>
              💣 <Text strong>Tanga Volcanic Ash Token(TVA)</Text><Button type='primary' onClick={() => buyTVA()}>Buy</Button>
            </>
          }
        >
          <Timeline mode="left" style={styles.timeline}>
            <Timeline.Item dot="💿">
              <Text style={styles.text}>
                Total issue volume of 1000 trillion{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/truffle">
                  TVA
                </a>
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="⚙️">
              <Text style={styles.text}>
              Developers account for 5%, 50 trillion{" "}
              <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/truffle">
                TVA
              </a>
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="📡">
              <Text style={styles.text}>
                Fund account for 15%, 150 trillion{" "}
                <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/truffle">
                  TVA
                </a>
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="✅" style={styles.text}>
              <Text>
              The remainder, 800 trillion, will be issued by mining
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>
        <Card
          style={{ marginTop: "10px", ...styles.card }}
          title={
            <>
              📡 <Text strong> Tanga Volcanic NFT (TangaNFT)</Text><Button type='primary' onClick={() => mintNFT()}>Mint</Button>
            </>
          }
        >
          <Timeline mode="left" style={styles.timeline}>
            <Timeline.Item dot="💿">
              <Text style={styles.text}>
              Putting a certain amount of TVA into the pool can mint TangaNFT from the pool
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="⚙️">
              <Text style={styles.text}>
              Destroying TangaNFT to the pool can obtain a certain amount of TVA from the pool
              </Text>
            </Timeline.Item>
            <Timeline.Item dot="💾">
              <Text style={styles.text}>
              The current minting of a TangaNFT requires the consumption of {MintPrice} Billion TVA
              </Text><p/>
              <Text style={styles.text}>
              The current destroying of a TangaNFT can the obtain {BurnPrice} Billion TVA
              </Text>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
    </div>
  );
}
