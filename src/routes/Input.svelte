<script lang="ts">
	export let value: number;
</script>

<label class="form-control w-full">
	<div class="label">
		<span class="label-text"><slot /></span>
	</div>
	<input type="number" class="input input-bordered w-full" bind:value />
</label>
