/* SPELL: added rule: `do something` */
function do_something() {
	if (1) {
		let it = 100
		/* PARSE ERROR: Don't understand "+ card" */
	}
}
/* PARSE ERROR: Don't understand "print it as lowercase and then do this and do that and do the other thing" */
let it = 2
if (1) { it = 3 }
/* PARSE ERROR: Got both inline statement and nested block */