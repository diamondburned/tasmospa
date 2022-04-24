<script>
	import * as tasmota from "$lib/tasmota"
	import * as navigation from "$app/navigation"
	import { error, initInfo } from "$lib/global"

	async function submit() {
		$error = null
		navigation.goto("/")
	}
</script>

<main class="centered">
	<form on:submit|preventDefault={submit}>
		<p class="error">{$error || ""}</p>
		<formset>
			<label for="url">Tasmota URL</label>
			<input type="text" id="url" bind:value={$initInfo.url} />

			{#if $error == tasmota.unauthorizedError}
				<label for="username">Username (optional)</label>
				<input type="text" id="username" bind:value={$initInfo.auth.username} />
				<label for="password">Password (optional)</label>
				<input type="password" id="password" bind:value={$initInfo.auth.password} />
			{/if}
		</formset>
		<button type="submit">Login</button>
	</form>
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
	}

	form {
		display: flex;
		flex-direction: column;
	}

	form > button {
		margin-top: 1rem;
	}

	formset {
		display: grid;
	}

	formset label {
		margin-top: 0.5rem;
	}
</style>
