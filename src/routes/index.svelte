<script>
	import * as tasmota from "$lib/tasmota.js"
	import * as svelte from "svelte"
	import * as navigation from "$app/navigation"
	import { error } from "$lib/global"
	import Spinner from "$lib/components/Spinner.svelte"

	let loading = true
	let pause = false
	let state = {}

	async function poll() {
		if (pause) {
			return
		}

		try {
			state = await tasmota.state()
			loading = false
			$error = null
		} catch (err) {
			console.error(err)
			$error = err

			switch (err) {
				case tasmota.missingURLError:
					$error = null // not important
				case tasmota.unauthorizedError:
					navigation.goto("/init")
					break
			}
		}
	}

	let timeoutHandle

	svelte.onMount(() => {
		poll()
		timeoutHandle = setInterval(() => poll(), 500)
	})

	svelte.onDestroy(() => {
		clearTimeout(timeoutHandle)
	})
</script>

<main class="centered">
	<p class="error">{$error || ""}</p>

	{#if loading && !$error}
		<Spinner />
	{:else}
		<pre class="state">{JSON.stringify(state, {}, 4)}</pre>
		<form class="controls">
			{#if state.Dimmer != undefined}
				<label for="dimmer">Dimmer</label>
				<input
					type="range"
					id="dimmer"
					min="0"
					max="100"
					bind:value={state.Dimmer}
					on:pointerdown={() => (pause = true)}
					on:pointerup={() => (pause = false)}
					on:input={() => {
						tasmota.setDimmer(state.Dimmer)
					}}
				/>
			{/if}
			{#if state.CT != undefined}
				<label for="ct">Temperature</label>
				<input
					type="range"
					id="ct"
					min="153"
					max="500"
					bind:value={state.CT}
					on:pointerdown={() => (pause = true)}
					on:pointerup={() => (pause = false)}
					on:input={() => {
						tasmota.setTemperature(state.CT)
					}}
				/>
			{/if}
		</form>
	{/if}
</main>

<style>
	p.error {
		color: red;
		font-weight: bold;
	}

	p.error:empty {
		display: none;
	}

	main {
		margin: auto;
		padding: 0 8px;
		flex-direction: column;

		min-width: 100px;
		max-width: 300px;

		height: 100vh;
		overflow: hidden;
	}

	main :global(.spinner) {
		width: 64px;
		height: 64px;
		border-width: 10px;
	}

	pre.state {
		overflow: scroll;
		margin: 0;
		padding: 0;
		max-height: 400px;
		background-color: transparent;
	}

	form.controls {
		display: grid;
		width: 100%;
		margin: 16px;
	}

	label {
		font-size: 0.8em;
		margin: 0 4px;
		margin-top: 10px;
		overflow: hidden;
	}

	input[type="range"] {
		--bg: rgba(255, 255, 255, 0.35);
		--fg: white;
		--thumb: pink;
		--thumb-border: pink;

		width: calc(100% - 4px);
		border: none;
		margin: 4px auto;
		padding: 0;
		background: transparent;
	}
	input[type="range"]::-moz-range-track {
		width: 100%;
		height: 12px;
		border-radius: 64px;
		background: var(--bg);
	}
	input[type="range"]::-moz-range-progress {
		background: var(--fg);
		height: 12px;
		width: 100%;
		border-radius: 50px;
	}
	input[type="range"]::-moz-range-thumb {
		background: var(--thumb);
		height: 0px;
		width: 0px;
		outline: 7px solid var(--thumb);
		border: 1px solid var(--thumb);
		border-radius: 64px;
		cursor: pointer;
		overflow: visible;
		box-shadow: 0 0 0 6px var(--thumb), 0 0 0 10px var(--thumb-border), 0 0 6px 8px var(--thumb),
			0 0 8px 8px black;
	}

	#dimmer {
		--bg: rgba(255, 252, 157, 0.35);
		--fg: rgba(255, 252, 0, 0.75);
		--thumb: #c0bc28;
		--thumb-border: yellow;
	}

	#ct {
		--bg: linear-gradient(to right, rgb(238, 255, 255), rgb(255, 136, 17));
		--fg: transparent;
		--thumb: black;
		--thumb-border: white;
	}
</style>
