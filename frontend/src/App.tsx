import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ResetResult {
  username: string;
  status: 'sucesso' | 'erro';
  message: string;
}

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:18080/api/reset-password"
    : window.location.hostname === "backend"
    ? "http://backend:18080/api/reset-password"
    : window.location.hostname === "10.201.48.5"
    ? "http://10.201.48.5:18080/api/reset-password"
    : "http://portal.bm4e.equatorialenergia.com.br/api/reset-password";


function App() {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResetResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Iniciando requisição de reset de senha...');
      const usernames = userInput.split(/[\s,]+/).filter(u => u.trim());
      console.log('Usuários a serem processados:', usernames);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernames }),
      });

      console.log('Resposta recebida:', response.status);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      setResults(data.results || []);
    } catch (error) {
      console.error('Erro detalhado:', error);
      setResults([{ 
        username: 'Erro',
        status: 'erro',
        message: error instanceof Error ? error.message : 'Erro ao conectar com o servidor'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Reset de Senha de Usuários
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="users" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Digite os usuários (separados por espaço ou vírgula):
            </label>
            <textarea
              id="users"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              rows={4}
              placeholder="Ex: usuario1 usuario2 usuario3"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !userInput.trim()}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Resetar Senhas
              </>
            )}
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Resultados:</h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    result.status === 'sucesso' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className={`text-sm ${
                    result.status === 'sucesso' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <strong>{result.username}:</strong> {result.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
