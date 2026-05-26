# Security Policy

`kg-protocol-detect` is a pure-transform library and CLI: it reads JSON and returns a routing verdict. No network listener, no remote fetch, no execution of user-supplied code.

The detector does not parse or interpret the document beyond a few top-level shape signals — it does not validate the document, normalize it, or surface any field content in the verdict.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/kg-protocol-detect/security/advisories/new)

Do not file public issues for security reports.
