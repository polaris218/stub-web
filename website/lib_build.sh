#!/bin/bash
printf "\n Gen prod \n\n"

NODE_ENV=production node --max_old_space_size=4096 node_modules/webpack/bin/webpack --verbose --colors --display-error-details --config webpack.lib.conf.js
