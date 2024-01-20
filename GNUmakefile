#
VERSION!=	cat manifest.json | jq -r ".version"

#
build:
	zip -r ../keyboard-event-${VERSION}.zip . -x ".git/*"
