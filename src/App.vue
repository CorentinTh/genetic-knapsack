<script lang="ts" setup>
import { ABtn, ACard, AInput, ATable } from 'anu-vue';
import { computed, ref } from 'vue';
import DotGraph from './components/DotGraph.vue';
import LineGraph from './components/LineGraph.vue';
import knapsackWorker from './knapsack.worker.ts?worker';

const generationCount = ref(20);
const populationSize = ref(100);
const mutationRate = ref(0.01);
const itemCount = ref(20);
const backpackCapacity = ref(100);
const initialGenes = ref<'random' | 'zero' | 'one'>('random');
const weightRange = ref({ min: 1, max: 20 });
const valueRange = ref({ min: 1, max: 20 });
const tournamentSampleSize = ref(5);

const knapsackResult = ref<{ stats: { weight: number; generation: number; bestFitness: number; bestIndividual: number[] }[]; items: { weight: number; value: number }[]; duration: number }>();
const state = ref<'idle' | 'computing'>('idle');
const worker = new knapsackWorker();

const bestResult = computed(() => {
  if (!knapsackResult.value) return undefined;

  const bestIndividual = knapsackResult.value.stats.at(-1);

  return {
    weight: bestIndividual.weight,
    value: bestIndividual.bestFitness,
    items: knapsackResult.value.items.filter((_, i) => bestIndividual.bestIndividual[i]),
    individual: bestIndividual.bestIndividual,
  };
});

worker.onmessage = (event) => {
  knapsackResult.value = event.data;
  state.value = 'idle';
};

function computeKnapsack() {
  state.value = 'computing';
  worker.postMessage(
    JSON.stringify({
      generationCount: generationCount.value,
      populationSize: populationSize.value,
      mutationRate: mutationRate.value,
      itemCount: itemCount.value,
      backpackCapacity: backpackCapacity.value,
      initialGenes: initialGenes.value,
      weightRange: weightRange.value,
      valueRange: valueRange.value,
      tournamentSampleSize: tournamentSampleSize.value,
    }),
  );
}
</script>

<template>
  <div class="min-h-screen">
    <div class="p-6 py-5 border-b border-gray-200">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="text-lg a-title">Genetic knapsack</div>
        <div class="text-sm text-center">A genetic algorithm to solve the knapsack problem</div>
        <div class="text-sm">by <a href="https://github.com/CorentinTh/genetic-knapsack" target="_blank" class="text-blue-500" rel="noopener noreferrer">CorentinTh</a></div>
      </div>
    </div>

    <div class="flex flex-col py-6 gap-4 max-w-7xl mx-auto">
      <div class="flex gap-4 w-full">
        <ACard class="pa-6 max-w-450px">
          <div class="a-title">What ?</div>

          <div class="my-4">
            The knapsack problem is a problem in combinatorial optimization: Given a set of items, each with a weight and a value, determine the number of each item to include in a collection so that
            the total weight is less than or equal to a given limit and the total value is as large as possible.
          </div>

          <div>
            Genetic algorithms are a class of search, adaptation, and optimization algorithms based on the principles of natural evolution. They are frequently used to find optimal or near-optimal
            solutions to difficult problems which otherwise would take a lifetime to solve.
          </div>
        </ACard>
        <ACard class="pa-6 flex-1">
          <div class="a-title">Parameters</div>

          <div class="flex gap-4 my-4">
            <div class="flex-1 flex gap-4 flex-col">
              <AInput type="number" v-model="generationCount" placeholder="Generation count" label="Generation count" />
              <AInput type="number" v-model="populationSize" placeholder="Population size" label="Population size" />
              <AInput type="number" v-model="mutationRate" placeholder="Mutation rate" label="Mutation rate" />
            </div>

            <div class="flex-1 flex gap-4 flex-col">
              <AInput type="number" v-model="itemCount" placeholder="Item count" label="Item count" />
              <AInput type="number" v-model="backpackCapacity" placeholder="Backpack capacity" label="Backpack capacity" />
              <AInput type="number" v-model="tournamentSampleSize" placeholder="Tournament sample size" label="Tournament sample size" />
            </div>
          </div>

          <ABtn @click="computeKnapsack" class="w-full" :disabled="state === 'computing'" :loading="state === 'computing'">Compute</ABtn>
        </ACard>
      </div>

      <div v-if="state === 'idle' && knapsackResult" class="flex flex-col gap-4">
        <ACard class="pa-6" v-if="bestResult">
          <div class="a-title">Best result from last generation</div>

          <div><span class="inline-block w-120px font-bold text-right mr-4">Fitness:</span> {{ bestResult.value }}</div>
          <div><span class="inline-block w-120px font-bold text-right mr-4">Total weight:</span> {{ bestResult.weight }}kg</div>
          <div><span class="inline-block w-120px font-bold text-right mr-4">Items:</span> {{ bestResult.items.map(({ weight, value }) => `${weight}kg (${value})`).join(', ') }}</div>
          <div><span class="inline-block w-120px font-bold text-right mr-4">Individual:</span> {{ bestResult.individual.join(', ') }}</div>
          <!-- Duration -->
          <div><span class="inline-block w-120px font-bold text-right mr-4">Duration:</span> {{ knapsackResult.duration }}ms</div>
        </ACard>

        <div class="flex gap-4 items-start">
          <DotGraph class="flex-1" :data="knapsackResult.items.map((s) => ({ x: s.weight, y: s.value }))" title="Items weight/value repartition" x-label="Weight" y-label="Value" />
          <LineGraph class="flex-1" :data="knapsackResult.stats.map((s) => ({ x: s.generation, y: s.bestFitness }))" title="Best fitness per generation" x-label="Generation" y-label="Fitness" />
        </div>
        <div class="flex gap-4 items-start">
          <ACard class="pa-6">
            <div class="a-title">Items</div>

            <ATable :rows="knapsackResult.items"></ATable>
          </ACard>

          <ACard class="pa-6 flex-1">
            <div class="a-title">Generation breakdown</div>

            <ATable :rows="knapsackResult.stats"></ATable>
          </ACard>
        </div>
      </div>
    </div>
  </div>
</template>
