// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HumiditySensorManager {

    address public admin;

    // Construtor: para definir quem implantou o contrato como administrador
    constructor() {
        admin = msg.sender;
    }

    // Estrutura mínima para sintetizar os dados de registro dos sensores de umidade
    struct HumiditySensor {
        string macAddress;
        address owner;          // dono do dispositivo
        string measurementType; // esperado: "humidity"
        uint256 registeredAt;
        uint256 expiresAt;
        bool isValid;
    }

    // Mapeamento usando UID como chave
    mapping(string => HumiditySensor) public sensors;

    // Evento de log para o processo de registro
    event SensorRegistered(
        string uid,
        string macAddress,
        address owner,
        string measurementType,
        uint256 registeredAt,
        uint256 expiresAt
    );

    // Evento de log para o processo de revogação do dispositivo sensor
    event SensorRevoked(string uid, address revokedBy, uint256 atTimestamp);

    // Modificador que limita o uso de funcionalidades ao administrador
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    // Modificador que limita o uso da função de revogação ao administrador e ao proprietario do dispositivo
    modifier onlyOwnerOrAdmin(string memory _uid) {
        HumiditySensor memory s = sensors[_uid];
        require(s.isValid, "Sensor not registered/invalid");
        require(msg.sender == admin || msg.sender == s.owner, "Not owner nor admin");
        _;
    }

    // Função de registro: somente o admin pode registrar sensores a partir do modificador onlyAdmin()
    function registerHumiditySensor(string memory _uid, string memory _macAddress, address _owner) public onlyAdmin {
        // proteção contra entradas vazias e malformadas
        require(bytes(_uid).length > 0 && bytes(_uid).length <= 64, "Invalid UID");
        require(bytes(_macAddress).length == 17, "Invalid MAC length");
        require(_owner != address(0), "Owner cannot be zero address");

        // proteção contra replays ou duplicações de UID
        require(!sensors[_uid].isValid, "Device already registered");

        // Registro do sensor
        uint256 nowTimestamp = block.timestamp;
        uint256 expiryTimestamp = nowTimestamp + 2 minutes;

        sensors[_uid] = HumiditySensor({
            macAddress: _macAddress,
            owner: _owner,
            measurementType: "humidity",
            registeredAt: nowTimestamp,
            expiresAt: expiryTimestamp,
            isValid: true
        });

        emit SensorRegistered(_uid, _macAddress, _owner, "humidity", nowTimestamp, expiryTimestamp);
    }

    // Verifica autenticidade do sensor
    function isHumiditySensorAuthentic(string memory _uid) public view returns (bool) {
        HumiditySensor memory device = sensors[_uid];
        return device.isValid && block.timestamp <= device.expiresAt;
    }

    // Revogação: somente owner ou admin
    function revokeHumiditySensor(string memory _uid) public onlyOwnerOrAdmin(_uid) {
        HumiditySensor storage device = sensors[_uid];
        device.isValid = false;
        device.expiresAt = block.timestamp; // expira o tempo do dispositivo assim que seu estado é modificado
        emit SensorRevoked(_uid, msg.sender, block.timestamp);
    }
}

