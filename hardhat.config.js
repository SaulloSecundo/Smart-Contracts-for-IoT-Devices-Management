require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://localhost:7545",
      accounts: [
        "0xde65dc2fefa2e60626703f0a4f63c49d1d84ebefaca67852f180f8ec0da1df7b",
        "0xce6b881bdd1ea38f84fcb82350b0469638ebe9350a2fb2d9075c3cd8f9ed7418",
	"0x99a1d82623df30c3d3842f981e04fdcf8fb3d39ba89e83c7b4d745a214b838c2"
      ]
    }
  }
};
