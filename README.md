# ipc-light

[![ipc-light](https://img.shields.io/npm/v/ipc-light.svg)](https://www.npmjs.com/package/ipc-light)
[![Build Status](https://travis-ci.org/fed135/ipc-light.svg?branch=master)](https://travis-ci.org/fed135/ipc-light)
[![Coverage Status](https://coveralls.io/repos/fed135/ipc-light/badge.svg)](https://coveralls.io/r/fed135/ipc-light)
[![Dependencies](https://david-dm.org/fed135/ipc-light.svg)](https://www.npmjs.com/package/ipc-light)

## What is ipc-light?

**ipc-light** is a lightweight inter-process-communication library
that leverages UNIX domain sockets to avoid latency, unreliability and overhead of 
going through the network card, like most socket types.

Unfortunatly, it is only available on Mac and Linux yet. Windows support is on the way.

The goal behind this implementation design is to further mimick the
node classic server setup pattern. It's designed to be simple. Very, very simple.

COMPATIBLE WITH ALL VERSIONS OF NODE.

## Releases

[Latest release](https://github.com/fed135/ipc-light/releases/latest)
[All releases](https://github.com/fed135/ipc-light/releases)


## Installation

    $ npm install ipc-light --save


## Tests

    $ npm test


## Debugging

ipc-light uses the debug module, to include ipc-light logs in your app
use the debug syntax. Ex:

    $ DEBUG=ipc npm start
    
    
## Usage

See examples in the docs folder. [Here](https://github.com/fed135/ipc-light/blob/master/docs/EXAMPLES.md)


## Benchmarks

    $ node tests/benchmark.js

## Roadmap

  - Test out streaming options
  - Add more tests
  - Attempt windows support #4
  - Add more docs #3