# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [1.0.0] - 2021-03-29

### Added

+ Initial release

[Unreleased]: https://git.sr.ht/~mser/emote-server/tree/develop
[1.3.0]: https://git.sr.ht/~mser/emote-server/tree/1.3.0
[1.2.0]: https://git.sr.ht/~mser/emote-server/tree/1.2.0
[1.1.0]: https://git.sr.ht/~mser/emote-server/tree/1.1.0
[1.0.0]: https://git.sr.ht/~mser/emote-server/tree/1.0.0
