require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0x67f10ddcb165496c64106726eaabdf476dfd171afeca98c6f3bf107c9c8ce7a0",
        "0x0155f34e62bb60a51308bb0743c5b30bc988e4c09937b89b10e61d7a25f16733"
      ]
    }
  }
};
