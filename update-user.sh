#!/bin/sh
# usage: ./update-user.sh newname   Rewrites the GitHub username in config.js and the static links in index.html.
set -e; old=$(sed -n "s/.*githubUser:'\([^']*\)'.*/\1/p" config.js); [ -n "$1" ]
sed -i "s#githubUser:'$old'#githubUser:'$1'#" config.js; sed -i "s#github.com/$old#github.com/$1#g" index.html; echo "$old -> $1"
