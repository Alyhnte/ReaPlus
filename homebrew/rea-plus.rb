# homebrew/rea-plus.rb — ReaPlus Homebrew formulu (hazirlik; tap yayini YOK).
# Surum kaynagi: package.json (0.13.0).
# sha256: npm registry tarball'inin yayin sonrasi gercek olcumu (0.13.0).
# Uydurma hash YOK.
class ReaPlus < Formula
  desc "Conduit live-debug core + Rea static domains over MCP stdio/HTTP"
  homepage "https://github.com/Alyhnte/ReaPlus"
  url "https://registry.npmjs.org/rea-plus/-/rea-plus-0.13.0.tgz"
  version "0.13.0"
  sha256 "cae7bebaf67902ff186023e90e3598281fbb31f196eede9a889c3371f7e95019"
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    bin.write_exec_script libexec/"dist/cli/index.js", "rea-plus-cli"
    bin.write_exec_script libexec/"dist/server.js", "rea-plus"
  end

  test do
    assert_match "0.13.0", shell_output("#{bin}/rea-plus-cli --version")
  end
end
