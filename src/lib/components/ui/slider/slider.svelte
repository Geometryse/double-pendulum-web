<script lang="ts">
	import { Slider as SliderPrimitive } from 'bits-ui';
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn } from '$lib/utils';

	type $$Props = SliderPrimitive.Props;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = [0];
	export { className as class };
</script>

<div class="flex flex-col">
	<Label
		for="Ntheta1"
		class="text-md leading-8 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		><slot /></Label
	>
	<SliderPrimitive.Root
		bind:value
		on:change
		class={cn('relative flex w-full touch-none select-none items-center', className)}
		{...$$restProps}
		let:thumbs
	>
		<span class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
			<SliderPrimitive.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				{thumb}
				class="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	</SliderPrimitive.Root>
</div>
