#!/usr/bin/env bash
if ! command -v python3 &> /dev/null; then
	echo "Python 3 is required for the HTTP server." >&2
	exit 1
fi

(
	sleep 0.25
	if command -v xdg-open &> /dev/null; then
		xdg-open http://localhost:8080
	elif command -v open &> /dev/null; then
		open http://localhost:8080
	else
		echo "Please open http://localhost:8080 in your browser." >&2
	fi
) &

python3 -m http.server 8080
