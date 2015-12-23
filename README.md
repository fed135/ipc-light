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

## Release notes

**v1.1.2** - 2015-12-23

- Exposed Client and Server API #1
- Exposed defaults to change global settings
- Removed write/recieve logs for slightly lower overhead
- Pushed git tags

**v1.1.1** - 2015-12-22

- Bug fix: When disconnecting, socket filter was reversed.
- Debug/Improvement: Added names to anonymous functions for debugging

**v1.1.0** - 2015-12-10

  [Breaking changes]
- Payload is no longer serialized by default. This gives you the option to send
  and receive buffers of data. A good use case would be in a situation where you
  want to send a binary JSON object (UBJSON, msgpack, etc.). Writing any type other
  than Buffer or String will serialized by JSON.stringify to simplify and allow resiliance.

**v1.0.4** - 2015-11-11

- Added write callback (to check for drain overflows)


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