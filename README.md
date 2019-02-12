# OTA dashboard

A device dashboard for the [OTA API](https://github.com/foundriesio/ota-api).

## Disclaimer

This is not meant to be run in production.

## Setup

### Requirements

[nodejs](https://nodejs.org/) >= 8.12.0

Install dependencies:

    npm i

### Development

Either a `local-development.json` or a `development.json` file is needed with the
information from the [default.json](config/default.json) config file. Place this
file in the [config](config/) directory.

### Production-like

Either a `local-production.json` or a `production.json` file is needed with the
information from the [default.json](config/default.json) config file. Place this
file in the [config](config/) directory.


The `secretKey` for the `devices` JWT, can also be stored in a separate file.
In that case, define the `JWT_SECRET_FILE` env variable pointing to the file.

You need to have an [OTA API](https://github.com/foundriesio/ota-api) service up
and running, and need the URL for such service.

## Run

### Development

Just run `npm run dev`.

### Production-like

Run, in order:

    npm run build:prod
    npm run build:marko
    npm start

The dashboard will be available at http://localhost:3090/.
