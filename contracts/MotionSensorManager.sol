// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MotionSensorManager {

    address public admin;

    //construtor definido para armazenar o endereço que implantou o contrato
    constructor() {
        admin = msg.sender;
    }

    // Estrutura mínima para sintetizar os dados de registro dos sensores de movimento
    struct MotionSensor {
        string macAddress;
        string measurementType; // esperado: "motion"
        uint256 registeredAt;
        uint256 expiresAt;
        bool isValid;
    }

    // Mapeamento usando UID como chave
    mapping(string => MotionSensor) public sensors;

    //evento de log para o processo de registro
    event SensorRegistered(
        string uid,
        string macAddress,
        string measurementType,
        uint256 registeredAt,
        uint256 expiresAt
    );

    // modificador que limita o uso de funcionalidades ao administrador
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    function registerMotionSensor(string memory _uid, string memory _macAddress) public onlyAdmin {
        //verifica se o dispositivo já/ainda está registrado na rede
        require(!sensors[_uid].isValid, "Device already registered");

        //síntese da data de registro do dispositivo e seu período de validade
        uint256 nowTimestamp = block.timestamp;
        uint256 expiryTimestamp = nowTimestamp + 2 minutes;

        sensors[_uid] = MotionSensor({
            macAddress: _macAddress,
            measurementType: "motion",
            registeredAt: nowTimestamp,
            expiresAt: expiryTimestamp,
            isValid: true
        });

        emit SensorRegistered(_uid, _macAddress, "motion", nowTimestamp, expiryTimestamp);
    }

//Se o dispositivo está registrado e a data de validade ainda não foi atingida, a função de autenticação retorna 'true'
    function isMotionSensorAuthentic(string memory _uid) public view returns (bool) {
        MotionSensor memory device = sensors[_uid];
        return device.isValid && block.timestamp <= device.expiresAt;
    }
}
