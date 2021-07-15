if (!('io' in window)) {
	const ioScript = document.createElement("script");
	ioScript.setAttribute("src", "/socket.io/socket.io.js");
	document.head.appendChild(ioScript);
}

export default function (namespace, options) {
	return io(namespace, options);
};