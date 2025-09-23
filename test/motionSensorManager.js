const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MotionSensorManager", function () {
  let MotionSensorManager, motionSensorManager;
  let owner, otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    MotionSensorManager = await ethers.getContractFactory("MotionSensorManager");
    motionSensorManager = await MotionSensorManager.deploy();
    await motionSensorManager.waitForDeployment();
  });

  it("Registra um sensor de umidade corretamente", async function () {
    await motionSensorManager.registerMotionSensor("UID456", "AA:11:22:33:44:55");
    const sensor = await motionSensorManager.sensors("UID456");

    expect(sensor.macAddress).to.equal("AA:11:22:33:44:55");
    expect(sensor.measurementType).to.equal("motion");
    expect(sensor.isValid).to.equal(true);
  });

  it("Falha ao tentar registrar o mesmo UID novamente", async function () {
    await motionSensorManager.registerMotionSensor("UID456", "AA:11:22:33:44:55");
    await expect(
      motionSensorManager.registerMotionSensor("UID456", "AA:BB:CC:DD:EE:FF")
    ).to.be.revertedWith("Device already registered");
  });

  it("Falha ao tentar registrar sensor com UID vazio", async function () {
    await expect(
      motionSensorManager.registerMotionSensor("", "00:11:22:33:44:55")
    ).to.be.revertedWith("UID cannot be empty");
  });

  it("Falha ao tentar registrar sensor com MAC vazio", async function () {
    await expect(
      motionSensorManager.registerMotionSensor("UID456", "")
    ).to.be.revertedWith("MAC cannot be empty");
  });

  it("Autentica um sensor válido dentro do prazo", async function () {
    await motionSensorManager.registerMotionSensor("UID456", "AA:11:22:33:44:55");
    const isAuthentic = await motionSensorManager.isMotionSensorAuthentic("UID456");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração", async function () {
    await motionSensorManager.registerMotionSensor("UID456", "AA:11:22:33:44:55");

    // Avança o tempo em 3 minutos (o contrato define validade de 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await motionSensorManager.isMotionSensorAuthentic("UID456");
    expect(isAuthentic).to.equal(false);
  });

  it("Impede que contas não-admin registrem sensores", async function () {
    await expect(
      motionSensorManager.connect(otherAccount).registerMotionSensor("UID456", "11:22:33:44:55:66")
    ).to.be.revertedWith("Only admin can perform this action.");
  });
});
