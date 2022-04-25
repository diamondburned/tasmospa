import { debounce, throttle } from "js-debounce-throttle"

export let url = ""
export let auth = {
	username: "",
	password: "",
}

// setURL sets the URL and optionally the authorization information for the
// Tasmota API requests.
export function setURL(_url, _authorization = auth) {
	url = _url
	auth = _authorization
}

// unauthorizedError is thrown if the Tasmota light bulb requires authorization.
// To authorize, set the auth object.
export const unauthorizedError = Error("unauthorized")

// missingURLError is thrown if the url field is not yet filled.
export const missingURLError = Error("missing Tasmota URL")

async function command(cmnd) {
	if (!url) {
		throw missingURLError
	}

	const form = {
		username: encodeURIComponent(auth.username),
		password: encodeURIComponent(auth.password),
		cmnd: cmnd,
	}

	const resp = await fetch(
		`${url}/cm?cmnd=${form.cmnd}&user=${form.username}&password=${form.password}`
	)

	if (!resp.ok) {
		if (resp.status == 401) {
			throw unauthorizedError
		}

		let error = resp.statusText
		try {
			let json = JSON.parse(await resp.blob())
			if (json.WARNING) {
				error = json.WARNING
			}
		} catch (err) {}

		throw error
	}

	let body = await resp.text()
	return JSON.parse(body)
}

export async function state() {
	return command("State")
}

let cmnds = {}
let cmndDebounce = throttle(
	() => {
		let q = []
		for (const [k, v] of Object.entries(cmnds)) {
			q.push(`${k} ${v}; `)
		}
		cmnds = {}
		command(q.join())
	},
	25,
	true
)

function queueCommand(cmnd, value) {
	cmnds[cmnd] = `${value}`
	cmndDebounce()
}

export function setDimmer(dimLevel) {
	queueCommand("Dimmer", dimLevel)
}

export function setTemperature(ct) {
	queueCommand("CT", ct)
}
