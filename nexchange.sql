CREATE DATABASE IF NOT EXISTS nexchange
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexchange;

CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_usuario_email UNIQUE (email)
) ENGINE=InnoDB;

-- Relação 1:1 com usuario: cada usuário possui no máximo um perfil.
CREATE TABLE perfil_investidor (
  id_perfil INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tolerancia_risco VARCHAR(20) NOT NULL,
  objetivo VARCHAR(100) NOT NULL,
  prazo_investimento VARCHAR(50) NOT NULL,
  CONSTRAINT uk_perfil_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_perfil_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Um ativo pode ser usado em várias oportunidades e operações.
CREATE TABLE ativo (
  id_ativo INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  simbolo VARCHAR(20) NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  CONSTRAINT uk_ativo_simbolo UNIQUE (simbolo)
) ENGINE=InnoDB;

-- Um usuário pode cadastrar várias regras de investimento.
CREATE TABLE regra_investimento (
  id_regra INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  valor_maximo DECIMAL(12,2) NOT NULL,
  moeda VARCHAR(10) NOT NULL,
  automacao_ativa BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_regra_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Uma oportunidade pertence a um usuário e a um ativo.
CREATE TABLE oportunidade (
  id_oportunidade INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_ativo INT NOT NULL,
  justificativa TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_oportunidade_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_oportunidade_ativo
    FOREIGN KEY (id_ativo) REFERENCES ativo(id_ativo)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Uma operação usa um usuário, um ativo e uma regra de investimento.
CREATE TABLE operacao (
  id_operacao INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_ativo INT NOT NULL,
  id_regra INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_operacao_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_operacao_ativo
    FOREIGN KEY (id_ativo) REFERENCES ativo(id_ativo)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_operacao_regra
    FOREIGN KEY (id_regra) REFERENCES regra_investimento(id_regra)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Uma notificação pertence a um usuário e está ligada a uma operação.
CREATE TABLE notificacao (
  id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_operacao INT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_notificacao_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_notificacao_operacao
    FOREIGN KEY (id_operacao) REFERENCES operacao(id_operacao)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_regra_usuario ON regra_investimento (id_usuario);
CREATE INDEX idx_oportunidade_usuario ON oportunidade (id_usuario);
CREATE INDEX idx_oportunidade_ativo ON oportunidade (id_ativo);
CREATE INDEX idx_operacao_usuario ON operacao (id_usuario);
CREATE INDEX idx_operacao_ativo ON operacao (id_ativo);
CREATE INDEX idx_operacao_regra ON operacao (id_regra);
CREATE INDEX idx_notificacao_usuario ON notificacao (id_usuario);
CREATE INDEX idx_notificacao_operacao ON notificacao (id_operacao);
