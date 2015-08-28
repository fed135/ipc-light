# ipc-light

## What is ipc-light?

**ipc-light** is a lightweight inter-process-communication library
that leverages UNIX domain sockets to avoid latency and overhead of 
going throw the network card, like most socket types.

Unfortunatly, it is only available on Mac and Linux.

The goal behind this implementation design is to further mimick the
node classic setup pattern. It's designed to be simple. Very, Very simple.


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
