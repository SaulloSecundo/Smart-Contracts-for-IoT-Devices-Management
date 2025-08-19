const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TemperatureSensorManager", function () {
  let TemperatureSensorManager, temperatureSensorManager;
  let owner, otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    TemperatureSensorManager = await ethers.getContractFactory("TemperatureSensorManager");
    temperatureSensorManager = await TemperatureSensorManager.deploy();
    await temperatureSensorManager.waitForDeployment();
  });

  it("Registra um sensor de umidade corretamente", async function () {
    await temperatureSensorManager.registerTemperatureSensor("UID789", "BB:11:22:33:44:55");
    const sensor = await temperatureSensorManager.sensors("UID789");

    expect(sensor.macAddress).to.equal("BB:11:22:33:44:55");
    expect(sensor.measurementType).to.equal("temperature");
    expect(sensor.isValid).to.equal(true);
  });

  it("Falha ao tentar registrar o mesmo UID novamente", async function () {
    await temperatureSensorManager.registerTemperatureSensor("UID789", "BB:11:22:33:44:55");
    await expect(
      temperatureSensorManager.registerTemperatureSensor("UID789", "AA:BB:CC:DD:EE:FF")
    ).to.be.revertedWith("Device already registered");
  });

  it("Autentica um sensor válido dentro do prazo", async function () {
    await temperatureSensorManager.registerTemperatureSensor("UID789", "BB:11:22:33:44:55");
    const isAuthentic = await temperatureSensorManager.isTemperatureSensorAuthentic("UID789");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração", async function () {
    await temperatureSensorManager.registerTemperatureSensor("UID789", "BB:11:22:33:44:55");

    // Avança o tempo em 3 minutos (o contrato define validade de 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await temperatureSensorManager.isTemperatureSensorAuthentic("UID789");
    expect(isAuthentic).to.equal(false);
  });

  it("Impede que contas não-admin registrem sensores", async function () {
    await expect(
      temperatureSensorManager.connect(otherAccount).registerTemperatureSensor("UID789", "11:22:33:44:55:66")
    ).to.be.revertedWith("Only admin can perform this action.");
  });
});
