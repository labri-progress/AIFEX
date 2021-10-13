#!/bin/bash
cd model
npm audit fix --force
npm update
cd ..

cd session
npm audit fix --force
npm update
cd ..

cd website
npm audit fix --force
npm update
cd ..

cd browser-extension
npm audit fix --force
npm update
cd ..

cd evaluator
npm audit fix --force
npm update
cd ..