import { solveKnapsack } from './knapsack';

const worker: Worker = self as any;

worker.addEventListener('message', (event) => {
  const { generationCount, populationSize, mutationRate, itemCount, backpackCapacity, initialGenes, weightRange, valueRange, tournamentSampleSize } = JSON.parse(event.data);

  const { items, stats, duration } = solveKnapsack({
    generationCount,
    populationSize,
    mutationRate,
    itemCount,
    backpackCapacity,
    initialGenes,
    weightRange,
    valueRange,
    tournamentSampleSize,
  });

  worker.postMessage({ stats, items, duration });
});
