# SLSP Courier to 7DM - Alma Cloud App
<a href="https://developers.exlibrisgroup.com/appcenter/slsp-to-7dm/">![CloudApp Activations](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapps01.ext.exlibrisgroup.com%2Fappstats.json&query=%24%5B%3F(%40.cloud_app_id%3D%3D'swiss-library-service-platform%2F7dm-cloudapp')%5D.user_count&style=flat&label=Cloud%20App%20Activations)</a>
<a href="https://developers.exlibrisgroup.com/appcenter/slsp-to-7dm/">![CloudApp Activations](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapps01.ext.exlibrisgroup.com%2Fappstats.json&query=%24%5B%3F(%40.cloud_app_id%3D%3D'swiss-library-service-platform%2F7dm-cloudapp')%5D.institution_count&style=flat&label=Cloud%20App%20Institutions)</a>

## Overview

This repository contains the "SLSP Courier to 7DM" [Alma Cloud App](https://developers.exlibrisgroup.com/cloudapps/).

It is provided by [SLSP](https://slsp.ch/).

## Requirements

In order to use this app

- your institution must be a member of the SLSP network
- your institution must have a subscription to the SLSP Courier service
- your Alma user has to contain at least of one these user roles:
    - Circulation Desk Manager
    - Circulation Desk Operator
    - Circulation Desk Operator - Limited

Please [contact SLSP](https://slsp.ch/en/contact) if you have any questions.

## Issues and defects
Please use the GitHub "Issues" of this repository to report any defects. We will have a look into it as soon as possible.

## Licence 

[GNU Genereal Public Licence v3.0](https://github.com/Swiss-Library-Service-Platform/slspmails-cloud-app/blob/main/LICENCE)

## Development Notes

### Common Issues 
#### MacOS Error: OpenSSL Error 'ERR_OSSL_EVP_UNSUPPORTED'

Run in Terminal: `export NODE_OPTIONS=--openssl-legacy-provider`

and then run `eca start` again.
