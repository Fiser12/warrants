// import type { SavedOperation } from '../../lib/types'; // Removed unused import

interface ComparisonHeaderProps {
    operationsCount: number;
    onClose: () => void;
}

export const ComparisonHeader = ({ operationsCount, onClose }: ComparisonHeaderProps) => {
    return (
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    COMPARADOR DE ESTRATEGIAS
                </h2>
                <p className="text-slate-400 text-sm mt-1">Comparando {operationsCount} escenarios</p>
            </div>
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
            >
                ✕ Cerrar
            </button>
        </div>
    );
};
