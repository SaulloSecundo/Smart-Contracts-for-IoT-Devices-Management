require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x107aec3392259470509b726adf1823ee135d636b221972e91a1c8de874f81b7c",
        "0xb487dfb2f64c812c3cad3c5b7db19b6d2245f8eb765d567fdbed859ca4e07368",
	"0xf598f76ebd02a0e1e3349504594ab0cdf4c14a20cb585aee012d2fe0d91e056a"
      ]
    }
  }
};
