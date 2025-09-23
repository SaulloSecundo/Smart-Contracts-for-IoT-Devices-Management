require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x1692292ef45ebe7e46b623df88022446ade1bab2de1f6586a48899ed3826b164",
        "0xdfb5258d616b832ff39d2b8144afa29dff04419baa52346b7e4a7fabba83309c"
      ]
    }
  }
};
