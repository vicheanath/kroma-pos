"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-sm">{`Sales: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
}
