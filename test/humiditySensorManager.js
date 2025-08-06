const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumiditySensorManager", function () {
  let contract;
  let deployer;
  let otherAccount;

  beforeEach(async function () {
    [deployer, otherAccount] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("HumiditySensorManager");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  it("Permite que o admin registre um sensor", async function () {
    const tx = await contract.registerHumiditySensor("sensor001");
    await tx.wait();

    const sensor = await contract.sensors("sensor001");
    expect(sensor.isValid).to.be.true;
  });

  it("Permite registrar um sensor já registrado", async function () {
    await contract.registerHumiditySensor("sensor001");

    await expect(
      contract.registerHumiditySensor("sensor001")
    ).to.be.revertedWith("Device already registered");
  });

  it("Retorna verdadeiro se o sensor for autêntico", async function () {
    await contract.registerHumiditySensor("sensor001");

    const isAuthentic = await contract.isHumiditySensorAuthentic("sensor001");
    expect(isAuthentic).to.be.true;
  });

  it("Retorna falso se o sensor estiver expirado", async function () {
    await contract.registerHumiditySensor("sensor001");

    // avança o tempo em 3 minutos (180 segundos)
    await ethers.provider.send("evm_increaseTime", [180]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await contract.isHumiditySensorAuthentic("sensor001");
    expect(isAuthentic).to.be.false;
  });

  it("Não permite que contas não-admin registre sensores", async function () {
    await expect(
      contract.connect(otherAccount).registerHumiditySensor("sensor002")
    ).to.be.revertedWith("Only admin can perform this action.");
  });
});
