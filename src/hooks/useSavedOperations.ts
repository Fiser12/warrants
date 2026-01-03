import { useState, useEffect, useCallback } from 'react';
import type { SavedOperation, SimulatorInput } from '../lib/types';

const STORAGE_KEY = 'warrant-simulator-operations';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateName(input: SimulatorInput): string {
    const type = input.warrant.type;
    const strike = input.warrant.strike;
    const rate = input.market.simulatedRate;
    return `${type} S${strike} @${rate}%`;
}

export function useSavedOperations() {
    // Initialize with data from localStorage to avoid race conditions/overwrites
    const [operations, setOperations] = useState<SavedOperation[]>(() => {
        try {
            if (typeof window === 'undefined') return [];
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading operations:', e);
            return [];
        }
    });

    // Save to localStorage whenever operations change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
        } catch (e) {
            console.error('Error saving operations:', e);
        }
    }, [operations]);

    const saveOperation = useCallback((input: SimulatorInput, name?: string): SavedOperation => {
        const now = new Date().toISOString();
        const operation: SavedOperation = {
            id: generateId(),
            name: name || generateName(input),
            input,
            createdAt: now,
            updatedAt: now,
        };
        setOperations(prev => [...prev, operation]);
        return operation;
    }, []);

    const updateOperation = useCallback((id: string, input: SimulatorInput, name?: string) => {
        setOperations(prev => prev.map(op =>
            op.id === id
                ? { ...op, input, name: name || op.name, updatedAt: new Date().toISOString() }
                : op
        ));
    }, []);

    const duplicateOperation = useCallback((id: string): SavedOperation | null => {
        const original = operations.find(op => op.id === id);
        if (!original) return null;

        const now = new Date().toISOString();
        const duplicate: SavedOperation = {
            id: generateId(),
            name: `${original.name} (copia)`,
            input: JSON.parse(JSON.stringify(original.input)),
            createdAt: now,
            updatedAt: now,
        };
        setOperations(prev => [...prev, duplicate]);
        return duplicate;
    }, [operations]);

    const deleteOperation = useCallback((id: string) => {
        setOperations(prev => prev.filter(op => op.id !== id));
    }, []);

    const renameOperation = useCallback((id: string, name: string) => {
        setOperations(prev => prev.map(op =>
            op.id === id ? { ...op, name, updatedAt: new Date().toISOString() } : op
        ));
    }, []);

    return {
        operations,
        saveOperation,
        updateOperation,
        duplicateOperation,
        deleteOperation,
        renameOperation,
    };
}
