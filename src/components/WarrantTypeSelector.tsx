import type { WarrantType } from '../lib/types';

interface WarrantTypeSelectorProps {
    value: WarrantType;
    onChange: (type: WarrantType) => void;
}

export const WarrantTypeSelector = ({ value, onChange }: WarrantTypeSelectorProps) => {
    const baseBtn = "px-3 sm:px-6 py-2 sm:py-2.5 border border-blue-500/30 bg-transparent text-slate-400 cursor-pointer transition-all duration-300 font-semibold text-[11px] sm:text-[13px] hover:bg-blue-500/10";
    const activeBtn = "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500";

    return (
        <div className="rounded-xl p-4 sm:p-5 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-blue-500/15 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]">
            <h3 className="m-0 mb-3 sm:mb-4 text-xs sm:text-sm text-slate-400 tracking-wide">TIPO DE OPERACIÓN</h3>
            <div className="flex flex-col sm:flex-row">
                <button
                    className={`${baseBtn} rounded-t-md sm:rounded-l-md sm:rounded-tr-none ${value === 'PUT' ? activeBtn : ''}`}
                    onClick={() => onChange('PUT')}
                >
                    🔻 PUT
                </button>
                <button
                    className={`${baseBtn} rounded-b-md sm:rounded-r-md sm:rounded-bl-none ${value === 'CALL' ? activeBtn : ''}`}
                    onClick={() => onChange('CALL')}
                >
                    🔺 CALL
                </button>
            </div>
            <p className="mt-3 text-[11px] sm:text-xs text-slate-500">
                {value === 'PUT'
                    ? '💡 Con un PUT, ganas cuando el precio del bono BAJA (tipos suben)'
                    : '💡 Con un CALL, ganas cuando el precio del bono SUBE (tipos bajan)'}
            </p>
        </div>
    );
};
