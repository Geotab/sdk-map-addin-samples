#!/bin/sh

if [ -d "./dist" ]; then
  rm -rf dist
fi

mkdir dist

addins=$(find . -maxdepth 1 -type d | grep -v ".git" | grep -v "dist" | grep -v "^.$")

for addin in $addins
do
    zip -r "./dist/$addin.zip" $addin
done