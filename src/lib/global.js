import * as store from "svelte/store"
import * as svelte from "svelte"
import * as tasmota from "./tasmota"

export function newPersistent(name, def = null) {
	let value = def
	try {
		let v = JSON.parse(localStorage.getItem(name))
		if (v) {
			value = v
		}
	} catch (err) {
		console.error(`local storage ${name} error (${err}), resetting to default`)
	}

	const writable = store.writable(value)
	writable.subscribe((v) => {
		localStorage.setItem(name, JSON.stringify(v))
	})

	return writable
}

export const error = store.writable(null)

export const initInfo = newPersistent("init_info", {
	url: tasmota.url,
	auth: tasmota.auth,
})

initInfo.subscribe((initInfo) => {
	if (initInfo) {
		tasmota.setURL(initInfo.url, initInfo.auth)
	}
})
