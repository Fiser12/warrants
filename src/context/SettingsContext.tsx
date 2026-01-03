import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
    hasApiKey: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [apiKey, setApiKeyState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('av_api_key') || '';
        }
        return '';
    });

    const setApiKey = (key: string) => {
        setApiKeyState(key);
        localStorage.setItem('av_api_key', key);
    };

    const hasApiKey = !!apiKey && apiKey.length > 0;

    return (
        <SettingsContext.Provider value={{ apiKey, setApiKey, hasApiKey }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
