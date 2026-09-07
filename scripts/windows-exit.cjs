// Let pending native build handles close naturally on Windows. Vinext's
// immediate process.exit(0) triggers a libuv UV_HANDLE_CLOSING assertion.
// Failed exits keep their original behavior; later errors still fail the build.
if (process.platform === 'win32') {
  const exit = process.exit.bind(process);
  process.exit = function(code) {
    if (code === 0) { process.exitCode = 0; return; }
    return exit(code);
  };
}
