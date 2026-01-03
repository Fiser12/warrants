import { SavedOperation, SimulatorOutput } from '../../lib/types';

export type ChartType = 'roi' | 'pnl' | 'delta';
export type AxisType = 'rate' | 'time' | 'vol';

export interface ChartDataPoint {
    // Dynamic key for X-axis value (rate, days, vol)
    xPoints: number;
    label: string;
    // Dynamic keys for each operation ID
    [operationId: string]: number | string;
}

export interface ComparisonResult extends SavedOperation {
    result: SimulatorOutput;
}
