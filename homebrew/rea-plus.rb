# homebrew/rea-plus.rb — ReaPlus Homebrew formula (prepared; tap is not published).
# Version source: package.json (0.13.1).
# sha256 is measured from the npm registry tarball after publish. No invented hash.
class ReaPlus < Formula
  desc "Conduit live-debug core + Rea static domains over MCP stdio/HTTP"
  homepage "https://github.com/Alyhnte/ReaPlus"
  url "https://registry.npmjs.org/rea-plus/-/rea-plus-0.13.1.tgz"
  version "0.13.1"
  sha256 "bilinmiyor"
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    bin.write_exec_script libexec/"dist/cli/index.js", "rea-plus-cli"
    bin.write_exec_script libexec/"dist/server.js", "rea-plus"
  end

  test do
    assert_match "0.13.1", shell_output("#{bin}/rea-plus-cli --version")
  end
end
