// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HumiditySensorManager {

    address public admin;

    //construtor definido para armazenar o endereço que implantou o contrato
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

    //evento de log para o processo de registro
    event SensorRegistered(
        string uid,
        string macAddress,
        address owner,
        string measurementType,
        uint256 registeredAt,
        uint256 expiresAt
    );

    //evento de log para o processo de revogação do dispositivo sensor
    event SensorRevoked(string uid, address revokedBy, uint256 atTimestamp);

    // modificador que limita o uso de funcionalidades ao administrador
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    // modificador que limita o uso de funcionalidades ao administrador e ao proprietáro do dispositivo
    modifier onlyOwnerOrAdmin(string memory _uid) {
        HumiditySensor memory s = sensors[_uid];
        require(s.isValid, "Sensor not registered/invalid");
        require(msg.sender == admin || msg.sender == s.owner, "Not owner nor admin");
        _;
    }

    // Admin registra o sensor e define o owner do dispositivo

    function registerHumiditySensor(string memory _uid, string memory _macAddress, address _owner) public onlyAdmin {
        // validação de UID, MAC e endereço do owner

    	require(bytes(_uid).length > 0, "UID cannot be empty");
        require(bytes(_macAddress).length > 0, "MAC cannot be empty");
        require(_owner != address(0), "Owner cannot be zero address");
        
        //verifica se o dispositivo já/ainda está registrado na rede
        require(!sensors[_uid].isValid, "Device already registered");

        //síntese da data de registro do dispositivo e seu período de validade
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

//Se o dispositivo está registrado e a data de validade ainda não foi atingida, a função de autenticação retorna 'true'
    function isHumiditySensorAuthentic(string memory _uid) public view returns (bool) {
        HumiditySensor memory device = sensors[_uid];
        return device.isValid && block.timestamp <= device.expiresAt;
    }

    // Revogação só por owner ou admin
    function revokeHumiditySensor(string memory _uid) public onlyOwnerOrAdmin(_uid) {
        HumiditySensor storage device = sensors[_uid];
        device.isValid = false;
        device.expiresAt = block.timestamp; // expira imediatamente
        emit SensorRevoked(_uid, msg.sender, block.timestamp);
    }
}


