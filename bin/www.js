#!/usr/bin/env node

'use strict';

const Path = require('path');

process.env.NODE_CONFIG_DIR = Path.join(__dirname, '../config');

var server = require('../www/server');
server();
