// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HumiditySensorManager {

    address public admin;

    //construtor definido para armazenar o endereço que implantou o contrato
    constructor() {
        admin = msg.sender;
    }

    //struct para síntese de dados dos sensores de humidade
    struct HumiditySensor {
        uint256 registeredAt;
        uint256 expiresAt;
        bool isValid;
    }

    mapping(string => HumiditySensor) public sensors;

    //evento de log para o processo de registro 
    event SensorRegistered(uint256 timestamp, uint256 expiresAt);

    //modificador que limita o uso de funcionalidades ao administrador
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    function registerHumiditySensor(string memory _deviceID) public onlyAdmin {
        //verifica se o dispositivo já/ainda está registrado na rede
        require(!sensors[_deviceID].isValid, "Device already registered");

        //síntese da data de registro do dispositivo e seu período de validade
        uint256 nowTimestamp = block.timestamp;
        uint256 expiryTimestamp = nowTimestamp + 2 minutes;

        sensors[_deviceID] = HumiditySensor({
            registeredAt: nowTimestamp,
            expiresAt: expiryTimestamp,
            isValid: true
        });

        emit SensorRegistered(nowTimestamp, expiryTimestamp);
    }

    function isHumiditySensorAuthentic(string memory _deviceID) public view returns (bool) {
        HumiditySensor memory device = sensors[_deviceID];
        //se o dispositivo está registrado e a data de validade ainda não foi atingida, a função retorna 'true'
        return device.isValid && block.timestamp <= device.expiresAt;
    }
}
