const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProximitySensorManager", function () {
  let ProximitySensorManager, proximitySensorManager;
  let owner, otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    ProximitySensorManager = await ethers.getContractFactory("ProximitySensorManager");
    proximitySensorManager = await ProximitySensorManager.deploy();
    await proximitySensorManager.waitForDeployment();
  });

  it("Registra um sensor de umidade corretamente", async function () {
    await proximitySensorManager.registerProximitySensor("UID987", "CC:11:22:33:44:55");
    const sensor = await proximitySensorManager.sensors("UID987");

    expect(sensor.macAddress).to.equal("CC:11:22:33:44:55");
    expect(sensor.measurementType).to.equal("proximity");
    expect(sensor.isValid).to.equal(true);
  });

  it("Falha ao tentar registrar o mesmo UID novamente", async function () {
    await proximitySensorManager.registerProximitySensor("UID987", "CC:11:22:33:44:55");
    await expect(
      proximitySensorManager.registerProximitySensor("UID987", "AA:BB:CC:DD:EE:FF")
    ).to.be.revertedWith("Device already registered");
  });

  it("Falha ao tentar registrar sensor com UID vazio", async function () {
    await expect(
      proximitySensorManager.registerProximitySensor("", "00:11:22:33:44:55")
    ).to.be.revertedWith("UID cannot be empty");
  });

  it("Falha ao tentar registrar sensor com MAC vazio", async function () {
    await expect(
      proximitySensorManager.registerProximitySensor("UID987", "")
    ).to.be.revertedWith("MAC cannot be empty");
  });

  it("Autentica um sensor válido dentro do prazo", async function () {
    await proximitySensorManager.registerProximitySensor("UID987", "CC:11:22:33:44:55");
    const isAuthentic = await proximitySensorManager.isProximitySensorAuthentic("UID987");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração", async function () {
    await proximitySensorManager.registerProximitySensor("UID987", "CC:11:22:33:44:55");

    // Avança o tempo em 3 minutos (o contrato define validade de 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await proximitySensorManager.isProximitySensorAuthentic("UID987");
    expect(isAuthentic).to.equal(false);
  });

  it("Impede que contas não-admin registrem sensores", async function () {
    await expect(
      proximitySensorManager.connect(otherAccount).registerProximitySensor("UID987", "11:22:33:44:55:66")
    ).to.be.revertedWith("Only admin can perform this action.");
  });
});
