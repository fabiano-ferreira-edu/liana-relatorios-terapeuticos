import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ConnectionStatus: React.FC = () => {
  const { isConnected, isLoading, error } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Conectando ao banco de dados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Erro de conexão - usando dados locais</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Conectado ao Supabase</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Modo offline - dados locais</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;