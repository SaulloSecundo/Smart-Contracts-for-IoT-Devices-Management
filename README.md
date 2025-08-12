# Contratos inteligentes para gerenciamento de dispositivos IoT

Este projeto implementa contratos inteligentes Ethereum para atuação nos processos de registro e autenticação temporária de dispositivos IoT. No presente recorte, a proposta é permitir que sensores sejam registrados por um administrador e tenham seu tempo de validade controlado na blockchain, com autenticação verificável.

Atualmente, o projeto contempla quatro tipos de sensores:

```shell
ProximitySensorManager
MotionSensorManager
HumiditySensorManager
TemperatureSensorManager
```

##  Requisitos

- Node.js (v18+)
- Hardhat (```npm install --save-dev hardhat```)
- Ganache (interface gráfica ou CLI)

## Como rodar localmente

### 1. Clone o repositório

```shell
git clone https://github.com/SaulloSecundo/Smart-Contracts-for-IoT-Devices-Management.git
cd register-auth-device
```

### 2. Instale as dependências

```shell
npm install
```
### 3. Inicie o Ganache
- Abra o Ganache (UI ou CLI)
- Copie a RPC URL e mantenha visível a chave privada de uma conta
- Configure o Hardhat (se necessário):

Se ainda não tiver configurado, edite hardhat.config.js com a RPC e a private key:

```shell
module.exports = {
  defaultNetwork: "ganache",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // ou sua URL do Ganache
      accounts: ["SUA_CHAVE_PRIVADA", "outra chave (se necessário)"]
    }
  },
  solidity: "0.8.20"
};
```
## Como compilar e fazer o deploy dos contratos

### 1. Compile os contratos

```shell
npx hardhat compile
```

### 2. Deploy dos contratos na rede local (Ganache)

```shell
npx hardhat run scripts/deploy.js --network ganache
```
Isso irá compilar e implantar os quatro contratos, e exibir os endereços na rede Ganache.

## Como interagir com os contratos

### 1. Use o console interativo do Hardhat

```shell
npx hardhat console --network ganache
```
### 2. Exemplo de interação:

```shell
const Contract = await ethers.getContractFactory("HumiditySensorManager");
const contract = await Contract.attach("ENDERECO_CONTRATO");

// Registra um sensor (somente admin)
await contract.registerHumiditySensor("UID001", "AA-BB-CC-DD-EE-FF");

// Verifica se está válido
await contract.isHumiditySensorAuthentic("UID001");
```

## Estrutura dos Contratos

Cada contrato segue a mesma lógica de autenticação temporária. Eles contêm:

### Modificador ```onlyAdmin```

Permite que apenas o administrador (endereço que fez o deploy) execute funções críticas como o registro de sensores.

### ```Struct``` específica

Cada contrato define uma struct que sintetisa o mínimo de informações necessárias para efetivar a identificação única dos dispositivos no processo de registro. No contrato destinado aos sensores de umidade, por exemplo, temos o seguinte:

```shell
struct HumiditySensor {
  string macAddress;
  uint256 registeredAt;
  uint256 expiresAt;
  bool isValid;
}
```

Para cada dispositivo registrado, o "uid" informado é mapeado para uma strutc que contém os dados do aparelho correspondente.
 
### Função ```register<SensorType>Sensor```

Registra um sensor na blockchain com validade de 2 minutos (tempo de expiração usado para testes rápidos):

```shell
function registerHumiditySensor(string memory _deviceID) public onlyAdmin
```

### Função ```is<SensorType>SensorAuthentic```

Verifica se o sensor está ativo e dentro do tempo de validade:

```shell
function isHumiditySensorAuthentic(string memory _deviceID) public view returns (bool)
```
## Como rodar os testes

Os testes automatizados básicos estão localizados na pasta ```test/```. Para executá-los:

```shell
npx hardhat test
```

Os testes cobrem:

- Registro válido de sensores
- Verificação da autenticidade
- Rejeição de sensores já registrados
- Acesso restrito a administradores

## Observações

- Os contratos foram organizados por tipo de sensor para maior modularidade.
- O projeto pode ser facilmente expandido para atuaradores, mais tipos de sensores ou classes distintas de dispostivos com dados mais complexos.
- Os contratos foram implantados usando scripts/deploy.js

