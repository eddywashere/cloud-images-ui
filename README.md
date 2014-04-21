# Cloud Images UI (WIP)

Based on rack-hack-stack(a self contained hack stack): passport-keystone, praxy(node-http-proxy), express 4, angular-generator

## Getting started

- Clone the repo with `git clone https://github.com/eddywashere/cloud-images-ui.git`.
- Install dependencies: `bundle install && npm install && bower install`
- Requires mongodb - make sure `mongod` is running locally
- Run development server with `grunt serve`

## Production?

- `grunt build` or `grunt build:cdn`
-  set env variable for mongodb
- Run the production server with `node server.js`

## TODO

- add serviceCatolog proxy to a middleware module
