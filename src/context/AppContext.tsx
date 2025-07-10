import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, Frequency, CoverSettings } from '../types';
import { useSupabase } from '../hooks/useSupabase';

interface AppContextType {
  config: AppConfig;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  updateIntroductionText: (text: string) => Promise<void>;
  updateFrequency: (id: number, frequency: Partial<Frequency>) => Promise<void>;
  uploadFrequencyImage: (id: number, file: File) => Promise<void>;
  updateCoverSettings: (settings: CoverSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultFrequencies: Frequency[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  title: `Frequência ${i + 1}`,
  description: `Descrição da frequência ${i + 1}. Configure este texto na área administrativa.`,
  imageUrl: null,
}));

const defaultConfig: AppConfig = {
  introductionText: `Caro(a) [NOME_CLIENTE],

Este relatório apresenta as frequências terapêuticas utilizadas em sua sessão. Cada frequência foi selecionada especificamente para suas necessidades terapêuticas atuais.

As frequências são ferramentas importantes no processo de harmonização e equilíbrio energético, contribuindo para seu bem-estar geral.`,
  frequencies: defaultFrequencies,
  coverSettings: {
    backgroundImage: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800',
    backgroundType: 'mandala'
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const { 
    isConnected, 
    isLoading, 
    error, 
    loadConfig, 
    saveIntroductionText, 
    updateFrequency: updateFrequencyDB, 
    saveCoverSettings,
    saveSessionReport 
  } = useSupabase();

  // Carregar configurações do Supabase na inicialização
  useEffect(() => {
    const initializeConfig = async () => {
      if (isConnected) {
        const supabaseConfig = await loadConfig();
        if (supabaseConfig) {
          setConfig(supabaseConfig);
        } else {
          // Fallback para localStorage se Supabase falhar
          const savedConfig = localStorage.getItem('therapeutic-reports-config');
          if (savedConfig) {
            try {
              const parsed = JSON.parse(savedConfig);
              setConfig(parsed);
            } catch (error) {
              console.error('Erro ao carregar configuração do localStorage:', error);
            }
          }
        }
      } else {
        // Usar localStorage se Supabase não estiver conectado
        const savedConfig = localStorage.getItem('therapeutic-reports-config');
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
          } catch (error) {
            console.error('Erro ao carregar configuração do localStorage:', error);
          }
        }
      }
    };

    if (!isLoading) {
      initializeConfig();
    }
  }, [isConnected, isLoading, loadConfig]);

  // Função auxiliar para salvar no localStorage (fallback)
  const saveToLocalStorage = (newConfig: AppConfig) => {
    const configForStorage = {
      ...newConfig,
      frequencies: newConfig.frequencies.map(freq => ({
        ...freq,
        imageUrl: freq.imageUrl && freq.imageUrl.startsWith('data:') ? null : freq.imageUrl
      })),
      coverSettings: {
        ...newConfig.coverSettings,
        backgroundImage: newConfig.coverSettings.backgroundImage && 
                        newConfig.coverSettings.backgroundImage.startsWith('data:') 
                        ? '' 
                        : newConfig.coverSettings.backgroundImage
      }
    };
    
    try {
      localStorage.setItem('therapeutic-reports-config', JSON.stringify(configForStorage));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const updateIntroductionText = async (text: string) => {
    const newConfig = { ...config, introductionText: text };
    setConfig(newConfig);
    
    if (isConnected) {
      const success = await saveIntroductionText(text);
      if (!success) {
        // Fallback para localStorage
        saveToLocalStorage(newConfig);
      }
    } else {
      saveToLocalStorage(newConfig);
    }
  };

  const updateFrequency = async (id: number, frequencyUpdate: Partial<Frequency>) => {
    const newFrequencies = config.frequencies.map(freq =>
      freq.id === id ? { ...freq, ...frequencyUpdate } : freq
    );
    const newConfig = { ...config, frequencies: newFrequencies };
    setConfig(newConfig);

    if (isConnected) {
      const success = await updateFrequencyDB(id, frequencyUpdate);
      if (!success) {
        // Fallback para localStorage
        saveToLocalStorage(newConfig);
      }
    } else {
      saveToLocalStorage(newConfig);
    }
  };

  const uploadFrequencyImage = async (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      await updateFrequency(id, { imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const updateCoverSettings = async (settings: CoverSettings) => {
    const newConfig = { ...config, coverSettings: settings };
    setConfig(newConfig);

    if (isConnected) {
      const success = await saveCoverSettings(settings);
      if (!success) {
        // Fallback para localStorage
        saveToLocalStorage(newConfig);
      }
    } else {
      saveToLocalStorage(newConfig);
    }
  };

  return (
    <AppContext.Provider value={{
      config,
      isLoading,
      isConnected,
      error,
      updateIntroductionText,
      updateFrequency,
      uploadFrequencyImage,
      updateCoverSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};