require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x6106d0551dabf960de60e7e0fcbc17dbbdc7b6350e16c2392a89e71b49ead4c1",
        "0x939c29e1a85008ef48567105c25e96897d6565a8f6b955ce5059b6388e268e94"
      ]
    }
  }
};
