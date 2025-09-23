const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HumiditySensorManager", function () {
  let HumiditySensorManager, humiditySensorManager;
  let admin, deviceOwner, otherAccount;

  beforeEach(async function () {
    [admin, deviceOwner, otherAccount] = await ethers.getSigners();
    HumiditySensorManager = await ethers.getContractFactory("HumiditySensorManager");
    humiditySensorManager = await HumiditySensorManager.deploy();
    await humiditySensorManager.waitForDeployment();
  });

  it("Registra um sensor de umidade corretamente", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    const sensor = await humiditySensorManager.sensors("UID123");

    expect(sensor.macAddress).to.equal("00:11:22:33:44:55");
    expect(sensor.owner).to.equal(deviceOwner.address);
    expect(sensor.isValid).to.equal(true);
  });

  it("Falha ao tentar registrar o mesmo UID novamente", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "AA:BB:CC:DD:EE:FF", deviceOwner.address)
    ).to.be.revertedWith("Device already registered");
  });

  it("Falha ao tentar registrar sensor com UID vazio", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("", "00:11:22:33:44:55", deviceOwner.address)
    ).to.be.revertedWith("UID cannot be empty");
  });

  it("Falha ao tentar registrar sensor com MAC vazio", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "", deviceOwner.address)
    ).to.be.revertedWith("MAC cannot be empty");
  });

  it("Falha ao tentar registrar sensor com owner inválido (zero address)", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", ethers.ZeroAddress)
    ).to.be.revertedWith("Owner cannot be zero address");
  });

  it("Autentica um sensor válido dentro do prazo", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);

    // Avança o tempo em 3 minutos (o contrato define validade de 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(false);
  });

  it("Impede que contas não-admin registrem sensores", async function () {
    await expect(
      humiditySensorManager.connect(otherAccount).registerHumiditySensor("UID456", "11:22:33:44:55:66", deviceOwner.address)
    ).to.be.revertedWith("Only admin can perform this action.");
  });

  it("Permite que o owner revogue seu sensor", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    await humiditySensorManager.connect(deviceOwner).revokeHumiditySensor("UID123");

    const sensor = await humiditySensorManager.sensors("UID123");
    expect(sensor.isValid).to.equal(false);
  });

  it("Permite que o admin revogue qualquer sensor", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    await humiditySensorManager.revokeHumiditySensor("UID123"); // admin chama

    const sensor = await humiditySensorManager.sensors("UID123");
    expect(sensor.isValid).to.equal(false);
  });

  it("Impede que uma conta que não seja owner nem admin revogue um sensor", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);

    await expect(
      humiditySensorManager.connect(otherAccount).revokeHumiditySensor("UID123")
    ).to.be.revertedWith("Not owner nor admin");
  });
});
