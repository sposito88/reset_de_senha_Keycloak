import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

console.log('Iniciando servidor...');

// Inicializa o oracledb com logs detalhados
try {
  console.log('Configurando Oracle Client...');
  console.log('LD_LIBRARY_PATH:', process.env.LD_LIBRARY_PATH);
  console.log('ORACLE_HOME:', process.env.ORACLE_HOME);
  console.log('TNS_ADMIN:', process.env.TNS_ADMIN);
  
  oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient' });
  console.log('Oracle Client inicializado com sucesso');
} catch (err) {
  console.error('Erro ao inicializar Oracle Client:', err);
  process.exit(1);
}

const DB_CONFIG = {
  user: "BANCO",
  password: "USER",
  connectString: "SENHA"
};

console.log('Configuração do banco:', {
  ...DB_CONFIG,
  password: '****' // Oculta a senha nos logs
});

async function testDatabaseConnection() {
  let connection;
  try {
    console.log('Testando conexão com o banco...');
    connection = await oracledb.getConnection(DB_CONFIG);
    console.log('Conexão com o banco estabelecida com sucesso');
    
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('Teste de query executado com sucesso:', result);
    
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão com o banco:', err);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão de teste:', err);
      }
    }
  }
}

async function getToken() {
  try {
    console.log('Obtendo token de autenticação...');
    const response = await axios.post(
      'http://portal.bm4e.equatorialenergia.com.br/auth/realms/CPQD-Portal/protocol/openid-connect/token',
      new URLSearchParams({
        client_id: 'PGA',
        grant_type: 'password',
        username: 'USER',
        password: 'SENHA'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Token obtido com sucesso');
    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

app.post('/api/reset-password', async (req, res) => {
  console.log('Recebida requisição de reset de senha');
  const { usernames } = req.body;
  console.log('Usuários a serem processados:', usernames);
  
  const results = [];
  let connection;

  try {
    // Testa a conexão antes de prosseguir
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Não foi possível estabelecer conexão com o banco de dados');
    }

    connection = await oracledb.getConnection(DB_CONFIG);
    console.log('Conexão estabelecida para reset de senha');
    
    const token = await getToken();
    console.log('Token obtido para reset de senha');

    for (const username of usernames) {
      try {
        console.log(`Processando usuário: ${username}`);
        
        // Busca o ID do usuário
        const result = await connection.execute(
          `SELECT ID FROM USER_ENTITY WHERE USERNAME = :username`,
          [username],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`Resultado da busca para ${username}:`, result);

        if (result.rows.length === 0) {
          console.log(`Usuário não encontrado: ${username}`);
          results.push({ username, status: 'erro', message: 'Usuário não encontrado' });
          continue;
        }

        const userId = result.rows[0].ID;
        console.log(`ID encontrado para ${username}: ${userId}`);

        // Atualiza a credencial no banco
        console.log(`Atualizando credencial para ${username}`);
        await connection.execute(`
          UPDATE CREDENTIAL 
          SET SECRET_DATA = '{\"value\":\"YHBB8yeSUxxydP4YA9zpR/6amCsiiNWGhv5yVlOfpruFp6QR7I0hnDDDvfSLagABCYYZi4OSTZcyYEMzMjrapg==\",\"salt\":\"BYZkgl8XZtqXJzTdQ77z/w==\",\"additionalParameters\":{}}',
              CREDENTIAL_DATA = '{\"hashIterations\":27500,\"algorithm\":\"pbkdf2-sha256\",\"additionalParameters\":{}}'
          WHERE "TYPE" = 'password' AND USER_ID = :userId`,
          [userId]
        );

        await connection.commit();
        console.log(`Credencial atualizada para ${username}`);

        // Atualiza via API
        console.log(`Atualizando via API para ${username}`);
        await axios.put(
          `http://portal.bm4e.equatorialenergia.com.br/auth/admin/realms/CPQD-Portal/users/${userId}`,
          {
            requiredActions: ["UPDATE_PASSWORD"],
            enabled: true
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`API atualizada para ${username}`);

        results.push({ username, status: 'sucesso', message: 'Senha resetada com sucesso' });
      } catch (error) {
        console.error(`Erro ao processar usuário ${username}:`, error);
        results.push({ 
          username, 
          status: 'erro', 
          message: error.message || 'Erro interno ao processar usuário'
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Erro na execução:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor',
      details: error.stack
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Conexão fechada com sucesso');
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Configurações do ambiente:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('LD_LIBRARY_PATH:', process.env.LD_LIBRARY_PATH);
  console.log('ORACLE_HOME:', process.env.ORACLE_HOME);
  console.log('TNS_ADMIN:', process.env.TNS_ADMIN);
});
