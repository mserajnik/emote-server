# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

+ Maintenance release

## [1.4.0] - 2021-08-15

### Changed

+ Improved the HTTP API responses
+ Made it so that it is no longer possible to add a file of the same name as an
  existing one (instead, the existing one has to be deleted manually
  beforehand)

## [1.3.1] - 2021-07-17

### Fixed

+ Bumped the HTTP API version due to the `FileSizeError` that can now occur
  when adding files

## [1.3.0] - 2021-07-17

### Added

+ Optional file size limit when uploading via HTTP API

## [1.2.0] - 2021-04-02

### Added

+ Route for deleting all frozen emotes (`DELETE /frozen-emotes`)

## [1.1.0] - 2021-04-02

### Added

+ Frozen emote generation support for APNGs

## 1.0.0 - 2021-03-29

### Added

+ Initial release

[Unreleased]: https://github.com/mserajnik/emote-server/compare/1.4.0...develop
[1.4.0]: https://github.com/mserajnik/emote-server/compare/1.3.1...1.4.0
[1.3.1]: https://github.com/mserajnik/emote-server/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/mserajnik/emote-server/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/mserajnik/emote-server/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/mserajnik/emote-server/compare/1.0.0...1.1.0
