//
//  Polyfills to make node/browser environmens consistent.
//

// GRRR... will SOMEONE on the node team please implement console.group ???
if (!console.group) console.group = console.log;
if (!console.groupCollapsed) console.groupCollapsed = console.group;
if (!console.groupEnd) console.groupEnd = console.log;
