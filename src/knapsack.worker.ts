import { solveKnapsack } from './knapsack';

const worker: Worker = self as any;

worker.addEventListener('message', (event) => {
  const { generationCount, populationSize, mutationRate, itemCount, backpackCapacity, initialGenes, weightRange, valueRange, tournamentSampleSize, items } = JSON.parse(event.data);

  const { stats, duration } = solveKnapsack({
    generationCount,
    populationSize,
    mutationRate,
    itemCount,
    backpackCapacity,
    initialGenes,
    weightRange,
    valueRange,
    tournamentSampleSize,
    items,
  });

  worker.postMessage({ stats, duration });
});
