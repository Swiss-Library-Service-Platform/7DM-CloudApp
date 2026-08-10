# SLSP Courier to 7DM - Alma Cloud App

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
For questions or to report an issue, please contact [SLSP Support](https://slsp.atlassian.net/servicedesk/customer/portal/1).

## Licence 

[GNU Genereal Public Licence v3.0](https://github.com/Swiss-Library-Service-Platform/slspmails-cloud-app/blob/main/LICENCE)

## Development Notes

### Common Issues 
#### MacOS Error: OpenSSL Error 'ERR_OSSL_EVP_UNSUPPORTED'

Run in Terminal: `export NODE_OPTIONS=--openssl-legacy-provider`

and then run `eca start` again.
