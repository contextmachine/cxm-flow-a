import { useMemo } from "react";

const useLegend = (section: string, statistics: any) => {
  const legend = useMemo(() => {
    if (!statistics) return [];

    const bufferProperties = statistics.bufferProperties[section];
    if (!bufferProperties) return [];

    // Summarize shares
    let totalShares = 0;
    bufferProperties.forEach((item: any, i: number) => {
      totalShares += item[1];
    });

    // Create range and split into 6 parts
    const step = totalShares / 6;
    const ranges = [];
    let accumulatedShare = 0;

    for (let i = 0; i < 6; i++) {
      const startShare = accumulatedShare;
      accumulatedShare += step;
      const endShare = accumulatedShare;

      // Find values and colors within the range
      let totalShareInRange = 0;
      const valuesInRange = bufferProperties.filter((item: any) => {
        const share = item[1];
        totalShareInRange += share;

        return totalShareInRange >= startShare && totalShareInRange < endShare;
      });

      const valueRange = `${valuesInRange[0][0]} - ${
        valuesInRange[valuesInRange.length - 1][0]
      }`;
      const colorRange = valuesInRange
        .map((item: any) => item[2])
        .reduce((acc: any, color: any) => {
          if (!acc) return color;
          return [
            Math.min(acc[0], color[0]),
            Math.min(acc[1], color[1]),
            Math.min(acc[2], color[2]),
            Math.max(acc[0], color[0]),
            Math.max(acc[1], color[1]),
            Math.max(acc[2], color[2]),
          ];
        }, null);

      ranges.push({
        valueRange,
        shareRange: `${startShare.toFixed(2)} - ${endShare.toFixed(2)}`,
        colorRange: colorRange
          ? [colorRange.slice(0, 3), colorRange.slice(3)]
          : null,
      });
    }

    return ranges.filter((range) => range.colorRange);
  }, [section, statistics]);

  return legend;
};

export default useLegend;
