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

  // REGISTRO DE SENSORES (FUNCIONALIDADE BÁSICA)

  it("Registra um sensor de umidade corretamente (funcionalidade)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    const sensor = await humiditySensorManager.sensors("UID123");

    expect(sensor.macAddress).to.equal("00:11:22:33:44:55");
    expect(sensor.owner).to.equal(deviceOwner.address);
    expect(sensor.isValid).to.equal(true);
  });


  //VALIDAÇÕES DE DADOS DE ENTRADA

  it("Falha ao tentar registrar sensor com UID vazio (validação de dados)", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("", "00:11:22:33:44:55", deviceOwner.address)
    ).to.be.revertedWith("Invalid UID");
  });

  it("Falha ao registrar sensor com UID acima de 64 caracteres (validação de dados)", async function () {
    const longUID = "U".repeat(65);
    await expect(
      humiditySensorManager.registerHumiditySensor(longUID, "00:11:22:33:44:55", deviceOwner.address)
    ).to.be.revertedWith("Invalid UID");
  });

  it("Falha ao registrar sensor com MAC de tamanho incorreto (validação de dados)", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33", deviceOwner.address)
    ).to.be.revertedWith("Invalid MAC length");
  });

  it("Falha ao tentar registrar sensor com owner inválido (zero address) (validação de dados)", async function () {
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", ethers.ZeroAddress)
    ).to.be.revertedWith("Owner cannot be zero address");
  });

  // SEGURANÇA E PERMISSÕES
  
  it("Falha ao tentar registrar o mesmo UID novamente (segurança)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    await expect(
      humiditySensorManager.registerHumiditySensor("UID123", "AA:BB:CC:DD:EE:FF", deviceOwner.address)
    ).to.be.revertedWith("Device already registered");
  });

  it("Impede que contas não-admin registrem sensores (segurança)", async function () {
    await expect(
      humiditySensorManager.connect(otherAccount).registerHumiditySensor("UID456", "11:22:33:44:55:66", deviceOwner.address)
    ).to.be.revertedWith("Only admin can perform this action.");
  });

  it("Permite que o proprietário revogue seu próprio sensor (segurança)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);

    await humiditySensorManager.connect(deviceOwner).revokeHumiditySensor("UID123");
    const sensor = await humiditySensorManager.sensors("UID123");

    expect(sensor.isValid).to.equal(false);
  });

  it("Impede que um usuário não autorizado revogue sensor de outro (segurança)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);

    await expect(
      humiditySensorManager.connect(otherAccount).revokeHumiditySensor("UID123")
    ).to.be.revertedWith("Not owner nor admin");
  });

  // AUTENTICAÇÃO E EXPIRAÇÃO

  it("Autentica um sensor válido dentro do prazo (funcionalidade)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);
    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(true);
  });

  it("Retorna falso se o sensor registrado chegou ao tempo limite de expiração (funcionalidade)", async function () {
    await humiditySensorManager.registerHumiditySensor("UID123", "00:11:22:33:44:55", deviceOwner.address);

    // Avança o tempo em 3 minutos (expiração definida como 2 minutos)
    await ethers.provider.send("evm_increaseTime", [3 * 60]);
    await ethers.provider.send("evm_mine");

    const isAuthentic = await humiditySensorManager.isHumiditySensorAuthentic("UID123");
    expect(isAuthentic).to.equal(false);
  });
});

