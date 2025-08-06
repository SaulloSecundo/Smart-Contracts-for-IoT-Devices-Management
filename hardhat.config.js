require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x78784954a684fc03f4dfd3e935866bdc3d4fa748788da6a42edb154fd88c9742",
        "0x6f155f91def2b74aef62b537e4b2f2a6c5d9540d8edc599b37d2ead4dd98a676"
      ]
    }
  }
};
