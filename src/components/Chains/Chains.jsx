import { useEffect, useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";
import { useChain, useMoralis } from "react-moralis";

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
  },
  button: {
    border: "2px solid rgb(231, 234, 243)",
    borderRadius: "12px",
  },
};

const menuItems = [
  {
    key: "0x1",
    value: "Ethereum",
    icon: <ETHLogo />,
  },
  {
    key: "0x4",
    value: "Rinkeby Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x0a",
    value: "Optimism",
    icon: <ETHLogo />,
  },
  {
    key: "0x45",
    value: "Optimism Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0xa4b1",
    value: "Abitrum",
    icon: <ETHLogo />,
  },
  {
    key: "0x66eeb",
    value: "Abitrum Testnet",
    icon: <ETHLogo />,
  },
  {
    key: "0x38",
    value: "BSC",
    icon: <BSCLogo />,
  },
  {
    key: "0x61",
    value: "BSC Testnet",
    icon: <BSCLogo />,
  },
  {
    key: "0x89",
    value: "Polygon",
    icon: <PolygonLogo />,
  },
  {
    key: "0x13881",
    value: "Mumbai (Polygon Testnet)",
    icon: <PolygonLogo />,
  },
  {
    key: "0xa86a",
    value: "Avalanche",
    icon: <AvaxLogo />,
  },
  {
    key: "0xa869",
    value: "Avalanche Fuji Testnet",
    icon: <AvaxLogo />,
  },
];

function Chains() {
  const { switchNetwork, chainId, chain } = useChain();
  const { isAuthenticated } = useMoralis();
  const [selected, setSelected] = useState({});

  const IsMainnet = window.location.origin.indexOf("test") < 0 && window.location.origin.indexOf("localhost") < 0;
  const filterChains = {"mainnet": {'0x1': true, '0x0a': true, '0x38': true, '0x89': true,    '0xa4b1': true, '0xa86a': true}, 
                        "testnet": {'0x4': true, '0x45': true, '0x61': true, '0x13881': true, '0x66eeb': true,   '0xa869': true}}

  useEffect(() => {
    if (!chainId) return null;
    const newSelected = menuItems.find((item) => item.key === chainId);
    setSelected(newSelected);
    console.log("current chainId: ", chainId);
  }, [chainId]);

  const handleMenuClick = (e) => {
    console.log("switch to: ", e.key);
    switchNetwork(e.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {menuItems.map((item) => (
        filterChains[IsMainnet ? "mainnet" : "testnet"][item.key] ?
        <Menu.Item key={item.key} icon={item.icon} style={styles.item}>
          <span style={{ marginLeft: "5px" }}>{item.value}</span>
        </Menu.Item> : ''
      ))}
    </Menu>
  );

  if (!chainId || !isAuthenticated) return null;

  return (
    <div>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Button key={selected?.key} icon={selected?.icon} style={{ ...styles.button, ...styles.item }}>
          <span style={{ marginLeft: "5px" }}>{selected?.value}</span>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
}

export default Chains;
