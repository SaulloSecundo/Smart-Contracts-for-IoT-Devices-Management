const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumiditySensorManager", function () {
  let HumiditySensorManager, humiditySensorManager;
  let owner, otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    HumiditySensorManager = await ethers.getContractFactory("HumiditySensorManager");
    humiditySensorManager = await HumiditySensorManager.deploy();
    await humiditySensorManager.waitForDeployment();
  });

  it("Registra um sensor de umidade corretamente", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55");
    const sensor = await humiditySensorManager.sensors("UID123");

    expect(sensor.macAddress).to.equal("00:11:22:33:44:55");
    expect(sensor.measurementType).to.equal("humidity");
    expect(sensor.isValid).to.equal(true);
  });

  it("Falha ao tentar registrar o mesmo UID novamente", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55");
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "AA:BB:CC:DD:EE:FF")
    ).to.be.revertedWith("Device already registered");
  });

  it("Autentica um sensor válido dentro do prazo", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55");
    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55");

    // Avança o tempo em 3 minutos (o contrato define validade de 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(false);
  });

  it("Impede que contas não-admin registrem sensores", async function () {
    await expect(
      humiditySensorManager.connect(otherAccount).registerHumiditySensor("UID456", "11:22:33:44:55:66")
    ).to.be.revertedWith("Only admin can perform this action.");
  });
});

