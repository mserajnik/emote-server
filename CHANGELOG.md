# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2020-12-31

### Added

+ Add support for generating and serving "frozen" GIF emotes

## [1.5.1] - 2020-09-27

### Fixed

+ Fixed `joi` import

## [1.5.0] - 2020-09-27

### Changed

+ Maintenance release, no feature changes

## [1.4.0] - 2020-01-25

### Changed

+ Reverted the base route requiring authentication; instead it can now
  _optionally_ be used to authenticate access keys by passing them (in which
  case it will either respond normally when using a valid access key or with an
  `AccessKeyError` when using an invalid one)

## [1.3.0] - 2020-01-25

### Changed

+ Made the base route require authentication
+ Updated dependencies

## [1.2.0] - 2020-01-25

### Added

+ Added the ability to add and delete emotes via API

### Changed

+ Normalized the API

### Fixed

+ Fixed the regression causing
  `Authorization: Bearer <EMOTE_SERVER_ACCESS_KEY>` not to work anymore

## [1.1.0] - 2020-01-22

### Added

+ Added the ability to use a `accessKey=<EMOTE_SERVER_ACCESS_KEY>` query
  parameter instead of the `Authorization: Bearer <EMOTE_SERVER_ACCESS_KEY>`
  header for authentication to make hotlinking emotes in `<img>` tags possible

### Changed

+ Updated dependencies

## [1.0.2] - 2020-01-19

### Fixed

+ Fixed version numbers

## [1.0.1] - 2020-01-19

### Fixed

+ Fixed wrong service name in example Docker Compose configuration

## 1.0.0 - 2020-01-19

### Added

+ Initial release

[Unreleased]: https://github.com/imtbl/emote-server/compare/1.6.0...develop
[1.6.0]: https://github.com/imtbl/emote-server/compare/1.5.1...1.6.0
[1.5.1]: https://github.com/imtbl/emote-server/compare/1.5.0...1.5.1
[1.5.0]: https://github.com/imtbl/emote-server/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/imtbl/emote-server/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/imtbl/emote-server/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/imtbl/emote-server/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/imtbl/emote-server/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/imtbl/emote-server/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/imtbl/emote-server/compare/1.0.0...1.0.1
