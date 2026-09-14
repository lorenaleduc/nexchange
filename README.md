# NEXCHANGE

O **NEXCHANGE** é uma plataforma acadêmica de simulação de investimentos desenvolvida com o objetivo de facilitar o acompanhamento de ativos financeiros e a criação de regras automatizadas de compra.

O sistema permite que o usuário acompanhe um mercado simulado, configure regras de investimento e visualize o histórico das operações realizadas, oferecendo uma experiência simples e organizada para compreender o funcionamento de investimentos automatizados.

> **Importante:** o NEXCHANGE funciona como um ambiente de simulação. Nenhuma operação financeira realizada dentro da plataforma envolve dinheiro real.

## Funcionalidades

O projeto conta atualmente com:

* Cadastro e login de usuários;
* Sessão de usuário;
* Perfil do investidor;
* Painel administrativo;
* Visualização do saldo disponível;
* Acompanhamento de ativos financeiros;
* Exibição de preços e variações simuladas;
* Criação de regras de investimento;
* Ativação e desativação da automação;
* Histórico de operações;
* Cadastro, edição e exclusão de ativos pelo administrador;
* Armazenamento local dos dados da interface;
* Estrutura de banco de dados relacional em MySQL.

## Tecnologias utilizadas

### Front-end

* HTML5
* CSS3
* JavaScript

### Banco de Dados

* MySQL
* SQL

Atualmente, a interface utiliza o **LocalStorage do navegador** para armazenar dados durante a simulação. O arquivo SQL presente no projeto representa a estrutura planejada do banco de dados da aplicação.

## Estrutura do projeto

```text
nexchange/
│
├── index.html
├── style.css
├── mercado.js
├── nexchange.sql
└── README.md
```

### `index.html`

Responsável pela estrutura da interface da aplicação, incl
