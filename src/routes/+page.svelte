<script lang="ts">
	import { degToRad, radToDeg } from '$lib/util';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Slider } from '$lib/components/ui/slider';

	// import Input from './Input.svelte';
	/**
	 * Parameters
	 */

	let stopTime: number = $state(999);
	let defaultTheta1: [number] = $state([40]);
	let defaultTheta2: [number] = $state([90]);

	let g: number = $state(-9.81);

	let l1: number = $state(10);
	let l2: number = $state(10);

	let theta1: number = $state(degToRad(defaultTheta1[0]));
	let theta2: number = $state(degToRad(defaultTheta2[0]));

	let m1: number = $state(1);
	let m2: number = $state(1);

	let dt: number = $state(0.01);

	const x1 = $derived(l1 * Math.sin(theta1));
	const y1 = $derived(-l1 * Math.cos(theta1));

	const x2 = $derived(x1 + l2 * Math.sin(theta2));
	const y2 = $derived(y1 - l2 * Math.cos(theta2));

	let w1 = $state(0); // represents angular velocity of top rod. Derivative of theta1
	let w2 = $state(0); // represents angular velocity of bottom rod. Derivative of theta2

	let w1D = $state(0); // angular acceleration
	let w2D = $state(0); // angular acceleration

	let pathD = $state(`M ${x2} ${y2}`);
	let pathLength = $state(0);
	let lastPathUpdate: number = $state(0);
	let showPath = $state(false);

	let prevX2 = x2;
	let prevY2 = y2;

	let startTime: number | null = $state(null);
	let timeNow: number = $state(Date.now());
	let pauseTime: number = 0;

	let interval: number | null = $state(null);

	const start = () => {
		if (!startTime) {
			clearPath();
			startTime = Date.now();
		} else {
			startTime += Date.now() - pauseTime;
		}
		timeNow = Date.now();
		const update = () => {
			w1D =
				(-g * (2 * m1 + m2) * Math.sin(theta1) -
					m2 * g * Math.sin(theta1 - 2 * theta2) -
					2 *
						Math.sin(theta1 - theta2) *
						m2 *
						(w2 ** 2 * l2 + w1 ** 2 * l1 * Math.cos(theta1 - theta2))) /
				(l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2)));
			w2D =
				(2 *
					Math.sin(theta1 - theta2) *
					(w1 ** 2 * l1 * (m1 + m2) +
						g * (m1 + m2) * Math.cos(theta1) +
						w2 ** 2 * l2 * m2 * Math.cos(theta1 - theta2))) /
				(l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2)));

			w1 += w1D * dt;
			w2 += w2D * dt;

			theta1 += w1 * dt;
			theta2 += w2 * dt;

			timeNow = Date.now();
			if (timeNow - lastPathUpdate > 5) {
				lastPathUpdate = Date.now();
				if (showPath) pathD += ` L ${x2} ${y2}`;

				// Approximate the new distance with the pythagorean theorem
				const distance = Math.sqrt((x2 - prevX2) ** 2 + (y2 - prevY2) ** 2);

				// Accumulate the total path length
				pathLength += distance;

				// Update the previous position for the next frame
				prevX2 = x2;
				prevY2 = y2;
			}
		};
		interval = setInterval(update, dt);
	};
	const handlePauseClick = () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
			pauseTime = Date.now();
		} else start();
	};
	const handleResetClick = () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}

		theta1 = degToRad(defaultTheta1[0]);
		theta2 = degToRad(defaultTheta2[0]);
		setTimeout(() => {
			w1 = 0;
			w2 = 0;
			w1D = 0;
			w2D = 0;
			clearPath();
			pathLength = 0;
			prevX2 = x2;
			prevY2 = y2;
			startTime = null;
		}, 30);
	};
	const clearPath = () => {
		pathD = `M ${x2} ${y2}`;
	};
	// Update thetas on defaultTheta change
	$effect(() => {
		theta1 = degToRad(defaultTheta1[0]);
		theta2 = degToRad(defaultTheta2[0]);
		// and make sure angular vel and acc are zero
		w1 = 0;
		w2 = 0;
		w1D = 0;
		w2D = 0;
	});

	$effect(() => {
		if (interval && startTime) {
			if ((timeNow - startTime) / 1000 > stopTime) {
				handlePauseClick();
			}
		}
	});
	$effect(() => {
		if (!showPath) clearPath();
	});
	const active = $derived(!!interval);
</script>

<div class="grid w-full grid-cols-5 items-center justify-center divide-x">
	<div class="col-span-3 flex h-full items-center justify-center">
		<svg width="100%" viewBox="-25 -25 50 50">
			<!-- First rod -->
			<line x1="0" y1="0" x2={x1} y2={y1} stroke="white" stroke-width="0.5px" />

			<!-- Second rod -->
			<line {x1} {y1} {x2} {y2} stroke="white" stroke-width="0.5px" />

			<!-- First weight -->
			<circle cx={x1} cy={y1} r={Math.log10(m1 * 50)} fill="blue" />

			<!-- Second weight -->
			<circle cx={x2} cy={y2} r={Math.log10(m2 * 50)} fill="red" />

			<!-- Path -->
			{#if showPath}
				<path d={pathD} fill="none" stroke="gray" stroke-width="0.2" />
			{/if}
		</svg>
	</div>
	<div class="col-span-2 mx-auto space-y-2 px-20">
		<div class="flex gap-3">
			<Button on:click={handlePauseClick} class="w-20 font-medium"
				>{active ? 'Pause' : 'Start'}</Button
			>
			<Button on:click={handleResetClick} class="">Reset</Button>
			<div class="flex w-28 items-center space-x-2">
				<Checkbox id="terms" bind:checked={showPath} />
				<Label
					for="terms"
					class="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Show path
				</Label>
			</div>
		</div>

		<div class="flex flex-col">
			<Label
				for="Ntheta1"
				class="text-md leading-8 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>theta1: {defaultTheta1}°</Label
			>
			<Slider id="Ntheta1" bind:value={defaultTheta1} max={180} min={-180} step={5} />
		</div>
		<div class="flex flex-col">
			<Label
				for="Ntheta1"
				class="text-md leading-8 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>theta2: {defaultTheta2}°</Label
			>
			<Slider id="Ntheta1" bind:value={defaultTheta2} max={180} min={-180} step={5} />
		</div>

		<br />

		<div class="grid grid-cols-3 gap-3">
			<Input bind:value={defaultTheta1[0]} type="number">Theta 1 (°)</Input>
			<Input bind:value={defaultTheta2[0]} type="number">Theta 2 (°)</Input>
			<Input bind:value={stopTime} type="number">Max duration (s)</Input>

			<Input bind:value={m1} type="number">Mass 1 (kg)</Input>
			<Input bind:value={m2} type="number">Mass 2 (kg)</Input>

			<Input bind:value={g} type="number">g (m/s^2)</Input>

			<Input bind:value={l1} type="number">Length 1 (m)</Input>
			<Input bind:value={l2} type="number">Length 2 (m)</Input>
			<Input bind:value={dt} type="number">dt</Input>
		</div>

		<br />

		<div>
			<p class="mb-2">Live values:</p>
			<div class="space-y-1 px-2">
				<p>
					path length: {(pathLength / 10).toFixed(2)}m
				</p>
				<p>
					time:
					{#if startTime}
						{((timeNow - startTime) / 1000).toFixed(1)}s
					{:else}
						0.0s
					{/if}
				</p>
				<p>
					Theta 1: {radToDeg(theta1).toFixed(2)}°
				</p>
				<p>
					Theta 2: {radToDeg(theta2).toFixed(2)}°
				</p>
				<p>ω1: {w1.toFixed(2)} rad/s</p>
				<p>ω2: {w2.toFixed(2)} rad/s</p>
				<p>ω'1: {w1D.toFixed(2)} rad/s^2</p>
				<p>ω'2: {w2D.toFixed(2)} rad/s^2</p>
				<p>x1: {x1.toFixed(2)}</p>
				<p>y1: {-y1.toFixed(2)}</p>
				<p>x2: {x2.toFixed(2)}</p>
				<p>y2: {-y2.toFixed(2)}</p>
			</div>
		</div>
	</div>
</div>
